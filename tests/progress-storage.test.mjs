import assert from "node:assert/strict";
import test from "node:test";
import { ROUTE_STORAGE_KEY, readRouteProgress, readRouteAttempt } from "../app/progress-storage.ts";

const previousNamespace = String.fromCharCode(0x6d, 0x69, 0x72, 0x6d, 0x69);
const previousKey = `${previousNamespace}-berlin-routes-v1`;
function memory(entries = {}) {
  const data = new Map(Object.entries(entries));
  return { data, getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
}

test("moves answers, completion and attempt IDs without changing their values", () => {
  const progress = { anmeldung: { answers: { eid: "yes" }, doneSteps: [1], outcome: "received", attemptId: "existing" } };
  const storage = memory({ [previousKey]: JSON.stringify(progress) });
  assert.deepEqual(JSON.parse(readRouteProgress(storage)), progress);
  assert.equal(storage.getItem(previousKey), null);
  assert.equal(storage.getItem(ROUTE_STORAGE_KEY), JSON.stringify(progress));
});

test("merges missing routes while keeping newer route records", () => {
  const current = { anmeldung: { outcome: "pending" } };
  const previous = { anmeldung: { outcome: "received" }, housing: { outcome: "ready" } };
  const storage = memory({ [previousKey]: JSON.stringify(previous), [ROUTE_STORAGE_KEY]: JSON.stringify(current) });
  assert.deepEqual(JSON.parse(readRouteProgress(storage)), { ...previous, ...current });
  assert.equal(readRouteProgress(storage), storage.getItem(ROUTE_STORAGE_KEY));
});

for (const invalid of ["broken JSON", "[]", "null"]) {
  test(`retains the original when stored progress is invalid: ${invalid}`, () => {
    const storage = memory({ [previousKey]: invalid, [ROUTE_STORAGE_KEY]: '{"health":{"outcome":"received"}}' });
    assert.equal(readRouteProgress(storage), storage.getItem(ROUTE_STORAGE_KEY));
    assert.equal(storage.getItem(previousKey), invalid);
  });
}

test("never deletes old data when writing fails", () => {
  const storage = memory({ [previousKey]: '{"business":{"doneSteps":[0]}}' });
  storage.setItem = () => { throw new Error("quota"); };
  assert.equal(readRouteProgress(storage), null);
  assert.ok(storage.getItem(previousKey));
});

test("keeps both records when newer progress is malformed", () => {
  const storage = memory({ [previousKey]: '{}', [ROUTE_STORAGE_KEY]: 'invalid' });
  assert.equal(readRouteProgress(storage), "invalid");
  assert.equal(storage.getItem(previousKey), "{}");
});

test("keeps migrated progress usable if removal is blocked", () => {
  const storage = memory({ [previousKey]: '{"doctor":{"outcome":"received"}}' });
  storage.removeItem = () => { throw new Error("blocked"); };
  assert.equal(readRouteProgress(storage), storage.getItem(ROUTE_STORAGE_KEY));
  assert.ok(storage.getItem(previousKey));
});

test("moves session attempts and preserves a newer attempt", () => {
  const key = `${previousNamespace}-attempt-doctor`;
  const storage = memory({ [key]: "old-attempt" });
  assert.equal(readRouteAttempt("doctor", storage), "old-attempt");
  assert.equal(storage.getItem(key), null);
  storage.setItem(key, "another-old-attempt");
  assert.equal(readRouteAttempt("doctor", storage), "old-attempt");
  assert.equal(storage.getItem(key), null);
});
