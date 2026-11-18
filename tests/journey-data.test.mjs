import assert from "node:assert/strict";
import test from "node:test";
import { journeys } from "../app/nostres-data.ts";
import { factKinds, factFieldOrder } from "../app/berlin/anmeldung/fact-kinds.ts";

const ids = ["anmeldung", "tax-id", "health"];
const kinds = new Set(["official", "provider", "authority", "editorial", "load", "none"]);

for (const id of ids) {
  test(`${id}: every method has typed facts, official links, steps, result and fallback`, () => {
    const journey = journeys.find((item) => item.id === id);
    const sourceIds = new Set(journey.sources.map((source) => source.id));
    assert.ok(journey.actionMethods.length > 0);
    for (const method of journey.actionMethods) {
      const typed = factKinds[method.id];
      assert.ok(typed, `${method.id}: no fact kinds`);
      for (const field of factFieldOrder) {
        assert.ok(kinds.has(typed[field]), `${method.id}.${field}: bad kind`);
        assert.ok(String(method[field]).length > 3, `${method.id}.${field}: empty value`);
        (method.factSourceIds?.[field] ?? []).forEach((sid) => assert.ok(sourceIds.has(sid), `${method.id}.${field}: unknown source ${sid}`));
      }
      assert.ok(method.steps.length >= 3, `${method.id}: steps`);
      assert.ok(method.expectedResult.length > 0 && method.fallback.length > 0, `${method.id}: result/fallback`);
      assert.ok(method.links.length > 0);
      method.links.forEach((link) => assert.ok(link.url.startsWith("/") || link.url.startsWith("https://"), `${method.id}: link ${link.url}`));
      const text = JSON.stringify([method.steps, method.fallback, method.expectedResult, method.deadline, method.appointmentTime, method.processingTime]);
      assert.ok(!/[Уу]точните у|[Сс]просите у/.test(text), `${method.id}: dead-end phrase`);
      // a "none" kind must not claim a figure
      for (const field of factFieldOrder) if (typed[field] === "none") assert.ok(!/\d+\s*(дн|недел|рабоч|месяц)/i.test(String(method[field])) || /не опубликован|не установлен|нет/i.test(String(method[field])), `${method.id}.${field}: none-kind value states a figure`);
    }
  });
}
test("every journey method id is covered by fact kinds", () => {
  const all = journeys.filter((item) => ids.includes(item.id)).flatMap((item) => item.actionMethods.map((method) => method.id));
  assert.deepEqual(all.filter((id) => !factKinds[id]), []);
  assert.deepEqual(Object.keys(factKinds).filter((id) => !all.includes(id)), []);
});
