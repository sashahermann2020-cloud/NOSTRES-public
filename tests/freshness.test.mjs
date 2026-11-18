import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { routeFreshness } from "../worker/freshness.ts";
import { routeCheckedAt, isoDate } from "../app/route-checks.ts";

const root = new URL("../", import.meta.url);
const day = 86400;
const at = (iso) => Math.floor(Date.parse(`${iso}T12:00:00Z`) / 1000);
const route = { id: "kindergeld", path: "/berlin/kindergeld", title: "Kindergeld", checkedAt: "2026-10-19", reviewDays: 60, sources: ["https://a.example/1", "https://a.example/2"] };
const ok = (url, now) => ({ url, state: "ok", last_status: 200, last_checked: now, last_ok: now });

test("маршрут без изменений и в пределах срока актуален", () => {
  const now = at("2026-10-29");
  const [r] = routeFreshness([route], route.sources.map((url) => ok(url, now)), [], now);
  assert.deepEqual(r.reasons, []);
  assert.equal(r.daysSinceCheck, 10);
});

test("изменение официальной страницы после сверки требует сверки маршрута, до сверки – нет", () => {
  const now = at("2026-10-29");
  const links = route.sources.map((url) => ok(url, now));
  const before = { url: route.sources[0], kind: "content_changed", detail: "", created_at: at("2026-10-18") };
  const sameDay = { ...before, created_at: at("2026-10-19") };
  const after = { ...before, created_at: at("2026-10-25") };
  assert.deepEqual(routeFreshness([route], links, [before], now)[0].reasons, []);
  assert.deepEqual(routeFreshness([route], links, [sameDay], now)[0].reasons, ["changed"]);
  const [r] = routeFreshness([route], links, [after, { ...after, url: "https://other.example/" }], now);
  assert.deepEqual(r.reasons, ["changed"]);
  assert.equal(r.changes.length, 1);
});

test("сломанная страница и истёкший срок поднимают маршрут в начало списка", () => {
  const now = at("2026-12-31");
  const fresh = { ...route, id: "fresh", checkedAt: "2026-12-20" };
  const links = [ok(route.sources[0], now), { ...ok(route.sources[1], now), state: "broken", last_status: 404 }];
  const [first, second] = routeFreshness([fresh, route], links, [], now);
  assert.equal(first.id, "kindergeld");
  assert.deepEqual(first.reasons, ["broken", "overdue"]);
  assert.deepEqual(first.broken, [route.sources[1]]);
  assert.equal(second.reasons.length, 1);
  assert.deepEqual(second.reasons, ["broken"]);
});

test("страницы, закрытые от робота или давно не открывавшиеся, отмечаются для ручной сверки", () => {
  const now = at("2026-10-29");
  const links = [{ ...ok(route.sources[0], now), state: "blocked", last_status: 403 }, { ...ok(route.sources[1], now), last_ok: now - 10 * day }];
  const [r] = routeFreshness([route], links, [], now);
  assert.deepEqual(r.unverifiable, route.sources);
  assert.deepEqual(r.reasons, []);
});

test("у каждого маршрута есть дата сверки в едином списке и официальные страницы", () => {
  const sources = JSON.parse(readFileSync(new URL("worker/route-sources.json", root), "utf8"));
  const registry = JSON.parse(readFileSync(new URL("docs/ROUTE_REGISTRY.json", root), "utf8")).routes;
  const routed = registry.filter((r) => ["guided", "journey", "urgent"].includes(r.kind)).map((r) => r.routeId ?? "anmeldung").sort();
  assert.deepEqual(Object.keys(routeCheckedAt).sort(), routed);
  assert.deepEqual(sources.map((r) => r.id).sort(), routed);
  for (const r of sources) {
    assert.equal(r.checkedAt, isoDate(routeCheckedAt[r.id]), r.id);
    assert.ok(r.sources.length >= 2, `${r.id}: мало официальных страниц`);
  }
  const monitored = new Set(JSON.parse(readFileSync(new URL("worker/monitored-links.json", root), "utf8")));
  for (const r of sources) for (const url of r.sources) assert.ok(monitored.has(url), `${url} (${r.id}) не попадает в мониторинг`);
});

test("route-sources.json и monitored-links.json собраны из текущего кода", () => {
  execFileSync("node", ["scripts/sources-extract.mjs", "--check"], { cwd: root, stdio: "pipe" });
  execFileSync("node", ["scripts/links-extract.mjs", "--check"], { cwd: root, stdio: "pipe" });
});

test("проверенное изменение страницы больше не требует сверки, а новое после проверки – требует", () => {
  const now = at("2026-10-29");
  const links = route.sources.map((url) => ok(url, now));
  const change = { url: route.sources[0], kind: "content_changed", detail: "", created_at: at("2026-10-25") };
  const reviewed = { ...route, reviewed: { [route.sources[0]]: "2026-10-28T09:00Z" } };
  assert.deepEqual(routeFreshness([reviewed], links, [change], now)[0].reasons, []);
  const later = { ...change, created_at: at("2026-10-28") };
  assert.deepEqual(routeFreshness([reviewed], links, [later], now)[0].reasons, ["changed"]);
});
