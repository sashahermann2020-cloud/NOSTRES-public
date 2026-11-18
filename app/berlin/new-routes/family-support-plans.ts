import type { Action, Answers, Fact, Method, Plan, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

export const supportOfficial = {
  maternityOverview: "https://familienportal.de/familienportal/familienleistungen/mutterschaftsleistungen",
  maternityProtection: "https://familienportal.de/familienportal/familienleistungen/mutterschutz",
  basFaq: "https://www.bundesamtsozialesicherung.de/de/mutterschaftsgeld/haeufige-fragen/",
  butBerlin: "https://www.berlin.de/sen/bjf/hilfe-und-unterstuetzung/bildungspaket/",
  butFederal: "https://www.arbeitsagentur.de/familie-und-kinder/informationen-zum-bildungspaket",
  butAdvice: "https://www.but-beratung.de/",
};
const s = supportOfficial;

// ---------------------------------------------------------------------------
// Mutterschutz und Mutterschaftsgeld
// ---------------------------------------------------------------------------
export const maternityQuestions = [
  q("work", "Какой у вас статус до родов?", [
    ["employee", "Работа по найму, включая неполный день, Minijob и срочный договор"],
    ["self", "Самозанятость или своё дело"],
    ["alg", "Получаю Arbeitslosengeld"],
    ["bg", "Получаю Bürgergeld или Grundsicherungsgeld"],
    ["none", "Не работаю и не получаю пособий"],
  ]),
  q("insurance", "Какая у вас медицинская страховка?", [["gkv", "Сама член государственной кассы (GKV)"], ["pkv", "Частная (PKV), с освобождением от государственной (Befreiungsbescheid)"], ["family", "Семейная государственная страховка"]]),
  q("timing", "На каком вы этапе?", [["before", "Защита материнства ещё не началась"], ["inside", "Она уже идёт или ребёнок родился"]]),
  q("birth", "Какие роды ожидаются?", [["normal", "Один ребёнок, роды в срок"], ["long", "Близнецы, недоношенный ребёнок или ребёнок с инвалидностью, выявленной в первые 8 недель"]]),
] as const;

export function maternityVisible(a: Answers): readonly Question[] {
  const [work, insurance, timing, birth] = maternityQuestions;
  if (a.work === "employee") return [work, insurance, timing, birth];
  if (a.work === "alg") return [work, timing, birth];
  return [work];
}

export function maternityPlan(a: Answers): Plan {
  const overview = act("Familienportal: Mutterschaftsleistungen", s.maternityOverview);
  const protection = act("Familienportal: Mutterschutz", s.maternityProtection);
  const bas = act("Bundesamt für Soziale Sicherung: Mutterschaftsgeld", s.basFaq);
  const long = a.birth === "long";
  const period = long ? "Срок защиты после родов 12 недель вместо 8: при недоношенном ребёнке (меньше 2500 г) всего 18 недель, при близнецах после родов 12 недель; при инвалидности ребёнка, выявленной в первые 8 недель, срок продлевают до 12 недель по заявлению в страховую кассу." : "Mutterschutzfrist начинается за 6 недель до ожидаемых родов и обычно заканчивается через 8 недель после них, всего около 14 недель. Если ребёнок родился раньше, срок после родов удлиняется на число недостающих дней.";
  const next = act("Маршрут: Elterngeld", "/berlin/elterngeld");
  const note = "Это общая информация, а не юридическая консультация. Условия взяты с официальных страниц Familienportal, BMBFSFJ и Bundesamt für Soziale Sicherung.";
  if (a.work === "self") return {
    fit: "conditional",
    why: ["Самозанятость"],
    title: "Для самозанятых закон о защите материнства не действует",
    summary: "Mutterschutzgesetz не распространяется на самозанятых, поэтому нет и обязательного Mutterschaftsgeld. Право зависит от вашей страховки и договора. При добровольной государственной страховке с правом на Krankengeld Mutterschaftsgeld равно Krankengeld (70% последнего регулярного дохода в пределах границы взносов). При частной страховке выплачивается договорное Krankentagegeld после срока ожидания, если оно застраховано: срок ожидания может быть до 8 месяцев.",
    steps: [
      step("Определите свою страховку", "Если вы добровольно в государственной кассе, посмотрите, есть ли у вас право на Krankengeld: оно не возникает автоматически. Если вы в частной страховке, посмотрите, есть ли Krankentagegeld и какой срок ожидания.", "Выбор", overview),
      step("Подайте заявление в свою страховую организацию", "Mutterschaftsgeld или Krankentagegeld выплачивает касса или страховщик. Для художников и работников культуры (KSK) и сельского хозяйства (SVLFG) действуют особые правила.", "Лично", overview),
      step("Рассчитайте Elterngeld", "Elterngeld самозанятым считают от прибыли за последний завершённый налоговый год: маршрут показывает документы и работу во время выплаты.", "Онлайн", act("Маршрут: Elterngeld", "/berlin/elterngeld"), overview),
    ],
    next,
    note,
  };
  if (a.work === "bg") return {
    fit: "redirect",
    why: ["Получаете Bürgergeld или Grundsicherungsgeld"],
    title: "Mutterschaftsgeld не положен, но есть доплата в пособии",
    summary: "При Bürgergeld (с 1 июля 2026 года Grundsicherungsgeld) Mutterschaftsgeld не платят. Взамен с 13-й недели беременности выплачивается Mehrbedarfszuschlag 17% от Regelbedarf, возможны и единовременные выплаты на беременность и рождение.",
    steps: [step("Сообщите беременность в Jobcenter", "Mehrbedarf и единовременные выплаты назначает Jobcenter: сообщите ему о беременности, как только она подтверждена. Маршрут показывает, как работать с Jobcenter.", "Онлайн", act("Маршрут: Jobcenter", "/berlin/jobcenter"), overview)],
    next: act("Маршрут: Jobcenter", "/berlin/jobcenter"),
    note,
  };
  if (a.work === "none") return {
    fit: "redirect",
    why: ["Нет работы, пособий и страховки"],
    title: "Без работы и страховки Mutterschaftsgeld не положен",
    summary: "Без медицинской страховки и без работы Mutterschaftsgeld не платят. После рождения доступны другие пособия: Kindergeld и Elterngeld.",
    steps: [step("Подайте на Kindergeld и Elterngeld после рождения", "Kindergeld платят независимо от дохода при подходящем статусе; Elterngeld зависит от прежнего дохода и статуса.", "Онлайн", act("Маршрут: Kindergeld", "/berlin/kindergeld"), overview)],
    next,
    note,
  };
  if (a.work === "alg") return {
    fit: "fits",
    why: ["Получаете Arbeitslosengeld", long ? "Особые роды" : "Роды в срок"],
    title: "Подайте заявление на Mutterschaftsgeld в Krankenkasse",
    summary: `При Arbeitslosengeld Krankenkasse выплачивает Mutterschaftsgeld в размере Arbeitslosengeld. ${period}`,
    steps: [
      step("Получите справку о сроке родов", "Врач или акушерка выдаёт Bescheinigung о предположительной дате родов. Справка нужна кассе.", "Лично", overview),
      step("Подайте заявление в Krankenkasse", "Используйте форму кассы, подпишите и отправьте по почте со справкой. После родов пришлите свидетельство о рождении.", "Выбор", overview),
      step("Сообщите об этом в Agentur für Arbeit", "Arbeitslosengeld заменяется Mutterschaftsgeld на время защиты: сообщите о беременности и сроках в Agentur.", "Онлайн", act("Маршрут: Agentur für Arbeit", "/berlin/jobcenter"), overview),
    ],
    next,
    note,
  };
  // employee
  const insurance = a.insurance ?? "gkv";
  const before = a.timing === "before";
  const facts: Fact[] = [
    { label: "Срок защиты", value: period, kind: "official" },
    { label: "Защита от увольнения", value: "с начала беременности до конца Mutterschutzfrist и не меньше четырёх месяцев после родов; действует, когда работодатель знает о беременности или родах; если вам уже отказали до сообщения, у вас две недели на уведомление; исключения только с разрешения надзорного органа", kind: "official" },
    { label: "Когда сообщить работодателю", value: "когда решите сами; раннее уведомление, особенно в первые три месяца, даёт больше защиты", kind: "official" },
    { label: "Работа до родов", value: "по своему желанию можно работать до родов и отозвать это решение в любой момент; после родов работа в Mutterschutzfrist запрещена", kind: "official" },
  ];
  const certificate = step("Получите справку о сроке родов", "Врач или акушерка выдаёт справку о предположительной дате родов. Выдавайте справку не слишком рано: ранние справки вызывают вопросы. Если справки нет, срок считают по дате родов.", "Лично", overview);
  const employerZuschuss = step("Попросите Arbeitgeberzuschuss", "Работодатель доплачивает до вашего среднего чистого дневного заработка, если он выше 13 € в день. База: среднее за последние три расчётных месяца перед защитой. Заявление работодателю обычно свободной формы; сначала подайте на Mutterschaftsgeld. Пример: 1800 € нетто в месяц дают 60 € в день, из них 13 € платит касса и 47 € работодатель.", "Выбор", overview);
  const ban = step("При запрете на работу получите Mutterschutzlohn", "Если действует запрет на работу (Beschäftigungsverbot) вне Mutterschutzfrist, работодатель платит Mutterschutzlohn: средний брутто за последние три месяца при месячной зарплате. Заявление не нужно: отдайте работодателю справку врача о запрете.", "Выбор", protection);
  const birthDoc = step("Пришлите свидетельство о рождении", "После родов отправьте свидетельство о рождении в ту организацию, куда подали заявление.", "Выбор", overview);
  const gkvMethod = (): Method => ({
    id: "krankenkasse", kind: "mail", title: "Mutterschaftsgeld в Krankenkasse", summary: "Вы подаёте заявление в свою государственную кассу и отдельно просите доплату у работодателя.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Вы сами член государственной кассы: семейной страховки недостаточно", "Для Minijob при государственной страховке заявление тоже подают в Krankenkasse"],
    documents: ["Справка врача или акушерки о предполагаемой дате родов", "Заявление кассы, подписанное и отправленное по почте", "Свидетельство о рождении после родов"],
    facts: [{ label: "Размер", value: "не больше 13 € в день за Mutterschutzfrist и день родов", kind: "official" }, ...facts],
    steps: [...(before ? [certificate] : []), step("Подайте заявление в Krankenkasse", "Форма кассы подписывается и отправляется по почте вместе со справкой о сроке родов.", "Выбор", overview), employerZuschuss, ban, birthDoc],
  });
  const basMethod = (famOrPrivate: string): Method => ({
    id: "bas", kind: "phone", title: "Mutterschaftsgeld в Bundesamt für Soziale Sicherung", summary: "Вы подаёте заявление в BAS, а не в кассу.",
    availability: insurance === "pkv" ? "conditional" : "available", availabilityLabel: insurance === "pkv" ? "Нужен Befreiungsbescheid" : "Доступно",
    conditions: [famOrPrivate, "Работа по найму, например Minijob, до начала защиты"],
    documents: ["Справка работодателя (Bescheinigung des Beschäftigungsbetriebes)", "Справка врача о предполагаемой дате родов", ...(insurance === "pkv" ? ["Befreiungsbescheid: освобождение от государственной страховки, действующее с начала работы"] : [])],
    facts: [{ label: "Размер", value: "в сумме не больше 210 € одной выплатой", kind: "official" }, ...facts],
    steps: [certificate, step("Подайте заявление в BAS", "Лучше всего в начале Mutterschutzfrist: справку работодателя можно оформить только тогда. Контакты: форма Mutterschaftsgeldstelle или телефон 0228/619-1888 (пн–пт 9–12, пн–чт 13–15); почтовый адрес Friedrich-Ebert-Allee 38, 53113 Bonn.", "Звонок", bas), employerZuschuss, ban, birthDoc],
  });
  const methods = insurance === "gkv" ? [gkvMethod()] : insurance === "pkv" ? [basMethod("Вы освобождены от государственной страховки (Befreiungsbescheid) и освобождение ещё действует")] : [basMethod("Вы семейно застрахованы в государственной кассе и работали до защиты, например в Minijob")];
  return {
    fit: "fits",
    why: ["Работа по найму", insurance === "gkv" ? "Сама член государственной кассы" : insurance === "pkv" ? "Частная страховка с освобождением" : "Семейная страховка", before ? "Защита ещё не началась" : "Защита идёт или роды прошли", long ? "Особые роды" : "Роды в срок"],
    title: insurance === "gkv" ? "Подайте заявление на Mutterschaftsgeld в Krankenkasse" : "Подайте заявление на Mutterschaftsgeld в Bundesamt für Soziale Sicherung",
    summary: insurance === "gkv"
      ? `Государственная касса платит Mutterschaftsgeld до 13 € в день, работодатель доплачивает разницу до среднего чистого заработка. ${period}`
      : `Частно застрахованным и семейно застрахованным работавшим женщинам Mutterschaftsgeld платит Bundesamt für Soziale Sicherung: в сумме до 210 €. Работодатель доплачивает разницу до среднего чистого заработка, если он выше 13 € в день. ${period}`,
    methods,
    steps: methods[0].steps,
    note,
    next,
  };
}

// ---------------------------------------------------------------------------
// Bildungs- und Teilhabepaket
// ---------------------------------------------------------------------------
export const butQuestions = [
  q("benefit", "Какое пособие получает семья?", [["kiz", "Kinderzuschlag"], ["wohngeld", "Wohngeld"], ["bg", "Bürgergeld или Grundsicherungsgeld"], ["social", "Sozialhilfe или помощь по Asylbewerberleistungsgesetz"], ["none", "Никакого"]]),
  q("child", "Где учится или находится ребёнок?", [["kita", "Kita или Kindertagespflege"], ["primary", "Начальная школа, 1–6 классы"], ["secondary", "Школа с 7 класса или профессиональная школа без Ausbildungsvergütung"]]),
  q("age", "Сколько лет ребёнку?", [["u18", "Меньше 18"], ["u25", "От 18 до 24"]]),
] as const;

export function butVisible(a: Answers): readonly Question[] {
  const [benefit, child, age] = butQuestions;
  if (a.benefit === "none") return [benefit];
  if (a.benefit === "social") return [benefit, child];
  return [benefit, child, age];
}

export function butPlan(a: Answers): Plan {
  const berlin = act("Берлин: Bildungspaket", s.butBerlin);
  const federal = act("Bundesagentur: Bildungspaket", s.butFederal);
  const advice = act("BuT-Beratung: консультация, в том числе на русском", s.butAdvice);
  if (a.benefit === "none") return {
    fit: "redirect",
    why: ["Семья не получает нужного пособия"],
    title: "Bildungspaket положен семьям, которые получают определённые пособия",
    summary: "Право на Bildungs- und Teilhabepaket есть у детей из семей, получающих Bürgergeld (Grundsicherungsgeld), Sozialhilfe, Kinderzuschlag, Wohngeld или пособия по Asylbewerberleistungsgesetz. Если у вас небольшой доход, проверьте Kinderzuschlag и Wohngeld: они дают право на пакет.",
    steps: [
      step("Проверьте Kinderzuschlag", "Доплата к Kindergeld для семей с небольшим доходом. Получатели Kinderzuschlag имеют право на Bildungspaket.", "Онлайн", act("Маршрут: Kinderzuschlag", "/berlin/kinderzuschlag"), federal),
      step("Проверьте Wohngeld", "Жилищная доплата тоже даёт право на Bildungspaket.", "Онлайн", act("Маршрут: Wohngeld", "/berlin/wohngeld"), berlin),
    ],
    next: act("Маршрут: Kinderzuschlag", "/berlin/kinderzuschlag"),
  };
  const kita = a.child === "kita";
  const primary = a.child === "primary";
  const noLimit = a.benefit === "social";
  const over18 = a.age === "u25";
  const steps: Step[] = [
    step("Получите berlinpass-BuT", "Berlinpass-BuT подтверждает ваше право. Для него нужны договор с Kita или справка из школы, либо Schülerausweis. Оформляют в ведомстве, где вы получаете пособие.", "Лично", berlin, federal),
    step(kita ? "Обед в Kita покрывается полностью" : primary ? "Обед в начальной школе бесплатный для всех" : "Обед в школе покрывается полностью", kita ? "Стоимость общего обеда в Kita или у Tagespflegeperson покрывается полностью." : primary ? "С 1 августа 2019 года каждый ученик начальной школы в Берлине получает бесплатный обед от земли, поэтому поддержка Bildungspaket на обед не нужна." : "Стоимость общего обеда в школе покрывается полностью.", "Выбор", berlin, federal),
    ...(kita ? [] : [step("Школьные принадлежности: 174 € в год", "Выплата 174 € на ребёнка в год двумя частями: в феврале и августе. Нужна справка из школы, Schülerausweis, письмо о приёме или назначение школьного ведомства.", "Выбор", berlin, federal)]),
    ...(kita ? [] : [step("Школьные поездки и транспорт", "Расходы на однодневные и многодневные поездки школы или Kita покрываются по формам с подтверждением школы. Реальные расходы на проезд в школу возмещаются, например месячный билет ABC. Берлинские школьники также ездят по Schülerticket AB с fahrCard.", "Выбор", berlin, federal)]),
    ...(kita || over18 ? [] : [step("Кружки, спорт и музыка: 15 € в месяц", "Пауш. 15 € в месяц на ребёнка независимо от фактических расходов, отдельного заявления не нужно: достаточно подтверждения, например договора о членстве. Ещё 15 € в месяц возможны на оборудование или поездки: Eigenanteil рассчитывает ведомство.", "Выбор", berlin, federal)]),
    ...(kita ? [] : [step("Lernförderung, если школа подтвердила необходимость", "Репетиторство оплачивают, если школа подтверждает потребность и не предлагает своей помощи. Покажите berlinpass-BuT в школе и подайте дополнительную форму: это единственная выплата с отдельным заявлением.", "Лично", berlin, federal)]),
    step("Получите консультацию BuT-Beratung", "Консультация доступна на арабском, немецком, английском, русском и турецком языках: +49 30 5771 3004 0 или info@but-beratung.de.", "Звонок", advice, berlin),
  ];
  return {
    fit: "fits",
    why: [a.benefit === "kiz" ? "Kinderzuschlag" : a.benefit === "wohngeld" ? "Wohngeld" : a.benefit === "bg" ? "Bürgergeld или Grundsicherungsgeld" : "Sozialhilfe или Asylbewerberleistungsgesetz", kita ? "Ребёнок в Kita" : primary ? "Начальная школа" : "Школа с 7 класса", noLimit ? "Возрастного предела нет" : over18 ? "Ребёнку от 18 до 24 лет: кружки и досуг уже не оплачиваются" : "Ребёнку меньше 18 лет"],
    title: "Оформите berlinpass-BuT и получайте помощь на ребёнка",
    summary: "Bildungs- und Teilhabepaket даёт помощь на обед, школьные принадлежности, поездки, транспорт, репетиторство и досуг. Подавайте в ведомстве, которое выплачивает ваше пособие или где вы уже подали заявление на него. Большинство выплат не требуют отдельного заявления: достаточно подтверждений расходов.",
    steps,
    note: `Это общая информация, а не юридическая консультация. ${noLimit ? "Для Sozialhilfe и Asylbewerberleistungsgesetz возрастного предела нет." : "Выплаты идут до 25 лет, а на кружки и досуг до 18 лет."} Условия взяты с официальных страниц Берлина и Bundesagentur für Arbeit.`,
    next: act("Маршрут: Kinderzuschlag", "/berlin/kinderzuschlag"),
  };
}
