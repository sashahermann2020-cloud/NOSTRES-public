import type { Action, Answers, Fact, Method, Plan, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

/** Официальные страницы маршрута «Niederlassungserlaubnis» (услуги LEA Berlin, сверены 12 ноября 2026 года). */
export const settlementOfficial = {
  general: "https://service.berlin.de/dienstleistung/121864/en/",
  skilled: "https://service.berlin.de/dienstleistung/326558/en/",
  blue: "https://service.berlin.de/dienstleistung/326556/en/",
  german: "https://service.berlin.de/dienstleistung/327012/en/",
  protection: "https://service.berlin.de/dienstleistung/326554/en/",
  euLong: "https://service.berlin.de/dienstleistung/324281/en/",
  law18c: "https://www.gesetze-im-internet.de/aufenthg_2004/__18c.html",
};
const o = settlementOfficial;

type Basis = "skilled" | "blue" | "german" | "other" | "protection";

export const settlementQuestions = [
  q("basis", "На каком основании у вас сейчас вид на жительство?", [["skilled", "Работа специалистом (§ 18a, § 18b, § 18d или § 18g)"], ["blue", "Blue Card (Blaue Karte EU)"], ["german", "Я супруг(а), ребёнок или родитель гражданина Германии"], ["other", "Другое основание: работа, семья, самостоятельная деятельность"], ["protection", "Признанный беженец или право на убежище (решение BAMF)"]]),
  q("skilledTime", "Сколько вы живёте с этим видом на жительство?", [["y3", "3 года или больше"], ["y2", "От 2 лет, и я окончил(а) учёбу или Ausbildung в Германии"], ["less", "Меньше"]]),
  q("blueTime", "Сколько месяцев вы работаете по Blue Card?", [["m27", "27 месяцев или больше"], ["m21", "От 21 до 27 месяцев"], ["less", "Меньше 21 месяца"]]),
  q("germanTime", "Сколько лет у вас вид на жительство как у члена семьи гражданина Германии?", [["y3", "3 года или больше, семья всё это время вместе"], ["less", "Меньше 3 лет"]]),
  q("otherTime", "Сколько лет вы законно живёте в Германии с видом на жительство?", [["y5", "5 лет или больше"], ["less", "Меньше 5 лет"]]),
  q("protectionTime", "Сколько лет у вас вид на жительство после признания?", [["y5", "5 лет или больше"], ["y3", "От 3 до 5 лет"], ["less", "Меньше 3 лет"]]),
  q("language", "Какой уровень немецкого подтверждён сертификатом?", [["c1", "C1 или выше"], ["b1", "B1 или B2"], ["a", "A1 или A2"], ["none", "Сертификата пока нет"]]),
  q("before2013", "Был ли у вас вид на жительство как у члена семьи гражданина Германии до 6 сентября 2013 года?", [["yes", "Да"], ["no", "Нет"]]),
] as const;

const timeQuestion: Record<Basis, string> = { skilled: "skilledTime", blue: "blueTime", german: "germanTime", other: "otherTime", protection: "protectionTime" };

export function settlementVisible(a: Answers): readonly Question[] {
  const byId = Object.fromEntries(settlementQuestions.map((item) => [item.id, item]));
  const list: Question[] = [byId.basis];
  const basis = a.basis as Basis | undefined;
  if (!basis) return list;
  const timeId = timeQuestion[basis];
  list.push(byId[timeId]);
  if (!a[timeId] || a[timeId] === "less") return list;
  list.push(byId.language);
  if (basis === "german" && a.language === "a") list.push(byId.before2013);
  return list;
}

const level: Record<string, number> = { none: 0, a: 1, b1: 2, c1: 3 };

export function settlementPlan(a: Answers): Plan {
  const basis = (a.basis ?? "other") as Basis;
  const time = a[timeQuestion[basis]] ?? "less";
  const lang = level[a.language ?? "none"];
  const service = { skilled: o.skilled, blue: o.blue, german: o.german, other: o.general, protection: o.protection }[basis];
  const serviceLabel = {
    skilled: "LEA Berlin: Niederlassungserlaubnis для специалистов",
    blue: "LEA Berlin: Niederlassungserlaubnis с Blue Card",
    german: "LEA Berlin: Niederlassungserlaubnis для семьи граждан Германии",
    other: "LEA Berlin: Niederlassungserlaubnis, общие условия",
    protection: "LEA Berlin: Niederlassungserlaubnis для признанных беженцев",
  }[basis];
  const svc = act(serviceLabel, service);
  const note = "Это общая информация, а не юридическая консультация. Решение принимает LEA (Landesamt für Einwanderung, берлинское ведомство по делам иностранцев). Условия взяты с официальных страниц услуг LEA и закона о пребывании.";
  const why: string[] = [{
    skilled: "Вид на жительство специалиста", blue: "Blue Card", german: "Член семьи гражданина Германии", other: "Другое основание пребывания", protection: "Признанный беженец или право на убежище",
  }[basis]];

  const needLevel = basis === "protection" ? (time === "y3" ? 3 : 1)
    : basis === "blue" ? (time === "m27" ? 1 : 2)
      : basis === "german" ? (a.before2013 === "yes" ? 1 : 2)
        : 2;
  const needName = ["", needLevel === 1 && basis === "protection" ? "A2" : "A1", "B1", "C1"][needLevel];

  const timeRule = {
    skilled: "3 года с видом на жительство специалиста (§ 18a, § 18b, § 18d или § 18g); 2 года, если вы окончили учёбу или Ausbildung в Германии. Работать специалистом нужно и дальше",
    blue: "не меньше 27 месяцев работы по Blue Card при немецком A1 или не меньше 21 месяца при немецком B1; эту работу нужно продолжать",
    german: "3 года с видом на жительство как у члена семьи гражданина Германии; семья всё это время живёт вместе и остаётся вместе",
    other: "5 лет законного пребывания с видом на жительство, возраст от 18 лет",
    protection: "5 лет после признания при немецком A2 или 3 года при немецком C1",
  }[basis];

  if (time === "less") return {
    fit: "insufficient",
    why: [...why, "Нужный срок пребывания ещё не набран"],
    title: "Срок для Niederlassungserlaubnis ещё не набран",
    summary: `Для вашего основания нужно: ${timeRule}. Пока срок не набран, продлевайте нынешний вид на жительство вовремя.`,
    steps: [
      step("Продлите нынешний вид на жительство", "Подайте заявление на продление до окончания срока документа. Маршрут ВНЖ покажет нужную услугу LEA и порядок подачи.", "Онлайн", act("Маршрут: вид на жительство (LEA)", "/berlin/aufenthalt"), svc),
      step(basis === "protection" ? "Готовьте немецкий заранее" : "Готовьте немецкий и документы заранее", `К заявлению понадобится сертификат немецкого: ${basis === "protection" ? "A2 для пути через 5 лет или C1 для пути через 3 года" : basis === "blue" ? "A1 для пути через 27 месяцев или B1 для пути через 21 месяц" : basis === "german" ? "B1, а при виде на жительство до 6 сентября 2013 года — A1" : "B1"}. Курс и экзамен можно подобрать в маршруте интеграционного курса.`, "Выбор", act("Маршрут: Integrationskurs (интеграционный курс)", "/berlin/integrationskurs"), svc),
    ],
    note,
    next: act("Маршрут: вид на жительство (LEA)", "/berlin/aufenthalt"),
  };

  if (lang < needLevel) return {
    fit: "insufficient",
    why: [...why, `Нужен сертификат немецкого ${needName}`],
    title: `Сначала получите сертификат немецкого ${needName}`,
    summary: `Срок пребывания набран, но для Niederlassungserlaubnis по вашему основанию нужен немецкий ${needName} с сертификатом.${basis === "blue" && time === "m21" ? " Если вы проработаете по Blue Card 27 месяцев, хватит A1." : ""}${basis === "protection" && time === "y3" ? " Через 5 лет после признания хватит A2." : ""}`,
    steps: [
      step(`Сдайте экзамен на ${needName}`, "Подходят сертификат интеграционного курса, Deutsch-Test für Zuwanderer или другой признанный сертификат нужного уровня. Курс и экзамен можно подобрать в маршрутах интеграционного и языкового курса.", "Выбор", act("Маршрут: Integrationskurs (интеграционный курс)", "/berlin/integrationskurs"), svc, act("Маршрут: языковые курсы", "/berlin/sprachkurs")),
      step("Продлевайте нынешний вид на жительство", "Пока сертификата нет, не допускайте окончания срока нынешнего документа.", "Онлайн", act("Маршрут: вид на жительство (LEA)", "/berlin/aufenthalt"), svc),
    ],
    note,
    next: act("Маршрут: Integrationskurs (интеграционный курс)", "/berlin/integrationskurs"),
  };

  const common = "Жизнь обеспечена собственным доходом без Bürgergeld и Sozialhilfe; немецкая государственная или сопоставимая частная медицинская страховка (иностранная не подходит); достаточная жилая площадь для семьи; основное место жительства в Берлине.";
  const orientation = "Нужны основы знаний о правовом и общественном устройстве Германии: их подтверждают интеграционный или ориентационный курс, тест «Leben in Deutschland» или тест на гражданство, немецкий школьный или профессиональный диплом, не меньше года учёбы или Ausbildung в Германии.";
  const conditions = {
    skilled: `Не меньше 36 месяцев взносов в государственную пенсионную страховку, 24 месяца при учёбе или Ausbildung в Германии. Немецкий B1. ${orientation} ${common}`,
    blue: `Взносы в пенсионную страховку за всё время работы по Blue Card. ${orientation} ${common}`,
    german: "Немецкий B1, при виде на жительство до 6 сентября 2013 года — A1. Жизнь обеспечена собственным доходом без Bürgergeld и Sozialhilfe (исключение — постоянная болезнь с медицинской справкой); медицинская страховка и страховка по уходу для вас и семьи; основное место жительства в Берлине.",
    other: `Не меньше 60 месяцев взносов в государственную или сопоставимую частную пенсионную страховку (исключения: возраст 67 лет, болезнь, учёба). Немецкий B1. ${orientation} ${common}`,
    protection: time === "y3"
      ? "Решение BAMF о признании; немецкий C1; пособия составляют меньше 25% всего дохода."
      : "Решение BAMF о признании; немецкий A2; пособия составляют меньше 50% всего дохода, в 67 лет это условие не действует.",
  }[basis];
  const fee = basis === "protection" ? "на странице услуги сбор не указан"
    : basis === "skilled" ? "56,50 € за рассмотрение и 56,50 € за выдачу; с высшим образованием как высококвалифицированный специалист — 73,50 € и 73,50 €"
      : "56,50 € за рассмотрение и 56,50 € за выдачу";
  const documents = [
    "Паспорт и нынешний вид на жительство",
    ...(basis === "german" ? ["Свидетельство о браке или о рождении ребёнка и документ члена семьи с гражданством Германии"] : []),
    ...(basis === "protection" ? ["Решение BAMF о признании"] : basis === "german" ? ["Подтверждение дохода"] : ["Подтверждение работы: договор, расчётные листы за 6 месяцев и справка работодателя не старше 14 дней"]),
    ...(basis === "protection" ? [] : ["Подтверждение медицинской страховки", "Подтверждение жилья: договор аренды с тёплой арендной платой (Warmmiete) или выписка из земельной книги"]),
    ...(basis === "german" || basis === "protection" ? [] : ["Выписка о пенсионных взносах"]),
    `Сертификат немецкого ${needName}`,
    ...(basis === "skilled" || basis === "blue" || basis === "other" ? ["Подтверждение знаний об устройстве Германии"] : []),
  ];
  const facts: Fact[] = [
    { label: "Срок пребывания", value: timeRule, kind: "official" },
    { label: "Сбор", value: basis === "protection" ? fee : `${fee}; для граждан Турции 13,80 € до 24 лет и 23,00 € с 24 лет за каждую часть`, kind: basis === "protection" ? "none" : "official" },
    { label: "Когда выдают документ", value: "не раньше чем через 4 недели после приёма в LEA", kind: "official" },
  ];
  const steps = [
    step("Проверьте условия", `${timeRule[0].toUpperCase()}${timeRule.slice(1)}. ${conditions}${basis === "protection" ? "" : " Даже штраф по приговору может помешать выдаче, а открытое расследование останавливает рассмотрение."}`, "Выбор", svc, basis === "blue" || basis === "skilled" ? act("Закон: § 18c AufenthG", o.law18c) : svc),
    step("Соберите документы", "Файлы загружаются в онлайн-форму: список ниже, полный список — на странице услуги. Оригиналы понадобятся на приёме.", "Выбор", svc),
    step("Пройдите Quick-Check и подайте заявление онлайн", `Заявление подаётся только онлайн: сначала короткая проверка Quick-Check на странице услуги, затем форма с файлами.${basis === "protection" ? "" : " Плата за рассмотрение вносится картой или через PayPal до отправки."}${basis === "other" ? " Она не возвращается, если рассмотрение уже началось." : ""} После отправки придёт подтверждение в PDF.`, "Онлайн", svc),
    step("Придите на приём в LEA", "Если проверка заявления прошла успешно, LEA пригласит вас на приём по адресу Friedrich-Krause-Ufer 24, 13353 Berlin. Возьмите оригиналы документов. Документ выдают не раньше чем через 4 недели после приёма.", "Лично", svc),
    ...(basis === "other" ? [step("Сравните с Daueraufenthalt-EU", "Erlaubnis zum Daueraufenthalt-EU (долгосрочное пребывание в ЕС) требует похожего: 5 лет законного пребывания, обычно 60 месяцев пенсионных взносов, немецкий B1. Сбор 54,50 € за рассмотрение и 54,50 € за выдачу. Она не подходит, если вид на жительство выдан для учёбы, обучения или другой временной цели.", "Выбор", act("LEA Berlin: Erlaubnis zum Daueraufenthalt-EU", o.euLong))] : []),
  ];
  const methods: Method[] = [{
    id: "online-lea", kind: "combined", title: "Онлайн-заявление и приём в LEA", summary: "Заявление и файлы — онлайн, затем приём в LEA с оригиналами.", availability: "available", availabilityLabel: "Доступно",
    conditions: ["Quick-Check на странице услуги", ...(basis === "protection" ? [] : ["Оплата картой или через PayPal"])], documents, facts, steps,
  }];
  return {
    fit: "fits",
    why: [...why, "Срок пребывания набран", `Немецкий ${needName} или выше подтверждён`],
    title: basis === "protection" && time === "y3" ? "Niederlassungserlaubnis через 3 года после признания" : "Можно подавать на Niederlassungserlaubnis",
    summary: "Niederlassungserlaubnis — бессрочный вид на жительство. Проверьте остальные условия, соберите документы, подайте заявление онлайн и придите на приём в LEA.",
    methods,
    steps,
    singleMethodNote: "LEA принимает заявление только онлайн, затем приглашает на приём: способ один.",
    note,
    next: act("Маршрут: Einbürgerung (гражданство)", "/berlin/einbuergerung"),
  };
}
