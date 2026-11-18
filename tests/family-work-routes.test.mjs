import test from "node:test";
import assert from "node:assert/strict";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const forbidden = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
const hosts = new Set(["www.arbeitsagentur.de"]);

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

for (const id of ["kindergeld", "jobcenter"]) {
  test(`${id}: every result is concrete, has steps and only official links`, () => {
    const all = plans(id);
    assert.ok(all.length >= 3);
    for (const [answers, plan] of all) {
      const text = JSON.stringify(plan);
      assert.doesNotMatch(text, forbidden, JSON.stringify(answers));
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

test("kindergeld: status decides the outcome", () => {
  assert.equal(planFor("kindergeld", { stage: "new", citizen: "eu" }).fit, "conditional");
  assert.equal(planFor("kindergeld", { stage: "new", citizen: "noneu", permit: "work" }).fit, "fits");
  const none = planFor("kindergeld", { stage: "new", citizen: "noneu", permit: "none" });
  assert.equal(none.fit, "redirect");
  assert.equal(none.next.href, "/berlin/aufenthalt");
  assert.deepEqual(questionsFor("kindergeld", { stage: "waiting" }).map((x) => x.id), ["stage"]);
  const ok = planFor("kindergeld", { stage: "new", citizen: "eu" });
  assert.deepEqual(ok.methods.map((m) => m.id), ["online-bundid", "online-print"]);
  assert.ok(ok.methods[0].facts.some((f) => /259/.test(f.value) && f.kind === "official"));
  assert.match(JSON.stringify(planFor("kindergeld", { stage: "waiting" })), /0800 4 555530/);
});

test("jobcenter: registration timing and identification change the plan", () => {
  const before = planFor("jobcenter", { goal: "lost", timing: "before", eid: "yes" });
  const after = planFor("jobcenter", { goal: "lost", timing: "after", eid: "yes" });
  assert.ok(before.methods[0].steps.length > after.methods[0].steps.length);
  assert.match(JSON.stringify(before), /3 месяца/);
  assert.equal(planFor("jobcenter", { goal: "lost", timing: "after", eid: "yes" }).methods[0].id, "online");
  assert.equal(planFor("jobcenter", { goal: "lost", timing: "after", eid: "no" }).methods[0].id, "in-person");
  const money = planFor("jobcenter", { goal: "money" });
  assert.deepEqual(money.methods.map((m) => m.id), ["online", "post"]);
  assert.match(JSON.stringify(money), /1 июля 2026/);
  assert.deepEqual(questionsFor("jobcenter", { goal: "money" }).map((x) => x.id), ["goal"]);
});
