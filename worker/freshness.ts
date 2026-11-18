// Актуальность информации в маршрутах: какой маршрут нужно заново сверить с официальными страницами и почему.
// Чистые функции без сети и базы: используются отчётом /_monitor/links и скриптом scripts/freshness-report.mjs.
// Правила – PROJECT_SPEC.md, «Актуальность информации».

export interface RouteSources {
  id: string;
  path: string;
  title: string;
  /** Дата последней сверки, YYYY-MM-DD (app/route-checks.ts). */
  checkedAt: string;
  reviewDays: number;
  sources: string[];
  /** Страницы, изменение которых уже проверено: момент проверки, YYYY-MM-DDTHH:MMZ (app/route-checks.ts, sourceReviewedAt). */
  reviewed?: Record<string, string>;
}

export interface LinkRow { url: string; state: string; last_status: number; last_checked: number; last_ok: number }
export interface EventRow { url: string; kind: string; detail: string; created_at: number }

export type Reason = "broken" | "changed" | "overdue";
export interface RouteFreshness {
  id: string;
  path: string;
  title: string;
  checkedAt: string;
  daysSinceCheck: number;
  reviewDays: number;
  /** Пусто – маршрут актуален. Порядок: сначала самые срочные причины. */
  reasons: Reason[];
  /** Страницы маршрута, которые сейчас не открываются. */
  broken: string[];
  /** Изменения страниц маршрута после даты сверки. */
  changes: { url: string; kind: string; detail: string; at: number }[];
  /** Страницы, которые робот не может проверить: их сверяют вручную при сверке маршрута. */
  unverifiable: string[];
}

/** Изменения, после которых маршрут сверяется заново: текст, переезд, поломка, подмена. */
const CHANGE_KINDS = new Set(["content_changed", "moved", "broken", "hijacked"]);
/** Работавшая ссылка без успешной проверки дольше этого срока считается непроверяемой (сайт стал отказывать роботу). */
export const STALE_OK_DAYS = 7;
const DAY = 86400;

const dayStart = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / 1000);
const reviewedAt = (route: RouteSources, url: string) => (route.reviewed?.[url] ? Math.floor(Date.parse(route.reviewed[url].replace(/Z$/, ":00Z")) / 1000) : 0);

export function routeFreshness(routes: RouteSources[], links: LinkRow[], events: EventRow[], now: number): RouteFreshness[] {
  const byUrl = new Map(links.map((link) => [link.url, link]));
  const result = routes.map((route) => {
    // Событие в день сверки тоже учитывается: время сверки внутри дня неизвестно, надёжнее перепроверить.
    const since = dayStart(route.checkedAt);
    const daysSinceCheck = Math.floor((now - since) / DAY);
    const own = new Set(route.sources);
    const changes = events
      .filter((event) => own.has(event.url) && CHANGE_KINDS.has(event.kind) && event.created_at >= since && event.created_at > reviewedAt(route, event.url))
      .sort((a, b) => b.created_at - a.created_at)
      .map((event) => ({ url: event.url, kind: event.kind, detail: event.detail, at: event.created_at }));
    const broken = route.sources.filter((url) => byUrl.get(url)?.state === "broken");
    const unverifiable = route.sources.filter((url) => {
      const link = byUrl.get(url);
      if (!link || !link.last_checked) return true;
      if (link.state === "blocked") return true;
      return link.state === "ok" && now - link.last_ok > STALE_OK_DAYS * DAY;
    });
    const reasons: Reason[] = [];
    if (broken.length) reasons.push("broken");
    if (changes.some((change) => change.kind !== "broken")) reasons.push("changed");
    if (daysSinceCheck > route.reviewDays) reasons.push("overdue");
    return { id: route.id, path: route.path, title: route.title, checkedAt: route.checkedAt, daysSinceCheck, reviewDays: route.reviewDays, reasons, broken, changes, unverifiable };
  });
  const rank = (item: RouteFreshness) => (item.reasons.includes("broken") ? 0 : item.reasons.includes("changed") ? 1 : item.reasons.includes("overdue") ? 2 : 3);
  return result.sort((a, b) => rank(a) - rank(b) || b.changes.length - a.changes.length || b.daysSinceCheck - a.daysSinceCheck || a.id.localeCompare(b.id));
}

export const REASON_LABELS: Record<Reason, string> = {
  broken: "страница маршрута не открывается",
  changed: "официальная страница изменилась после сверки",
  overdue: "срок повторной сверки прошёл",
};
