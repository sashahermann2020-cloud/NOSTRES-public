// Правила приёма технических событий /api/mvp-events. Файл без зависимостей: его проверяют тесты без сборки.
// Сервер принимает только документированные события и технические поля (SECURITY_RULES.md §6): свободный текст,
// имена, адреса и номера документов сюда попасть не должны, поэтому каждое поле проверяется по узкому шаблону.

export const EVENT_NAMES = new Set([
  "situation_opened",
  "question_answered",
  "route_result_generated",
  "action_method_selected",
  "official_source_opened",
  "step_completed",
  "step_reopened",
  "step_blocked",
  "step_unblocked",
  "summary_copied",
  "summary_downloaded",
  "summary_printed",
  "result_waiting",
  "additional_document_requested",
  "official_refusal_reported",
  "goal_achieved",
  "housing_plan_ready",
  "issue_reported",
  "route_feedback_submitted",
  "insurance_provider_selected",
  "quick_helpful",
  "quick_not_helpful",
]);

export const ISSUE_TYPES = new Set([
  "broken_link",
  "information_changed",
  "wrong_geography",
  "unclear_instruction",
  "missing_official_option",
]);

export const ROUTE_IDS = new Set(["anmeldung", "tax-id", "health", "housing", "lea", "doctor", "urgent", "business", "bank", "telecom", "dog", "wbs", "kindergeld", "jobcenter", "kita", "employment", "elterngeld", "kinderzuschlag", "steuererklaerung", "elternzeit", "wohngeld", "mutterschutz", "bildungspaket", "pflegegeld", "schwerbehinderung", "wohnungsgeber", "umzug", "arbeitslosengeld", "grundsicherungsgeld", "kfz", "einbuergerung", "workpermit", "recognition", "language", "reunion", "sprachkurs", "study", "petmove", "petpass", "vet", "dogtrainer", "transport", "culture", "relocation", "chancenkarte", "workvisa", "volunteer", "studyvisa", "company", "socialnumber", "settlement", "notary", "mental", "discrimination", "homeless", "hardship", "violence"]);

export const NEXT_ACTION_STATUSES = new Set(["yes", "partly", "no"]);
export const OFFICIAL_ACTION_STATUSES = new Set(["reached", "not_yet", "blocked"]);
export const BLOCKER_CODES = new Set(["none", "not_my_case", "official_page_unclear", "missing_document", "no_appointment", "service_error", "other"]);
export const OUTCOMES = new Set(["waiting", "received", "additional", "refused", "blocked"]);

export const MAX_BODY_BYTES = 4096;
/** Сколько записей одной таблицы допускается на одну «попытку» (проверяется по индексу attempt_id). */
export const MAX_PER_ATTEMPT = { event: 400, issue: 20, feedback: 20 } as const;

/** Технический код: латиница, цифры и - _ . : (идентификаторы способов, кодов проблем, попыток). Пробелов и кириллицы нет. */
const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}$/;
/** Ссылка-идентификатор: печатные ASCII-знаки без пробела (начало адреса официальной страницы или код источника). */
const REFERENCE = /^[\x21-\x7E]{1,80}$/;

export type EventPayload = {
  kind: "event";
  routeId: string;
  attemptId: string;
  eventName: string;
  methodId: string | null;
  elementId: string | null;
  stepIndex: number | null;
  problemCode: string | null;
};
export type IssuePayload = {
  kind: "issue";
  routeId: string;
  attemptId: string;
  issueType: string;
  methodId: string | null;
  sourceId: string | null;
  stepIndex: number | null;
};
export type FeedbackPayload = {
  kind: "feedback";
  routeId: string;
  attemptId: string;
  methodId: string | null;
  outcome: string | null;
  clarityRating: number;
  nextActionStatus: string;
  officialActionStatus: string;
  blockerCode: string;
};
export type ParsedPayload = EventPayload | IssuePayload | FeedbackPayload;
export type ParseResult = { ok: true; value: ParsedPayload } | { ok: false; error: string };

const fail = (error: string): ParseResult => ({ ok: false, error });

/** Поле необязательно: отсутствует или null – значит пусто; присутствует, но не по шаблону – ошибка, а не молчаливая запись. */
function optional(value: unknown, pattern: RegExp): { ok: true; value: string | null } | { ok: false } {
  if (value === undefined || value === null) return { ok: true, value: null };
  if (typeof value !== "string" || !pattern.test(value)) return { ok: false };
  return { ok: true, value };
}

function stepIndexOf(value: unknown): number | null | "invalid" {
  if (value === undefined || value === null) return null;
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 20 ? (value as number) : "invalid";
}

/** Проверяет тело запроса целиком до обращения к базе: неверный запрос не стоит ни одного чтения D1. */
export function parsePayload(raw: unknown): ParseResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fail("invalid payload");
  const payload = raw as Record<string, unknown>;

  const routeId = payload.routeId;
  if (typeof routeId !== "string" || !ROUTE_IDS.has(routeId)) return fail("invalid route payload");
  const attemptId = payload.attemptId;
  if (typeof attemptId !== "string" || !IDENTIFIER.test(attemptId)) return fail("invalid route payload");

  const methodId = optional(payload.methodId, IDENTIFIER);
  const elementId = optional(payload.elementId, REFERENCE);
  const problemCode = optional(payload.problemCode, IDENTIFIER);
  const sourceId = optional(payload.sourceId, REFERENCE);
  const stepIndex = stepIndexOf(payload.stepIndex);
  if (!methodId.ok || !elementId.ok || !problemCode.ok || !sourceId.ok || stepIndex === "invalid") return fail("invalid field");

  if (payload.kind === "event") {
    const eventName = payload.eventName;
    if (typeof eventName !== "string" || !EVENT_NAMES.has(eventName)) return fail("invalid event");
    return { ok: true, value: { kind: "event", routeId, attemptId, eventName, methodId: methodId.value, elementId: elementId.value, stepIndex, problemCode: problemCode.value } };
  }

  if (payload.kind === "issue") {
    const issueType = payload.issueType;
    if (typeof issueType !== "string" || !ISSUE_TYPES.has(issueType)) return fail("invalid issue");
    return { ok: true, value: { kind: "issue", routeId, attemptId, issueType, methodId: methodId.value, sourceId: sourceId.value, stepIndex } };
  }

  if (payload.kind === "feedback") {
    const rating = payload.clarityRating;
    const nextActionStatus = payload.nextActionStatus;
    const officialActionStatus = payload.officialActionStatus;
    const blocker = payload.blockerCode === undefined || payload.blockerCode === null ? "none" : payload.blockerCode;
    const outcomeRaw = payload.outcome;
    const outcomeGiven = outcomeRaw !== undefined && outcomeRaw !== null && outcomeRaw !== "";
    if (
      !Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5
      || typeof nextActionStatus !== "string" || !NEXT_ACTION_STATUSES.has(nextActionStatus)
      || typeof officialActionStatus !== "string" || !OFFICIAL_ACTION_STATUSES.has(officialActionStatus)
      || typeof blocker !== "string" || !BLOCKER_CODES.has(blocker)
      || (outcomeGiven && (typeof outcomeRaw !== "string" || !OUTCOMES.has(outcomeRaw)))
    ) return fail("invalid feedback");
    const outcome = outcomeGiven ? (outcomeRaw as string) : null;
    return {
      ok: true,
      value: { kind: "feedback", routeId, attemptId, methodId: methodId.value, outcome, clarityRating: rating as number, nextActionStatus, officialActionStatus, blockerCode: blocker },
    };
  }

  return fail("invalid kind");
}

/**
 * Простое ограничение частоты «окном» для одного экземпляра Worker. Оно не заменяет правило Cloudflare (экземпляров много,
 * счётчик не общий), но отсекает лавину запросов с одного адреса до обращения к базе и ничего не читает из D1.
 */
export function createRateLimiter(options: { limit: number; windowMs: number; maxKeys: number }) {
  let windowStart = 0;
  let counts = new Map<string, number>();
  return function allow(key: string, now: number): boolean {
    if (now - windowStart >= options.windowMs) { windowStart = now; counts = new Map(); }
    const used = counts.get(key) ?? 0;
    if (used >= options.limit) return false;
    // Переполнение таблицы адресов не должно расти без предела: новые адреса сверх предела сразу считаются исчерпавшими лимит.
    if (used === 0 && counts.size >= options.maxKeys) return false;
    counts.set(key, used + 1);
    return true;
  };
}
