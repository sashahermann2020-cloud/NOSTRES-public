import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const cases = [
  ["Anmeldung", "app/berlin/anmeldung/AnmeldungJourney.tsx", ["personal-result", "questions", "route-steps", "method-choice", "provider-choice", "report-source"]],
  ["guided", "app/berlin/new-routes/GuidedRoute.tsx", ["new-route-result"]],
];

for (const [label, file, ids] of cases) {
  test(`${label}: result/stage targets support keyboard focus and reduced motion`, () => {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(source, /prefers-reduced-motion: reduce/);
    for (const id of ids) {
      assert.ok(source.includes(`id="${id}" tabIndex={-1}`), `${id} must be programmatically focusable`);
    }
    assert.match(source, /\.focus\(\)/);
  });
}
