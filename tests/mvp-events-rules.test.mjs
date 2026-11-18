import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { parsePayload, createRateLimiter, ROUTE_IDS, EVENT_NAMES, MAX_PER_ATTEMPT } from "../app/api/mvp-events/rules.ts";
import { routeCheckedAt } from "../app/route-checks.ts";

const attemptId = "3f1c2a9e-6d4b-4c7e-9b51-0a8d2e7f4c10";
const event = (extra = {}) => ({ kind: "event", routeId: "bank", attemptId, eventName: "question_answered", ...extra });

test("принимаются события в той форме, в какой их отправляют маршруты", () => {
  for (const payload of [
    event(),
    event({ eventName: "situation_opened", elementId: "utm:telegram" }),
    event({ eventName: "action_method_selected", elementId: "kind:online" }),
    event({ eventName: "step_blocked", methodId: "health-employee-direct", stepIndex: 3, problemCode: "missing_document" }),
    event({ eventName: "official_source_opened", elementId: "https://service.berlin.de/dienstleistung/120686/" }),
    { ...event(), attemptId: "anonymous-session" },
    { ...event(), attemptId: "attempt-1762950000000-k3j9x2" },
    { kind: "issue", routeId: "transport", attemptId, issueType: "broken_link", sourceId: "https://www.vbb.de/tickets-tarife/tarife/", stepIndex: null },
    { kind: "feedback", routeId: "lea", attemptId, methodId: "online", outcome: "", clarityRating: 4, nextActionStatus: "yes", officialActionStatus: "reached" },
  ]) {
    const result = parsePayload(payload);
    assert.equal(result.ok, true, JSON.stringify(payload));
  }
});

test("свободный текст, кириллица, пробелы и переносы в служебных полях отклоняются", () => {
  for (const extra of [
    { methodId: "мой адрес Hauptstraße 5" },
    { elementId: "Иван Петров, Steuer-ID 12345678901" },
    { elementId: "с пробелом" },
    { problemCode: "line\nbreak" },
    { problemCode: "<script>alert(1)</script>" },
    { methodId: "x".repeat(81) },
    { elementId: "x".repeat(81) },
    { methodId: 42 },
    { elementId: { nested: "object" } },
    { stepIndex: -1 },
    { stepIndex: 21 },
    { stepIndex: 1.5 },
    { stepIndex: "2" },
  ]) {
    assert.equal(parsePayload(event(extra)).ok, false, JSON.stringify(extra));
  }
  assert.equal(parsePayload({ kind: "issue", routeId: "bank", attemptId, issueType: "broken_link", sourceId: "ссылка со словами" }).ok, false);
});

test("идентификатор попытки: только технический код", () => {
  for (const bad of ["", " ", "a b", "попытка", "x".repeat(81), "-start", "../etc/passwd", "a;DROP TABLE product_events", null, 7]) {
    assert.equal(parsePayload({ ...event(), attemptId: bad }).ok, false, String(bad));
  }
});

test("неизвестные маршрут, событие, вид и неверная форма тела отклоняются", () => {
  assert.equal(parsePayload(event({ routeId: "unknown" })).ok, false);
  assert.equal(parsePayload(event({ eventName: "drop_table" })).ok, false);
  assert.equal(parsePayload({ ...event(), kind: "other" }).ok, false);
  assert.equal(parsePayload({ kind: "issue", routeId: "bank", attemptId, issueType: "free_text" }).ok, false);
  for (const raw of [null, undefined, 5, "text", [], [event()]]) assert.equal(parsePayload(raw).ok, false);
});

test("оценка маршрута: границы и значения по умолчанию", () => {
  const base = { kind: "feedback", routeId: "bank", attemptId, clarityRating: 3, nextActionStatus: "partly", officialActionStatus: "not_yet" };
  const ok = parsePayload(base);
  assert.equal(ok.ok, true);
  assert.equal(ok.value.blockerCode, "none");
  assert.equal(ok.value.outcome, null);
  for (const bad of [{ clarityRating: 0 }, { clarityRating: 6 }, { clarityRating: 2.5 }, { clarityRating: "4" }, { nextActionStatus: "maybe" }, { officialActionStatus: "x" }, { blockerCode: "свой текст" }, { outcome: "won" }]) {
    assert.equal(parsePayload({ ...base, ...bad }).ok, false, JSON.stringify(bad));
  }
});

test("ограничитель частоты: лимит на адрес, новое окно сбрасывает счёт, таблица адресов не растёт без предела", () => {
  const allow = createRateLimiter({ limit: 3, windowMs: 1000, maxKeys: 2 });
  assert.deepEqual([1, 2, 3, 4].map(() => allow("a", 0)), [true, true, true, false]);
  assert.equal(allow("b", 10), true);
  assert.equal(allow("c", 20), false, "третий новый адрес сверх maxKeys не принимается");
  assert.equal(allow("a", 1000), true, "в новом окне счёт начинается заново");
  assert.equal(allow("c", 1000), true);
});

test("белый список маршрутов совпадает с маршрутами, у которых есть дата сверки", () => {
  const sent = new Set(Object.keys(routeCheckedAt));
  assert.deepEqual([...ROUTE_IDS].filter((id) => !sent.has(id)), [], "в API есть маршрут без даты сверки");
  assert.deepEqual([...sent].filter((id) => !ROUTE_IDS.has(id)), [], "у маршрута есть дата сверки, но API отклонит его события");
  assert.ok(EVENT_NAMES.size >= 20);
});

test("подсчёт записей попытки использует индекс и не читает всю таблицу", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(fs.readFileSync(new URL("../db/cloudflare-schema.sql", import.meta.url), "utf8"));
  const route = fs.readFileSync(new URL("../app/api/mvp-events/route.ts", import.meta.url), "utf8");
  assert.doesNotMatch(route, /SELECT COUNT\(\*\) AS n FROM product_events WHERE/, "полное сканирование таблицы по attempt_id вернулось");
  for (const [kind, table] of [["event", "product_events"], ["issue", "issue_reports"], ["feedback", "route_feedback"]]) {
    const plan = db.prepare(`EXPLAIN QUERY PLAN SELECT COUNT(*) AS n FROM (SELECT 1 FROM ${table} WHERE attempt_id = ? LIMIT ?)`).all("x", MAX_PER_ATTEMPT[kind]);
    const text = plan.map((row) => row.detail).join(" | ");
    assert.match(text, /USING (COVERING )?INDEX idx_\w+_attempt/, `${table}: ${text}`);
  }
  const migration = fs.readFileSync(new URL("../db/migrations/2026-11-12-attempt-id-indexes.sql", import.meta.url), "utf8");
  const fresh = new DatabaseSync(":memory:");
  fresh.exec(fs.readFileSync(new URL("../db/cloudflare-schema.sql", import.meta.url), "utf8").replace(/CREATE INDEX `idx_\w+_attempt`[^;]*;/g, ""));
  fresh.exec(migration);
  fresh.exec(migration); // повторный запуск безопасен
  const indexes = fresh.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%_attempt'").all().map((row) => row.name).sort();
  assert.deepEqual(indexes, ["idx_issue_reports_attempt", "idx_product_events_attempt", "idx_route_feedback_attempt"]);
});
