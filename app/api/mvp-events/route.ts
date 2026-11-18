import { getD1 } from "../../../db";
import { createRateLimiter, MAX_BODY_BYTES, MAX_PER_ATTEMPT, parsePayload, type ParsedPayload } from "./rules";

// Все правила приёма (белые списки, шаблоны полей, лимиты) лежат в ./rules.ts и проверяются тестами без сборки.

/** Не больше 120 запросов в минуту с одного адреса на экземпляр Worker; обычный человек отправляет несколько событий в минуту. */
const allowRequest = createRateLimiter({ limit: 120, windowMs: 60_000, maxKeys: 5000 });

/** Принимает только запросы со страниц самого сайта. Заголовок Origin подделывается вне браузера, поэтому это не защита от скриптов: её дают лимиты и проверка полей. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

const TABLE_FOR_KIND = { event: "product_events", issue: "issue_reports", feedback: "route_feedback" } as const;

/** Сколько записей уже есть у этой попытки. Подзапрос с LIMIT останавливает чтение на пределе, индекс по attempt_id делает его дешёвым. */
async function attemptIsFull(db: Awaited<ReturnType<typeof getD1>>, value: ParsedPayload): Promise<boolean> {
  const limit = MAX_PER_ATTEMPT[value.kind];
  const table = TABLE_FOR_KIND[value.kind];
  const row = await db.prepare(`SELECT COUNT(*) AS n FROM (SELECT 1 FROM ${table} WHERE attempt_id = ? LIMIT ?)`).bind(value.attemptId, limit).first<{ n: number }>();
  return (row?.n ?? 0) >= limit;
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return Response.json({ error: "forbidden" }, { status: 403 });
    // Адрес берётся из заголовка Cloudflare; вне Cloudflare (локальная разработка) все запросы считаются одним адресом.
    const client = request.headers.get("cf-connecting-ip") ?? "local";
    if (!allowRequest(client, Date.now())) return Response.json({ error: "too many requests" }, { status: 429, headers: { "retry-after": "60" } });

    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_BODY_BYTES) return Response.json({ error: "payload too large" }, { status: 413 });
    const body = await request.text();
    if (body.length > MAX_BODY_BYTES) return Response.json({ error: "payload too large" }, { status: 413 });

    const parsed = parsePayload(JSON.parse(body));
    if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
    const value = parsed.value;

    const db = await getD1();
    if (await attemptIsFull(db, value)) return Response.json({ error: "too many events" }, { status: 429 });

    if (value.kind === "event") {
      await db.prepare(`
        INSERT INTO product_events
          (event_name, route_id, method_id, element_id, step_index, problem_code, attempt_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(value.eventName, value.routeId, value.methodId, value.elementId, value.stepIndex, value.problemCode, value.attemptId).run();
    } else if (value.kind === "issue") {
      await db.prepare(`
        INSERT INTO issue_reports
          (route_id, method_id, step_index, source_id, issue_type, attempt_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(value.routeId, value.methodId, value.stepIndex, value.sourceId, value.issueType, value.attemptId).run();
    } else {
      await db.prepare(`
        INSERT INTO route_feedback
          (route_id, method_id, outcome, clarity_rating, next_action_status, official_action_status, blocker_code, attempt_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(value.routeId, value.methodId, value.outcome, value.clarityRating, value.nextActionStatus, value.officialActionStatus, value.blockerCode, value.attemptId).run();
    }
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return Response.json({ error: "invalid json" }, { status: 400 });
    console.error("NOSTRES MVP event storage failed", error);
    return Response.json({ error: "storage unavailable" }, { status: 503 });
  }
}
