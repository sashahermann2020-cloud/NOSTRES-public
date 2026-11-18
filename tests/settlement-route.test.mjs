import assert from "node:assert/strict";
import test from "node:test";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const vague = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
function allPlans() {
  const out = [];
  (function walk(answers) {
    const next = questionsFor("settlement", answers).find((question) => !answers[question.id]);
    if (!next) return out.push([answers, planFor("settlement", answers)]);
    for (const [value] of next.options) walk({ ...answers, [next.id]: value });
  })({});
  return out;
}
const links = (plan) => [...(plan.steps ?? []), ...(plan.methods ?? []).flatMap((m) => m.steps)].flatMap((s) => [s.action, s.source, s.alternative]).filter(Boolean).map((a) => a.href);

test("settlement: every path is concrete and uses official links", () => {
  for (const [answers, plan] of allPlans()) {
    assert.ok(plan.steps.length > 0, JSON.stringify(answers));
    assert.doesNotMatch(JSON.stringify(plan), vague);
    for (const href of links(plan)) if (!href.startsWith("/")) assert.ok(["service.berlin.de", "www.gesetze-im-internet.de"].includes(new URL(href).host), href);
  }
});

test("settlement: Blue Card needs A1 after 27 months and B1 after 21", () => {
  assert.equal(planFor("settlement", { basis: "blue", blueTime: "m27", language: "a" }).fit, "fits");
  assert.equal(planFor("settlement", { basis: "blue", blueTime: "m21", language: "a" }).fit, "insufficient");
  assert.equal(planFor("settlement", { basis: "blue", blueTime: "m21", language: "b1" }).fit, "fits");
});

test("settlement: refugees need C1 after 3 years and A2 after 5", () => {
  assert.equal(planFor("settlement", { basis: "protection", protectionTime: "y3", language: "b1" }).fit, "insufficient");
  assert.equal(planFor("settlement", { basis: "protection", protectionTime: "y5", language: "a" }).fit, "fits");
});

test("settlement: family of Germans with a permit before 6 September 2013 needs only A1", () => {
  assert.ok(questionsFor("settlement", { basis: "german", germanTime: "y3", language: "a" }).some((q) => q.id === "before2013"));
  assert.equal(planFor("settlement", { basis: "german", germanTime: "y3", language: "a", before2013: "yes" }).fit, "fits");
  assert.equal(planFor("settlement", { basis: "german", germanTime: "y3", language: "a", before2013: "no" }).fit, "insufficient");
});

test("settlement: too short a stay leads to extending the current permit", () => {
  const plan = planFor("settlement", { basis: "other", otherTime: "less" });
  assert.equal(plan.fit, "insufficient");
  assert.equal(plan.next.href, "/berlin/aufenthalt");
  assert.match(JSON.stringify(planFor("settlement", { basis: "skilled", skilledTime: "y3", language: "b1" })), /73,50 €/);
});
