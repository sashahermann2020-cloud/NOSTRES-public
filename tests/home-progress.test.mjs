import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { ROUTE_IDS } from "../app/api/mvp-events/rules.ts";

// Счётчики «сохранено» и «завершено» на главной учитывают каждый маршрут GuidedRoute.
// До 18.11.2026 нотариус, бессрочный ВНЖ и номер соцстрахования в них не попадали.
test("home counters include every guided route", () => {
  const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const list = (marker) => {
    const line = page.split("\n").find((l) => l.includes(marker));
    assert.ok(line, marker);
    return new Set([...line.split("].includes")[0].matchAll(/"([a-z-]+)"/g)].map((m) => m[1]));
  };
  const started = list("const startedRoutes");
  const completed = list('].includes(id)) return savedRoutes[id]?.outcome === "received"');
  const journeys = new Set(["anmeldung", "tax-id", "health"]); // считаются через publishedJourneys
  for (const id of ROUTE_IDS) {
    if (journeys.has(id)) continue;
    assert.ok(started.has(id), `started: ${id}`);
    if (id !== "housing" && id !== "lea") assert.ok(completed.has(id), `completed: ${id}`);
  }
});
