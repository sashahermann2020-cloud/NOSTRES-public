import assert from "node:assert/strict";
import test from "node:test";
import { loadStartProgress, saveStartProgress, START_PROGRESS_KEY } from "../app/berlin/start/progress-storage.ts";

function memory(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { values, getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test("saves every partial answer and resumes the last questionnaire stage", () => {
  const storage = memory();
  assert.equal(saveStartProgress({ answers: { location: "already", access: "online" }, stage: 3, confirmed: ["tax-id"] }, storage), true);
  assert.deepEqual(loadStartProgress(storage), {
    answers: { location: "already", access: "online" }, stage: 3, confirmed: ["tax-id"],
    checkedAt: JSON.parse(storage.values.get(START_PROGRESS_KEY)).checkedAt,
  });
});

test("reads existing MVP 0.9 saved answers without requiring new fields", () => {
  const storage = memory({ [START_PROGRESS_KEY]: JSON.stringify({ answers: { location: "already" }, checkedAt: "2026-10-12" }) });
  assert.deepEqual(loadStartProgress(storage), { answers: { location: "already" }, stage: 0, confirmed: [], checkedAt: "2026-10-12" });
});

test("keeps current progress usable when browser storage is blocked or malformed", () => {
  assert.equal(saveStartProgress({ answers: { location: "already" }, stage: 0, confirmed: [] }, { getItem: () => null, setItem: () => { throw new Error("quota"); } }), false);
  assert.equal(loadStartProgress(memory({ [START_PROGRESS_KEY]: "broken" })), null);
});
