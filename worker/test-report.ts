// Отчёт по тестированию: считает анонимные заходы и отзывы из D1. Заходы до даты начала теста — проверки проекта, их не считаем людьми.
interface Statement { bind(...values: unknown[]): Statement; all<T>(): Promise<{ results: T[] }> }
interface Db { prepare(sql: string): Statement }

export const TEST_START = "2026-10-19";
const FUNNEL = ["situation_opened", "question_answered", "route_result_generated", "action_method_selected", "official_source_opened", "step_completed", "goal_achieved", "quick_helpful", "quick_not_helpful", "route_feedback_submitted"];

export interface TestReport {
  since: string;
  people: { total: number; real: number; internal: number };
  funnel: { event: string; real: number; internal: number }[];
  days: { day: string; people: number; real: boolean }[];
  routes: { route: string; people: number }[];
  sources: { source: string; people: number }[];
  feedback: { total: number; avgClarity: number | null; nextYes: number; nextPartly: number; nextNo: number; reached: number; notYet: number; blocked: number; items: { route_id: string; created_at: string; clarity_rating: number; next_action_status: string; official_action_status: string; blocker_code: string }[] };
  issues: number;
}

export async function buildTestReport(db: Db): Promise<TestReport> {
  const q = <T,>(sql: string, ...v: unknown[]) => db.prepare(sql).bind(...v).all<T>().then((r) => r.results);
  const [funnel, days, routes, sources, fb, items, issues] = await Promise.all([
    q<{ event_name: string; real: number; internal: number }>("SELECT event_name, COUNT(DISTINCT CASE WHEN created_at >= ? THEN attempt_id END) real, COUNT(DISTINCT CASE WHEN created_at < ? THEN attempt_id END) internal FROM product_events GROUP BY event_name", TEST_START, TEST_START),
    q<{ day: string; people: number }>("SELECT substr(created_at,1,10) day, COUNT(DISTINCT attempt_id) people FROM product_events GROUP BY day ORDER BY day"),
    q<{ route: string; people: number }>("SELECT route_id route, COUNT(DISTINCT attempt_id) people FROM product_events WHERE event_name='situation_opened' AND created_at >= ? GROUP BY route_id ORDER BY people DESC", TEST_START),
    q<{ source: string; people: number }>("SELECT element_id source, COUNT(DISTINCT attempt_id) people FROM product_events WHERE event_name='situation_opened' AND element_id IS NOT NULL AND created_at >= ? GROUP BY element_id ORDER BY people DESC", TEST_START),
    q<{ n: number; avg: number | null; ny: number; np: number; nn: number; r: number; ny2: number; b: number }>("SELECT COUNT(*) n, AVG(clarity_rating) avg, SUM(next_action_status='yes') ny, SUM(next_action_status='partly') np, SUM(next_action_status='no') nn, SUM(official_action_status='reached') r, SUM(official_action_status='not_yet') ny2, SUM(official_action_status='blocked') b FROM route_feedback WHERE created_at >= ?", TEST_START),
    q<TestReport["feedback"]["items"][number]>("SELECT route_id, created_at, clarity_rating, next_action_status, official_action_status, blocker_code FROM route_feedback WHERE created_at >= ? ORDER BY created_at DESC LIMIT 100", TEST_START),
    q<{ n: number }>("SELECT COUNT(*) n FROM issue_reports WHERE created_at >= ?", TEST_START),
  ]);
  const byEvent = new Map(funnel.map((f) => [f.event_name, f]));
  const people = await q<{ real: number; internal: number }>("SELECT COUNT(DISTINCT CASE WHEN created_at >= ? THEN attempt_id END) real, COUNT(DISTINCT CASE WHEN created_at < ? THEN attempt_id END) internal FROM product_events", TEST_START, TEST_START);
  const f = fb[0];
  return {
    since: TEST_START,
    people: { total: (people[0]?.real ?? 0) + (people[0]?.internal ?? 0), real: people[0]?.real ?? 0, internal: people[0]?.internal ?? 0 },
    funnel: FUNNEL.map((event) => ({ event, real: byEvent.get(event)?.real ?? 0, internal: byEvent.get(event)?.internal ?? 0 })),
    days: days.map((d) => ({ ...d, real: d.day >= TEST_START })),
    routes,
    sources,
    feedback: { total: f?.n ?? 0, avgClarity: f?.avg == null ? null : Math.round(f.avg * 10) / 10, nextYes: f?.ny ?? 0, nextPartly: f?.np ?? 0, nextNo: f?.nn ?? 0, reached: f?.r ?? 0, notYet: f?.ny2 ?? 0, blocked: f?.b ?? 0, items },
    issues: issues[0]?.n ?? 0,
  };
}

const LABELS: Record<string, string> = {
  situation_opened: "Открыли маршрут", question_answered: "Ответили на вопрос", route_result_generated: "Получили результат", action_method_selected: "Выбрали способ действия",
  official_source_opened: "Открыли официальный сайт", step_completed: "Отметили шаг выполненным", goal_achieved: "Достигли цели", quick_helpful: "Нажали «Помог»", quick_not_helpful: "Нажали «Не помог»", route_feedback_submitted: "Оставили подробный отзыв",
};
const SOURCE_LABELS: Record<string, string> = { direct: "Прямой заход (ссылка без источника, закладка, часть мессенджеров)", messenger: "Мессенджер", social: "Соцсеть", ai: "ИИ-ассистент", "other-site": "Другой сайт", "search-google": "Поиск Google", "search-yandex": "Поиск Яндекс", "search-bing": "Поиск Bing", "search-duckduckgo": "Поиск DuckDuckGo", "search-other": "Другой поиск" };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

export function renderTestReport(r: TestReport): string {
  const top = r.funnel[0]?.real || 0;
  const funnel = r.funnel.map((f) => `<tr><td>${esc(LABELS[f.event] ?? f.event)}</td><td>${f.real}</td><td>${top ? Math.round((f.real / top) * 100) : 0}%</td><td class="mute">${f.internal}</td></tr>`).join("");
  const days = r.days.map((d) => `<tr class="${d.real ? "" : "mute"}"><td>${d.day}</td><td>${d.people}</td><td>${d.real ? "тест" : "ранние пробные заходы"}</td></tr>`).join("");
  const sources = r.sources.map((x) => `<tr><td>${esc(SOURCE_LABELS[x.source] ?? x.source)}</td><td>${x.people}</td></tr>`).join("");
  const routes = r.routes.map((x) => `<tr><td>${esc(x.route)}</td><td>${x.people}</td></tr>`).join("");
  const items = r.feedback.items.map((i) => `<tr><td>${esc(i.created_at)}</td><td>${esc(i.route_id)}</td><td>${i.clarity_rating}/5</td><td>${esc(i.next_action_status)}</td><td>${esc(i.official_action_status)}</td><td>${esc(i.blocker_code)}</td></tr>`).join("");
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Отчёт по тестированию</title><style>body{font:16px/1.5 system-ui;margin:24px auto;max-width:960px;padding:0 16px}table{border-collapse:collapse;width:100%;margin-bottom:24px}td,th{border-bottom:1px solid #ccc;padding:6px;text-align:left;vertical-align:top}.mute{color:#888}</style>
<h1>Отчёт по тестированию</h1>
<p>Людей в тесте (с ${r.since}): <b>${r.people.real}</b>. До этой даты было ${r.people.internal} ранних пробных заходов, в число людей теста они не входят. Сообщений о проблемах в тесте: ${r.issues}.</p>
<h2>Воронка</h2><table><tr><th>Шаг</th><th>Людей</th><th>От открывших</th><th>До теста (пробные)</th></tr>${funnel}</table>
<h2>Отзывы: ${r.feedback.total}</h2><p>Средняя понятность: ${r.feedback.avgClarity ?? "нет данных"} из 5. Следующее действие понятно: да ${r.feedback.nextYes}, частично ${r.feedback.nextPartly}, нет ${r.feedback.nextNo}. Дошли до официального действия: ${r.feedback.reached}, ещё нет: ${r.feedback.notYet}, упёрлись: ${r.feedback.blocked}.</p>
${items ? `<table><tr><th>Когда (UTC)</th><th>Маршрут</th><th>Понятность</th><th>Следующее действие</th><th>Официальное действие</th><th>Помеха</th></tr>${items}</table>` : ""}
<h2>Заходы по дням</h2><table><tr><th>День</th><th>Браузеров</th><th></th></tr>${days}</table>
${sources ? `<h2>Откуда пришли (только заходы после 29 октября)</h2><table><tr><th>Источник</th><th>Людей</th></tr>${sources}</table>` : ""}
<h2>Какие маршруты открывали (с ${r.since})</h2><table><tr><th>Маршрут</th><th>Людей</th></tr>${routes}</table>`;
}
