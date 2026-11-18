import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { isPurgeWindow, purgeExpired, retentionCutoff, RETENTION_MONTHS } from "../worker/retention.ts";

const SCHEMA = ["product_events", "issue_reports", "route_feedback"].map(
  (table) => `CREATE TABLE ${table} (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, route_id text NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
);

/** Обёртка node:sqlite под нужную часть интерфейса D1. */
function d1(sqlite) {
  return {
    prepare: (sql) => ({
      bind: (...values) => ({ run: async () => ({ meta: { changes: sqlite.prepare(sql).run(...values).changes } }) }),
    }),
  };
}

function seed(rows) {
  const sqlite = new DatabaseSync(":memory:");
  for (const sql of SCHEMA) sqlite.exec(sql);
  for (const table of ["product_events", "issue_reports", "route_feedback"]) {
    for (const createdAt of rows) sqlite.prepare(`INSERT INTO ${table} (route_id, created_at) VALUES ('lea', ?)`).run(createdAt);
  }
  return sqlite;
}

const count = (sqlite, table) => sqlite.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;

test("срок хранения — 12 месяцев", () => assert.equal(RETENTION_MONTHS, 12));

test("граница хранения считается в UTC и в формате SQLite", () => {
  assert.equal(retentionCutoff(new Date("2026-11-12T18:02:30Z")), "2025-11-12 18:02:30");
  assert.equal(retentionCutoff(new Date("2026-01-31T00:00:00Z")), "2025-01-31 00:00:00");
  assert.equal(retentionCutoff(new Date("2028-02-29T10:00:00Z")), "2027-03-01 10:00:00");
});

test("очистка идёт один раз в сутки: в первом окне 03:00 UTC", () => {
  const at = (iso) => isPurgeWindow(Date.parse(iso));
  assert.equal(at("2026-11-12T03:00:00Z"), true);
  assert.equal(at("2026-11-12T03:14:59Z"), true);
  assert.equal(at("2026-11-12T03:15:00Z"), false);
  assert.equal(at("2026-11-12T02:45:00Z"), false);
  assert.equal(at("2026-11-12T15:00:00Z"), false);
});

test("удаляются только записи старше срока, во всех трёх таблицах", async () => {
  const sqlite = seed(["2024-01-01 00:00:00", "2025-11-12 18:02:29", "2025-11-12 18:02:30", "2026-06-01 12:00:00"]);
  const deleted = await purgeExpired(d1(sqlite), new Date("2026-11-12T18:02:30Z"));
  assert.deepEqual(deleted, { product_events: 2, issue_reports: 2, route_feedback: 2 });
  for (const table of ["product_events", "issue_reports", "route_feedback"]) {
    assert.equal(count(sqlite, table), 2, table);
    const left = sqlite.prepare(`SELECT created_at FROM ${table} ORDER BY id`).all().map((row) => row.created_at);
    assert.deepEqual(left, ["2025-11-12 18:02:30", "2026-06-01 12:00:00"], "запись ровно на границе остаётся");
  }
});

test("за один запуск удаляется не больше заданного потолка, остальное — в следующие сутки", async () => {
  const sqlite = seed(Array.from({ length: 25 }, (_, i) => `2024-01-01 00:00:${String(i).padStart(2, "0")}`));
  const now = new Date("2026-11-12T03:00:00Z");
  const first = await purgeExpired(d1(sqlite), now, { batch: 5, maxBatches: 2 });
  assert.equal(first.product_events, 10);
  assert.equal(count(sqlite, "product_events"), 15);
  await purgeExpired(d1(sqlite), now, { batch: 5, maxBatches: 2 });
  await purgeExpired(d1(sqlite), now, { batch: 5, maxBatches: 2 });
  assert.equal(count(sqlite, "product_events"), 0);
});

test("пустые таблицы и свежие записи не вызывают ошибок", async () => {
  const sqlite = seed([]);
  assert.deepEqual(await purgeExpired(d1(sqlite), new Date("2026-11-12T03:00:00Z")), { product_events: 0, issue_reports: 0, route_feedback: 0 });
  const fresh = seed(["2026-11-01 00:00:00"]);
  assert.equal((await purgeExpired(d1(fresh), new Date("2026-11-12T03:00:00Z"))).product_events, 0);
  assert.equal(count(fresh, "product_events"), 1);
});
