import assert from "node:assert/strict";
import test from "node:test";
import { clearNostresKeys } from "../app/clear-local-data.ts";
import { ROUTE_STORAGE_KEY } from "../app/progress-storage.ts";

function fakeStorage(entries) {
  const map = new Map(Object.entries(entries));
  return {
    map,
    get length() { return map.size; },
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => { map.delete(key); },
  };
}

test("removes only NOSTRES keys and reports the count", () => {
  const storage = fakeStorage({ [ROUTE_STORAGE_KEY]: "{}", "nostres-berlin-plan-v1": "{}", "nostres-attempt-lea": "x", other: "keep" });
  assert.equal(clearNostresKeys(storage), 3);
  assert.deepEqual([...storage.map.keys()], ["other"]);
});

test("returns zero for empty storage", () => {
  assert.equal(clearNostresKeys(fakeStorage({})), 0);
});
