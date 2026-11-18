// Мониторинг внешних ссылок: хранит эталон каждой ссылки и сообщает только об изменениях.
// Логика сравнения вынесена в чистые функции (evaluate), чтобы её можно было проверить тестами.
import { routeFreshness, type EventRow, type RouteSources } from "./freshness.ts";

export type LinkState = "new" | "ok" | "broken" | "blocked";
export type EventKind = "broken" | "moved" | "hijacked" | "content_changed" | "recovered";

export interface LinkRecord {
  url: string;
  state: LinkState;
  last_status: number;
  final_url: string;
  title: string;
  content_hash: string;
  pending_hash: string;
  fail_count: number;
  last_checked: number;
  last_ok: number;
  first_seen: number;
  state_since: number;
}

export interface Observation {
  status: number; // 0 при сетевой ошибке или таймауте
  finalUrl: string;
  permanentRedirect: boolean;
  title: string;
  hash: string;
}

export interface LinkEvent { kind: EventKind; detail: string }

export const FAIL_THRESHOLD = 3;
// Ответы, которыми сайт отказывает роботу, а не сообщает об удалении страницы: 4xx-защита от ботов,
// 999 (LinkedIn-подобные фильтры) и 520–530 (ошибки сети Cloudflare между проверкой и сайтом).
// Пример: BMI отвечал роботу 400, ING – 520, Hochschulkompass – 400, хотя для людей страницы открывались.
// Удалённую страницу выдают 404/410, недоступный сайт – 500–504 или отсутствие ответа: это по-прежнему поломка.
const BLOCKED_STATUSES = new Set([400, 401, 403, 406, 429, 451, 999, 520, 521, 522, 523, 524, 525, 526, 527, 530]);
export const isBlockedStatus = (status: number) => BLOCKED_STATUSES.has(status);
const NOT_FOUND_TITLE = /nicht gefunden|not found|seite existiert nicht|seite nicht gefunden|404|fehler\b|error\b|page unavailable|nicht verfügbar/i;

export function emptyRecord(url: string, now: number): LinkRecord {
  return { url, state: "new", last_status: 0, final_url: "", title: "", content_hash: "", pending_hash: "", fail_count: 0, last_checked: 0, last_ok: 0, first_seen: now, state_since: now };
}

function normalize(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  } catch { return url; }
}

/** Подменой считается переадресация на главную страницу сайта или страница с заголовком «не найдено». */
export function looksHijacked(originalUrl: string, obs: Observation): boolean {
  try {
    const original = new URL(originalUrl);
    const final = new URL(obs.finalUrl);
    const wasDeep = original.pathname.replace(/\/$/, "") !== "";
    const nowRoot = final.pathname.replace(/\/$/, "") === "" && final.search === "";
    if (wasDeep && nowRoot) return true;
  } catch { /* некорректный адрес считаем обычным ответом */ }
  return NOT_FOUND_TITLE.test(obs.title) && obs.title.length < 80;
}

/** Сравнивает новое наблюдение с эталоном, возвращает новое состояние и события-изменения. */
export function evaluate(prev: LinkRecord, obs: Observation, now: number): { next: LinkRecord; events: LinkEvent[] } {
  const events: LinkEvent[] = [];
  const next: LinkRecord = { ...prev, last_checked: now, last_status: obs.status };
  const setState = (state: LinkState) => { if (next.state !== state) { next.state = state; next.state_since = now; } };

  if (BLOCKED_STATUSES.has(obs.status)) {
    // Защита от ботов: ссылку нельзя проверить, но это не поломка. Эталон сохраняется как есть.
    // Ссылка, ошибочно помеченная сломанной по такому ответу, переходит в «закрыта от проверки» без события.
    // Работавшая ссылка остаётся «ok», но её last_ok стареет: отчёт показывает её как непроверяемую (см. freshness.ts).
    if (prev.state === "new" || prev.state === "blocked" || prev.state === "broken") { setState("blocked"); next.fail_count = 0; }
    return { next, events };
  }

  const okStatus = obs.status >= 200 && obs.status < 300;
  const hijacked = okStatus && looksHijacked(prev.url, obs);
  const failed = !okStatus || hijacked;

  if (failed) {
    next.fail_count = prev.fail_count + 1;
    if (next.fail_count >= FAIL_THRESHOLD && prev.state !== "broken") {
      setState("broken");
      events.push(hijacked
        ? { kind: "hijacked", detail: `Адрес ведёт на главную или на страницу «не найдено»: ${obs.finalUrl}` }
        : { kind: "broken", detail: obs.status === 0 ? "Сайт не отвечает" : `Код ответа ${obs.status}` });
    }
    return { next, events };
  }

  next.fail_count = 0;
  next.last_ok = now;
  const wasBroken = prev.state === "broken";
  setState("ok");
  if (wasBroken) events.push({ kind: "recovered", detail: "Ссылка снова доступна" });

  const finalUrl = normalize(obs.finalUrl);
  if (prev.final_url && normalize(prev.final_url) !== finalUrl) {
    if (obs.permanentRedirect) events.push({ kind: "moved", detail: `Страница переехала: ${obs.finalUrl}` });
  }
  next.final_url = obs.finalUrl;
  next.title = obs.title;

  // Изменение текста подтверждается двумя проверками подряд, чтобы не реагировать на случайные вставки.
  if (!prev.content_hash) {
    next.content_hash = obs.hash;
    next.pending_hash = "";
  } else if (obs.hash === prev.content_hash) {
    next.pending_hash = "";
  } else if (prev.pending_hash === obs.hash) {
    next.content_hash = obs.hash;
    next.pending_hash = "";
    events.push({ kind: "content_changed", detail: "Текст официальной страницы изменился" });
  } else {
    next.pending_hash = obs.hash;
  }
  return { next, events };
}

/** Ссылка проверяется раз в сутки, а с признаками сбоя чаще: каждые три часа. */
export function isDue(record: LinkRecord, now: number): boolean {
  if (!record.last_checked) return true;
  const hours = record.fail_count > 0 ? 3 : 24;
  return now - record.last_checked >= hours * 3600;
}

// ---------- сеть ----------

async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function textOf(html: string): { title: string; body: string } {
  const title = (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
  const main = /<main[\s\S]*?<\/main>/i.exec(html)?.[0] ?? /<body[\s\S]*<\/body>/i.exec(html)?.[0] ?? html;
  const body = main
    .replace(/<(script|style|noscript|svg|nav|header|footer)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\d{1,2}[.:]\d{1,2}[.:]?\d{0,4}/g, "#")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40000);
  return { title, body };
}

export async function observe(url: string, fetcher: typeof fetch = fetch): Promise<Observation> {
  let current = url;
  let permanent = false;
  let first = true;
  try {
    for (let hop = 0; hop < 5; hop += 1) {
      const response = await fetcher(current, {
        redirect: "manual",
        headers: { "user-agent": "NostresLinkMonitor/1.0 (+https://nostres.world)", accept: "text/html,application/pdf,*/*;q=0.8", "accept-language": "de,en;q=0.7" },
        signal: AbortSignal.timeout(8000),
      });
      if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
        if (first) permanent = response.status === 301 || response.status === 308;
        first = false;
        current = new URL(response.headers.get("location") as string, current).toString();
        await response.body?.cancel();
        continue;
      }
      const type = response.headers.get("content-type") ?? "";
      if (!type.includes("text/html")) {
        await response.body?.cancel();
        const length = response.headers.get("content-length") ?? "";
        return { status: response.status, finalUrl: current, permanentRedirect: permanent, title: "", hash: await sha256(`${type}|${length}`) };
      }
      const html = (await response.text()).slice(0, 400000);
      const { title, body } = textOf(html);
      return { status: response.status, finalUrl: current, permanentRedirect: permanent, title, hash: await sha256(body) };
    }
    return { status: 0, finalUrl: current, permanentRedirect: permanent, title: "", hash: "" };
  } catch {
    return { status: 0, finalUrl: current, permanentRedirect: permanent, title: "", hash: "" };
  }
}

// ---------- база данных ----------

export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS link_monitor_links (url TEXT PRIMARY KEY, state TEXT NOT NULL, last_status INTEGER NOT NULL DEFAULT 0, final_url TEXT NOT NULL DEFAULT '', title TEXT NOT NULL DEFAULT '', content_hash TEXT NOT NULL DEFAULT '', pending_hash TEXT NOT NULL DEFAULT '', fail_count INTEGER NOT NULL DEFAULT 0, last_checked INTEGER NOT NULL DEFAULT 0, last_ok INTEGER NOT NULL DEFAULT 0, first_seen INTEGER NOT NULL, state_since INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS link_monitor_events (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL, kind TEXT NOT NULL, detail TEXT NOT NULL, created_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_link_monitor_events_created ON link_monitor_events (created_at)`,
];

export const BATCH_SIZE = 8;

export async function ensureSchema(db: Db): Promise<void> {
  await db.batch(SCHEMA.map((sql) => db.prepare(sql)));
}

interface Statement {
  bind(...values: unknown[]): Statement;
  run(): Promise<unknown>;
  all<T>(): Promise<{ results: T[] }>;
}

interface Db {
  prepare(sql: string): Statement;
  batch(statements: unknown[]): Promise<unknown>;
}

export async function runMonitor(db: Db, links: string[], now = Math.floor(Date.now() / 1000), fetcher: typeof fetch = fetch): Promise<{ checked: number; events: number }> {
  await ensureSchema(db);
  const stored = (await db.prepare("SELECT * FROM link_monitor_links").bind().all<LinkRecord>()).results;
  const byUrl = new Map(stored.map((row) => [row.url, row]));
  const wanted = new Set(links);

  const cleanup: unknown[] = stored.filter((row) => !wanted.has(row.url)).map((row) => db.prepare("DELETE FROM link_monitor_links WHERE url = ?").bind(row.url));

  const records = links.map((url) => byUrl.get(url) ?? emptyRecord(url, now));
  const due = records.filter((record) => isDue(record, now)).sort((a, b) => a.last_checked - b.last_checked).slice(0, BATCH_SIZE);

  const writes: unknown[] = [...cleanup];
  let eventCount = 0;
  const results = await Promise.all(due.map(async (record) => ({ record, obs: await observe(record.url, fetcher) })));
  for (const { record, obs } of results) {
    const { next, events } = evaluate(record, obs, now);
    writes.push(db.prepare("INSERT OR REPLACE INTO link_monitor_links (url, state, last_status, final_url, title, content_hash, pending_hash, fail_count, last_checked, last_ok, first_seen, state_since) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(next.url, next.state, next.last_status, next.final_url, next.title, next.content_hash, next.pending_hash, next.fail_count, next.last_checked, next.last_ok, next.first_seen, next.state_since));
    for (const event of events) {
      eventCount += 1;
      writes.push(db.prepare("INSERT INTO link_monitor_events (url, kind, detail, created_at) VALUES (?,?,?,?)").bind(next.url, event.kind, event.detail, now));
    }
  }
  if (writes.length) await db.batch(writes);
  return { checked: due.length, events: eventCount };
}

export async function buildReport(db: Db, monitored: number, now = Math.floor(Date.now() / 1000), routeSources: RouteSources[] = []) {
  await ensureSchema(db);
  const links = (await db.prepare("SELECT url, state, last_status, final_url, fail_count, last_checked, last_ok, state_since FROM link_monitor_links").bind().all<LinkRecord>()).results;
  const events = (await db.prepare("SELECT url, kind, detail, created_at FROM link_monitor_events WHERE created_at > ? ORDER BY created_at DESC LIMIT 200").bind(now - 30 * 86400).all<{ url: string; kind: string; detail: string; created_at: number }>()).results;
  const count = (state: string) => links.filter((l) => l.state === state).length;
  return {
    generatedAt: now,
    total: monitored,
    ok: count("ok"),
    broken: count("broken"),
    blocked: count("blocked"),
    notYetChecked: monitored - links.filter((l) => l.last_checked > 0).length,
    problems: links.filter((l) => l.state === "broken" || l.fail_count > 0).map((l) => ({ url: l.url, state: l.state, status: l.last_status, failures: l.fail_count })),
    events,
    routes: routeFreshness(routeSources, links, await changeEventsSince(db, routeSources), now),
  };
}

/** События изменений с самой ранней даты сверки маршрутов: нужны для актуальности, срок не ограничен 30 днями. */
async function changeEventsSince(db: Db, routes: RouteSources[]): Promise<EventRow[]> {
  const earliest = Math.min(...routes.map((route) => Math.floor(Date.parse(`${route.checkedAt}T00:00:00Z`) / 1000)));
  return (await db.prepare("SELECT url, kind, detail, created_at FROM link_monitor_events WHERE created_at >= ? AND kind IN ('content_changed','moved','broken','hijacked') ORDER BY created_at DESC").bind(earliest).all<EventRow>()).results;
}
