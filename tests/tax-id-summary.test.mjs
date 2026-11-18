import assert from "node:assert/strict";
import test from "node:test";

import { buildTaxIdSummary } from "../app/tax-id-summary.ts";
import { journeys } from "../app/nostres-data.ts";

const journey = journeys.find((item) => item.id === "tax-id");
const method = {
  ...journey.actionMethods.find((item) => item.id === "taxid-online"),
  availability: "ready",
  availabilityLabel: "Доступно",
};

test("Steuer-ID summary contains route state and no sensitive answers", () => {
  const summary = buildTaxIdSummary({
    method,
    doneSteps: [0, 1],
    blockedSteps: { 2: "taxid_address_mismatch" },
    outcome: "waiting",
    sources: journey.sources,
    generatedAt: new Date("2026-09-24T10:00:00Z"),
  });

  assert.match(summary, /Способ: Запросить повторное сообщение IdNr\. онлайн/);
  assert.match(summary, /есть проблема: Адрес не совпадает/);
  assert.match(summary, /автоматическое письмо ожидается/);
  assert.match(summary, /https:\/\/www\.elster\.de/);
  assert.doesNotMatch(summary, /idStatus|registrationHistory|registrationDuty|urgency/);
  assert.doesNotMatch(summary, /\b\d{11}\b/);
});
