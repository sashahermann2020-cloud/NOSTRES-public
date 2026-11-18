import assert from "node:assert/strict";
import test from "node:test";

import {
  anmeldungProblems,
  getAvailableActionMethods,
  getPersonalizedResult,
  getVisibleQuestions,
  journeys,
} from "../app/nostres-data.ts";

const journey = journeys.find((item) => item.id === "anmeldung");

function methods(answers) {
  return getAvailableActionMethods(journey, answers).map((method) => method.id);
}

const eligible = {
  from: "germany",
  residenceType: "main",
  age: "adult",
  citizenship: "eu",
  household: "single",
  housing: "rent",
  onlineId: "ready",
};

test("eligible adult can choose online or Bürgeramt", () => {
  assert.deepEqual(methods(eligible), ["anmeldung-online", "anmeldung-personal"]);
  assert.match(getPersonalizedResult("anmeldung", eligible).title, /онлайн или Bürgeramt/i);
});

test("online route remains available but marked as setup when eID needs configuration", () => {
  const available = getAvailableActionMethods(journey, { ...eligible, onlineId: "setup" });
  assert.equal(available[0].id, "anmeldung-online");
  assert.equal(available[0].availability, "needs-setup");
});

test("first registration after arriving from abroad only offers Bürgeramt", () => {
  const answers = { from: "abroad", age: "adult", citizenship: "nonEU", household: "single", housing: "rent" };
  assert.equal(getVisibleQuestions(journey, answers).some((question) => question.id === "residenceType"), false);
  assert.equal(getVisibleQuestions(journey, answers).some((question) => question.id === "onlineId"), false);
  assert.deepEqual(methods(answers), ["anmeldung-personal"]);
});

test("keeping another German dwelling requires the personal route", () => {
  const answers = { ...eligible, residenceType: "multiple" };
  delete answers.onlineId;
  assert.deepEqual(methods(answers), ["anmeldung-personal"]);
  assert.match(getPersonalizedResult("anmeldung", answers).text, /Hauptwohnung и Nebenwohnung/);
});

test("eAT without an eligible eID document does not unlock online Anmeldung", () => {
  const answers = { ...eligible, citizenship: "nonEU" };
  delete answers.onlineId;
  assert.deepEqual(methods(answers), ["anmeldung-personal"]);
  assert.match(getPersonalizedResult("anmeldung", answers).text, /eAT/);
});

test("family already registered together can use the online family route", () => {
  assert.deepEqual(methods({ ...eligible, household: "familyTogether" }), ["anmeldung-online", "anmeldung-personal"]);
});

test("special child custody situation only offers Bürgeramt", () => {
  const answers = { ...eligible, household: "childSpecial" };
  delete answers.onlineId;
  assert.deepEqual(methods(answers), ["anmeldung-personal"]);
});

test("missing suitable eID card only offers Bürgeramt", () => {
  assert.deepEqual(methods({ ...eligible, onlineId: "none" }), ["anmeldung-personal"]);
});

test("minor applicant only offers Bürgeramt", () => {
  const answers = { ...eligible, age: "sixteen" };
  delete answers.onlineId;
  assert.deepEqual(methods(answers), ["anmeldung-personal"]);
});

test("each Anmeldung step and timeline fact has an official source reference", () => {
  const sourceIds = new Set(journey.sources.map((source) => source.id).filter(Boolean));
  for (const method of journey.actionMethods) {
    assert.equal(method.stepSourceIds.length, method.steps.length);
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

test("every problem state has a compatible method and official fallback", () => {
  const sourceIds = new Set(journey.sources.map((source) => source.id).filter(Boolean));
  for (const problem of anmeldungProblems) {
    assert.ok(problem.methodTypes.length > 0);
    assert.ok(problem.actions.length > 0);
    assert.ok(problem.actions.every((action) => action.url.startsWith("https://")));
    problem.sourceIds.forEach((id) => assert.ok(sourceIds.has(id), `unknown source ${id}`));
  }
});
