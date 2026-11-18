// Доступ к служебным страницам /_monitor/*: только по секретной ссылке.
// В базе D1 хранится лишь SHA-256 ключа (таблица access_tokens), сам ключ нигде в коде и репозитории не лежит.
// Без верного ключа страница отвечает так же, как несуществующая (404).

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Сравнение без раннего выхода: время не зависит от того, где строки разошлись. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

type Db = Pick<D1Database, "prepare">;

const MAX_FAILURES = 10;
const FAILURE_WINDOW_MS = 5 * 60_000;
const MAX_TRACKED_CLIENTS = 2000;
/** Неудачные попытки по адресам в пределах одного экземпляра Worker: после серии ошибок база больше не опрашивается. */
let failures = new Map<string, { count: number; since: number }>();
let tableChecked = false;

function isLockedOut(client: string, now: number): boolean {
  const entry = failures.get(client);
  if (!entry) return false;
  if (now - entry.since >= FAILURE_WINDOW_MS) { failures.delete(client); return false; }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(client: string, now: number): void {
  const entry = failures.get(client);
  if (entry && now - entry.since < FAILURE_WINDOW_MS) { entry.count += 1; return; }
  if (failures.size >= MAX_TRACKED_CLIENTS) failures = new Map();
  failures.set(client, { count: 1, since: now });
}

export async function hasMonitorAccess(db: Db, request: Request): Promise<boolean> {
  const url = new URL(request.url);
  const key = (url.searchParams.get("key") ?? request.headers.get("x-monitor-key") ?? "").trim();
  if (key.length < 20 || key.length > 200) return false;
  const client = request.headers.get("cf-connecting-ip") ?? "local";
  const now = Date.now();
  if (isLockedOut(client, now)) return false;
  try {
    const row = await db.prepare("SELECT hash FROM access_tokens WHERE name = ?").bind("monitor").first<{ hash: string }>();
    if (!row?.hash) { recordFailure(client, now); return false; }
    const granted = safeEqual(await sha256Hex(key), row.hash);
    if (!granted) recordFailure(client, now);
    return granted;
  } catch {
    // Таблицы ещё нет (новая база): создаём её один раз на экземпляр, не на каждый запрос. Ключа в ней быть не может, значит доступа нет.
    if (!tableChecked) {
      tableChecked = true;
      try { await db.prepare("CREATE TABLE IF NOT EXISTS access_tokens (name TEXT PRIMARY KEY, hash TEXT NOT NULL, created_at INTEGER NOT NULL)").run(); } catch { /* база недоступна */ }
    }
    return false;
  }
}

export function notFound(): Response {
  return new Response("Not found", { status: 404, headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
}
