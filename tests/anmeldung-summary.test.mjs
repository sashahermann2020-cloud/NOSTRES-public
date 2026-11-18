import assert from "node:assert/strict";
import test from "node:test";

import { buildAnmeldungSummary } from "../app/anmeldung-summary.ts";
import { journeys } from "../app/nostres-data.ts";

const journey = journeys.find((item) => item.id === "anmeldung");
const method = {
  ...journey.actionMethods.find((item) => item.id === "anmeldung-personal"),
  availability: "ready",
  availabilityLabel: "Доступно",
};

test("summary contains route state and official links without questionnaire answers", () => {
  const summary = buildAnmeldungSummary({
    method,
    doneSteps: [0, 1],
    blockedSteps: { 2: "no_appointment" },
    outcome: "refused",
    sources: journey.sources,
    generatedAt: new Date("2026-09-24T10:00:00Z"),
  });

  assert.match(summary, /Способ: Прийти в Bürgeramt/);
  assert.match(summary, /\[выполнено\]/);
  assert.match(summary, /есть проблема: Нет свободной записи/);
  assert.match(summary, /Получен отказ или документы не приняли/);
  assert.match(summary, /https:\/\/service\.berlin\.de/);
  assert.doesNotMatch(summary, /citizenship|household|onlineId/);
});
