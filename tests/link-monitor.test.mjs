import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { FAIL_THRESHOLD, emptyRecord, evaluate, isDue, looksHijacked, observe, runMonitor, buildReport } from "../worker/link-monitor.ts";

const url = "https://www.berlin.de/sen/wohnen/service/wohnberechtigungsschein/";
const good = { status: 200, finalUrl: url, permanentRedirect: false, title: "Wohnberechtigungsschein", hash: "aaa" };
const t0 = 1_000_000;
const baseline = () => evaluate(emptyRecord(url, t0), good, t0).next;

test("первая проверка только записывает эталон и не создаёт событий", () => {
  const { next, events } = evaluate(emptyRecord(url, t0), good, t0);
  assert.equal(next.state, "ok");
  assert.equal(next.content_hash, "aaa");
  assert.deepEqual(events, []);
});

test("неизменная ссылка не даёт событий", () => {
  const { events, next } = evaluate(baseline(), good, t0 + 86400);
  assert.deepEqual(events, []);
  assert.equal(next.state, "ok");
});

test("поломка фиксируется только после нескольких неудач подряд, один раз", () => {
  let rec = baseline();
  const bad = { ...good, status: 404 };
  const kinds = [];
  for (let i = 0; i < FAIL_THRESHOLD + 2; i += 1) {
    const r = evaluate(rec, bad, t0 + (i + 1) * 3600);
    kinds.push(r.events.map((e) => e.kind));
    rec = r.next;
  }
  assert.deepEqual(kinds.flat(), ["broken"]);
  assert.equal(rec.state, "broken");
  assert.deepEqual(kinds.slice(0, FAIL_THRESHOLD - 1).flat(), []);
});

test("случайный сбой с последующим успехом не даёт события", () => {
  let rec = evaluate(baseline(), { ...good, status: 503 }, t0 + 3600).next;
  const r = evaluate(rec, good, t0 + 7200);
  assert.deepEqual(r.events, []);
  assert.equal(r.next.fail_count, 0);
});

test("восстановление после поломки сообщается", () => {
  let rec = { ...baseline(), state: "broken", fail_count: 5 };
  const r = evaluate(rec, good, t0 + 99);
  assert.deepEqual(r.events.map((e) => e.kind), ["recovered"]);
  assert.equal(r.next.state, "ok");
});

test("защита от ботов (403) не считается поломкой и не меняет эталон", () => {
  const rec = baseline();
  const r = evaluate(rec, { ...good, status: 403, hash: "" }, t0 + 1);
  assert.deepEqual(r.events, []);
  assert.equal(r.next.state, "ok");
  assert.equal(r.next.fail_count, 0);
  const fresh = evaluate(emptyRecord(url, t0), { ...good, status: 403 }, t0).next;
  assert.equal(fresh.state, "blocked");
});

test("постоянная переадресация на новый адрес даёт событие переезда", () => {
  const moved = { ...good, finalUrl: "https://www.berlin.de/sen/wohnen/neu/", permanentRedirect: true };
  const r = evaluate(baseline(), moved, t0 + 1);
  assert.deepEqual(r.events.map((e) => e.kind), ["moved"]);
  assert.match(r.events[0].detail, /neu/);
  assert.equal(evaluate(r.next, moved, t0 + 2).events.length, 0);
});

test("временная переадресация не даёт события", () => {
  const temp = { ...good, finalUrl: "https://www.berlin.de/sen/wohnen/anders/", permanentRedirect: false };
  assert.deepEqual(evaluate(baseline(), temp, t0 + 1).events, []);
});

test("переадресация на главную и заголовок «не найдено» считаются подменой", () => {
  assert.ok(looksHijacked(url, { ...good, finalUrl: "https://www.berlin.de/" }));
  assert.ok(looksHijacked(url, { ...good, title: "Seite nicht gefunden" }));
  assert.ok(!looksHijacked(url, good));
  let rec = baseline();
  const bad = { ...good, finalUrl: "https://www.berlin.de/", title: "Berlin.de" };
  let kinds = [];
  for (let i = 0; i < FAIL_THRESHOLD; i += 1) { const r = evaluate(rec, bad, t0 + i * 3600); kinds.push(...r.events.map((e) => e.kind)); rec = r.next; }
  assert.deepEqual(kinds, ["hijacked"]);
});

test("изменение текста подтверждается двумя проверками подряд", () => {
  const changed = { ...good, hash: "bbb" };
  const first = evaluate(baseline(), changed, t0 + 1);
  assert.deepEqual(first.events, []);
  assert.equal(first.next.pending_hash, "bbb");
  const second = evaluate(first.next, changed, t0 + 2);
  assert.deepEqual(second.events.map((e) => e.kind), ["content_changed"]);
  assert.equal(second.next.content_hash, "bbb");
  assert.deepEqual(evaluate(second.next, changed, t0 + 3).events, []);
  const flicker = evaluate(first.next, good, t0 + 2);
  assert.deepEqual(flicker.events, []);
  assert.equal(flicker.next.pending_hash, "");
});

test("расписание: раз в сутки, а при сбоях каждые три часа", () => {
  assert.ok(isDue(emptyRecord(url, t0), t0));
  const rec = baseline();
  assert.ok(!isDue(rec, t0 + 23 * 3600));
  assert.ok(isDue(rec, t0 + 24 * 3600));
  assert.ok(!isDue({ ...rec, fail_count: 1 }, t0 + 2 * 3600));
  assert.ok(isDue({ ...rec, fail_count: 1 }, t0 + 3 * 3600));
});

test("observe идёт по переадресациям и определяет постоянную", async () => {
  const fake = async (address) => {
    if (address === "https://a.de/old") return new Response(null, { status: 301, headers: { location: "/new" } });
    return new Response("<html><head><title>Neu</title></head><main>Text 12.10.2026</main></html>", { status: 200, headers: { "content-type": "text/html" } });
  };
  const obs = await observe("https://a.de/old", fake);
  assert.equal(obs.status, 200);
  assert.equal(obs.finalUrl, "https://a.de/new");
  assert.equal(obs.permanentRedirect, true);
  assert.equal(obs.title, "Neu");
  const again = await observe("https://a.de/old", async (a) => a.endsWith("old") ? new Response(null, { status: 301, headers: { location: "/new" } }) : new Response("<title>Neu</title><main>Text 13.10.2026</main>", { headers: { "content-type": "text/html" } }));
  assert.equal(again.hash, obs.hash, "даты в тексте не должны менять хэш");
  assert.equal((await observe("https://a.de/x", async () => { throw new Error("down"); })).status, 0);
});

function d1(db) {
  const wrap = (sql, values = []) => ({
    bind: (...v) => wrap(sql, v),
    run: async () => db.prepare(sql).run(...values),
    all: async () => ({ results: db.prepare(sql).all(...values) }),
    exec: () => db.prepare(sql).run(...values),
  });
  return { prepare: (sql) => wrap(sql), batch: async (list) => list.forEach((s) => s.exec()) };
}

test("полный цикл на базе: эталон, поломка, замена ссылки в коде", async () => {
  const db = d1(new DatabaseSync(":memory:"));
  let status = 200;
  const fake = async () => new Response(status === 200 ? "<title>OK</title><main>text</main>" : "gone", { status, headers: { "content-type": "text/html" } });
  const links = ["https://a.de/1", "https://a.de/2"];
  let now = 2_000_000;
  assert.deepEqual(await runMonitor(db, links, now, fake), { checked: 2, events: 0 });
  assert.deepEqual(await runMonitor(db, links, now + 60, fake), { checked: 0, events: 0 }, "повторно в тот же час ничего не проверяется");
  status = 404;
  let total = 0;
  for (let i = 1; i <= FAIL_THRESHOLD; i += 1) { now += 24 * 3600; total += (await runMonitor(db, links, now, fake)).events; if (i === 1) now -= 21 * 3600; }
  assert.ok(total >= 2);
  let report = await buildReport(db, links.length, now);
  assert.equal(report.broken, 2);
  assert.equal(report.events.filter((e) => e.kind === "broken").length, 2);
  await runMonitor(db, ["https://a.de/2"], now + 5, fake);
  report = await buildReport(db, 1, now + 5);
  assert.equal(report.broken, 1, "ссылка, убранная из кода, исчезает из списка");
});

test("список ссылок в worker/monitored-links.json совпадает с кодом", () => {
  execFileSync("node", ["scripts/links-extract.mjs", "--check"], { stdio: "pipe" });
});

test("отказ роботу (400, 520) не считается поломкой и снимает ложную пометку «сломана»", () => {
  for (const status of [400, 520, 525]) {
    let rec = baseline();
    const kinds = [];
    for (let i = 0; i < FAIL_THRESHOLD + 2; i += 1) {
      const r = evaluate(rec, { ...good, status, hash: "" }, t0 + (i + 1) * 3600);
      kinds.push(...r.events.map((e) => e.kind));
      rec = r.next;
    }
    assert.deepEqual(kinds, [], `status ${status}`);
    assert.equal(rec.state, "ok", `status ${status}`);
    const wronglyBroken = { ...baseline(), state: "broken", fail_count: 40, last_status: status };
    const r = evaluate(wronglyBroken, { ...good, status, hash: "" }, t0 + 99);
    assert.deepEqual(r.events, []);
    assert.equal(r.next.state, "blocked");
    assert.equal(r.next.fail_count, 0);
  }
});

test("удалённая страница (404, 410) и недоступный сайт (503) остаются поломкой", () => {
  for (const status of [404, 410, 503]) {
    let rec = baseline();
    for (let i = 0; i < FAIL_THRESHOLD; i += 1) rec = evaluate(rec, { ...good, status }, t0 + (i + 1) * 3600).next;
    assert.equal(rec.state, "broken", `status ${status}`);
  }
});

test("отчёт показывает маршруты к сверке по событиям из базы", async () => {
  const raw = new DatabaseSync(":memory:");
  const db = d1(raw);
  const routes = [{ id: "kindergeld", path: "/berlin/kindergeld", title: "Kindergeld", checkedAt: "2026-10-19", reviewDays: 60, sources: [url] }];
  const now = Math.floor(Date.parse("2026-10-29T12:00:00Z") / 1000);
  await buildReport(db, 1, now, routes);
  raw.prepare("INSERT INTO link_monitor_events (url, kind, detail, created_at) VALUES (?,?,?,?)").run(url, "content_changed", "", now - 86400);
  const report = await buildReport(db, 1, now, routes);
  assert.deepEqual(report.routes[0].reasons, ["changed"]);
});
