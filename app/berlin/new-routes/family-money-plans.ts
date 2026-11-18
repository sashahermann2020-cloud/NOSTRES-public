import type { Action, Answers, Fact, Method, Plan, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

export const moneyOfficial = {
  elterngeld: "https://service.berlin.de/dienstleistung/326079/",
  elterngeldDigital: "https://elterngeld-digital.de/",
  elterngeldWho: "https://familienportal.de/familienportal/familienleistungen/elterngeld/familiensituation",
  beeg: "https://www.gesetze-im-internet.de/beeg/__1.html",
  kiz: "https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag-verstehen/kinderzuschlag-anspruch-hoehe-dauer",
  kizApply: "https://web.arbeitsagentur.de/kiz/ui/start",
  taxDuty: "https://service.berlin.de/dienstleistung/325687/",
  taxVoluntary: "https://service.berlin.de/dienstleistung/325685/",
  elster: "https://www.elster.de/",
  elsterApp: "https://www.berlin.de/sen/finanzen/presse/pressemitteilungen/pressemitteilung.1646731.php",
};
const m = moneyOfficial;

// ---------------------------------------------------------------------------
// Elterngeld
// ---------------------------------------------------------------------------
export const elterngeldQuestions = [
  q("timing", "На каком вы этапе?", [["pregnant", "Ребёнок ещё не родился, готовлюсь заранее"], ["born", "Ребёнок родился, нужно подать заявление"], ["change", "Заявление уже подано, нужно что-то изменить"]]),
  q("citizen", "Какое у вас гражданство?", [["eu", "Страна ЕС, ЕЭЗ или Швейцария"], ["noneu", "Другая страна"]]),
  q("permit", "Какой у вас документ на пребывание?", [
    ["permanent", "Niederlassungserlaubnis или Erlaubnis zum Daueraufenthalt-EU"],
    ["work", "Blaue Karte EU, ICT-Karte или Aufenthaltserlaubnis, который разрешает или разрешал работать не меньше 6 месяцев"],
    ["war", "Aufenthaltserlaubnis по гуманитарным основаниям (§ 23, § 23a, § 25 Absatz 3–5 AufenthG)"],
    ["other", "Aufenthaltserlaubnis с целью учёбы, обучения, au-pair, поиска работы или признания квалификации"],
    ["duldung", "Aufenthaltsgestattung или Duldung"],
  ]),
  q("birth", "Когда родился ребёнок?", [["new", "1 апреля 2025 года или позже"], ["mid", "С 1 апреля 2024 года по 31 марта 2025 года"], ["old", "До 1 апреля 2024 года"]]),
  q("income", "Каков ваш доход до рождения?", [["employee", "Работа по найму"], ["self", "Самозанятость или своё дело"], ["none", "Дохода не было"]]),
  q("taxbill", "Есть ли налоговое решение (Einkommensteuerbescheid) за последний завершённый год до года рождения?", [["yes", "Да, решение уже есть"], ["no", "Нет, его ещё нет"]]),
  q("during", "Будете ли вы работать самозанятым во время получения Elterngeld?", [["no", "Нет, работать не буду"], ["yes", "Да, продолжу или начну"]]),
] as const;

export function elterngeldVisible(a: Answers): readonly Question[] {
  const [timing, citizen, permit, birth, income, taxbill, during] = elterngeldQuestions;
  const base = a.citizen === "noneu" ? [timing, citizen, permit] : [timing, citizen];
  if (a.timing === "born" || a.timing === "change") return [...base, birth, ...(a.timing === "born" ? [income, ...(a.income === "self" ? [taxbill, during] : [])] : [])];
  return base;
}

function elterngeldDocs(a: Answers): string[] {
  const incomeDocs = a.income === "self" ? [
    a.taxbill === "yes" ? "Einkommensteuerbescheid за последний завершённый налоговый год до года рождения: по нему считают доход" : "Einnahmen-Überschuss-Rechnung (EÜR), Bilanz или решение налоговой за прошлый год: пока нет решения за нужный год, Elterngeld платят предварительно",
    ...(a.during === "yes" ? ["Прогноз ожидаемого дохода за время получения Elterngeld"] : []),
  ] : a.income === "none" ? ["Заявление о доходе: у вас до рождения его не было"] : ["Расчётные листки за 12 месяцев до рождения; при Mutterschaftsgeld листки за месяцы до начала защиты материнства"];
  return [
    `Форма заявления для вашей даты рождения: ${a.birth === "new" ? "ребёнок родился 1 апреля 2025 года или позже" : a.birth === "mid" ? "ребёнок родился с 1 апреля 2024 года по 31 марта 2025 года" : "ребёнок родился до 1 апреля 2024 года"}`,
    "Паспорта или удостоверения обоих родителей и свежая Meldebescheinigung каждого",
    "Свидетельство о рождении ребёнка в оригинале",
    "Заявление о доходе каждого родителя",
    ...incomeDocs,
    "Справка страховой кассы: получали ли вы Mutterschaftsgeld и сколько",
    "Подтверждение работодателя о доплате к Mutterschaftsgeld, если она была",
    ...(a.income === "employee" ? ["Договорённость с работодателем об Elternzeit"] : []),
    ...(a.citizen === "noneu" ? ["Aufenthaltstitel (документ на пребывание)"] : []),
  ];
}

export function elterngeldPlan(a: Answers): Plan {
  const main = act("Берлин: Elterngeld", m.elterngeld);
  const who = act("Familienportal: кто получает Elterngeld", m.elterngeldWho);
  const law = act("Закон BEEG, § 1", m.beeg);
  const digital = act("Elterngeld Digital: помощник заявления", m.elterngeldDigital);
  const noneu = a.citizen === "noneu";
  if (noneu && a.permit === "duldung") return {
    fit: "redirect",
    why: ["Гражданство не ЕС", "Aufenthaltsgestattung или Duldung"],
    title: "Elterngeld по этому документу сейчас недоступен",
    summary: "По Familienportal и закону BEEG Elterngeld не получают при Aufenthaltsgestattung и обычной Duldung. Исключение составляет Beschäftigungsduldung (разрешение на пребывание при трудоустройстве). Если ваш статус изменится, вернитесь к заявлению: оно возможно со дня рождения, выплата за прошлое не больше чем за три месяца.",
    steps: [step("Проверьте возможность смены статуса", "Статус меняют через ведомство по делам иностранцев. Маршрут показывает, как подать или продлить документ.", "Онлайн", act("Маршрут: вид на жительство", "/berlin/aufenthalt"), law)],
    next: act("Маршрут: Kindergeld", "/berlin/kindergeld"),
  };
  const conditionalStatus = noneu && (a.permit === "war" || a.permit === "other");
  const fitText = noneu ? a.permit === "permanent" ? "Постоянное пребывание (Niederlassungserlaubnis или Daueraufenthalt-EU)" : a.permit === "work" ? "Aufenthaltserlaubnis с правом работать" : a.permit === "war" ? "Гуманитарное основание: нужны ещё работа, Elternzeit или SGB III, либо 15 месяцев пребывания" : "Aufenthaltserlaubnis с целью учёбы, поиска работы или обучения: условия по § 1 Absatz 7 BEEG строгие" : "Гражданство ЕС, ЕЭЗ или Швейцарии";
  const selfFacts: Fact[] = a.income === "self" ? [
    { label: "Какой доход считают самозанятым", value: "средняя месячная прибыль за последний завершённый налоговый год до рождения; прибыль от свободной профессии, торговли и сельского хозяйства складывают, убыток в одном виде не вычитается из другого и считается нулём", kind: "official" },
    ...(a.during === "yes" ? [{ label: "Работа во время получения", value: "до 32 часов в неделю; фактический доход доказывают после периода, 25% дохода вычитают как расходы", kind: "official" } as Fact] : []),
    { label: "Очень маленький доход самозанятого", value: "по заявлению его не учитывают, если в среднем меньше 35 € в месяц и в году рождения, и в году до него: тогда считают как работающего по найму", kind: "official" },
  ] : [];
  const facts: Fact[] = [
    ...selfFacts,
    { label: "Размер Basiselterngeld", value: "от 300 до 1800 € в месяц в зависимости от прежнего дохода", kind: "official" },
    { label: "ElterngeldPlus", value: "половина суммы Basiselterngeld, если дохода после рождения нет; выплачивается вдвое дольше", kind: "official" },
    { label: "Срок", value: "12 месяцев, плюс 2, если доход одного из родителей после рождения падает; брать можно только в первые 14 месяцев жизни ребёнка", kind: "official" },
    { label: "Выплата за прошлое", value: "не больше чем за три месяца до даты заявления", kind: "official" },
    { label: "Предел дохода обоих родителей до рождения", value: a.birth === "new" ? "175 000 € для детей, рождённых с 1 апреля 2025 года" : a.birth === "mid" ? "200 000 € для детей, рождённых с 1 апреля 2024 года" : a.birth === "old" ? "для детей, рождённых до 1 апреля 2024 года, предел указан в форме для вашей даты рождения; на странице Берлина названа прежняя цифра 300 000 € без даты" : "175 000 € с 1 апреля 2025 года, 200 000 € с 1 апреля 2024 года", kind: "official" },
    { label: "Работа во время получения", value: "не больше 32 часов в неделю", kind: "official" },
  ];
  if (a.timing === "pregnant") return {
    fit: conditionalStatus ? "conditional" : "fits",
    why: ["Ребёнок ещё не родился", fitText],
    title: "Подготовьтесь к Elterngeld до рождения",
    summary: "Заявление можно подать со дня рождения. Выплата за прошлое возможна не больше чем за три месяца до заявления, поэтому после родов не откладывайте. Ответственна Elterngeldstelle Jugendamt вашего района проживания.",
    steps: [
      step("Проверьте право и сумму", "Familienportal описывает, кто получает Elterngeld: при незамужней паре отцовство должно быть признано или установлено, одиноким родителям положены Partnermonate и бонус.", "Онлайн", who, main),
      step("Договоритесь об Elternzeit с работодателем", "Работающим по найму нужна договорённость с работодателем о родительском отпуске. Без неё Elterngeldstelle не примет заявление полностью.", "Выбор", main),
      step("Если вы не в браке, признайте отцовство", "Признание отцовства можно оформить вместе с матерью в Jugendamt ещё до рождения. Для заявления нужно подтверждение.", "Лично", who, main),
      step("Соберите подтверждения дохода", "Расчётные листки за 12 месяцев до рождения. При Mutterschaftsgeld листки за месяцы до защиты материнства. Самозанятым нужны решение налоговой или EÜR.", "Выбор", main),
      step("Получите свидетельство о рождении", "Первые три свидетельства бесплатны для Elterngeld, Kindergeld и медицинского страхования ребёнка.", "Лично", act("Маршрут: рождение ребёнка", "/berlin/kita-schule"), main),
    ],
    next: act("Маршрут: рождение ребёнка", "/berlin/kita-schule"),
    note: "Это общая информация, а не юридическая консультация. Условия взяты со страницы Elterngeldstelle Берлина, Familienportal и закона BEEG.",
  };
  if (a.timing === "change") return {
    fit: "fits",
    why: ["Заявление уже подано", "Нужно изменить период выплаты или реквизиты"],
    title: "Подайте Änderungsantrag auf Elterngeld",
    summary: "Любое изменение после подачи, например периода выплаты или банковских реквизитов, оформляют отдельным заявлением Berliner Änderungsantrag auf Elterngeld. Его подают по почте в вашу Elterngeldstelle.",
    steps: [
      step("Возьмите форму изменения", "Используйте Berliner Änderungsantrag auf Elterngeld. Форму для вашей даты рождения выбирайте так же, как для первоначального заявления.", "Онлайн", main),
      step("Отправьте по почте в Elterngeldstelle", "Заявление подписывают оба родителя, если форма этого требует. Адрес вашей Elterngeldstelle указан на странице услуги: Jugendamt района проживания, телефон (030) 115.", "Выбор", main),
    ],
    note: "Это общая информация, а не юридическая консультация.",
  };
  const docs = elterngeldDocs(a);
  const common = (id: string, title: string, summary: string, avail: "available" | "conditional", label: string, steps: Step[]): Method => ({
    id, kind: "mail", title, summary, availability: avail, availabilityLabel: label,
    conditions: ["Ответственна Elterngeldstelle Jugendamt района проживания", "Онлайн-портал Берлина перестраивается: новые заявления принимают по почте"], documents: docs, facts, steps,
  });
  const selfSteps: Step[] = a.income === "self" ? [
    step(a.taxbill === "yes" ? "Приложите Einkommensteuerbescheid" : "Приложите EÜR или Bilanz", a.taxbill === "yes" ? "Доход считают как среднюю месячную прибыль за последний завершённый налоговый год до рождения. Налоги и взносы вычитают по упрощённой схеме: Steuerklasse IV без коэффициента." : "Пока решения нет, подтвердите доход EÜR или Bilanz: Elterngeld платят предварительно, пока вы не предъявите решение. Доход при EÜR считается по дате получения денег, при Bilanz по дате заработка; Bilanz обязательна для Gewerbe.", "Выбор", who, law),
    ...(a.during === "yes" ? [step("Укажите прогноз дохода и сообщите о работе", "Заявление должно содержать прогноз дохода за период получения. Выплата предварительная: после периода вы доказываете фактический доход EÜR или Bilanz, переплату возвращают, недоплату выплачивают. 25% дохода вычитают как расходы, фактические расходы только по вашей просьбе. О начале работы сообщите Elterngeldstelle сразу.", "Выбор", who, law)] : []),
  ] : [];
  const forDocs = step("Приложите подтверждения сразу", "Страница просит приложить подтверждение Mutterschaftsgeld, оригинал свидетельства о рождении и подтверждение дохода, потому что электронный запрос в Берлине ещё не работает. Иначе их запросят позже.", "Выбор", main);
  const methods = [
    common("assistant-print", "Помощник заявления, затем печать и почта", "Вы заполняете форму цифровым помощником, печатаете, подписываете оба родителя и отправляете почтой.", "conditional", "Нужна Bund-ID", [
      step("Заполните форму в помощнике", "Elterngeld Digital заполняет заявление цифрово, для входа нужна Bund-ID (федеральная учётная запись).", "Онлайн", digital, main),
      step("Распечатайте и подпишите", "Заявление должны подписать оба родителя.", "Выбор", main),
      forDocs,
      ...selfSteps,
      step("Отправьте в Elterngeldstelle почтой", "Адрес Elterngeldstelle вашего района указан на странице услуги.", "Выбор", main),
    ]),
    common("post", "Бумажная форма по почте", "Вы берёте бумажную форму для даты рождения вашего ребёнка, заполняете и отправляете почтой.", "available", "Доступно без Bund-ID", [
      step("Возьмите форму для своей даты рождения", "Формы различаются для рождённых с 1 апреля 2025 года, с 1 апреля 2024 по 31 марта 2025 и до 1 апреля 2024 года.", "Онлайн", main),
      step("Подпишите оба родителя", "Подписанное обоими заявление отправляется почтой.", "Выбор", main),
      forDocs,
      ...selfSteps,
      step("Отправьте в Elterngeldstelle почтой", "Адрес Elterngeldstelle вашего района указан на странице услуги.", "Выбор", main),
    ]),
  ];
  return {
    fit: conditionalStatus ? "conditional" : "fits",
    why: ["Ребёнок родился", fitText, `Доход до рождения: ${a.income === "self" ? "самозанятость" : a.income === "none" ? "дохода не было" : "работа по найму"}`],
    title: "Подайте заявление на Elterngeld в Elterngeldstelle",
    summary: conditionalStatus
      ? "Ваш статус даёт право на Elterngeld только при дополнительных условиях по § 1 Absatz 7 BEEG: Elterngeldstelle проверяет их по заявлению. Заявление подают по почте в Elterngeldstelle Jugendamt вашего района. Выплата за прошлое не больше чем за три месяца до даты заявления."
      : "Заявление подают по почте в Elterngeldstelle Jugendamt вашего района. Выплата за прошлое возможна не больше чем за три месяца до даты заявления.",
    methods,
    steps: methods[0].steps,
    note: "Это общая информация, а не юридическая консультация. Условия взяты со страницы Elterngeldstelle Берлина, Familienportal и закона BEEG.",
    next: act("Маршрут: Kindergeld", "/berlin/kindergeld"),
  };
}

// ---------------------------------------------------------------------------
// Kinderzuschlag
// ---------------------------------------------------------------------------
export const kinderzuschlagQuestions = [
  q("kindergeld", "Получаете ли вы Kindergeld на этого ребёнка?", [["yes", "Да"], ["no", "Нет, ещё не подавал(а) или не имею права"]]),
  q("household", "Какая у вас семья?", [["couple", "Пара с ребёнком"], ["single", "Один родитель"]]),
  q("income", "Каков брутто-доход семьи в месяц?", [["enough", "Не меньше 900 € для пары или 600 € для одного родителя"], ["low", "Меньше этой суммы"]]),
  q("status", "Какой у вас статус?", [["eu", "Гражданин ЕС, ЕЭЗ или Швейцарии"], ["refugee", "Признанный беженец, решение окончательное"], ["other", "Другой статус"]]),
] as const;

export function kinderzuschlagVisible(a: Answers): readonly Question[] {
  const [kindergeld, household, income, status] = kinderzuschlagQuestions;
  if (a.kindergeld === "no") return [kindergeld];
  return [kindergeld, household, income, ...(a.income === "enough" ? [status] : [])];
}

export function kinderzuschlagPlan(a: Answers): Plan {
  const main = act("Bundesagentur: Kinderzuschlag", m.kiz);
  const apply = act("Kinderzuschlag онлайн", m.kizApply);
  if (a.kindergeld === "no") return {
    fit: "redirect",
    why: ["Kindergeld на ребёнка не получаете"],
    title: "Сначала нужен Kindergeld",
    summary: "Kinderzuschlag выплачивают на ребёнка, на которого вы получаете Kindergeld или сопоставимое пособие. Подайте заявление на Kindergeld, затем вернитесь к Kinderzuschlag.",
    steps: [step("Откройте маршрут Kindergeld", "Kindergeld подают онлайн в Familienkasse. Выплата за прошлое возможна не больше чем за 6 месяцев.", "Онлайн", act("Маршрут: Kindergeld", "/berlin/kindergeld"), main)],
    next: act("Маршрут: Kindergeld", "/berlin/kindergeld"),
  };
  const single = a.household === "single";
  if (a.income === "low") return {
    fit: "redirect",
    why: [single ? "Один родитель" : "Пара", `Доход меньше ${single ? "600" : "900"} € в месяц брутто`],
    title: "При таком доходе нужна Grundsicherung",
    summary: `Kinderzuschlag получают семьи, где брутто-доход не меньше ${single ? "600 € для одного родителя" : "900 € для пары"} и вместе с Kinderzuschlag и возможным Wohngeld его хватает на жизнь. При меньшем доходе обращаются в Jobcenter за Grundsicherungsgeld.`,
    steps: [step("Подайте заявление на Grundsicherungsgeld", "Выплату назначает Jobcenter. Маршрут показывает, как подать заявление онлайн или по почте.", "Онлайн", act("Маршрут: Jobcenter и Agentur für Arbeit", "/berlin/jobcenter"), main)],
    next: act("Маршрут: Jobcenter и Agentur für Arbeit", "/berlin/jobcenter"),
  };
  const conditional = a.status === "other";
  const facts: Fact[] = [
    { label: "Размер", value: "до 297 € в месяц на ребёнка, включая Sofortzuschlag; платят вместе с Kindergeld", kind: "official" },
    { label: "Срок выплаты", value: "6 месяцев, затем нужно подать заявление снова", kind: "official" },
    { label: "Выплата за прошлое", value: "не назначается; при задержке обработки доплачивают", kind: "official" },
    { label: "Доход для расчёта", value: "доход за 6 месяцев перед заявлением", kind: "official" },
    { label: "Имущество", value: "учитывается только значительное: порог 55 000 € на двоих, 70 000 € на троих, плюс 15 000 € за каждого следующего ребёнка", kind: "official" },
  ];
  const docs = ["Подтверждение дохода", "Заявление об имуществе", "Подтверждение расходов на жильё"];
  const online: Method = {
    id: "online", kind: "online", title: single ? "Онлайн для одного родителя" : "Онлайн, с Bund-ID без подписи", summary: "Заявление отправляется онлайн в Familienkasse. С Bund-ID подпись не нужна.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Ребёнку меньше 25 лет, он не в браке и живёт в вашем доме", "Вы получаете Kindergeld на этого ребёнка"], documents: docs, facts,
    steps: [
      step("Подготовьте подтверждения", "Доход за последние 6 месяцев, заявление об имуществе, подтверждение расходов на жильё.", "Выбор", main),
      step("Заполните заявление онлайн", "Откройте онлайн-услугу Kinderzuschlag на сайте Bundesagentur für Arbeit.", "Онлайн", apply, main),
      step("Отправьте заявление", "С Bund-ID онлайн-подача без подписи. Без неё документы можно отправить по почте или принести лично.", "Онлайн", apply),
      step("Подайте заново, когда закончится срок", "Kinderzuschlag назначается на 6 месяцев.", "Выбор", main),
    ],
  };
  const post: Method = {
    id: "post", kind: "mail", title: "По почте или лично", summary: "Заявление и подтверждения отправляются почтой в Familienkasse или приносятся лично.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Те же условия, что для онлайн-заявления"], documents: docs, facts,
    steps: [
      step("Возьмите форму заявления", "Формы и Merkblatt размещены на сайте Bundesagentur für Arbeit.", "Онлайн", main),
      step("Отправьте или принесите в Familienkasse", "Приложите подтверждения дохода, имущества и расходов на жильё.", "Лично", main),
    ],
  };
  return {
    fit: conditional ? "conditional" : "fits",
    why: [single ? "Один родитель" : "Пара с ребёнком", "Доход не ниже минимума", a.status === "eu" ? "Гражданин ЕС, ЕЭЗ или Швейцарии" : a.status === "refugee" ? "Признанный беженец с окончательным решением" : "Статус не из перечня на официальной странице"],
    title: "Подайте заявление на Kinderzuschlag в Familienkasse",
    summary: conditional
      ? "Официальная страница называет право у граждан ЕС, ЕЭЗ и Швейцарии и у признанных беженцев с окончательным решением. Для других статусов Familienkasse проверяет право по вашему заявлению. Подайте его онлайн: решение принимает Familienkasse."
      : "Ваш статус и доход подходят под условия Kinderzuschlag. Окончательно право определяет Familienkasse по заявлению: размер зависит от дохода, расходов на жильё, размера семьи и возраста детей.",
    methods: [online, post],
    steps: online.steps,
    note: "Это общая информация, а не юридическая консультация. Если Kinderzuschlag и Wohngeld не хватает, можно получить доплату Grundsicherungsgeld в Jobcenter: Kinderzuschlag при расчёте считается доходом.",
    next: act("Маршрут: Jobcenter и Agentur für Arbeit", "/berlin/jobcenter"),
  };
}

// ---------------------------------------------------------------------------
// Einkommensteuererklärung
// ---------------------------------------------------------------------------
export const taxQuestions = [
  q("kind", "Какой у вас доход?", [["single", "Работа по найму у одного работодателя, другого дохода нет"], ["multi", "Несколько работодателей, налоговая льгота в расчёте зарплаты или другой доход больше 410 €"], ["self", "Свободная профессия или своё дело"]]),
  q("year", "За какой год декларация?", [["recent", "За прошлый год"], ["old", "За более ранний год"]]),
  q("elster", "Есть ли у вас доступ к Mein ELSTER?", [["yes", "Да"], ["no", "Нет"]]),
  q("help", "Кто будет готовить декларацию?", [["own", "Я сам(а)"], ["adviser", "Steuerberater или Lohnsteuerhilfeverein"]]),
] as const;

export function taxVisible(a: Answers): readonly Question[] {
  const [kind, year, elster, help] = taxQuestions;
  if (a.help === "adviser") return [kind, year, help];
  return [kind, year, help, ...(a.kind === "self" || a.help ? [elster] : [])];
}

export function taxPlan(a: Answers): Plan {
  const duty = act("Берлин: декларация по обязанности", m.taxDuty);
  const voluntary = act("Берлин: добровольная декларация", m.taxVoluntary);
  const elsterLink = act("Mein ELSTER", m.elster);
  const self = a.kind === "self";
  const mandatory = a.kind !== "single";
  const main = mandatory ? duty : voluntary;
  const old = a.year === "old";
  const adviser = a.help === "adviser";
  const reg = a.elster === "yes" || adviser ? [] : [step("Зарегистрируйтесь в Mein ELSTER", "Регистрация даёт электронный сертификат и может занять до двух недель, поэтому начните сразу.", "Онлайн", elsterLink, main)];
  const keep = step("Храните документы", "Чеки и подтверждения к декларации обычно не прикладывают: Finanzamt запросит их при необходимости. Храните их до конца срока возражения; подтверждения пожертвований год после решения налоговой.", "Выбор", main);
  const facts: Fact[] = [
    { label: "Срок", value: adviser ? "если декларацию готовит Steuerberater или Lohnsteuerhilfeverein, срок до конца февраля второго года после налогового года; для 2023 года действовал срок 2 июня 2025 года, для 2024 года 30 апреля 2026 года" : mandatory ? "обычно до 31 июля следующего года; продление можно запросить в Finanzamt письменно, по почте, факсу, электронной почте или телефону" : old ? "четыре года, продлить нельзя; декларация за 2022 год подаётся до 31 декабря 2026 года" : "добровольную декларацию можно подать в течение четырёх лет, продлить срок нельзя", kind: "official" },
    { label: "Стоимость", value: "подача бесплатна", kind: "official" },
    { label: "Обработка", value: "в среднем 7–9 недель; окончательную обработку берлинские Finanzämter начинают не раньше середины марта", kind: "official" },
  ];
  const elster: Method = {
    id: "elster", kind: "online", title: "Онлайн в Mein ELSTER", summary: "Вы подаёте декларацию в налоговом портале с электронным сертификатом.",
    availability: a.elster === "yes" || adviser ? "available" : "conditional", availabilityLabel: a.elster === "yes" ? "Доступно" : "Нужна регистрация до двух недель",
    conditions: [self ? "Для свободной профессии и бизнеса подача только электронная: бумажную декларацию считают не поданной" : "Подача возможна онлайн, на бумаге или лично", "Ответственен Finanzamt по месту жительства: в Берлине их 17"],
    documents: ["Steuer-ID", "Данные работодателя: годовая справка о зарплате", "Подтверждения расходов, которые вы заявляете"], facts,
    steps: [...reg, step("Заполните декларацию", "Войдите в Mein ELSTER, выберите форму подоходного налога и внесите данные. Для первого года можно использовать готовые данные, которые Finanzamt уже имеет.", "Онлайн", elsterLink, main), step("Отправьте декларацию", "После отправки Finanzamt вышлет решение в среднем за 7–9 недель.", "Онлайн", elsterLink, main), keep],
  };
  const paper: Method = {
    id: "paper", kind: "mail", title: "На бумаге", summary: "Формы бесплатны в Finanzamt или на сайте федерального министерства финансов.",
    availability: self ? "conditional" : "available", availabilityLabel: self ? "Не подходит свободной профессии и бизнесу" : "Доступно",
    conditions: ["Подача по электронной почте невозможна", "Для свободной профессии и бизнеса бумажная декларация считается не поданной, кроме случаев трудностей"],
    documents: ["Steuer-ID", "Данные работодателя: годовая справка о зарплате"], facts,
    steps: [step("Возьмите форму", "Формы бесплатны в берлинских Finanzämter. Можно отправить запрос с марками для ответного конверта или скачать формы на сайте федерального министерства финансов.", "Лично", main), step("Заполните и отправьте в Finanzamt", "Отправьте почтой или принесите лично в Finanzamt по месту жительства.", "Выбор", main), keep],
  };
  const adv: Method = {
    id: "adviser", kind: "in-person", title: "Через Steuerberater или Lohnsteuerhilfeverein", summary: "Консультант готовит и отправляет декларацию, срок подачи длиннее.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Срок до конца февраля второго года после налогового года"], documents: ["Steuer-ID", "Годовая справка работодателя и подтверждения расходов"], facts,
    steps: [step("Передайте документы консультанту", "Дайте Steuer-ID, справку работодателя и подтверждения расходов.", "Лично", main), keep],
  };
  const methods = adviser ? [adv] : self ? [elster] : [elster, paper];
  return {
    fit: "fits",
    why: [mandatory ? "Подача обязательна" : "Подача добровольна", old ? "Более ранний год" : "Прошлый год", adviser ? "Готовит консультант" : "Готовите сами"],
    title: mandatory ? "Вы обязаны подать декларацию" : old ? "Подайте добровольную декларацию за прошлые годы" : "Подайте добровольную декларацию, чтобы получить возврат",
    summary: mandatory
      ? `Обязанность возникает, например, при нескольких работодателях, налоговой льготе в расчёте зарплаты, другом доходе или пособии больше 410 €, и всегда при свободной профессии и бизнесе, если доход выше Grundfreibetrag. ${self ? "Свободная профессия и бизнес подают только электронно." : ""}`
      : "При одном работодателе подача не обязательна. Подав декларацию, вы можете получить возврат налога. Размер возврата страница не называет.",
    methods,
    steps: methods[0].steps,
    singleMethodNote: old && mandatory ? "Декларацию за прошлые годы подают тем же способом: подавайте как можно скорее, не дожидаясь срока." : undefined,
    note: "Это общая информация, а не налоговая консультация. ELSTER добавил в приложении MeinELSTER+ подачу для работающих без детей по найму: Finanzamt готовит предзаполненную декларацию.",
    next: act("Маршрут: Steuer-ID", "/berlin/steuer-id"),
  };
}
