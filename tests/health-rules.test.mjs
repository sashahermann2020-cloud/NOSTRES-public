import assert from "node:assert/strict";
import test from "node:test";

import {
  getAvailableActionMethods,
  getPersonalizedResult,
  getVisibleQuestions,
  healthProblems,
  journeys,
} from "../app/nostres-data.ts";

const journey = journeys.find((item) => item.id === "health");

function methods(answers) {
  return getAvailableActionMethods(journey, answers).map((method) => method.id);
}

test("employee in compulsory range can choose online or direct GKV route", () => {
  const answers = { goal: "join", insured: "none", situation: "employee", employeeBand: "compulsory" };
  assert.deepEqual(methods(answers), ["health-employee-online", "health-employee-direct"]);
  assert.match(getPersonalizedResult("health", answers).title, /онлайн или через офис/);
});

test("Minijob is not treated as employer health insurance", () => {
  const answers = { goal: "join", insured: "none", situation: "employee", employeeBand: "mini" };
  assert.deepEqual(methods(answers), ["health-clarify"]);
  assert.match(getPersonalizedResult("health", answers).title, /Minijob сам по себе не создаёт/);
});

test("student route includes the age branch", () => {
  const answers = { goal: "join", insured: "foreign", situation: "student", studentAge: "thirtyPlus" };
  assert.deepEqual(methods(answers), ["health-student"]);
  assert.match(getPersonalizedResult("health", answers).text, /После 30 лет/);
});

test("existing GKV member can request eGK without unrelated questions", () => {
  const answers = { goal: "card", insured: "gkv" };
  assert.deepEqual(methods(answers), ["health-egk"]);
  assert.equal(getVisibleQuestions(journey, answers).length, 2);
  assert.match(getPersonalizedResult("health", answers).title, /eGK/);
});

test("current GKV member can switch without answering status questions", () => {
  const answers = { goal: "switch", insured: "gkv" };
  assert.deepEqual(methods(answers), ["health-switch-gkv"]);
  assert.equal(getVisibleQuestions(journey, answers).length, 2);
});

test("private insurance transition is never treated as automatic", () => {
  const answers = { goal: "switch", insured: "private", situation: "self" };
  assert.deepEqual(methods(answers), ["health-clarify"]);
  assert.match(getPersonalizedResult("health", answers).title, /Не прекращайте PKV/);
});

test("each health step and timeline fact has an official source", () => {
  const sourceIds = new Set(journey.sources.map((source) => source.id).filter(Boolean));
  for (const method of journey.actionMethods) {
    assert.equal(method.stepSourceIds.length, method.steps.length, method.id);
    for (const ids of method.stepSourceIds) {
      assert.ok(ids.length > 0);
      ids.forEach((id) => assert.ok(sourceIds.has(id), `unknown source ${id}`));
    }
    for (const ids of Object.values(method.factSourceIds)) {
      assert.ok(ids.length > 0);
      ids.forEach((id) => assert.ok(sourceIds.has(id), `unknown source ${id}`));
    }
  }
});

test("every health problem has an official fallback", () => {
  const sourceIds = new Set(journey.sources.map((source) => source.id).filter(Boolean));
  for (const problem of healthProblems) {
    assert.ok(problem.methodTypes.length > 0);
    assert.ok(problem.actions.length > 0);
    assert.ok(problem.actions.every((action) => action.url.startsWith("https://")));
    problem.sourceIds.forEach((id) => assert.ok(sourceIds.has(id), `unknown source ${id}`));
  }
});

test("every complete questionnaire branch reaches a result and an actionable path", () => {
  for (const route of journeys.filter((item) => ["anmeldung", "tax-id", "health"].includes(item.id))) {
    let completedBranches = 0;

    function walk(answers) {
      const question = getVisibleQuestions(route, answers).find((item) => !answers[item.id]);
      if (question) {
        for (const option of question.options) walk({ ...answers, [question.id]: option.value });
        return;
      }

      completedBranches += 1;
      const result = getPersonalizedResult(route.id, answers);
      const paths = getAvailableActionMethods(route, answers);
      assert.ok(result?.title && result?.text, `${route.id}: result missing for ${JSON.stringify(answers)}`);
      if (route.id === "tax-id" && answers.registrationHistory === "never" && answers.registrationDuty === "none") {
        assert.equal(paths.length, 0, "no tax connection must not invent an application");
        assert.ok(result.actionUrl.startsWith("https://"));
        return;
      }
      assert.ok(paths.length > 0, `${route.id}: no path for ${JSON.stringify(answers)}`);
      for (const path of paths) {
        assert.ok(path.steps.length > 0, `${route.id}: ${path.id} has no steps`);
        assert.ok(path.links.some((link) => link.url.startsWith("https://")), `${route.id}: ${path.id} has no official action`);
      }
    }

    walk({});
    assert.ok(completedBranches > 0, `${route.id}: no complete branches`);
  }
});
