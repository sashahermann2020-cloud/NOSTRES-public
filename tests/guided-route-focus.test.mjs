import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("guided routes move keyboard focus to the generated result", () => {
  const source = readFileSync(new URL("../app/berlin/new-routes/GuidedRoute.tsx", import.meta.url), "utf8");
  assert.match(source, /id="new-route-result" tabIndex=\{-1\}/);
  assert.match(source, /result\?\.focus\(\)/);
});

test("guided route result scrolling respects reduced-motion preferences", () => {
  const source = readFileSync(new URL("../app/berlin/new-routes/GuidedRoute.tsx", import.meta.url), "utf8");
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /\? "auto" : "smooth"/);
});
