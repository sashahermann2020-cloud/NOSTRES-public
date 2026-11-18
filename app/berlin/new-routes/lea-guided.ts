import { planFor as leaPlan, questions as leaAll, visibleQuestions, official, type Answers } from "../aufenthalt/lea-plan.ts";
import type { Action, Fact, Method, Plan, Question, Step } from "./route-model.ts";

export const leaQuestions = leaAll as unknown as readonly Question[];
export const leaVisible = (a: Answers): readonly Question[] => visibleQuestions(a) as unknown as readonly Question[];

const basisLabels: Record<string, string> = { work: "работа по § 18b", study: "учёба по § 16b", spouse: "супруг или супруга по § 30", humanitarian: "гуманитарное основание" };
const documents: Record<string, string[]> = {
  work: ["Паспорт", "Трудовой договор и подтверждение занятости", "Подтверждение жилья", "Подтверждение медицинской страховки"],
  study: ["Паспорт", "Подтверждение учёбы", "Подтверждение средств на жизнь", "Подтверждение медицинской страховки"],
  spouse: ["Паспорта обоих супругов", "Свидетельство о браке (переводы или апостиль могут потребоваться)", "Подтверждения дохода, жилья и страховки"],
  humanitarian: ["Паспорт", "Документы по вашему параграфу: полный перечень на странице услуги"],
};
const early: Record<string, Fact> = {
  work: { label: "Когда подавать", value: "не раньше чем за четыре месяца до окончания действующего документа и до его истечения", kind: "official" },
  study: { label: "Когда подавать", value: "не раньше чем за четыре месяца до окончания действующего документа и до его истечения", kind: "official" },
  spouse: { label: "Когда подавать", value: "пока ваш нынешний вид на жительство действителен; единого раннего срока на странице услуги нет", kind: "none" },
  humanitarian: { label: "Когда подавать", value: "не раньше чем за восемь недель до истечения срока", kind: "official" },
};
const production: Record<string, string> = { work: "обычно 4–6 недель после личного приёма", study: "обычно 4–6 недель после личного приёма", spouse: "не менее четырёх недель после личного приёма", humanitarian: "обычно 4–6 недель после приёма, если выдаётся электронный вид на жительство" };

const toStep = (step: { title: string; detail: string; mode: Step["mode"]; action?: Action; source: Action }): Step => ({ ...step, action: step.action ?? step.source });

export function leaGuidedPlan(a: Answers): Plan {
  const plan = leaPlan(a);
  const why = [a.city && `Основной адрес: ${a.city === "berlin" ? "Берлин" : a.city === "elsewhere" ? "не Берлин" : "пока не известен"}`, a.document && `Документ: ${({ valid: "действующий вид на жительство", dvisa: "национальная виза D", expired: "срок истёк", schengen: "шенгенская виза C", eu: "гражданство ЕС / ЕЭЗ / Швейцарии", other: "другой или неизвестный" } as Record<string, string>)[a.document]}`, a.goal && `Цель: ${({ extend: "продлить на прежнем основании", first: "первый вид на жительство", change: "смена основания или работодателя", uncertain: "пока не известна" } as Record<string, string>)[a.goal]}`, a.basis && basisLabels[a.basis] && `Основание: ${basisLabels[a.basis]}`].filter((x): x is string => Boolean(x));
  const steps = plan.steps.map(toStep);
  if (!plan.supported) {
    const unclear = a.city === "uncertain" || a.document === "other" || a.goal === "uncertain" || a.basis === "other";
    return { fit: unclear ? "insufficient" : "redirect", why, title: plan.title, summary: plan.summary, note: plan.note, steps, next: { label: "Каталог услуг LEA", href: official.directory } };
  }
  const key = a.basis as string;
  const onlineFacts: Fact[] = [
    early[key],
    { label: "Файлы заявления", value: "PDF, JPG, JPEG или PNG: до 7 МБ каждый и до 100 МБ вместе", kind: "official" },
    { label: "Ожидание приглашения", value: "срок на странице услуги не указан", kind: "none" },
    { label: "Изготовление электронного вида на жительство (eAT)", value: production[key], kind: "authority" },
  ];
  const method: Method = {
    id: "online", kind: "combined", title: "Онлайн-заявление в LEA, затем личный приём", summary: "Заявление подаётся онлайн; после проверки LEA приглашает на личный приём, если он нужен.",
    availability: "available", availabilityLabel: "Доступно для вашего основания",
    conditions: ["Вы живёте в Берлине и продлеваете документ на том же основании", "Оплата картой или PayPal перед отправкой, если нет освобождения от сбора", "Прежний календарь самостоятельной записи LEA закрыт: приглашение присылает ведомство"],
    documents: documents[key] ?? [], facts: onlineFacts, steps,
  };
  return {
    fit: "fits", why, title: plan.title, summary: plan.summary, note: plan.note, steps, methods: [method],
    singleMethodNote: "Для вашего основания на странице услуги описана подача через онлайн-форму: другого способа подачи там нет, поэтому он выбран автоматически.",
    next: { label: "Когда можно получить бессрочный ВНЖ (Niederlassungserlaubnis)", href: "/berlin/niederlassungserlaubnis" },
  };
}
