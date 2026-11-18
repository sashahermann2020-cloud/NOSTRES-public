import { currentLocale, tr } from "./i18n/store.ts";
import type { ActionMethod, OfficialSource } from "./nostres-data";

type SummaryInput = {
  method: ActionMethod;
  doneSteps: number[];
  blockedSteps: Record<number, string>;
  outcome: string;
  sources: OfficialSource[];
  generatedAt: Date;
};

const outcomeLabels: Record<string, string> = {
  waiting: "Заявление или запрос отправлен: ожидается ответ",
  received: "Страхование подтверждено / eGK или Versicherungsnachweis получены",
  additional: "Krankenkasse, вуз, работодатель или Jobcenter запросили документ",
  refused: "Получен отказ или выбранный режим не подтверждён",
  blocked: "Маршрут остановлен другой проблемой",
};

export function buildHealthInsuranceSummary({ method, doneSteps, blockedSteps, outcome, sources, generatedAt }: SummaryInput) {
  const referencedSourceIds = new Set([
    ...(method.sourceIds ?? []),
    ...(method.stepSourceIds ?? []).flat(),
    ...Object.values(method.factSourceIds ?? {}).flat(),
  ]);
  const officialSources = sources.filter((source) => source.id && referencedSourceIds.has(source.id));

  return [
    tr("NOSTRES: личная сводка маршрута"),
    tr("Цель: оформить или подтвердить медицинское страхование в Германии"),
    `${tr("Способ:")} ${method.title}`,
    `${tr("Создано:")} ${generatedAt.toLocaleString(currentLocale() === "ru" ? "ru-RU" : currentLocale())}`,
    "",
    tr("Статус этапов"),
    ...method.steps.map((step, index) => {
      const marker = doneSteps.includes(index) ? tr("[готово]") : blockedSteps[index] ? tr("[проблема]") : tr("[ожидает]");
      return `${index + 1}. ${marker} ${step}`;
    }),
    "",
    `${tr("Результат:")} ${tr(outcomeLabels[outcome] ?? "Ещё не отмечен")}`,
    "",
    tr("Официальные источники"),
    ...officialSources.map((source) => `- ${tr(source.label)}: ${source.url}`),
    "",
    tr("Сводка не содержит ответы на вопросы, медицинские сведения, документы, номер страховки, имя или email."),
  ].join("\n");
}
