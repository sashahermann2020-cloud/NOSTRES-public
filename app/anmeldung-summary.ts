import { currentLocale, tr } from "./i18n/store.ts";
import { anmeldungProblems, type AvailableActionMethod, type OfficialSource } from "./nostres-data.ts";

type SummaryInput = {
  method: AvailableActionMethod;
  doneSteps: number[];
  blockedSteps: Record<number, string>;
  outcome: string;
  sources: OfficialSource[];
  generatedAt: Date;
};

const outcomeLabels: Record<string, string> = {
  waiting: "Отправлено, ожидаю результат",
  received: "Meldebestätigung получена",
  additional: "Ведомство запросило дополнительный документ",
  refused: "Получен отказ или документы не приняли",
  blocked: "Маршрут пока не завершён",
};

export function buildAnmeldungSummary({ method, doneSteps, blockedSteps, outcome, sources, generatedAt }: SummaryInput) {
  const lines = [
    tr("NOSTRES — персональная сводка маршрута"),
    tr("Цель: зарегистрировать адрес в Берлине (Anmeldung)"),
    `${tr("Способ:")} ${method.title}`,
    `${tr("Срок:")} ${method.deadline}`,
    `${tr("Стоимость:")} ${method.fee}`,
    `${tr("Сформировано:")} ${new Intl.DateTimeFormat(currentLocale() === "ru" ? "ru-RU" : currentLocale(), { dateStyle: "medium", timeStyle: "short" }).format(generatedAt)}`,
    "",
    tr("Этапы:"),
    ...method.steps.map((step, index) => {
      const problemLabel = tr(anmeldungProblems.find((problem) => problem.id === blockedSteps[index])?.label ?? blockedSteps[index]);
      const status = doneSteps.includes(index) ? tr("выполнено") : blockedSteps[index] ? `${tr("есть проблема:")} ${problemLabel}` : tr("не выполнено");
      return `${index + 1}. [${status}] ${step}`;
    }),
    "",
    `${tr("Результат:")} ${tr(outcomeLabels[outcome] ?? "не отмечен")}`,
    "",
    tr("Официальные источники:"),
    ...sources.filter((source) => method.sourceIds?.includes(source.id ?? "")).map((source) => `- ${tr(source.label)}: ${source.url}`),
    "",
    tr("Сводка не содержит ваши ответы на вопросы, документы или персональные данные."),
  ];

  return lines.join("\n");
}
