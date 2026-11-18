import test from "node:test";
import assert from "node:assert/strict";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const forbidden = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
const hosts = new Set(["service.berlin.de", "elterngeld-digital.de", "familienportal.de", "www.gesetze-im-internet.de", "www.arbeitsagentur.de", "web.arbeitsagentur.de", "www.elster.de", "www.berlin.de"]);

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

for (const id of ["elterngeld", "kinderzuschlag", "steuererklaerung"]) {
  test(`${id}: every result is concrete, has steps and only official links`, () => {
    const all = plans(id);
    assert.ok(all.length >= 6);
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

test("elterngeld: status and birth date decide the plan", () => {
  const base = { timing: "born", birth: "new", income: "employee" };
  assert.equal(planFor("elterngeld", { ...base, citizen: "eu" }).fit, "fits");
  assert.equal(planFor("elterngeld", { ...base, citizen: "noneu", permit: "duldung" }).fit, "redirect");
  assert.equal(planFor("elterngeld", { ...base, citizen: "noneu", permit: "other" }).fit, "conditional");
  assert.match(JSON.stringify(planFor("elterngeld", { ...base, citizen: "eu" })), /175 000/);
  assert.match(JSON.stringify(planFor("elterngeld", { ...base, citizen: "eu", birth: "mid" })), /200 000/);
  assert.match(JSON.stringify(planFor("elterngeld", { timing: "change", citizen: "eu", birth: "new" })), /Änderungsantrag/);
});

test("elterngeld: self-employed income proof and work during the benefit change the plan", () => {
  const base = { timing: "born", citizen: "eu", birth: "new", income: "self" };
  assert.deepEqual(questionsFor("elterngeld", base).map((x) => x.id).slice(-2), ["taxbill", "during"]);
  assert.deepEqual(questionsFor("elterngeld", { ...base, income: "employee" }).map((x) => x.id).slice(-1), ["income"]);
  const withBill = JSON.stringify(planFor("elterngeld", { ...base, taxbill: "yes", during: "no" }));
  const noBill = JSON.stringify(planFor("elterngeld", { ...base, taxbill: "no", during: "no" }));
  const working = JSON.stringify(planFor("elterngeld", { ...base, taxbill: "yes", during: "yes" }));
  assert.match(withBill, /Einkommensteuerbescheid/);
  assert.match(noBill, /предварительно/);
  assert.match(working, /32 часов/);
  assert.match(working, /прогноз/i);
  assert.doesNotMatch(withBill, /32 часов в неделю; фактический/);
});

test("kinderzuschlag: Kindergeld and income thresholds decide", () => {
  assert.equal(planFor("kinderzuschlag", { kindergeld: "no" }).next.href, "/berlin/kindergeld");
  assert.equal(planFor("kinderzuschlag", { kindergeld: "yes", household: "single", income: "low" }).fit, "redirect");
  assert.equal(planFor("kinderzuschlag", { kindergeld: "yes", household: "couple", income: "enough", status: "eu" }).fit, "fits");
  assert.equal(planFor("kinderzuschlag", { kindergeld: "yes", household: "couple", income: "enough", status: "other" }).fit, "conditional");
  assert.match(JSON.stringify(planFor("kinderzuschlag", { kindergeld: "yes", household: "single", income: "low" })), /600/);
});

test("tax: self-employed file electronically, adviser changes the deadline", () => {
  const self = planFor("steuererklaerung", { kind: "self", year: "recent", help: "own", elster: "yes" });
  assert.deepEqual(self.methods.map((m) => m.id), ["elster"]);
  const single = planFor("steuererklaerung", { kind: "single", year: "recent", help: "own", elster: "yes" });
  assert.deepEqual(single.methods.map((m) => m.id), ["elster", "paper"]);
  assert.match(JSON.stringify(planFor("steuererklaerung", { kind: "single", year: "recent", help: "adviser" })), /конца февраля/);
  assert.match(JSON.stringify(planFor("steuererklaerung", { kind: "single", year: "old", help: "own", elster: "yes" })), /31 декабря 2026/);
  assert.match(JSON.stringify(planFor("steuererklaerung", { kind: "multi", year: "recent", help: "own", elster: "no" })), /до двух недель/);
});
