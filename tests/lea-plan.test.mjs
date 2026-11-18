import assert from "node:assert/strict";
import test from "node:test";
import { official, planFor, questions, visibleQuestions } from "../app/berlin/aufenthalt/lea-plan.ts";

const base = { city: "berlin", document: "valid", goal: "extend", basis: "work" };

test("each supported extension has a direct official form and a later personal stage", () => {
  for (const basis of ["work", "study", "spouse", "humanitarian"]) {
    const plan = planFor({ ...base, basis });
    assert.equal(plan.supported, true);
    assert.deepEqual(plan.steps.map((step) => step.mode), ["Онлайн", "Онлайн", "Ожидание", "Лично", "Лично"]);
    assert.ok(plan.steps[1].action.href.includes(".service.berlin.de/intelliform/"));
    assert.ok(plan.steps.every((step) => step.source.href.startsWith("https://")));
    assert.match(plan.steps[2].detail, /календарь.*закрыт/);
  }
});

test("similar but distinct status routes do not receive a misleading extension form", () => {
  const cases = [
    [{ ...base, city: "elsewhere" }, official.directory],
    [{ ...base, document: "eu" }, official.eu],
    [{ ...base, document: "schengen" }, official.schengen],
    [{ ...base, document: "dvisa" }, official.directory],
    [{ ...base, document: "expired" }, official.contact],
    [{ ...base, document: "other" }, official.directory],
    [{ ...base, goal: "change" }, official.employerChange],
    [{ ...base, goal: "first" }, official.directory],
    [{ ...base, basis: "ukraine" }, official.ukraine],
    [{ ...base, basis: "other" }, official.directory],
  ];
  for (const [answers, expected] of cases) {
    const plan = planFor(answers);
    assert.equal(plan.supported, false, JSON.stringify(answers));
    assert.equal(plan.steps[0].action.href, expected);
    assert.ok(!plan.steps.some((step) => step.action?.href.includes("/intelliform/")));
  }
});

test("questions explicitly ask for geography, document, aim and current basis", () => {
  assert.deepEqual(questions.map((q) => q.id), ["city", "document", "goal", "basis"]);
  assert.deepEqual(visibleQuestions({}).map((q) => q.id), ["city"]);
  assert.deepEqual(visibleQuestions({ city: "berlin", document: "schengen" }).map((q) => q.id), ["city", "document"]);
  assert.deepEqual(visibleQuestions({ city: "berlin", document: "valid", goal: "first" }).map((q) => q.id), ["city", "document", "goal"]);
  assert.deepEqual(visibleQuestions(base).map((q) => q.id), ["city", "document", "goal", "basis"]);
  assert.match(planFor({ ...base, basis: "humanitarian" }).steps[0].detail, /восемь недель/);
  assert.match(planFor({ ...base, basis: "work" }).steps[0].detail, /четыре месяца/);
});
