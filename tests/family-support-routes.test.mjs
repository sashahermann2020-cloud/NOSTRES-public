import test from "node:test";
import assert from "node:assert/strict";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const forbidden = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
const hosts = new Set(["familienportal.de", "www.bundesamtsozialesicherung.de", "www.berlin.de", "www.arbeitsagentur.de", "www.but-beratung.de"]);

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

for (const id of ["mutterschutz", "bildungspaket"]) {
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

test("mutterschutz: insurance decides who pays, status decides the route", () => {
  const gkv = JSON.stringify(planFor("mutterschutz", { work: "employee", insurance: "gkv", timing: "before", birth: "normal" }));
  const fam = JSON.stringify(planFor("mutterschutz", { work: "employee", insurance: "family", timing: "before", birth: "normal" }));
  assert.match(gkv, /Krankenkasse/);
  assert.match(fam, /Bundesamt für Soziale Sicherung/);
  assert.equal(planFor("mutterschutz", { work: "bg" }).fit, "redirect");
  assert.equal(planFor("mutterschutz", { work: "self" }).fit, "conditional");
});

test("bildungspaket: school level and benefit change the result", () => {
  const kita = JSON.stringify(planFor("bildungspaket", { benefit: "kiz", child: "kita", age: "u18" }));
  const school = JSON.stringify(planFor("bildungspaket", { benefit: "kiz", child: "secondary", age: "u18" }));
  assert.notEqual(kita, school);
  assert.match(school, /174/);
  assert.equal(planFor("bildungspaket", { benefit: "none" }).fit, "redirect");
});
