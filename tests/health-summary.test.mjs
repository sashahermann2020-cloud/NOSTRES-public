import assert from "node:assert/strict";
import test from "node:test";

import { buildHealthInsuranceSummary } from "../app/health-insurance-summary.ts";
import { journeys } from "../app/nostres-data.ts";

const journey = journeys.find((item) => item.id === "health");
const method = journey.actionMethods.find((item) => item.id === "health-employee-online");

test("health summary keeps official route state but excludes sensitive answers", () => {
  const summary = buildHealthInsuranceSummary({
    method,
    doneSteps: [0, 1],
    blockedSteps: { 2: "health_no_confirmation" },
    outcome: "waiting",
    sources: journey.sources,
    generatedAt: new Date("2026-10-02T10:00:00Z"),
  });

  assert.match(summary, /Способ: Оформить государственную страховку онлайн/);
  assert.match(summary, /\[проблема\]/);
  assert.match(summary, /ожидается ответ/);
  assert.match(summary, /https:\/\/www\.gkv-spitzenverband\.de/);
  assert.doesNotMatch(summary, /employeeBand|studentAge|familyCheck/);
  assert.doesNotMatch(summary, /Versichertennummer:\s*\S+/);
});
