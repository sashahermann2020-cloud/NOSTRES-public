import { questions as housingAll, searchOptions, stepsFor, official, type Answers } from "../wohnungssuche/housing-plan.ts";
import type { Action, Method, Plan, Question, Step } from "./route-model.ts";

/** Четыре вопроса: регистрация адреса стала шагом плана, а не вопросом (спецификация §3: обычно 2–4 вопроса). */
export const housingQuestions = housingAll.filter((question) => question.id !== "registration") as unknown as readonly Question[];

const incomeLabels: Record<string, string> = { german: "немецкие зарплатные документы", other: "другое подтверждение дохода", benefits: "решение о социальных выплатах", none: "пока нет подтверждения дохода" };
const wbsLabels: Record<string, string> = { yes: "хотите проверить WBS", no: "WBS не нужен", unknown: "не знаете, подходит ли WBS" };
const housingLabels: Record<string, string> = { apartment: "отдельная квартира", room: "комната в WG", temporary: "временное жильё или субаренда", unknown: "формат пока не выбран" };

const toStep = (step: ReturnType<typeof stepsFor>[number]): Step => {
  const action: Action = step.link ?? step.alternative ?? step.source;
  const mode: Step["mode"] = step.link?.href.startsWith("/") || step.link ? "Онлайн" : "Выбор";
  return { title: step.title, detail: step.detail, mode, action, alternative: step.link && step.alternative ? step.alternative : undefined, source: step.source };
};

export function housingGuidedPlan(a: Answers): Plan {
  const all = stepsFor(a);
  const isSearchStep = (title: string) => title === "Откройте предложения городских жилищных компаний" || title === "Выберите подходящий способ поиска жилья";
  const before = all.slice(0, all.findIndex((step) => isSearchStep(step.title))).map(toStep);
  const after = all.slice(all.findIndex((step) => isSearchStep(step.title)) + 1).map(toStep);
  const type = a.housing ?? "unknown";
  const options = searchOptions.filter((option) => !option.forAnswers || option.forAnswers.includes(type));
  const docsByIncome = a.income === "german" ? "Немецкие зарплатные документы" : a.income === "benefits" ? "Действующее решение о выплатах" : a.income === "other" ? "Имеющееся подтверждение дохода" : "Короткое представление о себе (без выдуманного дохода)";
  const methods: Method[] = options.map((option) => {
    const first = option.links[0];
    const last = option.links[option.links.length - 1];
    const searchStep: Step = { title: `Откройте: ${option.name}`, detail: option.summary, mode: "Онлайн", action: first, source: last };
    return {
      id: option.id, kind: option.id === "coop" ? "combined" : "online", title: option.name, summary: option.summary,
      availability: "available", availabilityLabel: "Доступно без WBS; для отдельных квартир компании требуют WBS в объявлении",
      conditions: option.facts,
      documents: [docsByIncome, a.schufa === "yes" ? "Справка SCHUFA (сведения о кредитной истории)" : "SCHUFA, если арендодатель её просит: другим документом её не подменяют", "Документ личности", "Полный пакет передаётся только перед договором, не для записи на просмотр"],
      steps: [...before, searchStep, ...after],
    };
  });
  const why = [a.housing && `Вы ищете: ${housingLabels[a.housing]}`, a.income && `Подтверждение дохода: ${incomeLabels[a.income]}`, a.schufa && `SCHUFA: ${a.schufa === "yes" ? "есть" : a.schufa === "no" ? "нет" : "не знаете, что это"}`, a.wbs && `WBS: ${wbsLabels[a.wbs]}`].filter((x): x is string => Boolean(x));
  return {
    fit: "fits", why,
    title: type === "room" ? "Поиск комнаты в Берлине" : type === "temporary" ? "Поиск временного жилья" : type === "unknown" ? "Выбор подходящего жилья в Берлине" : "Поиск квартиры в Берлине",
    summary: "Ниже — способы поиска, документы и порядок действий для ваших ответов. NOSTRES помогает подготовиться и перейти к официальным источникам; наличие свободного жилья и решение арендодателя от него не зависят.",
    note: "Это общая информация, а не юридическая консультация. Условия объявления и официальных услуг смотрите на их страницах; для WBS есть отдельный маршрут.",
    steps: methods[0]?.steps ?? [], methods,
    next: { label: "После въезда: регистрация адреса", href: "/berlin/anmeldung" },
  };
}
export { official as housingOfficial };
