import assert from "node:assert/strict";
import test from "node:test";
import { everydayOfficial, everydayPlan, questionsForEveryday } from "../app/berlin/new-routes/everyday-plans.ts";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const hosts = ["www.bafin.de", "www.verbraucherzentrale.de", "www.bundesnetzagentur.de", "service.berlin.de", "www.berlin.de", "www.gesetze-im-internet.de", "www.dkb.de", "www.ing.de", "n26.com", "support.n26.com", "help.revolut.com", "www.revolut.com", "support.vivid.money", "website-static.vivid.money", "www.berliner-sparkasse.de", "www.berliner-volksbank.de", "www.commerzbank.de", "www.postbank.de", "www.vodafone.de", "www.o2online.de", "mobile.1und1.de", "hilfe.o2online.de", "www.alditalk.de", "www.telekom.de", "www.o2online.de", "www.freenet-funk.de"];
const stepsOf = (plan) => [...plan.steps, ...(plan.methods ?? []).flatMap((m) => m.steps)];
const textOf = (plan) => stepsOf(plan).map((s) => s.detail).join(" ");
const providerLinks = (plan) => (plan.methods ?? []).flatMap((m) => (m.providers ?? []).flatMap((p) => p.links));
const checkLinks = (plan) => [...providerLinks(plan).map((link) => ({ action: link, source: link }))].concat(stepsOf(plan)).forEach((step) => [step.action, step.source, step.alternative].filter(Boolean).forEach((link) => {
  assert.ok(link.label.length > 3);
  assert.ok(hosts.includes(new URL(link.href).host), `unexpected host in ${link.href}`);
}));

test("route-plans delegates the new routes", () => {
  assert.deepEqual(questionsFor("bank", {}).map((x) => x.id), ["goal"]);
  assert.equal(planFor("bank", { goal: "refused" }).steps.length, 3);
});

test("bank: at most three questions, no contradictory account question, ordinary account first, Basiskonto as fallback", () => {
  const ids = (answers) => questionsForEveryday("bank", answers).map((q) => q.id);
  assert.deepEqual(ids({}), ["goal"]);
  assert.deepEqual(ids({ goal: "refused" }), ["goal"]);
  assert.deepEqual(ids({ goal: "open" }), ["goal", "id"]);
  assert.deepEqual(ids({ goal: "another", id: "unknown" }), ["goal", "id"]);
  assert.deepEqual(ids({ goal: "open", id: "eu" }), ["goal", "id", "address"]);
  questionsForEveryday("bank", { goal: "open", id: "eu" }).forEach((q) => assert.ok(!/счёт.*немецк|немецк.*банк/i.test(q.prompt) || q.id === "goal"));
  const labels = JSON.stringify(questionsForEveryday("bank", { goal: "open", id: "eu" }));
  assert.doesNotMatch(labels, /Personalausweis\)|немецкое удостоверение личности \(/);
  const refused = everydayPlan("bank", { goal: "refused" });
  assert.match(refused.steps.at(-1).detail, /BaFin/);
  assert.match(refused.steps.at(-1).detail, /бесплатно/);
  assert.match(everydayPlan("bank", { goal: "open", id: "fiction" }).summary, /Fiktionsbescheinigung/);
  assert.equal(everydayPlan("bank", { goal: "open", id: "unknown" }).fit, "insufficient");
  const ok = everydayPlan("bank", { goal: "open", id: "foreign", address: "no" });
  assert.deepEqual(ok.methods.map((m) => m.id), ["remote", "branch"]);
  const [remote, branch] = ok.methods;
  assert.equal(remote.kind, "online");
  assert.ok(remote.steps.some((s) => /Videoident/.test(s.detail) && /без визита/i.test(s.title)));
  assert.ok(branch.steps.some((s) => /отделени/.test(s.title)));
  assert.ok(remote.steps.some((s) => /почтовый адрес/.test(s.detail)));
  assert.ok(remote.documents.some((d) => /Почтовый адрес/.test(d)));
  // ordinary account comes first, Basiskonto is the fallback step, not the main path
  assert.ok(!/Basiskonto/.test(remote.steps[0].title));
  assert.ok(remote.steps.some((s) => /Если банк отказал.*Basiskonto/.test(s.title) && /10 рабочих дней/.test(s.detail)));
  assert.ok(remote.facts.some((f) => f.kind === "official" && /10 рабочих дней/.test(f.value)));
  const second = everydayPlan("bank", { goal: "another", id: "eu", address: "yes" });
  assert.match(second.title, /Ещё один счёт/);
  assert.ok(second.methods.every((m) => !m.steps.some((s) => /Basiskonto:/.test(s.title))));
  assert.equal(everydayPlan("bank", { goal: "open", id: "authority", address: "yes" }).methods[0].availability, "conditional");
  assert.match(textOf(everydayPlan("bank", { goal: "open", id: "ukraine", address: "yes" })), /Anlaufbescheinigung/);
  assert.match(ok.note, /консультационная служба/);
  const all = JSON.stringify([ok, second, refused]);
  assert.doesNotMatch(all, /трудно добираться|тяжело общаться|потребительских организаций/);
  assert.doesNotMatch(all, /уточните у банка|спросите заранее|уточните заранее|уточните по телефону|спросите при записи|спросите у банка|Позвоните заранее/);
  const providers = (m) => m.providers.map((p) => p.id);
  assert.deepEqual(providers(remote), ["dkb", "ing", "n26", "revolut", "vivid"]);
  assert.deepEqual(providers(branch), ["berliner-sparkasse", "commerzbank", "postbank"]);
  [...remote.providers, ...branch.providers].forEach((p) => {
    assert.ok(p.links.length >= 1);
    assert.ok(p.facts.length >= 1);
    assert.doesNotMatch(JSON.stringify(p), /уточните|спросите/);
  });
  assert.doesNotMatch(JSON.stringify(ok), /kontenvergleich/i);
  assert.ok(branch.providers.every((p) => p.facts.some((f) => f.kind === "provider")));
  [refused, ok, second].forEach(checkLinks);
});

test("telecom: new contract offers remote and shop, other needs stay single-path", () => {
  assert.deepEqual(questionsForEveryday("telecom", { need: "new" }).map((x) => x.id), ["need", "product"]);
  assert.deepEqual(questionsForEveryday("telecom", { need: "problem" }).map((x) => x.id), ["need", "issue"]);
  const created = everydayPlan("telecom", { need: "new" });
  assert.deepEqual(created.methods.map((m) => m.id), ["remote", "shop"]);
  const remote = created.methods[0];
  assert.ok(remote.steps.some((step) => /14-дневное право отзыва/.test(step.detail)));
  assert.ok(remote.steps.some((step) => /24 месяцев/.test(step.detail) && /12 месяцев/.test(step.detail)));
  assert.match(created.methods[1].steps[3].title, /магазине/);
  assert.match(remote.steps[0].detail, /Aufenthaltstitel/);
  assert.ok(remote.providers.length >= 3 && created.methods[1].providers.length >= 2);
  [remote, created.methods[1]].forEach((m) => m.providers.forEach((p) => assert.ok(p.links.length > 0 && !/уточните|спросите/i.test(JSON.stringify(p)))));
  const unlimited = everydayPlan("telecom", { need: "new", product: "unlimited" });
  assert.deepEqual(unlimited.methods.map((m) => m.id), ["app", "contract"]);
  assert.ok(unlimited.methods[0].providers.some((p) => /FUNK/.test(p.name) && /eSIM/.test(JSON.stringify(p))));
  const home = everydayPlan("telecom", { need: "new", product: "home" });
  assert.deepEqual(home.methods.map((m) => m.id), ["home-5g", "home-fixed"]);
  [unlimited, home].forEach((pl) => { checkLinks(pl); pl.methods.forEach((m) => m.providers.forEach((p) => assert.ok(p.links.length > 0 && !/уточните|спросите/i.test(JSON.stringify(p))))); });
  assert.match(everydayPlan("telecom", { need: "switch" }).steps[1].detail, /один рабочий день|одного рабочего дня/);
  assert.match(everydayPlan("telecom", { need: "problem", issue: "speed" }).steps[0].detail, /15 Мбит\/с/);
  assert.match(everydayPlan("telecom", { need: "problem", issue: "outage" }).steps[0].detail, /20%/);
  ["new", "switch", "cancel", "problem"].forEach((need) => checkLinks(everydayPlan("telecom", { need, issue: "change" })));
});

test("dog: registration methods, tax and the listed-breed procedure", () => {
  assert.deepEqual(questionsForEveryday("dog", { stage: "move" }).map((x) => x.id), ["stage"]);
  assert.deepEqual(questionsForEveryday("dog", { stage: "new", breed: "yes" }).map((x) => x.id), ["stage", "breed"]);
  assert.deepEqual(questionsForEveryday("dog", { stage: "new", breed: "no" }).map((x) => x.id), ["stage", "breed", "leash"]);
  const normal = everydayPlan("dog", { stage: "new", breed: "no", leash: "yes" });
  assert.deepEqual(normal.methods.map((m) => m.id), ["online", "written"]);
  assert.ok(normal.methods[0].facts.some((f) => /17,50/.test(f.value)));
  assert.ok(normal.methods[1].facts.some((f) => /26,50/.test(f.value)));
  assert.match(normal.methods[0].steps.map((s) => s.detail).join(" "), /€17,50/);
  assert.match(normal.methods[1].steps.map((s) => s.detail).join(" "), /€26,50/);
  const text = textOf(normal);
  assert.match(text, /с 1 января 2024 года/);
  assert.match(text, /Hundeführerschein/);
  assert.doesNotMatch(text, /Pit Bull|намордник/);
  const listed = everydayPlan("dog", { stage: "new", breed: "yes" });
  const listedText = textOf(listed);
  assert.match(listedText, /3 недел/);
  assert.match(listedText, /8 недел/);
  assert.match(listedText, /€30/);
  assert.match(listedText, /Wesenstest/);
  assert.match(listedText, /не длиннее 2 м/);
  assert.equal(listed.fit, "conditional");
  assert.match(listed.summary, /Pit Bull Terrier, American Staffordshire Terrier, Bull Terrier/);
  assert.match(everydayPlan("dog", { stage: "ended" }).steps[0].detail, /Снять собаку с учёта/);
  assert.match(everydayPlan("dog", { stage: "new", breed: "unsure" }).title, /Listenhunde/);
  assert.equal(everydayPlan("dog", { stage: "new", breed: "unsure" }).fit, "insufficient");
  [normal, listed, everydayPlan("dog", { stage: "move" }), everydayPlan("dog", { stage: "ended" })].forEach(checkLinks);
});

test("dog insurance is not described as a blanket €1M rule", () => {
  const all = JSON.stringify([everydayPlan("dog", { stage: "new", breed: "no" }), everydayPlan("dog", { stage: "new", breed: "yes" })]);
  assert.doesNotMatch(all, /1 млн/);
  assert.ok(everydayOfficial.dogFaq.startsWith("https://www.berlin.de/"));
});

test("wbs: status and stay decide the result, two submission methods, no dead end", () => {
  const ids = (a) => questionsForEveryday("wbs", a).map((x) => x.id);
  assert.deepEqual(ids({}), ["status"]);
  assert.deepEqual(ids({ status: "short" }), ["status"]);
  assert.deepEqual(ids({ status: "eu", stay: "no" }), ["status", "stay"]);
  assert.deepEqual(ids({ status: "eu", stay: "yes" }), ["status", "stay", "household"]);
  assert.equal(everydayPlan("wbs", { status: "none" }).fit, "redirect");
  assert.equal(everydayPlan("wbs", { status: "short" }).fit, "redirect");
  assert.equal(everydayPlan("wbs", { status: "eu", stay: "no" }).fit, "redirect");
  assert.equal(everydayPlan("wbs", { status: "unknown" }).fit, "insufficient");
  const ok = everydayPlan("wbs", { status: "permit", stay: "yes", household: "wg" });
  assert.equal(ok.fit, "fits");
  assert.deepEqual(ok.methods.map((m) => m.id), ["online", "paper"]);
  assert.match(ok.summary, /WG/);
  assert.ok(ok.methods.every((m) => m.facts.some((f) => /бесплатно/.test(f.value))));
  assert.ok(ok.methods[0].conditions.some((c) => /30 МБ/.test(c)));
  assert.equal(everydayPlan("wbs", { status: "eu", stay: "unknown", household: "alone" }).fit, "conditional");
  ["none", "short", "unknown"].forEach((status) => assert.ok(everydayPlan("wbs", { status }).steps.length >= 1));
  const hostsWbs = ["service.berlin.de", "liste-antraege.bda.service.berlin.de", "ssl.stadtentwicklung.berlin.de", "www.berlin.de", "willkommenszentrum.berlin.de"];
  stepsOf(ok).forEach((s) => [s.action, s.source].forEach((l) => assert.ok(l.href.startsWith("/") || hostsWbs.includes(new URL(l.href).host), l.href)));
});

test("LEA and housing use the unified guided frame with a conclusion", async () => {
  const { planFor: guided, questionsFor: qs } = await import("../app/berlin/new-routes/route-plans.ts");
  assert.ok(qs("lea", {}).length <= 4 && qs("housing", {}).length <= 4);
  const ok = guided("lea", { city: "berlin", document: "valid", goal: "extend", basis: "work" });
  assert.equal(ok.fit, "fits");
  assert.equal(ok.methods.length, 1);
  assert.ok(ok.why.length >= 3 && ok.singleMethodNote && ok.next);
  assert.ok(ok.methods[0].facts.some((f) => /четыре месяца/.test(f.value)));
  assert.ok(ok.methods[0].documents.length > 0);
  const eu = guided("lea", { city: "berlin", document: "eu" });
  assert.equal(eu.fit, "redirect");
  assert.ok(eu.next && eu.steps.length > 0 && eu.why.length > 0);
  assert.equal(guided("lea", { city: "berlin", document: "other" }).fit, "insufficient");
  const flat = guided("housing", { housing: "apartment", income: "german", schufa: "no", wbs: "yes" });
  assert.deepEqual(flat.methods.map((m) => m.id), ["municipal", "coop", "private", "swap"]);
  assert.ok(flat.methods.every((m) => m.steps.length >= 5 && m.documents.length > 0));
  assert.ok(flat.methods[0].steps.some((s) => s.action.href === "/berlin/wbs"));
  assert.deepEqual(guided("housing", { housing: "room", income: "none", schufa: "unknown", wbs: "no" }).methods.map((m) => m.id), ["private", "swap"]);
  [ok, eu, flat].forEach(checkLinksLoose);
});
function checkLinksLoose(plan) {
  const all = [...plan.steps, ...(plan.methods ?? []).flatMap((m) => m.steps)];
  all.forEach((s) => [s.action, s.source, s.alternative].filter(Boolean).forEach((l) => { assert.ok(l.label.length > 3); assert.ok(l.href.startsWith("/") || l.href.startsWith("https://")); }));
  assert.ok(!/уточните|спросите/i.test(JSON.stringify(plan)), "no dead-end phrasing");
}
