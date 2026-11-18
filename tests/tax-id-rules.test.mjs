import assert from "node:assert/strict";
import test from "node:test";

import {
  getAvailableActionMethods,
  getPersonalizedResult,
  getVisibleQuestions,
  journeys,
  taxIdProblems,
} from "../app/nostres-data.ts";

const journey = journeys.find((item) => item.id === "tax-id");

function methods(answers) {
  return getAvailableActionMethods(journey, answers).map((method) => method.id);
}

test("an existing Steuer-ID is reused rather than issued again", () => {
  const answers = { idStatus: "have" };
  assert.deepEqual(methods(answers), ["taxid-find"]);
  assert.match(getPersonalizedResult("tax-id", answers).title, /Новая Steuer-ID вам не нужна/);
  assert.equal(getVisibleQuestions(journey, answers).length, 1);
});

test("recent first Anmeldung offers automatic mail and urgent Finanzamt", () => {
  const answers = {
    idStatus: "notReceived",
    registrationHistory: "current",
    firstRegistrationAge: "under3",
    urgency: "normal",
  };
  assert.deepEqual(methods(answers), ["taxid-wait", "taxid-urgent"]);
  assert.match(getPersonalizedResult("tax-id", answers).text, /4–8 недель/);
});

test("lost IdNr offers online re-notification and personal urgent route", () => {
  const answers = {
    idStatus: "lost",
    registrationHistory: "current",
    urgency: "urgent",
  };
  assert.deepEqual(methods(answers), ["taxid-online", "taxid-urgent"]);
  assert.match(getPersonalizedResult("tax-id", answers).text, /4 недели/);
});

test("a person with registration duty is sent to Anmeldung first", () => {
  const answers = {
    idStatus: "unsure",
    registrationHistory: "never",
    registrationDuty: "mustRegister",
  };
  assert.deepEqual(methods(answers), ["taxid-anmeldung-first"]);
  assert.match(getPersonalizedResult("tax-id", answers).title, /Сначала выполните Anmeldung/);
});

test("nonresident employee gets the dedicated Finanzamt procedure", () => {
  const answers = {
    idStatus: "unsure",
    registrationHistory: "never",
    registrationDuty: "employee",
  };
  assert.deepEqual(methods(answers), ["taxid-nonresident-employee"]);
  assert.match(getPersonalizedResult("tax-id", answers).title, /010250/);
});

test("no tax connection does not invent a Steuer-ID application route", () => {
  const answers = {
    idStatus: "unsure",
    registrationHistory: "never",
    registrationDuty: "none",
  };
  assert.deepEqual(methods(answers), []);
  assert.match(getPersonalizedResult("tax-id", answers).title, /не нужен/);
});

test("each Steuer-ID step and timeline fact has an official source", () => {
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

test("every Steuer-ID problem has an official fallback", () => {
  const sourceIds = new Set(journey.sources.map((source) => source.id).filter(Boolean));
  for (const problem of taxIdProblems) {
    assert.ok(problem.methodTypes.length > 0);
    assert.ok(problem.actions.length > 0);
    assert.ok(problem.actions.every((action) => action.url.startsWith("https://")));
    problem.sourceIds.forEach((id) => assert.ok(sourceIds.has(id), `unknown source ${id}`));
  }
});
