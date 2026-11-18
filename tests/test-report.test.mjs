import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { buildTestReport, renderTestReport } from "../worker/test-report.ts";

const wrap = (db, sql, values = []) => ({ bind: (...v) => wrap(db, sql, v), all: async () => ({ results: db.prepare(sql).all(...values) }) });

test("отчёт по тесту отделяет проверки проекта от людей и считает отзывы", async () => {
  const db = new DatabaseSync(":memory:");
  const schema = fs.readFileSync(new URL("../db/cloudflare-schema.sql", import.meta.url), "utf8");
  db.exec(schema);
  const ev = db.prepare("INSERT INTO product_events (event_name, route_id, attempt_id, created_at) VALUES (?, ?, ?, ?)");
  ev.run("situation_opened", "bank", "old1", "2026-10-13 10:00:00");
  ev.run("situation_opened", "anmeldung", "a", "2026-10-21 10:00:00");
  ev.run("situation_opened", "anmeldung", "b", "2026-10-21 11:00:00");
  ev.run("route_result_generated", "anmeldung", "a", "2026-10-21 10:05:00");
  db.prepare("INSERT INTO route_feedback (route_id, clarity_rating, next_action_status, official_action_status, attempt_id, created_at) VALUES ('anmeldung', 4, 'partly', 'not_yet', 'a', '2026-10-21 12:00:00')").run();
  const report = await buildTestReport({ prepare: (sql) => wrap(db, sql) });
  assert.equal(report.people.real, 2);
  assert.equal(report.people.internal, 1);
  assert.equal(report.funnel[0].real, 2);
  assert.equal(report.funnel[2].real, 1);
  assert.equal(report.feedback.total, 1);
  assert.equal(report.feedback.avgClarity, 4);
  const html = renderTestReport(report);
  assert.match(html, /Отчёт по тестированию/);
  assert.match(html, /noindex/);
});

import { classifySource } from "../app/traffic-source.ts";
test("источник захода определяется категорией, метка utm приоритетна", () => {
  assert.equal(classifySource("", "nostres.world", ""), "direct");
  assert.equal(classifySource("https://www.google.com/", "nostres.world", ""), "search-google");
  assert.equal(classifySource("https://yandex.ru/search/?text=x", "nostres.world", ""), "search-yandex");
  assert.equal(classifySource("https://t.me/somechat", "nostres.world", ""), "messenger");
  assert.equal(classifySource("https://l.facebook.com/", "nostres.world", ""), "social");
  assert.equal(classifySource("https://nostres.world/en", "nostres.world", ""), "internal");
  assert.equal(classifySource("https://t.me/x", "nostres.world", "?utm_source=Chat_1"), "utm:chat_1");
  assert.equal(classifySource("https://blog.example.org/post", "nostres.world", ""), "other-site");
});
