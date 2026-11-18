import test from "node:test";
import assert from "node:assert/strict";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const forbidden = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
const hosts = new Set(["service.berlin.de", "www.bmi.bund.de", "www.arbeitsagentur.de", "www.bundesregierung.de", "willkommenszentrum.berlin.de", "www.bmas.de", "www.berlin.de", "www.gesetze-im-internet.de"]);

function plans(id) {
  const out = [];
  (function walk(a) {
    const next = questionsFor(id, a).find((item) => !a[item.id]);
    if (!next) { out.push([a, planFor(id, a)]); return; }
    next.options.forEach(([value]) => walk({ ...a, [next.id]: value }));
  })({});
  return out;
}
function links(plan) {
  const all = [];
  const add = (x) => x && all.push(x.href);
  plan.steps.forEach((s) => { add(s.action); add(s.source); add(s.alternative); });
  (plan.methods ?? []).forEach((m) => m.steps.forEach((s) => { add(s.action); add(s.source); add(s.alternative); }));
  add(plan.next);
  return all;
}

for (const id of ["arbeitslosengeld", "grundsicherungsgeld", "kfz", "einbuergerung"]) {
  test(`${id}: every result is concrete, has steps and only official links`, () => {
    const all = plans(id);
    assert.ok(all.length >= 5);
    for (const [answers, plan] of all) {
      assert.doesNotMatch(JSON.stringify(plan), forbidden, JSON.stringify(answers));
      assert.ok(plan.steps.length >= 1, JSON.stringify(answers));
      assert.ok(plan.fit, JSON.stringify(answers));
      for (const href of links(plan)) {
        if (href.startsWith("/")) continue;
        assert.ok(hosts.has(new URL(href).host), `${id}: unexpected host ${href}`);
      }
      (plan.methods ?? []).forEach((m) => assert.ok(m.steps.length >= 2 && m.documents.length >= 1, `${id} ${m.id}`));
    }
  });
}

test("arbeitslosengeld: tenure, children and way of leaving change the result", () => {
  assert.equal(planFor("arbeitslosengeld", { months: "less" }).fit, "redirect");
  assert.equal(planFor("arbeitslosengeld", { months: "m12", status: "nopermit" }).fit, "redirect");
  const base = { months: "m24", status: "eu", end: "employer", age: "u50" };
  assert.match(JSON.stringify(planFor("arbeitslosengeld", { ...base, kids: "yes" })), /67%/);
  assert.match(JSON.stringify(planFor("arbeitslosengeld", { ...base, kids: "no" })), /60%/);
  assert.equal(planFor("arbeitslosengeld", { ...base, kids: "no", end: "own" }).fit, "conditional");
  assert.match(JSON.stringify(planFor("arbeitslosengeld", { ...base, kids: "no", end: "own" })), /12 недель/);
});

test("grundsicherungsgeld: household decides the rates, status can exclude", () => {
  assert.equal(planFor("grundsicherungsgeld", { who: "alone", status: "other" }).fit, "redirect");
  const alone = JSON.stringify(planFor("grundsicherungsgeld", { who: "alone", status: "permit", al: "none", home: "stay", income: "none", special: "none", age: "u30", savings: "no" }));
  const pair = JSON.stringify(planFor("grundsicherungsgeld", { who: "partner", status: "permit", al: "none", home: "stay", income: "none", special: "none", age: "u30", savings: "no" }));
  assert.match(alone, /563/);
  assert.match(alone, /449,00/);
  assert.match(pair, /506/);
  assert.match(pair, /543,40/);
  assert.match(JSON.stringify(planFor("grundsicherungsgeld", { who: "alone", status: "permit", al: "ends", home: "move", income: "none", special: "pregnant", age: "u25", savings: "yes" })), /Zusicherung/);
  assert.equal(planFor("grundsicherungsgeld", { who: "alone", status: "permit", al: "none", home: "stay", income: "none", special: "none", age: "o51", savings: "yes" }).fit, "conditional");
  assert.match(JSON.stringify(planFor("grundsicherungsgeld", { who: "family", size: "4", status: "permit", al: "none", home: "stay", income: "none", special: "none", age: "o51", savings: "no" })), /752,40/);
});

test("kfz: main residence is required, within-Berlin and arriving cars differ", () => {
  assert.equal(planFor("kfz", { from: "outside", home: "second" }).fit, "redirect");
  const within = planFor("kfz", { from: "berlin", eid: "yes", who: "self" });
  assert.deepEqual(within.methods.map((m) => m.id), ["online", "office"]);
  const arriving = JSON.stringify(planFor("kfz", { from: "outside", home: "main", plate: "wish", hu: "yes", who: "self" }));
  assert.match(arriving, /Fahrzeugbrief/);
  assert.match(arriving, /17,50/);
  assert.match(arriving, /unverzüglich/);
});

test("einbuergerung: missing conditions are listed, too early is a redirect", () => {
  assert.equal(planFor("einbuergerung", { years: "less" }).fit, "redirect");
  const ready = planFor("einbuergerung", { years: "five", title: "perm", lang: "b1", test: "have", income: "own", record: "no", kids: "no" });
  assert.equal(ready.fit, "fits");
  const gap = planFor("einbuergerung", { years: "five", title: "perm", lang: "no", test: "no", income: "own", record: "no", kids: "yes" });
  assert.equal(gap.fit, "conditional");
  assert.match(JSON.stringify(gap), /51 €/);
  assert.match(JSON.stringify(ready), /27 июня 2024/);
});

test("Grundsicherungsgeld считает одинокого родителя по размеру домохозяйства", () => {
  const base = { status: "permit", al: "none", home: "stay", income: "none", special: "none", age: "u30", savings: "no" };
  const one = JSON.stringify(planFor("grundsicherungsgeld", { who: "lone", children: "1", ...base }));
  assert.match(one, /543,40/);
  assert.doesNotMatch(one, /449,00/);
  assert.match(one, /357 €/);
  assert.match(JSON.stringify(planFor("grundsicherungsgeld", { who: "lone", children: "3", ...base })), /752,40/);
  assert.match(JSON.stringify(planFor("grundsicherungsgeld", { who: "lone", children: "4", ...base })), /903,72/);
  assert.match(JSON.stringify(planFor("grundsicherungsgeld", { who: "alone", ...base })), /449,00/);
});

test("Arbeitslosengeld по коротким договорам называет условия сокращённого правила", () => {
  const plan = planFor("arbeitslosengeld", { months: "short", status: "permit", kids: "no", end: "employer" });
  assert.equal(plan.fit, "conditional");
  const text = JSON.stringify(plan);
  assert.match(text, /6 месяцев/);
  assert.match(text, /14 неделями|до 14 недель/);
  assert.match(text, /не выше установленного предела/);
});

test("Integrationskurs для убежища, Duldung и § 24 зависит от свободных мест", () => {
  for (const status of ["asyl", "ukr"]) {
    const plan = planFor("language", { status, german: "no", income: "no", format: "general" });
    assert.equal(plan.fit, "conditional");
    assert.match(JSON.stringify(plan), /в рамках свободных мест/);
  }
});

