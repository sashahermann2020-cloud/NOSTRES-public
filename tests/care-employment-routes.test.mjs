import test from "node:test";
import assert from "node:assert/strict";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const forbidden = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
const hosts = new Set(["service.berlin.de", "willkommenszentrum.berlin.de", "www.berlin.de", "www.arbeitsagentur.de", "arbeitsagentur.de", "www.make-it-in-germany.com", "www.zoll.de", "eures.europa.eu", "www.karriereportal-stellen.berlin.de", "kita-navigator.berlin.de"]);

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

for (const id of ["kita", "employment"]) {
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

test("kita: age and hours decide documents, a baby gets proof of need", () => {
  const tiny = planFor("kita", { need: "kita", address: "yes", age: "tiny" });
  assert.equal(tiny.fit, "insufficient");
  const baby = planFor("kita", { need: "kita", address: "yes", age: "baby" });
  const older = planFor("kita", { need: "kita", address: "yes", age: "older", hours: "seven" });
  const more = planFor("kita", { need: "kita", address: "yes", age: "older", hours: "more" });
  assert.deepEqual(baby.methods.map((m) => m.id), ["mail", "in-person"]);
  assert.ok(baby.methods[0].documents.length > older.methods[0].documents.length);
  assert.equal(more.methods[0].documents.length, baby.methods[0].documents.length);
  assert.ok(planFor("kita", { need: "kita", address: "no", age: "baby" }).methods[0].steps.length > baby.methods[0].steps.length);
});

test("school and birth: situation changes the steps", () => {
  assert.notEqual(JSON.stringify(planFor("kita", { need: "school", child: "first" })), JSON.stringify(planFor("kita", { need: "school", child: "newcomer", age8: "from8" })));
  assert.match(JSON.stringify(planFor("kita", { need: "birth", place: "home", docs: "german" })), /одну неделю|одна неделя|в течение недели/);
  assert.match(JSON.stringify(planFor("kita", { need: "birth", place: "clinic", docs: "foreign" })), /апостиль/);
});

test("birth abroad: eligibility of the child changes the plan", () => {
  const eligible = planFor("kita", { need: "birth", place: "abroad", citizenship: "german" });
  const other = planFor("kita", { need: "birth", place: "abroad", citizenship: "other" });
  assert.equal(eligible.fit, "conditional");
  assert.match(JSON.stringify(eligible), /80 €/);
  assert.match(JSON.stringify(other), /признаются/);
  assert.deepEqual(questionsFor("kita", { need: "birth", place: "abroad" }).map((x) => x.id), ["need", "place", "citizenship"]);
});

test("employment: status decides, EU needs no permit, problems point to Zoll hotline", () => {
  assert.equal(planFor("employment", { goal: "search", citizen: "noneu", status: "none" }).fit, "redirect");
  assert.equal(planFor("employment", { goal: "search", citizen: "noneu", status: "duldung" }).fit, "conditional");
  assert.equal(planFor("employment", { goal: "permit", citizen: "eu" }).fit, "fits");
  assert.match(JSON.stringify(planFor("employment", { goal: "problem", issue: "pay" })), /030 60280028/);
  assert.deepEqual(questionsFor("employment", { goal: "problem" }).map((x) => x.id), ["goal", "issue"]);
});
