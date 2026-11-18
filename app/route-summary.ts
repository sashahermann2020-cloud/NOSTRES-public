import { tr, trf } from "./i18n/store.ts";
export type SummaryStep = { title: string; detail?: string; mode?: string; done: boolean; links: { label: string; href: string }[] };
export type SummarySource = { id: string; label: string; href: string };
export type RouteSummaryInput = { routeTitle: string; resultTitle: string; resultSummary: string; note?: string; steps: SummaryStep[]; checkedAt: string; pageUrl?: string };

export const issueTypeLabels = [
  ["broken_link", "Ссылка не работает"],
  ["information_changed", "Информация на официальной странице изменилась"],
  ["wrong_geography", "Маршрут не подходит для моего места"],
  ["unclear_instruction", "Инструкция непонятна"],
  ["missing_official_option", "Нет нужного официального способа"],
] as const;

export function toAbsoluteLink(href: string, origin = "https://nostres.world") {
  return href.startsWith("/") ? `${origin}${href}` : href;
}

export function uniqueSources(steps: { links: { label: string; href: string }[] }[]): SummarySource[] {
  const seen = new Map<string, SummarySource>();
  steps.forEach((step) => step.links.forEach((link) => {
    if (!link.href.startsWith("http") || seen.has(link.href)) return;
    seen.set(link.href, { id: link.href.slice(0, 80), label: link.label, href: link.href });
  }));
  return [...seen.values()];
}

export function buildRouteSummary(input: RouteSummaryInput) {
  const done = input.steps.filter((step) => step.done).length;
  const lines = [
    `NOSTRES · ${tr(input.routeTitle)}`,
    `${tr("Результат:")} ${tr(input.resultTitle)}`,
    tr(input.resultSummary),
  ];
  if (input.note) lines.push(`${tr("Важно:")} ${tr(input.note)}`);
  lines.push("", trf("Выполнено шагов: {done} из {total}", { done, total: input.steps.length }), "");
  input.steps.forEach((step, index) => {
    lines.push(`${step.done ? "[x]" : "[ ]"} ${index + 1}. ${tr(step.title)}${step.mode ? ` (${tr(step.mode)})` : ""}`);
    if (step.detail) lines.push(`    ${tr(step.detail)}`);
    step.links.forEach((link) => lines.push(`    ${tr(link.label)}: ${toAbsoluteLink(link.href)}`));
  });
  lines.push("", trf("Официальные страницы проверены: {date}. Ссылки на них указаны в шагах.", { date: tr(input.checkedAt) }));
  lines.push(tr("В сводку не включены личные данные. Ответы хранятся только в вашем браузере."));
  return lines.join("\n");
}
