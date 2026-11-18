import test from "node:test";
import assert from "node:assert/strict";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const forbidden = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
const official = ["food.ec.europa.eu", "europa.eu", "www.bmleh.de", "www.zoll.de", "www.gesetze-im-internet.de", "tieraerztekammer-berlin.de", "www.berlin.de", "service.berlin.de"];
// Ветеринарные практики: только в карточках исполнителей, данные с их собственных сайтов.
const practices = ["team-hansavet.de", "www.tierarztpraxis-peters-weissensee.de", "www.tierarzt-otto-suhr.de", "www.tier-arzt.berlin", "www.tierarzt-in-wedding.de"];

function plans(id) {
  const out = [];
  (function walk(a) {
    const next = questionsFor(id, a).find((item) => !a[item.id]);
    if (!next) { out.push([a, planFor(id, a)]); return; }
    next.options.forEach(([value]) => walk({ ...a, [next.id]: value }));
  })({});
  return out;
}
const stepsOf = (plan) => [...plan.steps, ...(plan.methods ?? []).flatMap((m) => m.steps)];
const stepLinks = (plan) => stepsOf(plan).flatMap((s) => [s.action, s.source, s.alternative]).filter(Boolean).map((x) => x.href).concat(plan.next ? [plan.next.href] : []);
const providerLinks = (plan) => (plan.methods ?? []).flatMap((m) => (m.providers ?? []).flatMap((p) => p.links.map((l) => l.href)));

for (const id of ["petmove", "petpass", "vet", "dogtrainer"]) {
  test(`${id}: every result is concrete, has steps and only official links`, () => {
    const all = plans(id);
    assert.ok(all.length >= 4, `${id}: ${all.length} results`);
    for (const [answers, plan] of all) {
      const key = JSON.stringify(answers);
      assert.doesNotMatch(JSON.stringify(plan), forbidden, key);
      assert.ok(plan.fit && plan.steps.length >= 1, key);
      assert.ok(questionsFor(id, answers).length <= 4, key);
      for (const href of stepLinks(plan)) if (!href.startsWith("/")) assert.ok(official.includes(new URL(href).host), `${id}: unexpected host ${href}`);
      for (const href of providerLinks(plan)) assert.ok(practices.includes(new URL(href).host), `${id}: unexpected provider host ${href}`);
      (plan.methods ?? []).forEach((m) => assert.ok(m.steps.length >= 2 && m.documents.length >= 1, `${id} ${m.id} ${key}`));
    }
  });
}

test("petmove: country list decides the rabies antibody test", () => {
  const base = { animal: "cat", prep: "vaccinated" };
  assert.match(JSON.stringify(planFor("petmove", { ...base, from: "unlisted" })), /тест на антитела/i);
  assert.doesNotMatch(planFor("petmove", { ...base, from: "listed" }).methods[0].documents.join(" "), /антител/);
  assert.equal(planFor("petmove", { animal: "dog", from: "unlisted", breed: "yes" }).fit, "insufficient");
  assert.equal(planFor("petmove", { animal: "cat", from: "unknown" }).fit, "clarify");
  assert.ok(!questionsFor("petmove", { animal: "cat", from: "listed" }).find((q) => q.id === "prep").options.some(([v]) => v === "titer"));
  assert.match(JSON.stringify(planFor("petmove", { animal: "dog", from: "eu", breed: "no" })), /sobaka\/marshrut/);
});

test("petmove: birds must not be sent to the EU pet passport procedure", () => {
  const bird = planFor("petmove", { animal: "bird", from: "unlisted" });
  assert.doesNotMatch(JSON.stringify(bird.steps), /Оформите EU-Heimtierausweis/);
  const dog = planFor("petmove", { animal: "dog", from: "unlisted", prep: "vaccinated", breed: "no" });
  assert.match(JSON.stringify(dog.steps), /Оформите EU-Heimtierausweis/);
});

test("vet: language filters practices; emergencies use the chamber list", () => {
  const names = (lang) => planFor("vet", { need: "routine", lang }).methods[0].providers.map((p) => p.id);
  assert.deepEqual(names("ru"), ["hansavet"]);
  assert.ok(!names("tr").includes("ulusal"), "Turkish booking page does not confirm consultation language");
  assert.equal(planFor("vet", { need: "routine", lang: "tr" }).fit, "conditional");
  assert.ok(names("ar").includes("peters") && names("ar").includes("otto-suhr"));
  assert.equal(names("de").length, 5);
  assert.deepEqual(questionsFor("vet", { need: "life" }).map((q) => q.id), ["need"]);
  assert.match(JSON.stringify(planFor("vet", { need: "night" })), /50 €/);
  // При наличии способа показываются только его шаги: адреса клиник и выезд на дом должны быть в них.
  assert.match(JSON.stringify(planFor("vet", { need: "life" }).steps), /0157 859 49 631/);
  assert.deepEqual(planFor("vet", { need: "night" }).methods.map((m) => m.id), ["duty", "home"]);
  assert.match(JSON.stringify(planFor("vet", { need: "night" }).methods.find((m) => m.id === "home").steps), /0157 859 49 631/);
  assert.doesNotMatch(JSON.stringify(planFor("vet", { need: "night" }).methods.find((m) => m.id === "duty").steps), /0157 859 49 631/);
  assert.match(JSON.stringify(planFor("vet", { need: "life" }).methods[0].steps), /Alt-Biesdorf 22/);
});

test("petpass and dogtrainer: answers change the result", () => {
  assert.equal(planFor("petpass", { animal: "other" }).fit, "redirect");
  assert.match(JSON.stringify(planFor("petpass", { animal: "pet", status: "first", chip: "no", rabies: "no" })), /Поставьте микрочип/);
  assert.match(planFor("dogtrainer", { goal: "exam", since: "no", age: "young" }).title, /год/);
  assert.match(planFor("dogtrainer", { goal: "exam", since: "yes" }).title, /не нужен/);
  assert.match(JSON.stringify(planFor("dogtrainer", { goal: "trainer" })), /§ 11/);
});

test("petpass: no dog-specific next step for shared dog/cat/ferret category", () => {
  for (const answers of [{ animal: "pet", status: "eu" }, { animal: "pet", status: "first", chip: "yes", rabies: "yes" }]) {
    const result = planFor("petpass", answers);
    assert.notEqual(result.next?.href, "/berlin/sobaka/marshrut");
    assert.equal(result.next?.href, "/berlin/veterinar");
  }
});

test("petmove: EU documents determine eligibility", () => {
  const base = { animal: "cat", from: "eu" };
  assert.ok(questionsFor("petmove", base).some((q) => q.id === "euDocs"));
  assert.equal(planFor("petmove", { ...base, euDocs: "yes" }).fit, "fits");
  assert.equal(planFor("petmove", { ...base, euDocs: "no" }).fit, "conditional");
  assert.equal(planFor("petmove", { ...base, euDocs: "unknown" }).fit, "conditional");
  assert.ok(!questionsFor("petmove", { animal: "bird", from: "eu" }).some((q) => q.id === "euDocs"));
});
