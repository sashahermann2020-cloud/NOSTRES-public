import type { Action, Answers, Fact, Method, Plan, Question, Step } from "./route-model.ts";
import { currentLocale } from "../../i18n/store.ts";

/** Метка для i18n-extract: тексты, которые видны только на части языков, при обходе маршрута на русском не встречаются. */
const tr = (text: string): string => text;

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

/** Официальные страницы маршрута «нотариус в Берлине» (сверены 12 ноября 2026 года). */
export const notaryOfficial = {
  costs: "https://www.notarkammer-berlin.de/notariat/kosten",
  faq: "https://www.notarkammer-berlin.de/kammer/faq",
  search: "https://www.notar.de/notare?chamber=7&cHash=8ac6b1264a9acf45553608fd5735bc19",
  /** Поиск Bundesnotarkammer по нотариусам Берлина (chamber=7) с фильтром языка; проверено в браузере 12.11.2026. */
  searchRu: "https://www.notar.de/notare?chamber=7&language=RU&name=",
  searchEn: "https://www.notar.de/notare?chamber=7&language=EN&name=",
  searchEs: "https://www.notar.de/notare?chamber=7&language=ES&name=",
  searchIt: "https://www.notar.de/notare?chamber=7&language=IT&name=",
  searchTr: "https://www.notar.de/notare?chamber=7&language=TR&name=",
  searchPt: "https://www.notar.de/notare?chamber=7&language=PT&name=",
  searchFr: "https://www.notar.de/notare?chamber=7&language=FR&name=",
  costsFederal: "https://www.notar.de/themen/notarkosten",
  examples: "https://www.notar.de/themen/notarkosten/beispiele",
  minValue: "https://www.gesetze-im-internet.de/gnotkg/__107.html",
  musterValue: "https://www.gesetze-im-internet.de/gnotkg/__105.html",
  gmbhPortal: "https://gmbh-gruenden.notar.de/",
  register: "https://service.berlin.de/dienstleistung/327425/",
};
const o = notaryOfficial;

export const notaryQuestions = [
  q("need", "Для чего вам нужен нотариус?", [["company", "Учредить GmbH или UG"], ["property", "Купить или продать квартиру, дом или участок"], ["family", "Признать отцовство или оформить совместную опеку"], ["other", "Другое дело: например доверенность или договор"]]),
  q("form", "Как будет устроена компания?", [["muster", "Один учредитель, договор по Musterprotokoll (готовому образцу)"], ["multi", "Несколько учредителей и свой договор, капитал 25 000 €"], ["other", "Другой вариант"]]),
  q("mode", "Как вам удобнее заверить договор?", [["office", "Лично в нотариате"], ["video", "По видеосвязи"]]),
] as const;

export function notaryVisible(a: Answers): readonly Question[] {
  const [need, form, mode] = notaryQuestions;
  return a.need === "company" ? [need, form, mode] : [need];
}

const lawStep = step(
  "Знайте, что цена одинакова у всех нотариусов",
  "Стоимость услуг нотариуса установлена законом Gerichts- und Notarkostengesetz (GNotKG) и одинакова по всей Германии. Нотариус обязан брать ровно положенное по закону: не больше и не меньше. Консультация и подготовка проекта документа входят в плату за заверение. Плата зависит от стоимости дела (Geschäftswert).",
  "Выбор",
  act("Notarkammer Berlin: стоимость по закону", o.costs),
  act("Bundesnotarkammer: Notarkosten", o.costsFederal),
);
/** Ссылка поиска с фильтром языка страницы. Для немецкого фильтр не нужен, для арабского фильтра в поиске палаты нет. */
const languageSearch: Record<string, string> = { ru: o.searchRu, en: o.searchEn, es: o.searchEs, it: o.searchIt, tr: o.searchTr, pt: o.searchPt, fr: o.searchFr };

function searchStep(): Step {
  const locale = currentLocale();
  const filtered = languageSearch[locale];
  const all = act("Bundesnotarkammer: все нотариусы Берлина", o.search);
  if (filtered) return step(
    "Найдите нотариуса, который говорит на вашем языке",
    "Ссылка открывает поиск палаты нотариусов уже с фильтром по языку этой страницы: в списке только нотариусы Берлина, которые указали этот язык. Нотариусы Берлина обязаны консультировать и заверять для любого обратившегося.",
    "Онлайн",
    act("Нотариусы Берлина, говорящие на вашем языке", filtered),
    act("Notarkammer Berlin: частые вопросы", o.faq),
    all,
  );
  return step(
    tr("Найдите нотариуса"),
    locale === "ar"
      ? tr("В поиске палаты нотариусов нельзя выбрать арабский язык: откройте общий список нотариусов Берлина или список нотариусов, которые говорят по-английски. Нотариусы Берлина обязаны консультировать и заверять для любого обратившегося.")
      : tr("Notarkammer Berlin (палата нотариусов) ведёт поиск нотариусов через портал Bundesnotarkammer. Нотариусы Берлина обязаны консультировать и заверять для любого обратившегося."),
    "Онлайн",
    all,
    act("Notarkammer Berlin: частые вопросы", o.faq),
    locale === "ar" ? act(tr("Нотариусы Берлина, говорящие по-английски"), o.searchEn) : undefined,
  );
}

export function notaryPlan(a: Answers): Plan {
  const note = "Это общая информация, а не юридическая консультация. Условия взяты с официальных страниц Notarkammer Berlin, Bundesnotarkammer (notar.de) и закона GNotKG.";
  const need = a.need ?? "other";
  if (need !== "company") {
    const steps = [
      searchStep(),
      need === "family"
        ? step("Узнайте цену заранее", "Признание отцовства у нотариуса бесплатно. Заявление о совместной опеке стоит около 60 € плюс НДС.", "Выбор", act("Notarkammer Berlin: частые вопросы", o.faq))
        : lawStep,
      step(need === "property" ? "Договор купли-продажи заверяет нотариус" : "Договоритесь о встрече", need === "property" ? "Договоры купли-продажи недвижимости в Берлине заверяют нотариусы. Плата зависит от цены сделки и одинакова у всех нотариусов." : "Назовите нотариату дело, которое нужно оформить: он подготовит проект документа и назначит встречу. Консультация входит в плату за заверение.", "Лично", act("Notarkammer Berlin: чем занимаются нотариусы", o.faq), act("Bundesnotarkammer: Notarkosten", o.costsFederal)),
    ];
    return {
      fit: "fits",
      why: [{ property: "Сделка с недвижимостью", family: "Отцовство или совместная опека", other: "Другое нотариальное дело" }[need as "property" | "family" | "other"]],
      title: need === "property" ? "Нотариус для сделки с недвижимостью" : need === "family" ? "Нотариус для признания отцовства или опеки" : "Нотариус в Берлине: как найти и сколько стоит",
      summary: "Найдите нотариуса через поиск палаты. Цена установлена законом и одинакова у всех нотариусов.",
      steps,
      singleMethodNote: "Нотариуса выбираете сами: порядок один.",
      note,
      next: act("Маршрут: GmbH или UG", "/berlin/gmbh-ug"),
    };
  }

  const form = a.form ?? "other";
  const video = a.mode === "video";
  const costText = form === "muster"
    ? "По примеру Bundesnotarkammer учреждение UG одним учредителем по Musterprotokoll стоит 105 € без НДС и расходов: 60 € за заверение, 30 € за заявку в Handelsregister и 15 € за электронную передачу данных. Для Musterprotokoll минимальная стоимость дела 30 000 € не действует, поэтому плата ниже."
    : form === "multi"
      ? "По примеру Bundesnotarkammer GmbH нескольких учредителей с капиталом 25 000 € и своим договором стоит 630 € без НДС и расходов: 384 € за заверение договора и назначение директора, 96 € за оформление, 62,50 € за заявку в Handelsregister, 25 € за электронную передачу данных и 62,50 € за сопровождение. Для своего договора стоимость дела берётся не меньше 30 000 €."
      : "По закону стоимость дела для договора об учреждении берётся не меньше 30 000 € и не больше 10 млн €; для Musterprotokoll этот минимум не действует. Примеры Bundesnotarkammer: от 105 € для UG одного учредителя по Musterprotokoll до 630 € для GmbH нескольких учредителей со своим договором, без НДС и расходов.";
  const facts: Fact[] = [
    { label: "Нотариус", value: form === "muster" ? "105 € без НДС и расходов (пример Bundesnotarkammer)" : form === "multi" ? "630 € без НДС и расходов (пример Bundesnotarkammer)" : "от 105 € до 630 € без НДС и расходов (примеры Bundesnotarkammer)", kind: "official" },
    ...(video ? [{ label: "Видеосвязь", value: "дополнительно 25 € за заверение по видео", kind: "official" as const }] : []),
    { label: "НДС и расходы", value: "плюс 19% НДС и расходы, например 4,50 € за электронный архив документов", kind: "official" },
    { label: "Суд (Handelsregister)", value: "отдельно: 150 €, с вкладом имуществом 240 €, плюс треть этой суммы", kind: "official" },
    { label: "Срок записи в реестр", value: "на странице суда не указан", kind: "none" },
  ];
  const steps: Step[] = [
    lawStep,
    step("Посчитайте плату нотариуса", costText, "Выбор", act("Bundesnotarkammer: примеры для GmbH и UG", o.examples), act(form === "muster" ? "Закон: Musterprotokoll без минимума (§ 105 Abs. 6 GNotKG)" : "Закон: минимум 30 000 € (§ 107 GNotKG)", form === "muster" ? o.musterValue : o.minValue)),
    searchStep(),
    ...(video ? [step("Подготовьтесь к заверению по видео", "Учредить GmbH онлайн можно через портал Bundesnotarkammer. Нужны удостоверение с включённой онлайн-функцией (eID) и PIN, компьютер или iPad и совместимый смартфон. Документ подписывают квалифицированной электронной подписью. За заверение по видео добавляется 25 €.", "Онлайн", act("Bundesnotarkammer: учреждение GmbH онлайн", o.gmbhPortal), act("Bundesnotarkammer: расходы при видео", o.examples))] : []),
    step("Оплачивайте только официальные счета", "За запись в Handelsregister приходит официальный счёт, обычно от Amtsgericht (суда). Частные справочники присылают похожие счета: их платить не нужно. Сбор суда в Берлине: 150 €, с вкладом имуществом 240 €, плюс треть этой суммы; срок записи на странице суда не указан.", "Ожидание", act("Bundesnotarkammer: о счетах после учреждения", o.gmbhPortal), act("Берлин: сбор Handelsregister", o.register)),
  ];
  const methods: Method[] = [{
    id: video ? "video" : "office", kind: video ? "online" : "in-person", title: video ? "Нотариус по видеосвязи" : "Нотариус в нотариате",
    summary: video ? "Договор заверяют онлайн через портал Bundesnotarkammer." : "Вы приходите к нотариусу, которого выбрали сами.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: video ? ["Удостоверение с онлайн-функцией (eID) и PIN", "Компьютер или iPad и совместимый смартфон"] : ["Действующий документ, удостоверяющий личность"],
    documents: ["Документ, удостоверяющий личность, каждого учредителя", form === "muster" ? "Данные для Musterprotokoll" : "Проект договора об учреждении"],
    facts, steps,
  }];
  return {
    fit: "fits",
    why: ["Учреждение GmbH или UG", form === "muster" ? "Один учредитель, Musterprotokoll" : form === "multi" ? "Несколько учредителей, свой договор" : "Другой вариант", video ? "По видеосвязи" : "Лично в нотариате"],
    title: "Нотариус для GmbH или UG: сколько стоит и как заверить",
    summary: "Плата нотариуса установлена законом и одинакова у всех нотариусов. Ниже расчёт по примерам Bundesnotarkammer; сбор суда за Handelsregister платится отдельно.",
    methods,
    steps,
    singleMethodNote: "Способ заверения вы выбрали в ответах.",
    note,
    next: act("Маршрут: GmbH или UG", "/berlin/gmbh-ug"),
  };
}
