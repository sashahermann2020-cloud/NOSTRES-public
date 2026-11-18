import type { Action, Answers, Fact, Method, Plan, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

export const learningOfficial = {
  nationalVisa: "https://www.auswaertiges-amt.de/de/service/visa-und-aufenthalt/nationale-visa",
  visaFee: "https://www.germany.info/us-en/service/visa/visa-fee-923358",
  blueCard: "https://service.berlin.de/dienstleistung/324659/standort/327805/",
  blueCardSettle: "https://service.berlin.de/dienstleistung/326556/standort/121885/pdf/",
  blueCardWelcome: "https://willkommenszentrum.berlin.de/en/residence-status/eu-blue-card",
  vocational: "https://service.berlin.de/dienstleistung/305304/en/",
  academic: "https://service.berlin.de/dienstleistung/329328/pdf/",
  jobSearch: "https://service.berlin.de/dienstleistung/324661/en/",
  fast: "https://service.berlin.de/dienstleistung/329325/",
  workRules: "https://www.berlin.de/einwanderung/aufenthalt/erwerbstaetigkeit/artikel.874035.php",
  overview2026: "https://www.make-it-in-germany.com/fileadmin/1_Rebrush_2022/b_Arbeitgeber/PDF-Dateien/BMWE_Moeglichkeiten_der_FKE_2026_DE.pdf",
  chance: "https://www.make-it-in-germany.com/de/unternehmen/einreise/beschaeftigung-chancenkarte-inhabern",
  chanceBrochure: "https://www.make-it-in-germany.com/fileadmin/1_Rebrush_2022/a_Fachkraefte/PDF-Dateien/3_Visum_u_Aufenthalt/Visagrafik_DE/Broschuere_Chancenkarte_DE.pdf",
  recognitionProcess: "https://www.anerkennung-in-deutschland.de/html/de/pro/anerkennungsverfahren.php",
  recognitionWhat: "https://www.anerkennung-in-deutschland.de/html/de/was-ist-anerkennung.php",
  recognitionBerlin: "https://willkommenszentrum.berlin.de/en/work-education/recognition-international-qualifications",
  recognitionAuthorities: "https://www.berlin.de/sen/arbeit/weiterbildung/berufsanerkennung/ausland/",
  architectBerlin: "https://www.ak-berlin.de/architektenkammer-berlin/mitgliedermitglied-werden/eintragung-architekten-stadtplanerliste/voraussetzung-und-verfahren/",
  architectFinder: "https://www.anerkennung-in-deutschland.de/en/interest/finder/result?arrangement=Nein&location=47619&nationality=Drittstaat&nationalityDrittstaat=&profession=378&qualification=&whereabouts=Ausland&zipSearch=0&pdf=1",
  engineerBerlin: "https://service.berlin.de/dienstleistung/350441/en/",
  doctorBerlin: "https://service.berlin.de/dienstleistung/331391/standort/327853/en/",
  ihkFosa: "https://www.ihk-fosa.de/en/procedure/",
  ihkFosaList: "https://www.ihk-fosa.de/fileadmin/Dateien/Informationsmaterial/IHK-Berufe_01.pdf",
  zab: "https://zab.kmk.org/de/zeugnisbewertung",
  economistFinder: "https://www.anerkennung-in-deutschland.de/de/interest/finder/profession/492",
  courseForeign: "https://www.bamf.de/DE/Themen/Integration/TraegerLehrFachkraefte/TraegerIntegrationskurse/Organisatorisches/TeilnahmeKosten/Auslaender/auslaender.html?nn=282656",
  courseAsyl: "https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/AsylbewerberGeduldete/asylbewerbergeduldete-node.html",
  courseEu: "https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Integrationskurse/TeilnahmeKosten/EU-Buerger/eu-buerger-node.html",
  courseNote: "https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Integrationskurse/Kursteilnehmer/Merkblaetter/630-009_merkblatt-zum-antrag-auf-zulassung.html",
};
const l = learningOfficial;
const visaFacts: Fact[] = [
  { label: "Сбор за национальную визу", value: "75 € взрослым и 37,50 € детям до 18 лет по данным посольства Германии; сумму и способ оплаты назначает представительство в вашей стране", kind: "official" },
  { label: "Срок рассмотрения визы", value: "может занять до трёх месяцев, иногда дольше: нужно согласие ведомства по делам иностранцев и иногда Bundesagentur", kind: "official" },
];

// ---------------------------------------------------------------------------
// Aufenthaltstitel für Beschäftigung (Blue Card и Fachkräfte)
// ---------------------------------------------------------------------------
export const workQuestions = [
  q("place", "Где вы сейчас?", [["abroad", "За пределами Германии, нужна виза"], ["inde", "В Германии, у меня есть вид на жительство или национальная виза D"]]),
  q("edu", "Какая у вас квалификация?", [["university", "Высшее образование (диплом университета)"], ["vocational", "Профессиональное образование от 2 лет (Berufsausbildung)"], ["vocexp", "Иностранная профессиональная квалификация от 2 лет и опыт работы от 2 лет за последние 5"], ["it", "IT-специалист без диплома, опыт от 3 лет за последние 7"], ["none", "Ничего из этого"]]),
  q("job", "Есть ли у вас трудовой договор или конкретное предложение о работе?", [["yes", "Да, на срок от 6 месяцев"], ["no", "Нет, хочу приехать искать работу"]]),
  q("recog", "Признана ли квалификация в Германии?", [["yes", "Да: диплом есть в базе anabin, оценка ZAB или решение о признании"], ["no", "Нет, пока не проверял"]]),
  q("salary", "Какая годовая брутто-зарплата по договору?", [["high", "50.700 € и больше"], ["mid", "От 45.934,20 до 50.699 €"], ["low", "Меньше 45.934,20 €"]]),
  q("recent", "Диплом получен не больше 3 лет назад или профессия дефицитная?", [["yes", "Да"], ["no", "Нет"]]),
  q("age45", "Вам 45 лет или больше?", [["yes", "Да"], ["no", "Нет"]]),
  q("regulated", "Нужна ли для профессии разрешение на практику (врач, инженер, учитель)?", [["yes", "Да, профессия регулируемая"], ["no", "Нет"]]),
  q("stage", "Первое заявление или продление?", [["new", "Первое заявление"], ["extend", "Продление уже выданного вида на жительство"]]),
  q("family", "Едете ли вы с супругом(ой) или детьми?", [["yes", "Да"], ["no", "Нет"]]),
] as const;

export function workVisible(a: Answers): readonly Question[] {
  const [place, edu, job, recog, salary, recent, age45, regulated, stage, family] = workQuestions;
  const list: Question[] = [place, edu];
  if (a.edu === "none") return list;
  list.push(job);
  if (a.job === "no") return list;
  if (a.edu === "university" || a.edu === "vocational") { list.push(recog); if (a.recog === "no") return list; }
  if (a.edu !== "vocational") list.push(salary);
  if (a.edu === "university" && a.salary === "mid") list.push(recent);
  if (a.edu !== "vocational" && a.salary === "low" && a.edu !== "university") return list;
  const fallback = a.edu === "university" && (a.salary === "low" || (a.salary === "mid" && a.recent === "no"));
  if (a.edu === "vocational" || a.edu === "vocexp" || fallback) list.push(age45);
  if (a.edu !== "it") list.push(regulated);
  if (a.place === "inde") list.push(stage);
  list.push(family);
  return list;
}

export function workPlan(a: Answers): Plan {
  const bc = act("Берлин: Blaue Karte EU", l.blueCard);
  const voc = act("Берлин: специалист с профессиональным образованием", l.vocational);
  const acad = act("Берлин: специалист с высшим образованием", l.academic);
  const overview = act("Make it in Germany: возможности для специалистов 2026", l.overview2026);
  const fast = act("Берлин: ускоренная процедура для специалистов", l.fast);
  const rules = act("Берлин: работа по виду на жительство", l.workRules);
  const note = "Это общая информация, а не юридическая консультация. Условия и суммы взяты с официальных страниц Берлина (LEA) и Make it in Germany; пороги зарплаты указаны на 2026 год.";
  const recognition = act("Маршрут: Anerkennung", "/berlin/anerkennung");
  const next = act("Маршрут: Aufenthaltstitel", "/berlin/aufenthalt");
  const abroad = a.place === "abroad";
  if (a.edu === "none") return {
    fit: "redirect", why: ["Нет подходящей квалификации"],
    title: "Для рабочего вида на жительство нужна признанная квалификация или опыт",
    summary: "Все пути для квалифицированных специалистов требуют диплома, профессионального образования от 2 лет либо специального опыта в IT. Сначала нужно доказать квалификацию.",
    steps: [step("Проверьте признание квалификации", "Маршрут показывает, где подать заявление и что приложить.", "Онлайн", recognition, overview), step("Учите немецкий", "Курсы помогают и с Chancenkarte, и с работой.", "Онлайн", act("Маршрут: Integrationskurs", "/berlin/integrationskurs"), overview)],
    next: recognition, note,
  };
  if (a.job === "no") {
    if (!abroad) return {
      fit: "conditional", why: ["Вы в Германии", "Работы пока нет"],
      title: "Вид на жительство для поиска работы после пребывания в Германии",
      summary: "Вид на жительство для поиска работы обычно даётся на 18 месяцев и позволяет любую работу, но его можно получить только после учёбы, исследований, профессионального обучения или признания квалификации в Германии.",
      steps: [step("Подайте онлайн-заявление", "Заявление подают только онлайн, оплатив сбор картой или PayPal. После отправки вы получаете PDF-подтверждение, которое продлевает действие текущего документа.", "Онлайн", act("Берлин: поиск работы после пребывания", l.jobSearch)), step("Приложите подтверждение основания", "Нужны диплом, свидетельство об обучении, решение о признании или документы об исследовательской работе, подтверждение средств, медицинская страховка и Meldebestätigung.", "Выбор", act("Берлин: поиск работы после пребывания", l.jobSearch))],
      next, note,
    };
    const facts: Fact[] = [
      ...visaFacts,
      { label: "Срок", value: "Такая карта для поиска работы действует до 12 месяцев; повторная карта на срок до 2 лет только для квалифицированной работы с согласием Bundesagentur", kind: "official" },
      { label: "Подработка и проба", value: "до 20 часов в неделю подработки и пробная работа до двух недель у одного работодателя", kind: "official" },
      { label: "Условия", value: "признанная квалификация, подтверждённые средства (сбережения или Verpflichtungserklärung), для системы баллов немецкий от A1 или английский от B2; поддержка при выборе зависит от баллов за квалификацию, язык, опыт, возраст и связь с Германией", kind: "official" },
      { label: "Страховка", value: "медицинская страховка обязательна на весь срок; для визы подойдёт частный полис, действующий в Германии", kind: "official" },
    ];
    const method: Method = {
      id: "chance", kind: "in-person", title: "Виза Chancenkarte в немецком представительстве", summary: "Заявление на визу подают до приезда в Германию.",
      availability: "available", availabilityLabel: "Доступно",
      conditions: ["Признанная квалификация (Fachkraft) или система баллов", "Подтверждённые средства на содержание"],
      documents: ["Паспорт и свидетельство о рождении", "Дипломы и сертификаты языка", "Подтверждение средств (накопления или Verpflichtungserklärung)", "Подтверждение медицинской страховки на первый период", ...(a.family === "yes" ? ["Свидетельство о браке с заверенным переводом"] : [])],
      facts,
      steps: [
        step("Проверьте условия", "Условия Chancenkarte и допустимая работа описаны для работодателей и соискателей на Make it in Germany.", "Онлайн", act("Make it in Germany: Chancenkarte", l.chance), act("Брошюра: Chancenkarte", l.chanceBrochure)),
        step("Соберите документы и средства", "Паспорт, дипломы, сертификаты языка, подтверждение средств и страховки на первый период.", "Выбор", act("Брошюра: Chancenkarte", l.chanceBrochure)),
        step("Оформите визу и приезжайте", "Ищите работу: подработка до 20 часов и проба до двух недель разрешены; перед началом квалифицированной работы нужно перейти на вид на жительство для занятости.", "Лично", act("Брошюра: Chancenkarte", l.chanceBrochure), act("Make it in Germany: Chancenkarte", l.chance)),
        step("Зарегистрируйте адрес в течение двух недель", "После переезда адрес регистрируют в Bürgeramt.", "Лично", act("Маршрут: Anmeldung", "/berlin/anmeldung")),
      ],
    };
    return { fit: "fits", why: ["Вы за границей", "Работы пока нет", a.edu === "university" ? "Высшее образование" : "Профессиональная квалификация"], title: "Получите Chancenkarte для поиска работы в Германии", summary: "Chancenkarte позволяет приехать на срок до 12 месяцев и искать работу, подрабатывая до 20 часов в неделю.", methods: [method], singleMethodNote: "Способ один: виза в немецком представительстве.", steps: method.steps, next: act("Маршрут: Anmeldung", "/berlin/anmeldung"), note };
  }
  if ((a.edu === "university" || a.edu === "vocational") && a.recog === "no") return {
    fit: "redirect", why: ["Квалификация не признана"],
    title: "Сначала нужно подтвердить квалификацию", summary: "Для вида на жительство специалиста нужно доказать, что диплом или обучение равноценны немецким: через базу anabin, оценку ZAB или решение о признании.",
    steps: [step("Проверьте диплом в anabin или подайте на оценку ZAB", "Если в anabin нет однозначной оценки, нужна платная оценка ZAB. Для профессионального образования нужно решение о признании.", "Онлайн", recognition, overview)],
    next: recognition, note,
  };
  const university = a.edu === "university";
  const it = a.edu === "it";
  const vocexp = a.edu === "vocexp";
  const vocational = a.edu === "vocational";
  const blueCard = (university && (a.salary === "high" || (a.salary === "mid" && a.recent === "yes"))) || (it && a.salary !== "low");
  if ((it || vocexp) && a.salary === "low") return {
    fit: "redirect", why: ["Зарплата ниже порога"],
    title: it ? "Для IT-специалиста без диплома зарплата ниже порога" : "Для пути по опыту зарплата ниже порога",
    summary: it ? "Для этого пути нужна брутто-зарплата не меньше 45,3% от годовой границы взносов, это 45.934,20 € в год, и согласие Bundesagentur." : "Для пути по профессиональному опыту нужна зарплата не меньше 45% от годовой границы взносов, около 45.630 € в год, если нет коллективного договора.",
    steps: [step("Пересмотрите условия договора", "Вид на жительство выдают на конкретную должность: зарплата в договоре должна проходить порог.", "Выбор", overview)],
    next, note,
  };
  if (vocexp && a.regulated === "yes") return {
    fit: "redirect", why: ["Регулируемая профессия"],
    title: "Путь по опыту не подходит для регулируемой профессии", summary: "Путь по профессиональному опыту действует только для нерегулируемых профессий. Для врача, инженера или учителя нужно признание и разрешение на практику.",
    steps: [step("Подайте на признание квалификации", "Маршрут показывает, куда подавать.", "Онлайн", recognition, overview)], next: recognition, note,
  };
  const fallback = university && !blueCard;
  const over45 = a.age45 === "yes";
  const ba = !(university && a.salary === "high");
  const kind = blueCard ? "bc" : fallback ? "acad" : vocexp ? "vocexp" : "voc";
  const mainLink = kind === "bc" ? bc : kind === "acad" ? acad : voc;
  const extend = a.stage === "extend" && !abroad;
  const fees: Fact = { label: "Сборы (онлайн перед отправкой)", value: extend ? "49 € за наклейку или 93 € за eAT при продлении; фото на месте 6 €" : "56 € за наклейку или 100 € за eAT при первом выпуске; фото на месте 6 €", kind: "official" };
  const facts: Fact[] = [
    ...(kind === "bc" ? [{ label: "Порог зарплаты 2026", value: "4.225 € в месяц брутто (50.700 € в год); для дефицитных профессий и дипломов не старше 3 лет 3.827,85 € (45.934,20 € в год); без бонусов", kind: "official" as const }, { label: "Согласие Bundesagentur", value: ba ? "нужно, если зарплата ниже 4.225 € в месяц" : "при вашей зарплате не нужно", kind: "official" as const }] : []),
    ...(kind === "acad" || kind === "voc" || kind === "vocexp" ? [{ label: "Согласие Bundesagentur", value: "как правило, нужно", kind: "official" as const }] : []),
    ...(over45 && kind !== "bc" ? [{ label: "После 45 лет", value: "брутто не меньше 4.647,50 € в месяц на 2026 год (55% годовой границы взносов) либо достаточное пенсионное обеспечение", kind: "official" as const }] : []),
    ...(kind === "vocexp" ? [{ label: "Условия пути по опыту", value: "иностранное профессиональное образование от 2 лет, опыт от 2 лет за последние 5, конкретная квалифицированная должность без регулируемой профессии, зарплата не меньше 45% годовой границы взносов, если нет коллективного договора", kind: "official" as const }] : []),
    ...(it ? [{ label: "Условия пути для IT", value: "IT-опыт на уровне высшего образования от 3 лет за последние 7, договор на 6 месяцев и больше, зарплата не меньше 45,3% годовой границы взносов", kind: "official" as const }] : []),
    { label: "Срок действия", value: "до 4 лет; при коротком договоре срок договора плюс 3 месяца", kind: "official" },
    fees,
    { label: "Выдача", value: "наклейка выдаётся на приёме; eAT готов через 4–6 недель; срок проверки заявления страница не называет", kind: "official" },
    ...(kind === "bc" ? [{ label: "Смена работодателя и постоянный вид на жительство", value: "через год на этой должности можно работать где угодно без уведомления; Niederlassungserlaubnis через 27 месяцев с A1 или через 21 месяц с B1; при потере работы сообщите в LEA в течение 2 недель, документ обычно действует ещё 6 месяцев", kind: "official" as const }] : []),
  ];
  const docs = ["Онлайн-заявление (только онлайн)", "Цветные копии страниц паспорта (при первом заявлении ещё штамп въезда и виза)", "Копия действующего вида на жительства, если есть", "Трудовой договор или конкретное предложение", "Erklärung zum Beschäftigungsverhältnis, подписанное работодателем", kind === "bc" && it ? "Резюме и документы об IT-опыте за последние 7 лет" : kind === "vocexp" ? "Иностранный диплом и подтверждение опыта работы" : kind === "voc" ? "Диплом профессионального образования и решение о признании" : "Диплом, оценка anabin или ZAB", "Meldebestätigung или договор аренды с Wohnungsgeberbestätigung", "Договор аренды с теплой арендой или выписка из земельной книги", "Подтверждение медицинской страховки: немецкая государственная или аналогичная частная (иностранная не подходит)", ...(a.regulated === "yes" ? ["Разрешение на практику профессии (Berufsausübungserlaubnis)"] : []), ...(extend ? ["Справка работодателя о неувольнении не старше 14 дней и расчётные листы за первые и последние два месяца"] : [])];
  const family = a.family === "yes";
  const lea: Method = {
    id: "lea", kind: "online", title: "Онлайн-заявление в LEA", summary: "Заявление в Landesamt für Einwanderung подают только онлайн.",
    availability: abroad ? "conditional" : "available", availabilityLabel: abroad ? "После получения визы" : "Доступно",
    conditions: ["Основное место жительства в Берлине", "Действующий документ или национальная виза D", extend ? "Продление можно подать не раньше чем за 4 месяца до окончания документа" : "Первое заявление", "Электронная почта и оплата картой или PayPal"],
    documents: docs, facts,
    steps: [
      step("Соберите документы", `Все файлы в PDF, JPG, JPEG или PNG: до 7 МБ каждый и до 100 МБ в сумме.${kind === "bc" ? " Для Blue Card нужен также диплом (anabin или ZAB) или опыт для IT-пути." : ""}`, "Выбор", mainLink, overview),
      step("Подайте онлайн-заявление и оплатите сбор", `Сбор оплачивается до отправки; PDF-подтверждение продлевает действие прежнего документа, если он не истёк и это не Schengen C. ${family ? "Супруга и детей внесите в то же заявление: отдельных заявлений и записей нет." : ""}`.trim(), "Онлайн", mainLink),
      step("Дождитесь проверки и приглашения", "LEA проверяет заявление и при необходимости запрашивает документы; после положительной проверки приходит приглашение на приём.", "Ожидание", mainLink),
      step("Приходите на приём с оригиналами", "Наклейку выдают на месте, eAT готов через 4–6 недель. Работать можно по справке, выданной на приёме.", "Лично", mainLink, rules),
    ],
  };
  const visaMission: Method = {
    id: "mission", kind: "in-person", title: "Национальная виза D в немецком представительстве", summary: "Обычная процедура: виза для работы, затем заявление в LEA после приезда.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Трудовой договор или конкретное предложение", "Подтверждённая квалификация"],
    documents: ["Паспорт", "Диплом и оценка anabin, ZAB или решение о признании", "Трудовой договор и Erklärung zum Beschäftigungsverhältnis", "Подтверждение медицинской страховки"],
    facts: [...visaFacts, { label: "Что дальше", value: "после въезда регистрация адреса в течение 14 дней и онлайн-заявление в LEA с визой", kind: "official" }],
    steps: [
      step("Подайте на визу в немецком представительстве", "Подайте заявление на национальную визу для работы в стране проживания: работодатель даёт договор и описание должности.", "Лично", overview, mainLink),
      step("Зарегистрируйте адрес после приезда", "Регистрация в течение 14 дней после заселения.", "Лично", act("Маршрут: Anmeldung", "/berlin/anmeldung")),
      step("Подайте онлайн-заявление в LEA", "С визой D подайте онлайн-заявление на вид на жительство: порядок и документы ниже.", "Онлайн", mainLink),
    ],
  };
  const accelerated: Method = {
    id: "fast", kind: "combined", title: "Ускоренная процедура через работодателя", summary: "Работодатель в Берлине подаёт через Business Immigration Service, срок в сумме не меньше 15 недель.",
    availability: "conditional", availabilityLabel: "Нужен работодатель в Берлине",
    conditions: ["Работодатель с филиалом в Берлине и договором с Business Immigration Service", "Квалификация от профессионального образования или высшего", "Виза ещё не подавалась", "Доверенность работнику и семье"],
    documents: ["Цветная копия паспорта", "Дипломы с заверенным копией и простым переводом", "Резюме на немецком в табличной форме", "Подтверждение опыта работы", "Erklärung zum Beschäftigungsverhältnis", ...(family ? ["Свидетельство о браке и о рождении детей с переводом"] : [])],
    facts: [{ label: "Сбор", value: "411 € при заключении соглашения с BIS; переводы и сборы за признание отдельно", kind: "official" }, { label: "Сроки", value: "признание около 8 недель; согласие Bundesagentur около 1 недели; визу в представительстве около 6 недель; всего не меньше 15 недель", kind: "official" }],
    steps: [
      step("Работодатель регистрируется в BIS", "Работодатель в Берлине регистрируется как клиент Business Immigration Service и заключает письменное соглашение до начала процедуры.", "Онлайн", fast),
      step("Оформите доверенность и документы", "Доверенности работнику и семье, документы о квалификации и описание должности.", "Выбор", fast),
      step("Получите визу", "После положительных проверок BIS соглашается на визу для работы, представительство выдаёт въездную визу.", "Лично", fast, overview),
    ],
  };
  const methods: Method[] = abroad ? [visaMission, accelerated] : [lea];
  return {
    fit: kind === "acad" || fallback ? "conditional" : "fits",
    why: [abroad ? "Вы за границей" : "Вы в Германии", university ? "Высшее образование" : it ? "IT без диплома" : vocexp ? "Опыт и иностранная квалификация" : "Профессиональное образование", kind === "bc" ? "Blue Card подходит по зарплате" : kind === "acad" ? "Blue Card не проходит по зарплате или сроку диплома" : "Путь для специалиста", extend ? "Продление" : "Первое заявление", family ? "Семья" : "Без семьи"],
    title: kind === "bc" ? "Подайте на Blaue Karte EU (Blue Card)" : kind === "acad" ? "Подайте на вид на жительство специалиста с высшим образованием" : kind === "vocexp" ? "Подайте на вид на жительство по профессиональному опыту" : "Подайте на вид на жительство специалиста с профессиональным образованием",
    summary: kind === "bc" ? "Blaue Karte EU подходит при вашей зарплате и образовании. Согласие Bundesagentur нужно только при зарплате ниже 4.225 € в месяц." : kind === "acad" ? "Blue Card при такой зарплате не выдают, но специалисту с высшим образованием положен вид на жительство для любой квалифицированной работы; согласие Bundesagentur как правило нужно." : "Вид на жительство выдают на квалифицированную работу; согласие Bundesagentur, как правило, нужно.",
    methods,
    ...(methods.length === 1 ? { singleMethodNote: "Способ один: вы уже в Германии, поэтому заявление в LEA подают онлайн." } : {}),
    steps: methods[0].steps,
    next, note,
  };
}

// ---------------------------------------------------------------------------
// Anerkennung
// ---------------------------------------------------------------------------
export const recognitionQuestions = [
  q("field", "Какая у вас профессия или документ?", [
    ["doctor", "Врач, стоматолог, фармацевт или ветеринар"],
    ["nurse", "Медсестра, фельдшер или другая неакадемическая медицинская профессия"],
    ["teacher", "Учитель или педагог (детский сад, социальная работа)"],
    ["engineer", "Инженер (звание «Ingenieur»)"],
    ["architect", "Архитектор (звание «Architekt»)"],
    ["trade", "Ремесло (электрик, мастер и другие профессии Handwerkskammer)"],
    ["commercial", "Профессия dualer Ausbildung или квалификация IHK: повар, Bilanzbuchhalter (бухгалтер), офис, торговля, техника"],
    ["degree", "Другой университетский диплом, например экономист: профессия не регулируется"],
    ["school", "Школьный аттестат"],
  ]),
  q("place", "Где вы находитесь?", [["abroad", "За пределами Германии"], ["de", "В Германии"]]),
  q("employer", "Есть ли работодатель в Германии?", [["yes", "Да, есть договор или предложение"], ["no", "Пока нет"]]),
  q("funding", "Получаете ли вы пособие Jobcenter или Agentur für Arbeit?", [["benefit", "Да"], ["none", "Нет"]]),
  q("papers", "Есть ли у вас дипломы с присяжным переводом?", [["yes", "Да"], ["no", "Нет, переводов пока нет"]]),
] as const;

export function recognitionVisible(a: Answers): readonly Question[] {
  const [field, place, employer, funding, papers] = recognitionQuestions;
  if (a.field === "school") return [field, place, papers];
  return [field, place, employer, funding, papers];
}

export function recognitionPlan(a: Answers): Plan {
  const process = act("Anerkennung in Deutschland: порядок процедуры", l.recognitionProcess);
  const what = act("Anerkennung in Deutschland: что такое признание", l.recognitionWhat);
  const berlin = act("Willkommenszentrum Berlin: признание квалификаций", l.recognitionBerlin);
  const authorities = act("Берлин: ответственные ведомства", l.recognitionAuthorities);
  const note = "Это общая информация, а не юридическая консультация. Условия взяты со страниц Anerkennung in Deutschland, Willkommenszentrum Berlin и Senatsverwaltung Берлина.";
  const next = act("Маршрут: Aufenthaltstitel для работы", "/berlin/aufenthalt-rabota");
  const bodies: Record<string, { name: string; text: string; regulated: boolean; fee?: string; link?: Action }> = {
    doctor: { name: "LAGeSo (Landesamt für Gesundheit und Soziales)", text: "Врачи, стоматологи, фармацевты и ветеринары подают в LAGeSo; для регулируемой профессии признание обязательно до работы. Для врачей из стран вне ЕС по заявлениям после 31 октября 2026 года знания подтверждают сразу экзаменом Kenntnisprüfung (устно-практический экзамен); платную экспертную оценку равноценности можно запросить в течение 4 недель после подачи. Нужны немецкий B2 и тест профессионального языка C1; сертификаты можно донести позже.", regulated: true, fee: "для врачей из стран вне ЕС 430 €, около 3–4 месяцев при полных документах", link: act("Берлин: Approbation врача из страны вне ЕС", l.doctorBerlin) },
    nurse: { name: "LAGeSo", text: "Неакадемические медицинские профессии подают в LAGeSo; признание обязательно до работы.", regulated: true },
    teacher: { name: "Senatsverwaltung für Bildung, Jugend und Familie", text: "Учителя, педагоги и социальные работники подают в Senatsverwaltung für Bildung, Jugend und Familie; заявление требует BundID.", regulated: true },
    engineer: { name: "Baukammer Berlin (Berlin Chamber of Construction)", text: "Звание «Ingenieur» защищено и требует признания в Baukammer Berlin. Заявление можно подать онлайн или по почте, в том числе из-за границы. Нужен немецкий B2: сертификат можно донести позже.", regulated: true, fee: "200 €, около 1–3 месяцев при полных документах", link: act("Берлин: признание квалификации инженера", l.engineerBerlin) },
    architect: { name: "Architektenkammer Berlin", text: "Звание «Architekt» в Берлине защищено: нужна запись в Architektenliste (список архитекторов палаты). Условия: учёба не меньше 4 лет или равноценное образование в иностранном вузе, не меньше 2 лет практики под руководством архитектора и 64 часа повышения квалификации. Если образование не равноценно, обычно возможна компенсационная мера. Немецкий для процедуры не проверяют, подать можно из-за границы.", regulated: true, fee: "155–515 €, плюс ежегодный членский взнос палаты", link: act("Architektenkammer Berlin: условия записи", l.architectBerlin) },
    trade: { name: "Handwerkskammer Berlin", text: "Ремесленные профессии подают в Handwerkskammer; сначала можно получить предварительную оценку.", regulated: false },
    commercial: { name: "IHK FOSA", text: "Профессии dualer Ausbildung и квалификации IHK рассматривает IHK FOSA: в её списке есть, например, Koch/Köchin (повар) и Geprüfte Bilanzbuchhalter (бухгалтер). Сначала около месяца идёт предварительная проверка, затем при полных документах около трёх месяцев оценка равноценности. Немецкий не нужен, подать можно из-за границы.", regulated: false, fee: "100–600 €, около 1 + 3 месяцев", link: act("IHK FOSA: список профессий", l.ihkFosaList) },
    degree: { name: "ZAB (Zentralstelle für ausländisches Bildungswesen)", text: "Для нерегулируемых университетских профессий, например экономиста (Wirtschaftswissenschaftler/in), ZAB выдаёт Zeugnisbewertung – заключение о сопоставимости диплома. Заявление подают онлайн, нужен BundID. Заключение не даёт права работать в регулируемой профессии.", regulated: false, fee: "208 €, около 3 месяцев после получения всех документов и оплаты", link: act("ZAB: Zeugnisbewertung", l.zab) },
    school: { name: "Senatsverwaltung für Bildung, Jugend und Familie (Zeugnisanerkennungsstelle)", text: "Школьные аттестаты признаёт Zeugnisanerkennungsstelle Senatsverwaltung für Bildung, Jugend und Familie.", regulated: false },
  };
  const body = bodies[a.field ?? "degree"];
  const papers = a.papers === "yes";
  const facts: Fact[] = [
    { label: "Срок", value: "обычно 3–4 месяца; с работодателем по ускоренной процедуре для специалистов цель 2 месяца при полных документах", kind: "official" },
    { label: "Стоимость", value: "сборы зависят от профессии и могут составлять несколько сотен евро; переводы, заверения и компенсационные меры оплачиваются отдельно", kind: "official" },
    { label: "Результаты", value: "полное признание; частичное признание (для нерегулируемых профессий, затем Anpassungsqualifizierung); компенсационная мера для регулируемых профессий (Anpassungslehrgang, Eignungsprüfung или Kenntnisprüfung); отказ при существенных различиях", kind: "official" },
    ...(body.fee ? [{ label: `Сбор и срок: ${body.name}`, value: body.fee, kind: "official" as const }] : []),
    ...(a.field === "architect" ? [{ label: "Язык", value: "для записи в Architektenliste знание немецкого не проверяют", kind: "official" as const }] : body.regulated ? [{ label: "Язык", value: "для регулируемых профессий нужен немецкий; ориентир B2 для программ квалификации", kind: "official" as const }] : [{ label: "Язык", value: "для заключения о сопоставимости и нерегулируемых профессий немецкий не нужен", kind: "official" as const }]),
    ...(a.funding === "benefit" ? [{ label: "Финансирование", value: "Jobcenter или Agentur für Arbeit могут поддержать заявление; просите поддержку до подачи", kind: "official" as const }] : a.funding === "none" ? [{ label: "Финансирование", value: "без пособия можно подать на Anerkennungszuschuss; подавать нужно до начала процедуры или меры", kind: "official" as const }] : []),
  ];
  const online: Method = {
    id: "online", kind: "online", title: `Заявление в ${body.name}`, summary: a.field === "school" ? "Заявление подают в Zeugnisanerkennungsstelle." : "Многие заявления подают онлайн через BundID.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Государственная иностранная квалификация, подтверждённая документом", "Из-за границы заявление подать можно, проживать в Германии не нужно", ...(a.employer === "yes" ? ["С договором работодатель может запросить ускоренную процедуру"] : [])],
    documents: ["Диплом или свидетельство об окончании", papers ? "Присяжный перевод документов" : "Присяжный перевод документов (его нужно заказать до подачи)", "Подтверждение опыта работы", ...(a.field === "school" ? [] : ["Паспорт или удостоверение личности"])],
    facts,
    steps: [
      step("Получите консультацию", "Берлинские консультации бесплатны: Willkommenszentrum Berlin (Potsdamer Str. 61), консультации на русском и украинском по понедельникам, вторникам и четвергам; телефон (030) 9017-23172, запись по телефону пн, ср, пт 10–12; общая горячая линия +49 30 31510-900 с понедельника по четверг 10–15.", "Звонок", berlin, authorities),
      step(`Выберите ведомство: ${body.name}`, body.text, "Выбор", authorities, body.link ?? process),
      step(papers ? "Подайте заявление" : "Закажите переводы и подайте заявление", papers ? "Подайте заявление онлайн или на бумаге в выбранное ведомство; ведомство подтверждает получение и сообщает, чего не хватает." : "Присяжные переводы нужно заказать заранее: часть ведомств принимает документы на английском. Затем подайте заявление; ведомство сообщит, каких документов не хватает.", "Онлайн", process, what),
      ...(a.funding !== undefined ? [step("Оформите финансирование до подачи", a.funding === "benefit" ? "Попросите в Jobcenter или Agentur für Arbeit поддержку расходов на признание до подачи." : "Подайте на Anerkennungszuschuss до начала процедуры или меры, если нет пособия.", "Выбор", berlin, process)] : []),
      step("Получите решение (Bescheid)", "Результат придёт формальным решением: полное признание, компенсационная мера или отказ. Для регулируемых профессий дальше проверяют разрешение на практику и язык.", "Ожидание", process),
      ...(a.employer === "yes" ? [step("Попросите работодателя об ускоренной процедуре", "Работодатель может запросить ускоренную процедуру в рамках закона о квалифицированной иммиграции; цель 2 месяца при полных документах.", "Выбор", process)] : []),
    ],
  };
  const paper: Method = {
    id: "paper", kind: "mail", title: "Заявление на бумаге", summary: "Подайте бумажное заявление в выбранное ведомство, если онлайн с BundID не подходит.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Формы и список документов выбранного ведомства"], documents: ["Диплом или свидетельство об окончании", "Присяжный перевод документов"],
    facts,
    steps: [step(`Выберите ведомство: ${body.name}`, body.text, "Выбор", authorities, body.link ?? process), step("Отправьте заявление с документами", "Отправьте формы и копии документов в выбранное ведомство и дождитесь подтверждения получения.", "Выбор", process)],
  };
  return {
    fit: "fits",
    why: [body.name, a.place === "abroad" ? "Вы за границей: заявление можно подать оттуда" : "Вы в Германии", a.employer === "yes" ? "Есть работодатель" : a.employer === "no" ? "Работодателя пока нет" : "Школьный аттестат", papers ? "Переводы готовы" : "Нужны переводы"],
    title: `Подайте заявление на признание в ${body.name}`,
    summary: body.regulated ? "Эта профессия регулируемая: без признания работать по ней нельзя. Заявление подают в профильное ведомство, обычно онлайн." : "Профессия нерегулируемая: работать можно и без признания, но решение помогает при поиске работы и оформлении вида на жительство.",
    methods: a.field === "school" ? [online] : [online, paper],
    steps: online.steps,
    next, note,
  };
}

// ---------------------------------------------------------------------------
// Integrationskurs
// ---------------------------------------------------------------------------
export const languageQuestions = [
  q("status", "Какой у вас статус?", [
    ["first", "Первый вид на жительство с 2005 года (работа, семья или гуманитарные основания)"],
    ["eu", "Гражданин ЕС (или гражданин Германии с недостаточным немецким)"],
    ["old", "Вид на жительство выдан до 2005 года или другой статус"],
    ["ukr", "Временная защита по § 24 (Украина)"],
    ["asyl", "Ищу убежище или имею Duldung"],
  ]),
  q("german", "Достаточно ли ваше знание немецкого?", [["no", "Нет, нужен курс"], ["yes", "Достаточно (примерно B1 и выше)"]]),
  q("income", "Получаете ли вы Grundsicherungsgeld, Arbeitslosengeld, Sozialhilfe или работаете с низким доходом?", [["yes", "Да"], ["no", "Нет"]]),
  q("distance", "Курс дальше 5 км от дома пешком?", [["yes", "Да, 5 км и больше"], ["no", "Нет, ближе"]]),
  q("format", "Какой формат нужен?", [["general", "Обычный интеграционный курс"], ["special", "Специальный курс: грамотность, женщины, родители, молодёжь"], ["fast", "Интенсивный курс для быстро учащихся"]]),
] as const;

export function languageVisible(a: Answers): readonly Question[] {
  const [status, german, income, distance, format] = languageQuestions;
  const list: Question[] = [status, german];
  if (a.german === "yes" && a.status !== "ukr" && a.status !== "asyl") return list;
  list.push(income);
  if (a.income === "yes") list.push(distance);
  list.push(format);
  return list;
}

export function languagePlan(a: Answers): Plan {
  const foreign = act("BAMF: Integrationskurs для иностранцев", l.courseForeign);
  const eu = act("BAMF: Integrationskurs для граждан ЕС", l.courseEu);
  const asyl = act("BAMF: Integrationskurs для ищущих убежище и Duldung", l.courseAsyl);
  const note = act("BAMF: памятка об Integrationskurs", l.courseNote);
  const noteText = "Это общая информация, а не юридическая консультация. Условия взяты со страниц BAMF.";
  const next = act("Маршрут: Aufenthaltstitel", "/berlin/aufenthalt");
  if (a.german === "yes" && a.status !== "ukr" && a.status !== "asyl") return {
    fit: "conditional", why: ["Достаточный немецкий"],
    title: "Право на языковую часть не положено, но Orientierungskurs остаётся",
    summary: "При достаточном немецком права на языковой курс нет, но остаётся право на Orientierungskurs (курс о законах, истории и обществе, 100 часов) с итоговым тестом «Leben in Deutschland».",
    steps: [step("Запишитесь на Orientierungskurs", "Курс завершается тестом «Leben in Deutschland». Тест бесплатный. Найдите организатора через BAMF-NAvI.", "Онлайн", foreign), step("Подготовьтесь к Berufssprachkurs, если нужен профессиональный язык", "Профессиональные языковые курсы идут после интеграционного курса в программе Gesamtprogramm Sprache; администрирует BAMF.", "Выбор", foreign)],
    next, note: noteText,
  };
  const exempt = a.income === "yes";
  const euCase = a.status === "eu";
  const entitled = a.status === "first";
  const old = a.status === "old";
  const special = a.format === "special";
  const fast = a.format === "fast";
  const hours = special ? "до 1.000 учебных часов" : "700 учебных часов";
  const price = special ? "по 2,29 € за час; 1.000 часов обходятся дороже, чем обычный курс" : "1.603 € за 700 часов по 2,29 € за час";
  const facts: Fact[] = [
    ...(a.status === "ukr" || a.status === "asyl" ? [{ label: "Допуск по § 44 Abs. 4 AufenthG", value: "BAMF допускает в рамках свободных мест, они зависят от бюджета; приоритет у тех, кто должен вернуться на рынок труда, и у держателей § 24. Данные страницы BAMF на 18 августа 2026 года", kind: "official" as const }] : []),
    ...(euCase || old ? [{ label: "Допуск по § 44 Abs. 4 AufenthG", value: "BAMF допускает в рамках свободных мест, они зависят от бюджета; заявления рассматривают в порядке поступления, неполные отклоняют; приоритет у тех, кто должен вернуться на рынок труда. Данные страницы BAMF на 18 августа 2026 года", kind: "official" as const }] : []),
    { label: "Структура", value: `${hours}: 600 часов языка (шесть блоков по 100) и 100 часов Orientierungskurs; перед началом бесплатный тест для определения уровня`, kind: "official" },
    { label: "Стоимость", value: exempt ? "освобождение от взноса возможно: подайте заявление (форма 630.027r) в BAMF до начала курса, задним числом освобождение не действует" : `${price}; платят блоками по 100 часов`, kind: "official" },
    { label: "Тесты", value: "курс заканчивается DTZ (уровень B1) и тестом «Leben in Deutschland»; оба бесплатны; при успехе выдают Zertifikat Integrationskurs", kind: "official" },
    { label: "Повтор", value: "если B1 не достигнут, можно один раз повторить до 300 часов", kind: "official" },
    { label: "Срок действия права", value: "годовой срок на запись; право теряется, если вы не начали курс за год или прервали его больше чем на год", kind: "official" },
    { label: "Возврат половины взноса", value: "при сдаче итогового теста в течение двух лет (трёх лет для специальных курсов) после выдачи права можно вернуть половину по заявлению", kind: "official" },
    ...(fast ? [{ label: "Интенсивный курс", value: "для быстро учащихся: 400 часов языка вместо 600", kind: "official" as const }] : []),
    ...(a.distance === "yes" ? [{ label: "Проезд", value: "освобождённым от взноса при пути от 5 км можно получить пауш. на проезд", kind: "official" as const }] : []),
  ];
  const steps: Step[] = [
    step(entitled ? "Получите Teilnahmeberechtigung в Ausländerbehörde" : euCase || old ? "Подайте заявление на допуск в BAMF" : "Получите допуск от ответственного органа", entitled ? "Право на курс подтверждает справка Ausländerbehörde после первого вида на жительства для работы, семьи или гуманитарных оснований." : euCase ? "У граждан ЕС права на курс нет: BAMF допускает по заявлению, если немецкого недостаточно, есть потребность в интеграции и свободные места. Заявление подают через Bundesportal." : old ? "Для вида на жительство до 2005 года права нет: допуск по заявлению в BAMF при наличии мест, приоритет у держателей § 24 и граждан ЕС с недостаточным немецким. Принимаются только полные заявления по порядку подачи." : a.status === "ukr" ? "Для § 24 допуск идёт в рамках свободных мест через ответственный орган или BAMF; у держателей § 24 приоритет при допуске." : "Для ищущих убежище и Duldung курс бесплатен. BAMF допускает их в рамках свободных мест: всё зависит от бюджета, приоритет у тех, кто должен вернуться на рынок труда. Допуск или обязанность посещать курс выдаёт ответственный орган.", "Онлайн", euCase ? eu : a.status === "asyl" || a.status === "ukr" ? asyl : foreign, note),
    step("Найдите организатора курса", "Организаторов ищут через BAMF-NAvI и записываются там, предъявив справку. Организатор должен начать курс в течение шести недель после записи или сообщить, что курса нет.", "Онлайн", foreign, note),
    step("Пройдите бесплатный тест уровня", "Тест определяет, с какого блока вы начинаете.", "Лично", note),
    ...(exempt ? [step("Подайте на освобождение от взноса", "Для получателей Grundsicherungsgeld, Arbeitslosengeld, Sozialhilfe, Asylbewerberleistungen, для людей в нужде и для работников с низким доходом: заявление в BAMF письменно, лучше до начала курса, с подтверждением.", "Выбор", note, foreign)] : []),
    step("Учитесь регулярно", "Посещение обязательно до конца курса, итоговые тесты нужно сдать; при обязательном курсе неявка может отразиться на продлении вида на жительство, на пособиях или привести к штрафу.", "Выбор", note),
    step("Сдайте DTZ и тест «Leben in Deutschland»", "Перед записью на тесты проверьте, что право на курс ещё действует; иначе подайте на продолжение курса и дождитесь решения.", "Лично", foreign, note),
  ];
  const method: Method = {
    id: "course", kind: "combined", title: "Допуск, запись у организатора и курс", summary: "Сначала допуск, затем запись у организатора курса.",
    availability: entitled ? "available" : "conditional", availabilityLabel: entitled ? "Доступно" : a.status === "ukr" || a.status === "asyl" ? "Допуск в рамках свободных мест" : "Нужно заявление на допуск",
    conditions: [entitled ? "Первый вид на жительство для работы, семьи или гуманитарных оснований с 2005 года" : euCase ? "Допуск по заявлению в BAMF" : old ? "Допуск по заявлению в BAMF при наличии мест" : "Допуск через ответственный орган", "Свободные места у организатора курса"],
    documents: ["Справка о праве участия (Teilnahmeberechtigung) или решение BAMF о допуске", "Документ, удостоверяющий личность", ...(exempt ? ["Подтверждение получения пособия или низкого дохода для освобождения от взноса"] : [])],
    facts, steps,
  };
  return {
    fit: entitled ? "fits" : "conditional",
    why: [entitled ? "Первый вид на жительство с 2005 года" : euCase ? "Гражданин ЕС" : old ? "Старый вид на жительство" : a.status === "ukr" ? "Временная защита по § 24" : "Убежище или Duldung", a.german === "no" ? "Немецкий нужно улучшить" : "Немецкого достаточно", exempt ? "Освобождение от взноса возможно" : "Взнос платится", special ? "Специальный курс" : fast ? "Интенсивный курс" : "Обычный курс"],
    title: entitled ? "Получите Teilnahmeberechtigung и запишитесь на Integrationskurs" : "Подайте заявление на допуск к Integrationskurs",
    summary: entitled ? "После первого вида на жительства у вас есть право на Integrationskurs. Курс стоит 2,29 € за час; половину можно вернуть после успешного теста." : "Права на курс по закону у вас нет или оно подтверждается отдельно: допуск выдаёт BAMF или ответственный орган. Допуск зависит от свободных мест.",
    methods: [method],
    singleMethodNote: "Способ один: допуск плюс запись у организатора курса.",
    steps: method.steps,
    next, note: noteText,
  };
}
