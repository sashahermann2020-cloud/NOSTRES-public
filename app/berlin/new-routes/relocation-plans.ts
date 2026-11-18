import type { Action, Answers, Fact, Method, Plan, Provider, Question, Step } from "./route-model.ts";

/**
 * Маршруты переезда в Германию, которые проходят ещё в стране исхода (решение владельца от 31.10.2026):
 * общий выбор пути, Chancenkarte, виза для работы (Blue Card и специалисты), виза для волонтёров и учебная виза.
 * Этап после въезда (LEA Берлина, порог зарплаты, продление) описан в существующих маршрутах и здесь не повторяется:
 * маршруты ведут туда ссылкой «следующий шаг».
 * Факты сверены 31 октября 2026 года; условия Working Holiday повторно проверены по официальным страницам 5 ноября 2026 года.
 */

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

export const relocationOfficial = {
  visaGeneral: "https://www.auswaertiges-amt.de/de/service/visa-und-aufenthalt/visabestimmungen-allgemein",
  portalInfo: "https://www.auswaertiges-amt.de/en/visa-service/consular-services-portal",
  portal: "https://digital.diplo.de/visa",
  blockedAccount: "https://www.auswaertiges-amt.de/de/sperrkonto-375488",
  workingHoliday: "https://www.auswaertiges-amt.de/en/06-workingholiday/606672",
  workingHolidayAustralia: "https://australien.diplo.de/au-en/service/visa/working-holiday-2640582",
  youthMobilityCanada: "https://canada.diplo.de/ca-en/consular-services/visa/working-holiday-2653142",
  chance: "https://www.make-it-in-germany.com/de/visum-aufenthalt/chancenkarte/jobsuche",
  partnership: "https://www.make-it-in-germany.com/de/visum-aufenthalt/arten/visum-anerkennungspartnerschaft",
  ausbildungVisa: "https://www.make-it-in-germany.com/de/visum-anerkennung/visaarten/berufsausbildung",
  ausbildungSearch: "https://www.make-it-in-germany.com/fileadmin/1_Rebrush_2022/a_Fachkraefte/PDF-Dateien/3_Visum_u_Aufenthalt/Visagrafik_DE/Visum_Ausbildungsplatzsuche_DE.pdf",
  studySearch: "https://www.make-it-in-germany.com/fileadmin/1_Rebrush_2022/a_Fachkraefte/PDF-Dateien/3_Visum_u_Aufenthalt/Visagrafik_DE/Visum_Studienplatzsuche_DE.pdf",
  studyRequirements: "https://www.make-it-in-germany.com/de/studium-ausbildung/studieren-in-deutschland/voraussetzungen",
  employerApproval: "https://www.make-it-in-germany.com/de/unternehmen/einreise/bundesagentur-fuer-arbeit",
  professionLicense: "https://www.make-it-in-germany.com/en/visa-recognition/visa-types/qualified-professionals",
  preApproval: "https://www.arbeitsagentur.de/unternehmen/fachkraefte-ausland/vorabzustimmung-fuer-auslaendische-beschaeftigte",
  westbalkan: "https://www.arbeitsagentur.de/unternehmen/fachkraefte-ausland/westbalkanregelung",
  law17: "https://www.gesetze-im-internet.de/aufenthg_2004/__17.html",
  law18: "https://www.gesetze-im-internet.de/aufenthg_2004/__18.html",
  escHumanitarian: "https://youth.europa.eu/solidarity/young-people/volunteering-humanitarian-aid_en",
  law16b: "https://www.gesetze-im-internet.de/aufenthg_2004/__16b.html",
  law19e: "https://www.gesetze-im-internet.de/aufenthg_2004/__19e.html",
  law41: "https://www.gesetze-im-internet.de/aufenthv/__41.html",
  berlinStudy: "https://service.berlin.de/dienstleistung/305244/",
  berlinVolunteer: "https://service.berlin.de/dienstleistung/330848/",
  berlinWorkingHoliday: "https://service.berlin.de/dienstleistung/305265/",
  berlinVisaFree: "https://service.berlin.de/dienstleistung/350471/",
  berlinBlueCard: "https://service.berlin.de/dienstleistung/324659/standort/327805/",
  bfdAz: "https://www.bundesfreiwilligendienst.de/bundesfreiwilligendienst/a-bis-z",
  bfdSearch: "https://www.bundesfreiwilligendienst.de/bundesfreiwilligendienst/platz-einsatzstellensuche",
  bfdFaq: "https://www.bundesfreiwilligendienst.de/bundesfreiwilligendienst/fragen-antworten",
  fsjFaq: "https://www.jugendfreiwilligendienste.de/jugendfreiwilligendienste/service/faq",
  esc: "https://youth.europa.eu/solidarity",
  escFaq: "https://youth.europa.eu/solidarity/faq/3_en",
  escAge: "https://youth.europa.eu/solidarity/young-people/about_en",
  financeProof: "https://www.study-in-germany.com/de/studium-planen/voraussetzungen/finanzierungsnachweis/",
  expatrio: "https://www.expatrio.com/prices-and-services-terms-and-conditions",
  fintiba: "https://www.fintiba.com/de/blocked-account-germany",
  fintibaPrice: "https://www.fintiba.com/de/news/more-value-for-you",
};
const o = relocationOfficial;

const routes = {
  relocation: act("Маршрут: возможности переезда в Германию", "/berlin/pereezd-v-germaniyu"),
  chance: act("Маршрут: Chancenkarte", "/berlin/chancenkarte"),
  workVisa: act("Маршрут: виза для работы", "/berlin/viza-rabota"),
  volunteer: act("Маршрут: виза для волонтёров", "/berlin/viza-volontyor"),
  studyVisa: act("Маршрут: виза для учёбы и Ausbildung", "/berlin/viza-uchyoba"),
  workPermit: act("Маршрут: вид на жительство для работы после въезда", "/berlin/aufenthalt-rabota"),
  recognition: act("Маршрут: признание диплома", "/berlin/anerkennung"),
  reunion: act("Маршрут: воссоединение семьи", "/berlin/familiennachzug"),
  study: act("Маршрут: поступление в вуз и на Ausbildung", "/berlin/studium-ausbildung"),
  anmeldung: act("Маршрут: регистрация адреса", "/berlin/anmeldung"),
  health: act("Маршрут: медицинская страховка", "/berlin/health-insurance"),
  course: act("Маршрут: языковые курсы", "/berlin/sprachkurs"),
  employment: act("Маршрут: поиск работы по найму", "/berlin/rabota-po-najmu"),
  lea: act("Маршрут: продление вида на жительство", "/berlin/aufenthalt"),
};

const note = "Это общая информация, а не юридическая консультация. Условия и суммы взяты с официальных страниц Auswärtiges Amt, Make it in Germany, Bundesagentur für Arbeit, Берлина и законов, указанных в шагах; суммы действуют на 2026 год. Решение о визе принимает представительство Германии.";

// ---------------------------------------------------------------------------
// Общие части: подача визы через Auslandsportal или на бумаге
// ---------------------------------------------------------------------------
const visaFee: Fact = { label: "Сбор за национальную визу", value: "75 € взрослым и 37,50 € несовершеннолетним; в отдельных случаях сбор снижают или не взимают", kind: "official" };
const visaTime: Fact = { label: "Срок рассмотрения", value: "в зависимости от цели: несколько месяцев", kind: "official" };
const portalFact: Fact = { label: "Онлайн-подача", value: "все визовые отделы подключены к Auslandsportal с 1 января 2025 года; онлайн принимаются 28 целей пребывания, шенгенские визы пока нет", kind: "official" };

const portalSteps: Step[] = [
  step("Создайте учётную запись в Auslandsportal", "Откройте портал, выберите представительство, которое отвечает за место вашего обычного проживания, и цель поездки. Заявление в другое представительство не принимают.", "Онлайн", act("Auslandsportal: заявление на визу", o.portal), act("Auswärtiges Amt: как работает Auslandsportal", o.portalInfo)),
  step("Заполните заявление и загрузите документы", "Представительство предварительно проверяет заявление и сообщает в портале, чего не хватает или что заполнено неверно: исправьте и отправьте снова. С ноября 2025 года семья подаёт заявления вместе из одной учётной записи.", "Онлайн", act("Auslandsportal: заявление на визу", o.portal), act("Auswärtiges Amt: как работает Auslandsportal", o.portalInfo)),
  step("Запишитесь на приём и придите лично", "Запись даёт сам портал. На приёме в представительстве или визовом центре снимают отпечатки пальцев и фото, проверяют оригиналы и принимают сбор.", "Лично", act("Auswärtiges Amt: как работает Auslandsportal", o.portalInfo), act("Auswärtiges Amt: общие правила виз", o.visaGeneral)),
  step("Следите за статусом в портале", "Решение и следующие шаги приходят в учётную запись портала. Билеты покупайте после выдачи визы.", "Ожидание", act("Auslandsportal: заявление на визу", o.portal), act("Auswärtiges Amt: общие правила виз", o.visaGeneral)),
];
const paperSteps: Step[] = [
  step("Запишитесь в представительство или визовый центр", "Если ваша цель ещё не принимается онлайн в вашем представительстве, заявление подают на бумаге по записи. Представительство выбирается по месту обычного проживания.", "Лично", act("Auswärtiges Amt: общие правила виз", o.visaGeneral), act("Auswärtiges Amt: как работает Auslandsportal", o.portalInfo)),
  step("Сдайте заявление и оригиналы", "Принесите заполненную анкету национальной визы, документы из списка и оплатите сбор на приёме.", "Лично", act("Auswärtiges Amt: общие правила виз", o.visaGeneral)),
  step("Дождитесь решения", "Срок зависит от цели: иногда нужно согласие ведомства по делам иностранцев или Bundesagentur für Arbeit.", "Ожидание", act("Auswärtiges Amt: общие правила виз", o.visaGeneral)),
];
function visaMethods(documents: string[], facts: Fact[], extra: Partial<Method> = {}, prefix: Step[] = []): Method[] {
  return [
    { id: "portal", kind: "combined", title: "Онлайн в Auslandsportal, затем приём в представительстве", summary: "Заявление и документы загружаются онлайн. Лично вы приходите один раз: биометрия, оригиналы и оплата сбора.", availability: "conditional", availabilityLabel: "Доступность зависит от цели поездки и представительства", conditions: ["Представительство выбирается по месту вашего обычного проживания", "Учётная запись в Auslandsportal и документы в электронном виде"], documents, facts: [portalFact, visaFee, ...facts], ...extra, steps: [...prefix, ...portalSteps] },
    { id: "paper", kind: "in-person", title: "На бумаге по записи", summary: "Запасной способ, если ваше представительство пока не принимает эту цель онлайн.", availability: "conditional", availabilityLabel: "Если цель не открыта онлайн в вашем представительстве", conditions: ["Запись в представительство или визовый центр по месту обычного проживания"], documents, facts: [visaFee, visaTime, ...facts], ...extra, steps: [...prefix, ...paperSteps] },
  ];
}

const visaFreeCountries = "Австралия, Израиль, Япония, Канада, Южная Корея, Новая Зеландия, Великобритания, США";

// ---------------------------------------------------------------------------
// Sperrkonto: готовые варианты провайдеров (проверено по их страницам 31.10.2026)
// ---------------------------------------------------------------------------
const blockedProviders: Provider[] = [
  {
    id: "expatrio", name: "Expatrio", label: "Sperrkonto · онлайн",
    summary: "Sperrkonto открывается онлайн; счёт ведёт банк-партнёр UniCredit. Сборы списываются со счёта в конце месяца.",
    facts: [{ label: "Открытие", value: "119 € один раз; столько же за каждое продление услуги", kind: "provider" }, { label: "Обслуживание", value: "9 € в месяц, пока счёт открыт; наценка на обмен валюты 2%", kind: "provider" }],
    conditions: ["Цены действуют для заявлений, проверенных Expatrio с 7 июля 2026 года"],
    links: [act("Expatrio: цены и условия", o.expatrio)],
  },
  {
    id: "fintiba", name: "Fintiba", label: "Sperrkonto · онлайн",
    summary: "Счёт открывается полностью онлайн, для регистрации нужен действующий паспорт. Подтверждение для визы выдаётся автоматически, когда деньги поступили; при оплате картой сразу.",
    facts: [{ label: "Открытие", value: "159 € один раз", kind: "provider" }, { label: "Обслуживание", value: "9,90 € в месяц", kind: "provider" }, { label: "Срок", value: "открытие около 10 минут; международный перевод идёт до двух недель", kind: "provider" }],
    conditions: ["Цены действуют для новых счетов с 3 ноября 2025 года"],
    links: [act("Fintiba: Sperrkonto", o.fintiba), act("Fintiba: новые цены", o.fintibaPrice)],
  },
];
const blockedNote = "Цены взяты с официальных страниц самих провайдеров 31 октября 2026 года и могут измениться. Это не рейтинг и не рекомендация. Auswärtiges Amt не ведёт список провайдеров: Sperrkonto можно открыть в любом банке, который его предлагает.";
const blockedExtra = (blocked: boolean): Partial<Method> => blocked ? { providers: blockedProviders, providersTitle: "Где открыть Sperrkonto", providersNote: blockedNote } : {};

// ---------------------------------------------------------------------------
// 1. Возможности переезда в Германию
// ---------------------------------------------------------------------------
export const relocationQuestions = [
  q("citizen", "Какое у вас гражданство?", [["eu", "Страна ЕС, ЕЭЗ или Швейцария"], ["visafree", visaFreeCountries], ["holiday", "Аргентина, Бразилия, Чили, Уругвай, Гонконг или Тайвань"], ["balkan", "Албания, Босния и Герцеговина, Косово, Северная Македония, Черногория или Сербия"], ["other", "Другая страна"]]),
  q("goal", "Что вы хотите делать в Германии?", [["job", "Работать: есть предложение от работодателя"], ["search", "Приехать и искать работу на месте"], ["study", "Учиться в вузе или поступать"], ["ausbildung", "Получить профессию через Ausbildung"], ["volunteer", "Пройти волонтёрскую службу"], ["family", "Переехать к супругу, супруге или родителям"], ["year", "Пожить и подработать до года"]]),
  q("qual", "Какое у вас образование?", [["degree", "Высшее или профессиональное от 2 лет, признано государством в стране получения"], ["none", "Такого образования нет"]]),
  q("holidayCountry", "Гражданство какой страны у вас?", [["australia", "Австралия"], ["israel", "Израиль"], ["japan", "Япония"], ["newzealand", "Новая Зеландия"], ["korea", "Южная Корея"], ["canada", "Канада"], ["argentina", "Аргентина"], ["brazil", "Бразилия"], ["chile", "Чили"], ["uruguay", "Уругвай"], ["hongkong", "Гонконг"], ["taiwan", "Тайвань"], ["uk", "Великобритания"], ["us", "США"]]),
  q("age", "Сколько вам лет?", [["minor", "Младше 18"], ["to30", "18–30"], ["to34", "31–34"], ["age35", "35"], ["over", "36 и больше"]]),
] as const;

export function relocationVisible(a: Answers): readonly Question[] {
  const [citizen, goal, qual, holidayCountry, age] = relocationQuestions;
  if (!a.citizen || a.citizen === "eu") return [citizen];
  const list: Question[] = [citizen, goal];
  if (a.goal === "job" || a.goal === "search") list.push(qual);
  if (a.goal === "year" && (a.citizen === "visafree" || a.citizen === "holiday")) {
    const visafree = ["australia", "israel", "japan", "newzealand", "korea", "canada", "uk", "us"];
    const options = holidayCountry.options.filter(([country]) => a.citizen === "visafree" ? visafree.includes(country) : !visafree.includes(country));
    list.push({ ...holidayCountry, options });
    if (a.holidayCountry && !["uk", "us"].includes(a.holidayCountry)) list.push(age);
  }
  return list;
}

const citizenWhy: Record<string, string> = { eu: "Гражданство ЕС, ЕЭЗ или Швейцарии", visafree: "Гражданство страны, которой можно получить вид на жительство без визы", holiday: "Гражданство страны с программой Working Holiday", balkan: "Гражданство страны Западных Балкан", other: "Гражданство другой страны" };
const goalWhy: Record<string, string> = { job: "Цель: работа по предложению", search: "Цель: поиск работы", study: "Цель: учёба", ausbildung: "Цель: Ausbildung", volunteer: "Цель: волонтёрская служба", family: "Цель: переезд к семье", year: "Цель: пожить и подработать до года" };

export function relocationPlan(a: Answers): Plan {
  const holidayCountryLabel = relocationQuestions.find((question) => question.id === "holidayCountry")?.options.find(([value]) => value === a.holidayCountry)?.[1];
  const why = [citizenWhy[a.citizen], holidayCountryLabel, a.goal && goalWhy[a.goal], a.qual && (a.qual === "degree" ? "Есть признанное образование" : "Признанного образования нет"), a.age && ({ to30: "Возраст 18–30", minor: "Возраст до 18", to34: "Возраст 31–34", age35: "Возраст 35", over: "Возраст 36 и больше" } as Record<string, string>)[a.age]].filter((x): x is string => Boolean(x));
  const visaFree = a.citizen === "visafree";
  const visaFreeStep = step("Можно въехать без визы и подать в Берлине", `Гражданам стран: ${visaFreeCountries} – вид на жительство можно получить после въезда без визы. Заявление подают в течение 90 дней после въезда.`, "Онлайн", act("§ 41 AufenthV: въезд без визы", o.law41), act("Берлин: вид на жительство для работы без визы", o.berlinVisaFree));
  const withVisaFree = (steps: Step[]) => visaFree ? [visaFreeStep, ...steps] : steps;

  if (a.citizen === "eu") return {
    fit: "fits", why, title: "Виза и разрешение на работу вам не нужны",
    summary: "Гражданам ЕС, ЕЭЗ и Швейцарии виза в Германию не нужна. Работать, учиться и искать работу можно без вида на жительство. Первое обязательное действие после заселения: регистрация адреса.",
    steps: [
      step("Зарегистрируйте адрес", "Регистрация в Bürgeramt в течение двух недель после заселения: маршрут покажет запись и документы.", "Лично", routes.anmeldung),
      step("Оформите медицинскую страховку", "Страховку выбирают до начала работы или учёбы: маршрут покажет кассы и способы.", "Онлайн", routes.health),
      step("Ищите работу или место учёбы", "Вакансии и права работника описаны в маршруте о работе по найму, поступление – в маршруте об учёбе.", "Выбор", routes.employment, routes.study),
    ],
    next: routes.anmeldung,
  };
  if (!a.goal) return { fit: "clarify", why, title: "Выберите цель переезда", summary: "Путь в Германию зависит от цели: работа, поиск работы, учёба, Ausbildung, волонтёрская служба, семья или год с подработкой.", steps: [step("Ответьте на вопрос о цели", "После ответа маршрут покажет подходящий путь и следующий маршрут.", "Выбор", routes.relocation)] };

  if (a.goal === "family") return {
    fit: "redirect", why, title: "Ваш путь: воссоединение семьи",
    summary: "Переезд к супругу, супруге или родителям оформляется как воссоединение семьи. Условия зависят от того, кто уже живёт в Германии, и от возраста детей.",
    steps: withVisaFree([step("Откройте маршрут о воссоединении семьи", "Маршрут покажет, нужна ли виза, какой немецкий нужен и какие документы собрать.", "Выбор", routes.reunion)]),
    next: routes.reunion, note,
  };
  if (a.goal === "study" || a.goal === "ausbildung") return {
    fit: "redirect", why, title: a.goal === "study" ? "Ваш путь: учебная виза" : "Ваш путь: виза для Ausbildung",
    summary: a.goal === "study" ? "Для учёбы нужна виза для студентов, а пока документы в вузе на рассмотрении – виза для поступающих. Средства подтверждают через Sperrkonto, Verpflichtungserklärung или стипендию." : "Для Ausbildung нужен договор с местом обучения и немецкий обычно B1. Если места ещё нет, до 35 лет можно приехать искать его на срок до девяти месяцев.",
    steps: withVisaFree([
      step("Откройте маршрут учебной визы", "Маршрут посчитает нужную сумму, покажет документы и подачу в Auslandsportal.", "Выбор", routes.studyVisa),
      step("Выберите программу или место", "Поступление, uni-assist и поиск мест Ausbildung описаны в отдельном маршруте.", "Выбор", routes.study),
    ]),
    next: routes.studyVisa, note,
  };
  if (a.goal === "volunteer") return {
    fit: "redirect", why, title: "Ваш путь: виза для волонтёров",
    summary: "Волонтёрская служба в Германии: Bundesfreiwilligendienst, FSJ, FÖJ или Европейский корпус солидарности. Сначала нужно место и договор, затем виза.",
    steps: withVisaFree([step("Откройте маршрут для волонтёров", "Маршрут покажет, какая служба подходит по возрасту, где искать место и какие документы нужны для визы.", "Выбор", routes.volunteer)]),
    next: routes.volunteer, note,
  };
  if (a.goal === "year") {
    const visaFreeHolidayCountries = ["australia", "israel", "japan", "newzealand", "korea", "canada"];
    const missionHolidayCountries = ["argentina", "brazil", "chile", "uruguay", "hongkong", "taiwan"];
    const allListedCountries = [...visaFreeHolidayCountries, ...missionHolidayCountries, "uk", "us"];
    const clarifyHoliday = () => ({
      fit: "clarify" as const, why, title: "Укажите страну и возраст для Working Holiday",
      summary: "Условия программы зависят от конкретного гражданства и возраста. Выберите подходящую страну и возраст в анкете.",
      steps: [step("Проверьте условия Working Holiday", "Официальный список стран и правила подачи опубликованы Auswärtiges Amt.", "Онлайн", act("Проверьте условия Working Holiday", o.workingHoliday))], note,
    });
    const noHolidayProgram = () => ({
      fit: "redirect" as const, why, title: "Для вашей страны программы Working Holiday нет",
      summary: "Год с подработкой без отдельной цели доступен только гражданам стран, с которыми у Германии есть соглашение Working Holiday. Вам подойдут другие пути: волонтёрская служба, Ausbildung или Chancenkarte.",
      steps: [step("Посмотрите список стран Working Holiday", "Auswärtiges Amt перечисляет страны-партнёры и где подавать.", "Онлайн", act("Проверьте условия Working Holiday", o.workingHoliday)), step("Выберите другой путь", "Волонтёрская служба не требует профессии и подходит для любого гражданства.", "Выбор", routes.volunteer, routes.chance)],
      next: routes.volunteer, note,
    });
    if (!a.citizen) return clarifyHoliday();
    if (a.citizen === "balkan" || a.citizen === "other") return noHolidayProgram();
    if (a.citizen !== "visafree" && a.citizen !== "holiday") return clarifyHoliday();
    if (!a.holidayCountry || !allListedCountries.includes(a.holidayCountry)) return clarifyHoliday();
    const visaFreeCountry = [...visaFreeHolidayCountries, "uk", "us"].includes(a.holidayCountry);
    const missionCountry = missionHolidayCountries.includes(a.holidayCountry);
    if ((a.citizen === "visafree" && !visaFreeCountry) || (a.citizen === "holiday" && !missionCountry)) return clarifyHoliday();
    if (a.holidayCountry === "uk" || a.holidayCountry === "us") return noHolidayProgram();
    if (!a.age || !["minor", "to30", "to34", "age35", "over"].includes(a.age)) return clarifyHoliday();

    const ageLimit = a.holidayCountry === "australia" || a.holidayCountry === "canada" ? 35 : a.holidayCountry === "korea" ? 34 : 30;
    if (a.age === "minor" || a.age === "over" || (a.age === "to34" && ageLimit < 34) || (a.age === "age35" && ageLimit < 35)) return {
      fit: "redirect", why, title: a.age === "minor" ? "Working Holiday доступен с 18 лет" : ageLimit === 35 ? "Для выбранной страны Working Holiday доступен до 35 лет" : ageLimit === 34 ? "Для выбранной страны Working Holiday доступен до 34 лет" : "Для выбранной страны Working Holiday доступен до 30 лет",
      summary: a.age === "minor" ? "Подать заявление на Working Holiday можно с 18 лет." : ageLimit === 35 ? "Возрастной предел для выбранной страны: 35 лет. Рассмотрите другие варианты переезда." : ageLimit === 34 ? "Возрастной предел для выбранной страны: 34 года. Рассмотрите другие варианты переезда." : "Возрастной предел для выбранной страны: 30 лет. Рассмотрите другие варианты переезда.",
      steps: [step("Выберите другой путь", "Chancenkarte подходит при признанном образовании, волонтёрская служба BFD: без ограничения возраста.", "Выбор", routes.chance, routes.volunteer)],
      next: routes.chance, note,
    };
    const older = a.age === "to34" || a.age === "age35";
    const holidayFacts: Fact[] = [
      { label: "Страны-партнёры", value: "Аргентина, Австралия, Бразилия, Чили, Гонконг, Израиль, Япония, Южная Корея, Новая Зеландия, Тайвань, Уругвай; для Канады действует молодёжная программа мобильности", kind: "official" },
      { label: "Возраст", value: "18–30 лет; Австралия и Канада – 18–35, Южная Корея – 18–34", kind: "official" },
      { label: "Срок", value: "до 12 месяцев; подработка разрешена, чтобы оплачивать поездку", kind: "official" },
    ];
    const missionInfoUrl = a.holidayCountry === "australia" ? o.workingHolidayAustralia : a.holidayCountry === "canada" ? o.youthMobilityCanada : o.workingHoliday;
    // Места подачи: Auswärtiges Amt (FAQ Working Holiday), сайты представительств в Австралии и Канаде, 05.11.2026.
    const missionLabel = ({
      korea: "Для Южной Кореи: посольство Германии в Сеуле",
      brazil: "Для Бразилии: представительство Германии в Бразилии",
      hongkong: "Для Гонконга: генеральное консульство Германии в Гонконге; заявитель живёт в Гонконге",
      taiwan: "Для Тайваня: Немецкий институт в Тайбэе",
      australia: "Любое представительство Германии; жителям Австралии: генеральное консульство в Сиднее",
      canada: "Жителям Канады: генеральное консульство Германии в Торонто",
    } as Record<string, string>)[a.holidayCountry] ?? "Любое представительство Германии за рубежом";
    const missionMethod: Method = {
      id: "mission", kind: "in-person", title: "Виза Working Holiday в представительстве Германии", summary: "Заявление подают до поездки в стране проживания.",
      availability: "available", availabilityLabel: missionLabel,
      conditions: ["Возраст на дату заявления в пределах программы", "Цель поездки: отдых с подработкой, а не постоянная работа"],
      documents: ["Паспорт", "Заявление на национальную визу", "Документы, которые перечисляет страница вашего представительства о Working Holiday"],
      facts: [...holidayFacts, visaFee],
      steps: [
        step("Проверьте, где вам подавать", "Auswärtiges Amt указывает для каждой страны-партнёра, в каком представительстве принимают заявления.", "Онлайн", act("Проверьте условия Working Holiday", missionInfoUrl)),
        step("Подайте заявление и придите на приём", "Заявление подают в представительство по месту проживания; на приёме сдают биометрию и оплачивают сбор.", "Лично", act("Auswärtiges Amt: общие правила виз", o.visaGeneral), act("Проверьте условия Working Holiday", missionInfoUrl)),
        step("После приезда зарегистрируйте адрес", "Регистрация в течение двух недель после заселения.", "Лично", routes.anmeldung),
      ],
    };
    const berlinMethod: Method = {
      id: "berlin", kind: "combined", title: "Без визы: заявление в LEA Берлина после въезда", summary: "Гражданам Австралии, Израиля, Японии, Новой Зеландии и Канады разрешение выдают в Берлине; заявление подают онлайн в течение 90 дней после въезда.",
      availability: "conditional", availabilityLabel: "Для Австралии, Израиля, Японии, Новой Зеландии и Канады; Великобритании и США программа недоступна",
      conditions: ["Основное место жительства в Берлине", "Не меньше 2 000 € собственных средств, например по выписке из банка", "Медицинская страховка для путешественников на 1 год", "Договор аренды и подтверждение текущей тёплой аренды", "Граждане Японии пока подают через контактную форму LEA, а не онлайн-заявление"],
      documents: [a.holidayCountry === "japan" ? "Обращение через контактную форму LEA (отдел F 1)" : "Онлайн-заявление «Befristeter Aufenthaltstitel zur Beschäftigung»", "Цветные копии паспорта со страницей отметки о въезде", "Meldebescheinigung о регистрации в Берлине", "Выписка о средствах и полис страховки"],
      facts: [...holidayFacts, { label: "Сбор LEA", value: "56 € за наклейку или 100 € за eAT, фото на месте 6 €; для граждан Японии без сбора", kind: "official" }],
      steps: [
        step("Зарегистрируйте адрес в Берлине", "Meldebescheinigung нужна для заявления.", "Лично", routes.anmeldung),
        ...(a.holidayCountry === "japan" ? [step("Напишите в LEA через контактную форму", "Для граждан Японии онлайн-заявление пока недоступно. Обращение принимает отдел F 1 LEA через контактную форму на странице услуги.", "Онлайн", act("Берлин: Working Holiday и Youth Mobility", o.berlinWorkingHoliday))] : [step("Подайте онлайн-заявление и оплатите сбор", "Файлы PDF, JPG или PNG до 7 МБ каждый и до 100 МБ вместе. Сохраните PDF-подтверждение.", "Онлайн", act("Берлин: Working Holiday и Youth Mobility", o.berlinWorkingHoliday))]),
        step("Придите на приём с оригиналами", "После положительной проверки LEA присылает приглашение; наклейку выдают на месте, eAT готов через 4–6 недель.", "Лично", act("Берлин: Working Holiday и Youth Mobility", o.berlinWorkingHoliday)),
      ],
    };
    const berlinEligible = ["australia", "israel", "japan", "newzealand", "canada"].includes(a.holidayCountry) && !(a.holidayCountry === "australia" && older);
    const methods = berlinEligible ? [berlinMethod, missionMethod] : [missionMethod];
    const summary = a.holidayCountry === "australia" && older
      ? "Австралия: возраст 31–35 лет допускает Working Holiday, но страница LEA Берлина пока указывает предел 30 лет; подавайте через представительство Германии."
      : older ? (ageLimit === 35 ? "Для выбранной страны возрастной предел: 35 лет. Проверьте условия и место подачи по официальной инструкции." : "Для выбранной страны возрастной предел: 34 года. Проверьте условия и место подачи по официальной инструкции.")
      : "Программа позволяет прожить в Германии до 12 месяцев и подрабатывать. Великобритания и США в программе не участвуют.";
    return {
      fit: older || berlinEligible ? "conditional" : "fits", why,
      title: "Working Holiday: год в Германии с подработкой",
      summary,
      methods, steps: methods[0].steps, ...(methods.length === 1 ? { singleMethodNote: "Для вашей страны заявление подают только в представительстве Германии, поэтому способ один." } : {}),
      next: routes.anmeldung, note,
    };
  }
  // Работа и поиск работы
  if (a.qual === "none") {
    if (a.goal === "job" && a.citizen === "balkan") return {
      fit: "redirect", why, title: "Ваш путь: Westbalkanregelung",
      summary: "Гражданам Албании, Боснии и Герцеговины, Косово, Северной Македонии, Черногории и Сербии можно работать в Германии на любой работе без признанной профессии, если работодатель даёт договор. Число разрешений ограничено квотой.",
      steps: [step("Откройте маршрут визы для работы", "Маршрут покажет предварительное согласие Bundesagentur für Arbeit и подачу визы.", "Выбор", routes.workVisa, act("Bundesagentur für Arbeit: Westbalkanregelung", o.westbalkan))],
      next: routes.workVisa, note,
    };
    return {
      fit: "redirect", why, title: "Без признанного образования путь начинается с профессии",
      summary: "Виза для работы и Chancenkarte требуют высшего образования или профессии от двух лет. Без них подходят Ausbildung, волонтёрская служба или, для граждан стран-партнёров, Working Holiday.",
      steps: withVisaFree([
        step("Получите профессию через Ausbildung", "До 35 лет можно приехать искать место Ausbildung, с договором – сразу на обучение.", "Выбор", routes.studyVisa, routes.study),
        step("Рассмотрите волонтёрскую службу", "Для службы не нужна профессия; на время службы вы застрахованы.", "Выбор", routes.volunteer),
      ]),
      next: routes.studyVisa, note,
    };
  }
  if (a.goal === "search") return {
    fit: "redirect", why, title: "Ваш путь: Chancenkarte",
    summary: "С признанным образованием можно приехать искать работу на срок до одного года по Chancenkarte. Маршрут посчитает баллы и покажет подачу.",
    steps: withVisaFree([step("Откройте маршрут Chancenkarte", "Маршрут проверит баллы по официальной таблице, средства и документы.", "Выбор", routes.chance, act("Make it in Germany: Chancenkarte", o.chance))]),
    next: routes.chance, note,
  };
  return {
    fit: "redirect", why, title: "Ваш путь: виза для работы",
    summary: "С предложением работодателя и признанным образованием подходят Blue Card, виза специалиста или Anerkennungspartnerschaft. Маршрут выберет вид визы по образованию и зарплате.",
    steps: withVisaFree([step("Откройте маршрут визы для работы", "Маршрут покажет вид визы, согласие Bundesagentur für Arbeit и подачу в Auslandsportal.", "Выбор", routes.workVisa)]),
    next: routes.workVisa, note,
  };
}

// ---------------------------------------------------------------------------
// 2. Chancenkarte
// ---------------------------------------------------------------------------
export const chanceQuestions = [
  q("qual", "Какое у вас образование?", [["full", "Полностью признано в Германии или получено в немецком вузе"], ["partial", "Есть решение о частичном признании в Германии"], ["state", "Признано государством в стране получения: высшее или профессиональное от 2 лет"], ["none", "Такого образования нет"]]),
  q("lang", "Какой у вас уровень языка?", [["a1", "Немецкий A1"], ["a2", "Немецкий A2"], ["b1", "Немецкий B1"], ["b2", "Немецкий B2 или выше"], ["en", "Немецкого нет, английский B2 или выше"], ["none", "Немецкий ниже A1 и английский ниже B2"]]),
  q("english", "Английский на уровне C1 или родной?", [["yes", "Да"], ["no", "Нет"]]),
  q("exp", "Сколько у вас опыта работы по этой профессии?", [["five", "Не меньше 5 лет за последние 7"], ["two", "Не меньше 2 лет за последние 5"], ["none", "Меньше"]]),
  q("age", "Сколько вам лет на дату заявления?", [["to34", "До 35 лет"], ["to40", "35–40 лет"], ["over", "41 год и больше"]]),
  q("shortage", "Ваша профессия в списке дефицитных в Германии?", [["yes", "Да"], ["no", "Нет или не знаю"]]),
  q("stay", "Вы законно жили в Германии не меньше 6 месяцев подряд за последние 5 лет, не как турист?", [["yes", "Да"], ["no", "Нет"]]),
  q("spouse", "Супруг или супруга тоже отвечает условиям Chancenkarte и подаёт вместе с вами?", [["yes", "Да"], ["no", "Нет"]]),
  q("funds", "Чем вы подтвердите средства на жизнь?", [["blocked", "Sperrkonto"], ["commitment", "Verpflichtungserklärung от человека в Германии"]]),
] as const;

export function chanceVisible(a: Answers): readonly Question[] {
  const [qual, lang, english, exp, age, shortage, stay, spouse, funds] = chanceQuestions;
  if (!a.qual || a.qual === "none") return [qual];
  if (a.qual === "full") return [qual, funds];
  if (!a.lang || a.lang === "none") return [qual, lang];
  return [qual, lang, english, exp, age, shortage, stay, spouse, funds];
}

export function chancePoints(a: Answers): number {
  let points = a.qual === "partial" ? 4 : 0;
  points += ({ a2: 1, b1: 2, b2: 3 } as Record<string, number>)[a.lang] ?? 0;
  if (a.english === "yes") points += 1;
  points += ({ five: 3, two: 2 } as Record<string, number>)[a.exp] ?? 0;
  points += ({ to34: 2, to40: 1 } as Record<string, number>)[a.age] ?? 0;
  if (a.shortage === "yes") points += 1;
  if (a.stay === "yes") points += 1;
  if (a.spouse === "yes") points += 1;
  return points;
}

export function chancePlan(a: Answers): Plan {
  const chance = act("Make it in Germany: Chancenkarte и баллы", o.chance);
  if (a.qual === "none") return {
    fit: "redirect", why: ["Нет признанного образования"], title: "Для Chancenkarte нужно образование",
    summary: "Chancenkarte выдают только с высшим образованием или профессией от двух лет, признанными государством в стране получения. Без них подходят Ausbildung или волонтёрская служба.",
    steps: [step("Выберите другой путь переезда", "Маршрут покажет пути без признанной профессии.", "Выбор", routes.relocation, chance), step("Получите профессию через Ausbildung", "До 35 лет можно приехать искать место Ausbildung.", "Выбор", routes.studyVisa)],
    next: routes.relocation, note,
  };
  if (a.qual !== "full" && a.lang === "none") return {
    fit: "insufficient", why: ["Нет нужного уровня языка"], title: "Сначала подтвердите язык",
    summary: "По системе баллов нужен немецкий не ниже A1 или английский не ниже B2. Без языкового сертификата заявление не рассматривают.",
    steps: [step("Выберите языковой курс", "Маршрут покажет курсы Goethe-Institut и другие варианты с сертификатом.", "Выбор", routes.course, chance), step("Вернитесь к маршруту с сертификатом", "После сертификата маршрут посчитает баллы.", "Выбор", routes.chance, chance)],
    next: routes.course, note,
  };
  const full = a.qual === "full";
  const points = full ? 0 : chancePoints(a);
  const why = full ? ["Образование полностью признано: вы считаетесь Fachkraft, баллы не нужны", a.funds === "commitment" ? "Средства: Verpflichtungserklärung" : "Средства: Sperrkonto"] : [
    a.qual === "partial" ? "Частичное признание: 4 балла" : "Образование признано в стране получения: 0 баллов",
    ({ a1: "Немецкий A1: 0 баллов", a2: "Немецкий A2: 1 балл", b1: "Немецкий B1: 2 балла", b2: "Немецкий B2: 3 балла", en: "Английский B2: 0 баллов" } as Record<string, string>)[a.lang],
    ...(a.english === "yes" ? ["Английский C1: 1 балл"] : []),
    ...(a.exp === "five" ? ["Опыт 5 лет за 7: 3 балла"] : a.exp === "two" ? ["Опыт 2 года за 5: 2 балла"] : []),
    ...(a.age === "to34" ? ["Возраст до 35: 2 балла"] : a.age === "to40" ? ["Возраст 35–40: 1 балл"] : []),
    ...(a.shortage === "yes" ? ["Дефицитная профессия: 1 балл"] : []),
    ...(a.stay === "yes" ? ["Пребывание в Германии: 1 балл"] : []),
    ...(a.spouse === "yes" ? ["Супруг или супруга с правом на Chancenkarte: 1 балл"] : []),
    `Сумма баллов: ${points} из нужных 6`,
  ].filter((x): x is string => Boolean(x));
  if (!full && points < 6) {
    const missing = 6 - points;
    return {
      fit: "insufficient", why, title: missing === 1 ? "Не хватает 1 балла до Chancenkarte" : `Не хватает ${missing} баллов до Chancenkarte`,
      summary: "Минимум по системе баллов: 6. Быстрее всего баллы добавляют язык (немецкий A2 – 1, B1 – 2, B2 – 3 балла) и частичное признание диплома в Германии (4 балла).",
      steps: [
        step("Поднимите уровень немецкого", "Каждый уровень после A1 даёт балл: A2, B1, B2 и выше.", "Выбор", routes.course, chance),
        step("Подайте на признание диплома в Германии", "Решение о частичном признании даёт сразу 4 балла, полное признание делает баллы ненужными. Подать можно из-за границы.", "Онлайн", routes.recognition, chance),
      ],
      next: routes.recognition, note,
    };
  }
  const blocked = a.funds !== "commitment";
  const documents = [
    "Паспорт",
    full ? "Подтверждение признания: распечатки anabin, оценка ZAB или Anerkennungsbescheid" : a.qual === "partial" ? "Решение о частичном признании (Anerkennungsbescheid)" : "Для высшего образования положительный результат anabin или оценка ZAB, для профессии – положительная «Digitale Auskunft zur Berufsqualifikation» от ZAB",
    ...(full ? [] : ["Сертификат языка", ...(a.exp !== "none" ? ["Подтверждение опыта работы: справки или Arbeitszeugnisse"] : [])]),
    blocked ? "Подтверждение Sperrkonto на 1 091 € в месяц" : "Оригинал Verpflichtungserklärung из ведомства по делам иностранцев в Германии",
    "Подтверждение медицинской страховки на время пребывания",
    "Резюме",
  ];
  const facts: Fact[] = [
    { label: "Средства на жизнь", value: "Sperrkonto не меньше 1 091 € нетто в месяц (2026 год) или Verpflichtungserklärung", kind: "official" },
    { label: "Срок", value: "до 1 года; если найдена квалифицированная работа, а другой вид на жительство не подходит, продление до 2 лет", kind: "official" },
    { label: "Работа во время поиска", value: "подработка до 20 часов в неделю и пробная работа до 2 недель у каждого работодателя", kind: "official" },
  ];
  const methods = visaMethods(documents, facts, blockedExtra(blocked), blocked ? [step("Откройте Sperrkonto", "Положите на счёт сумму на весь срок: 1 091 € в месяц. Подтверждение банка нужно для заявления. Варианты провайдеров ниже.", "Онлайн", act("Auswärtiges Amt: Sperrkonto", o.blockedAccount), chance)] : [step("Получите Verpflichtungserklärung", "Человек в Германии подписывает обязательство покрыть ваши расходы в своём ведомстве по делам иностранцев и присылает вам оригинал.", "Выбор", chance)]);
  return {
    fit: "fits", why,
    title: full ? "Chancenkarte для специалиста без баллов" : "Вы набираете баллы для Chancenkarte",
    summary: "Chancenkarte позволяет приехать на срок до одного года и искать работу на месте, подрабатывая. Заявление подают до приезда; найдя квалифицированную работу, вы переходите на вид на жительство для работы.",
    methods, steps: methods[0].steps,
    next: routes.workPermit, note,
  };
}

// ---------------------------------------------------------------------------
// 3. Виза для работы: Blue Card, специалисты, Anerkennungspartnerschaft, Westbalkanregelung
// ---------------------------------------------------------------------------
export const workVisaQuestions = [
  q("offer", "Есть ли у вас трудовой договор или письменное предложение от работодателя в Германии?", [["yes", "Да"], ["no", "Нет, хочу сначала искать работу"]]),
  q("qual", "Какое у вас образование?", [["degree", "Высшее: диплом есть в anabin с оценкой H+ или есть оценка ZAB"], ["voc", "Профессия, признанная в Германии решением о признании"], ["open", "Высшее или профессия от 2 лет признаны в своей стране, в Германии ещё нет"], ["it", "IT-специалист без диплома"], ["none", "Без профессионального образования"]]),
  q("salary", "Какая годовая брутто-зарплата по договору?", [["high", "50 700 € и больше"], ["mid", "45 934,20–50 699 €, профессия дефицитная или MINT либо диплом не старше 3 лет"], ["other", "Меньше или без этих условий"]]),
  q("german", "Какой у вас немецкий?", [["a2", "A2 или выше"], ["below", "Ниже A2"]]),
  q("regulated", "Для работы по профессии нужно разрешение (врач, медсестра, учитель, инженер с допуском)?", [["yes", "Да"], ["no", "Нет"]]),
  q("license", "Вы получили профессиональное разрешение для регулируемой профессии?", [["yes", "Да, разрешение уже получено"], ["promised", "Ведомство письменно обещало выдать разрешение (Zusage)"], ["no", "Нет, разрешение ещё не получено"], ["unknown", "Не знаю"]]),
  q("balkan", "Вы гражданин Албании, Боснии и Герцеговины, Косово, Северной Македонии, Черногории или Сербии?", [["yes", "Да"], ["no", "Нет"]]),
  q("visafree", `Вы гражданин одной из стран: ${visaFreeCountries}?`, [["yes", "Да"], ["no", "Нет"]]),
] as const;

export function workVisaVisible(a: Answers): readonly Question[] {
  const [offer, qual, salary, german, regulated, license, balkan, visafree] = workVisaQuestions;
  if (a.offer !== "yes") return [offer];
  const list: Question[] = [offer, qual];
  if (!a.qual || a.qual === "it") return list;
  if (a.qual === "none") { list.push(balkan); if (a.balkan !== "yes") return list; }
  if (a.qual === "degree") list.push(salary);
  if (a.qual === "open") { list.push(german); if (a.german !== "a2") return list; }
  if (a.qual === "degree" || a.qual === "voc") {
    list.push(regulated);
    // Гражданство влияет только на подачу; без разрешения или его обещания маршрут ведёт к признанию.
    if (a.regulated === "yes") { list.push(license); if (a.license !== "yes" && a.license !== "promised") return list; }
  }
  if (a.qual !== "none") list.push(visafree);
  return list;
}

export function workVisaPlan(a: Answers): Plan {
  const approval = act("Make it in Germany: согласие Bundesagentur für Arbeit", o.employerApproval);
  const pre = act("Bundesagentur für Arbeit: Vorabzustimmung", o.preApproval);
  if (a.offer === "no") return {
    fit: "redirect", why: ["Предложения о работе пока нет"], title: "Без предложения начните с Chancenkarte",
    summary: "Виза для работы выдаётся на конкретную должность. Чтобы приехать и искать работу на месте, подходит Chancenkarte.",
    steps: [step("Откройте маршрут Chancenkarte", "Маршрут посчитает баллы и покажет подачу.", "Выбор", routes.chance, act("Make it in Germany: Chancenkarte", o.chance))], next: routes.chance, note,
  };
  if (a.qual === "it") return {
    fit: "redirect", why: ["IT-специалист без диплома"], title: "IT-путь без диплома описан в маршруте вида на жительство для работы",
    summary: "Для IT-специалистов без диплома действует отдельный путь по опыту работы с порогом зарплаты. Он описан вместе с подачей из-за границы в маршруте вида на жительство для работы.",
    steps: [step("Откройте маршрут вида на жительство для работы", "Выберите в нём «За пределами Германии» и «IT-специалист без диплома».", "Выбор", routes.workPermit)], next: routes.workPermit, note,
  };
  if (a.qual === "none" && a.balkan !== "yes") return {
    fit: "redirect", why: ["Нет профессионального образования"], title: "По рассмотренным основаниям виза квалифицированного специалиста не подходит",
    summary: "Для визы специалиста нужно высшее образование или профессия. Без неё подходят Ausbildung, волонтёрская служба или, если вы гражданин страны-партнёра, Working Holiday.",
    steps: [step("Посмотрите другие пути переезда", "Маршрут покажет пути без признанной профессии.", "Выбор", routes.relocation), step("Получите профессию через Ausbildung", "С договором на Ausbildung выдают отдельную визу.", "Выбор", routes.studyVisa)], next: routes.relocation, note,
  };
  if (a.qual === "open" && a.german === "below") return {
    fit: "insufficient", why: ["Образование признано в своей стране", "Немецкий ниже A2"], title: "Для Anerkennungspartnerschaft нужен немецкий A2",
    summary: "Без признания в Германии работать по профессии можно через Anerkennungspartnerschaft: признание проходит уже после въезда, в ходе работы. Для этого нужен немецкий не ниже A2. Другой вариант: получить признание до переезда.",
    steps: [
      step("Доведите немецкий до A2", "Маршрут покажет курсы с сертификатом.", "Выбор", routes.course, act("Make it in Germany: Anerkennungspartnerschaft", o.partnership)),
      step("Или подайте на признание из-за границы", "С решением о признании подходит обычная виза специалиста.", "Онлайн", routes.recognition),
    ],
    next: routes.recognition, note,
  };
  if ((a.qual === "degree" || a.qual === "voc") && a.regulated === "yes" && a.license !== "yes" && a.license !== "promised") {
    const licenseSource = act("Make it in Germany: разрешение для регулируемой профессии", o.professionLicense);
    const lawSource = act("§ 18 AufenthG: условия для специалистов", o.law18);
    return {
      fit: a.license === "no" ? "conditional" : "clarify",
      why: ["Регулируемая профессия", a.license === "no" ? "Профессиональное разрешение ещё не получено" : "Профессиональное разрешение не подтверждено"],
      title: "Сначала получите разрешение для этой профессии",
      summary: "Для работы по регулируемой профессии к выдаче вида на жительство нужно профессиональное разрешение или письменное обещание ведомства его выдать (Zusage). Когда один из этих документов будет, вернитесь к визовому маршруту.",
      steps: [step("Проверьте порядок получения разрешения", "Вид на жительство для работы выдают, когда профессиональное разрешение уже выдано или ведомство письменно обещало его выдать. Откройте маршрут признания: он покажет следующий шаг.", "Выбор", routes.recognition, licenseSource), step("Условие в законе", "§ 18 AufenthG: профессиональное разрешение выдано или обещано (zugesagt), если оно требуется.", "Выбор", lawSource)],
      next: routes.recognition, note,
    };
  }
  const visaFree = a.visafree === "yes";
  const regulated = a.regulated === "yes" && a.qual !== "open";
  const licensePromised = regulated && a.license === "promised";
  type Kind = "bcHigh" | "bcMid" | "academic" | "vocational" | "partnership" | "balkan";
  const kind: Kind = a.qual === "none" ? "balkan" : a.qual === "open" ? "partnership" : a.qual === "voc" ? "vocational" : a.salary === "high" ? "bcHigh" : a.salary === "mid" ? "bcMid" : "academic";
  const needsApproval = kind !== "bcHigh";
  const titles: Record<Kind, string> = {
    bcHigh: "Виза для Blue Card без согласия Bundesagentur für Arbeit",
    bcMid: "Виза для Blue Card по сниженному порогу",
    academic: "Виза специалиста с высшим образованием",
    vocational: "Виза специалиста с профессиональным образованием",
    partnership: "Виза по Anerkennungspartnerschaft",
    balkan: "Виза по Westbalkanregelung",
  };
  const summaries: Record<Kind, string> = {
    bcHigh: "При зарплате от 50 700 € в год Blue Card выдают без проверки Bundesagentur für Arbeit. Заявление на визу подают в Auslandsportal до переезда.",
    bcMid: "По сниженному порогу Blue Card выдают с согласия Bundesagentur für Arbeit. Работодатель может получить его заранее через Vorabzustimmung: это ускоряет визу.",
    academic: "Если зарплата не проходит порог Blue Card, с высшим образованием выдают визу специалиста. Нужна квалифицированная должность и согласие Bundesagentur für Arbeit.",
    vocational: "С признанной в Германии профессией выдают визу специалиста на квалифицированную должность с согласия Bundesagentur für Arbeit.",
    partnership: "Вы приезжаете работать, а признание диплома проходите уже в Германии вместе с работодателем. Начните признание сразу после въезда.",
    balkan: "Работа любого вида, кроме регулируемых профессий (например, врача), без признанной профессии, если работодатель даёт договор на условиях, как у работников из Германии. Разрешения выдаются в пределах квоты.",
  };
  const kindWhy: Record<Kind, string> = { bcHigh: "Высшее образование и зарплата от 50 700 €", bcMid: "Высшее образование и сниженный порог Blue Card", academic: "Высшее образование, зарплата ниже порога Blue Card", vocational: "Профессия признана в Германии", partnership: "Образование признано в своей стране, немецкий от A2", balkan: "Гражданство страны Западных Балкан" };
  const why = ["Есть предложение о работе", kindWhy[kind], ...(regulated ? ["Регулируемая профессия", licensePromised ? "Ведомство письменно обещало выдать разрешение (Zusage)" : "Профессиональное разрешение получено"] : []), ...(visaFree ? ["Можно получить вид на жительство без визы"] : [])];

  const facts: Fact[] = [
    ...(kind === "bcHigh" || kind === "bcMid" ? [{ label: "Порог Blue Card на 2026 год", value: "50 700 € брутто в год; 45 934,20 € для MINT, дефицитных профессий и выпускников последних 3 лет", kind: "official" as const }] : []),
    { label: "Согласие Bundesagentur für Arbeit", value: needsApproval ? "нужно; его запрашивает представительство, работодатель может получить заранее через Vorabzustimmung" : "не нужно при зарплате не ниже 50% годовой границы взносов в пенсионное страхование (2026 год: 50 700 € брутто)", kind: "official" },
    ...(needsApproval ? [{ label: "Vorabzustimmung", value: "действует 9 месяцев с даты выдачи: за это время должна быть выдана виза", kind: "official" as const }] : []),
    ...(kind === "partnership" ? [{ label: "Срок и работа", value: "сначала до 12 месяцев, продление по году до 3 лет; кроме работы по договору: подработка до 20 часов в неделю", kind: "official" as const }] : []),
    ...(regulated ? [{ label: "Профессиональное разрешение", value: "к выдаче вида на жительство разрешение должно быть выдано или письменно обещано ведомством (Zusage)", kind: "official" as const }] : []),
    ...(kind === "balkan" ? [{ label: "Квота", value: "до 50 000 согласий в год, распределяются по месяцам и странам; нельзя было получать пособие AsylbLG последние 24 месяца; с 45 лет при первом согласии зарплата от 55 770 € в год или пенсионное обеспечение; первое согласие: только при подаче в представительстве Германии в одной из шести стран", kind: "official" as const }] : []),
  ];
  const insuranceDoc = "Медицинская страховка до начала работы: обязательное страхование работника начинается с проживания и работы в Германии";
  const documents = [
    "Паспорт с двумя чистыми страницами",
    "Резюме на немецком или английском",
    "Трудовой договор или письменное предложение",
    "Erklärung zum Beschäftigungsverhältnis, заполненная и подписанная работодателем",
    ...(kind === "bcHigh" || kind === "bcMid" || kind === "academic" ? ["Диплом с приложением и распечатки anabin о дипломе и вузе или оценка ZAB"] : []),
    ...(kind === "vocational" ? ["Решение о признании профессии в Германии"] : []),
    ...(kind === "partnership" ? ["Подтверждение образования: для высшего – положительный результат в anabin или оценка ZAB, для профессии – положительная «Auskunft zur Berufsqualifikation» от ZAB", "Сертификат немецкого A2", "Соглашение с работодателем о прохождении признания"] : []),
    ...(regulated ? [licensePromised ? "Письменное обещание ведомства выдать профессиональное разрешение (Zusage)" : "Профессиональное разрешение для работы по регулируемой профессии"] : []),
    ...(needsApproval ? ["Vorabzustimmung, если работодатель её получил"] : []),
    insuranceDoc,
  ];
  const prefix: Step[] = needsApproval ? [step("Работодатель запрашивает Vorabzustimmung", "Работодатель подаёт онлайн-заявление в Bundesagentur für Arbeit с Erklärung zum Beschäftigungsverhältnis и пересылает вам согласие. Подайте его вместе с заявлением на визу.", "Онлайн", pre, kind === "balkan" ? act("Bundesagentur für Arbeit: Westbalkanregelung", o.westbalkan) : kind === "partnership" ? act("Make it in Germany: Anerkennungspartnerschaft", o.partnership) : approval)] : [];
  const methods = visaMethods(documents, facts, {}, prefix);
  if (visaFree) methods.unshift({
    id: "berlin", kind: "combined", title: "Без визы: заявление в LEA Берлина после въезда", summary: "Гражданам этих стран вид на жительство для работы выдают в Берлине без визы. Заявление подают онлайн в течение 90 дней после въезда.",
    availability: "available", availabilityLabel: "Для граждан стран из § 41 AufenthV",
    conditions: ["Въезд не раньше чем за 90 дней до заявления или действующий вид на жительство", "Основное место жительства в Берлине", "Оплата картой или PayPal до отправки"],
    documents: [...documents.filter((item) => item !== insuranceDoc), "Meldebescheinigung о регистрации в Берлине", "Подтверждение медицинской страховки"],
    facts: [{ label: "Сбор LEA", value: "56 € за наклейку или 100 € за eAT при первом выпуске, фото на месте 6 €", kind: "official" }, ...facts],
    steps: [...prefix,
      step("Въезжайте и зарегистрируйте адрес", "Регистрация в течение двух недель после заселения; Meldebescheinigung нужна для заявления.", "Лично", routes.anmeldung, act("§ 41 AufenthV: въезд без визы", o.law41)),
      step("Подайте онлайн-заявление в LEA", "Форма «Befristeter Aufenthaltstitel zur Beschäftigung»; файлы до 7 МБ каждый и до 100 МБ вместе. Сохраните PDF-подтверждение.", "Онлайн", act("Берлин: вид на жительство для работы без визы", o.berlinVisaFree), kind === "bcHigh" || kind === "bcMid" ? act("Берлин: Blaue Karte EU", o.berlinBlueCard) : undefined),
      step("Придите на приём с оригиналами", "LEA проверяет заявление и присылает приглашение; на приёме нужны оригиналы документов.", "Лично", act("Берлин: вид на жительство для работы без визы", o.berlinVisaFree)),
    ],
  });
  return {
    fit: kind === "balkan" ? "conditional" : "fits", why, title: titles[kind], summary: summaries[kind],
    methods, steps: methods[0].steps, next: routes.workPermit, note,
  };
}

// ---------------------------------------------------------------------------
// 4. Виза для волонтёров: BFD, FSJ, FÖJ, Европейский корпус солидарности
// ---------------------------------------------------------------------------
export const volunteerQuestions = [
  q("program", "Какая служба вас интересует?", [["bfd", "Bundesfreiwilligendienst (BFD): место уже есть"], ["fsj", "FSJ или FÖJ: место уже есть"], ["esc", "Европейский корпус солидарности: место уже есть"], ["none", "Места пока нет"]]),
  q("age", "Сколько вам лет?", [["under18", "Младше 18 лет"], ["to26", "18–26 лет"], ["to30", "27–30 лет"], ["to35", "31–35 лет"], ["over", "36 лет и больше"]]),
  q("lodging", "Даёт ли место службы жильё и питание?", [["yes", "Да, и жильё, и питание"], ["part", "Только часть или ничего"]]),
  q("visafree", `Вы гражданин одной из стран: ${visaFreeCountries}?`, [["yes", "Да"], ["no", "Нет"]]),
] as const;

export function volunteerVisible(a: Answers): readonly Question[] {
  const [program, age, lodging, visafree] = volunteerQuestions;
  if (!a.program) return [program];
  const list: Question[] = [program, age];
  if (a.program === "none" || !a.age) return list;
  if ((a.program === "esc" && (a.age === "to35" || a.age === "over" || a.age === "under18")) || a.program === "fsj" || (a.program === "bfd" && a.age === "under18")) return list;
  list.push(lodging, visafree);
  return list;
}

export function volunteerPlan(a: Answers): Plan {
  const bfdAz = act("Bundesfreiwilligendienst: от А до Я", o.bfdAz);
  const bfdSearch = act("Bundesfreiwilligendienst: поиск места", o.bfdSearch);
  const esc = act("Европейский корпус солидарности", o.esc);
  const ageWhy = ({ under18: "Возраст младше 18 лет", to26: "Возраст 18–26 лет", to30: "Возраст 27–30 лет", to35: "Возраст 31–35 лет", over: "Возраст 36 лет и больше" } as Record<string, string>)[a.age];
  if (a.program === "none") {
    const young = a.age !== "over";
    return {
      fit: "insufficient", why: ["Места службы пока нет", ageWhy].filter((x): x is string => Boolean(x)), title: "Сначала найдите место службы",
      summary: young ? "Виза для волонтёров выдаётся только по договору с местом службы. BFD открыт для любого возраста, FSJ и FÖJ – до 27 лет, Европейский корпус солидарности – с 18 до 30 лет." : "Виза для волонтёров выдаётся только по договору с местом службы. После 30 лет остаётся BFD: у него нет верхней границы возраста.",
      steps: [
        step("Найдите место BFD", "В базе Bundesfreiwilligendienst ищут место службы или предложение и пишут напрямую в Einsatzstelle. Центрального приёма и единых сроков подачи нет; у отдельных мест службы свои сроки.", "Онлайн", bfdSearch, act("Bundesfreiwilligendienst: вопросы и ответы", o.bfdFaq)),
        ...((a.age === "under18" || a.age === "to26") ? [step("Проверьте условия FSJ или FÖJ", "Нужно завершить обязательное очное школьное обучение, а служба должна закончиться до 27-летия. Свободные места публикуют признанные организации.", "Онлайн", act("Jugendfreiwilligendienste: FAQ FSJ/FÖJ", o.fsjFaq))] : []),
        ...((a.age === "to26" || a.age === "to30") ? [step("Или зарегистрируйтесь в Европейском корпусе солидарности", "Регистрация с 17 лет, служба с 18 и до 30 лет на дату начала. После регистрации вы откликаетесь на проекты организаций.", "Онлайн", esc, act("Европейский корпус солидарности: возрастные условия", o.escAge))] : []),
        step("Вернитесь к маршруту с договором", "С договором маршрут покажет документы для визы.", "Выбор", routes.volunteer),
      ],
      next: routes.volunteer, note,
    };
  }
  if (a.program === "esc" && a.age === "under18") return {
    fit: "conditional", why: ["Европейский корпус солидарности", ageWhy], title: "Участие в проектах возможно с 18 лет",
    summary: "Зарегистрироваться можно с 17 лет, но начать волонтёрскую службу в Европейском корпусе солидарности можно только с 18 лет.",
    steps: [step("Проверьте условия участия", "Подберите проект с датой начала после достижения 18 лет. Регистрация в программе доступна с 17 лет.", "Онлайн", esc, act("Европейский корпус солидарности: кто может участвовать", o.escFaq))],
    next: routes.volunteer, note,
  };
  if (a.program === "esc" && (a.age === "to35" || a.age === "over")) return {
    fit: "redirect", why: ["Европейский корпус солидарности", ageWhy, "Служба в Германии: возрастной предел 30 лет"], title: "Для службы в Германии ESC доступен до 30 лет",
    summary: "Волонтёрство ESC в странах ЕС доступно до 30 лет на дату начала. Гуманитарное волонтёрство ESC до 35 лет проходит только в странах вне ЕС, поэтому для службы в Германии оно не подходит. BFD не имеет верхней границы возраста.",
    steps: [
      step("Найдите место BFD", "В базе Bundesfreiwilligendienst ищут место службы и пишут напрямую в Einsatzstelle.", "Онлайн", bfdSearch, bfdAz),
      step("Возрастные условия ESC", "До 30 лет на дату начала; до 35 лет: только гуманитарное волонтёрство в странах вне ЕС.", "Онлайн", act("Европейский корпус солидарности: возрастные условия", o.escAge), act("Европейский корпус солидарности: гуманитарное волонтёрство", o.escHumanitarian)),
    ],
    next: routes.volunteer, note,
  };
  if (a.program === "bfd" && a.age === "under18") return {
    fit: "conditional", why: ["Bundesfreiwilligendienst", ageWhy],
    title: "Для несовершеннолетних действуют дополнительные условия",
    summary: "Для BFD нет общего минимального возраста, но необходимо завершить обязательное школьное обучение. Условия FSJ и FÖJ отличаются; они не подтверждены одним выбором BFD.",
    steps: [step("Проверьте требования BFD к началу службы", "Проверьте окончание обязательного школьного обучения и условия места службы до оформления документов.", "Онлайн", bfdAz, act("Bundesfreiwilligendienst: вопросы и ответы", o.bfdFaq))],
    next: routes.volunteer, note,
  };
  if (a.program === "fsj") return {
    fit: a.age === "to30" || a.age === "over" ? "redirect" : "conditional",
    why: ["FSJ или FÖJ", ageWhy],
    title: a.age === "to30" || a.age === "over" ? "FSJ и FÖJ доступны до 27 лет" : "Проверьте условия FSJ или FÖJ",
    summary: a.age === "to30" || a.age === "over" ? "После 27 лет рассмотрите BFD: у него нет верхней возрастной границы." : "FSJ и FÖJ отличаются от BFD. До подачи заявления проверьте условия своей программы и договор.",
    steps: [step("Проверьте условия программы", "Определите, относится ли место к FSJ или FÖJ. Нужно завершить обязательное очное школьное обучение, а служба должна закончиться до 27-летия. Не используйте список документов BFD как универсальный.", "Онлайн", act("Берлин: волонтёрская служба", o.berlinVolunteer), act("Jugendfreiwilligendienste: FAQ FSJ/FÖJ", o.fsjFaq))],
    next: routes.volunteer, note,
  };
  const bfd = a.program === "bfd";
  const ownMoney = a.lodging === "part";
  const visaFree = a.visafree === "yes";
  const why = [bfd ? ("Bundesfreiwilligendienst (BFD)") : "Европейский корпус солидарности", ageWhy, ownMoney ? "Жильё или питание не полностью от места службы" : "Жильё и питание от места службы", ...(visaFree ? ["Можно получить вид на жительство без визы"] : [])].filter((x): x is string => Boolean(x));
  const facts: Fact[] = bfd ? [
    { label: "Срок службы BFD", value: "от 6 до 18 месяцев, обычно 12; в исключительных случаях до 24", kind: "official" },
    { label: "Карманные деньги", value: "не больше 676 € в месяц (январь 2026 года); сумму договаривают с местом службы", kind: "official" },
    { label: "Страховка", value: "на время службы вы в государственном медицинском, пенсионном и других видах страхования; взносы платит место службы", kind: "official" },
    ...(a.age === "to26" ? [{ label: "Семинары", value: "до 27 лет: 25 семинарских дней за 12 месяцев и 5-дневный семинар политического образования; бесплатно и в рабочее время", kind: "official" as const }] : [{ label: "Семинары", value: "с 27 лет: не меньше одного семинарского дня в месяц, бесплатно и в рабочее время", kind: "official" as const }]),
  ] : [
    { label: "Срок вида на жительство", value: "на срок договора, но не больше одного года", kind: "official" },
    { label: "Возраст", value: "регистрация с 17 лет, служба с 18 лет и до 30 лет на дату начала", kind: "official" },
  ];
  const documents = [
    "Паспорт",
    bfd ? "Письменный договор с местом службы или с Bundesamt für Familie und zivilgesellschaftliche Aufgaben" : "Договор с принимающей организацией: задачи, срок и часы службы, условия и сопровождение, средства на жильё и жизнь, карманные деньги, обучение",
    ...(ownMoney ? ["Подтверждение недостающих средств: Sperrkonto или Verpflichtungserklärung"] : []),
    "Подтверждение медицинской страховки",
    "Резюме и мотивационное письмо",
  ];
  const lodgingFact: Fact = { label: "Средства на жизнь", value: ownMoney ? "карманные деньги вместе с жильём и питанием от места службы должны покрывать базовую ставку пособия по SGB II или XII; недостающее подтверждают Sperrkonto или Verpflichtungserklärung" : "карманные деньги вместе с жильём и питанием от места службы должны покрывать базовую ставку пособия по SGB II или XII", kind: "official" };
  const agreement = bfd
    ? step("Подпишите договор о службе", "Договор заключают с местом службы или с Bundesamt für Familie und zivilgesellschaftliche Aufgaben; в нём указаны срок, карманные деньги, жильё и питание. Для визы нужен оригинал, подписанный всеми сторонами.", "Выбор", bfdAz, act("Берлин: вид на жительство для волонтёрской службы", o.berlinVolunteer))
    : step("Проверьте договор с организацией", "По закону в договоре должны быть: описание службы, срок и часы, условия и сопровождение, средства на жильё и жизнь, минимальные карманные деньги на весь срок и обучение.", "Выбор", act("§ 19e AufenthG: европейская волонтёрская служба", o.law19e), esc);
  const methods = visaMethods(documents, [...facts, lodgingFact], blockedExtra(ownMoney), [agreement]);
  if (visaFree) methods.unshift({
    id: "berlin", kind: "combined", title: "Без визы: заявление в LEA Берлина после въезда", summary: "Гражданам этих стран разрешение для службы в Берлине выдают после въезда без визы.",
    availability: "available", availabilityLabel: "Для граждан стран из § 41 AufenthV",
    conditions: ["Основное место жительства в Берлине на время службы", "Служба в полную занятость; другая работа и своё дело не разрешены", "Оплата картой или PayPal до отправки"],
    documents: [...documents, "Meldebescheinigung или договор аренды с Wohnungsgeberbestätigung"],
    facts: [{ label: "Сбор LEA", value: "56 € за наклейку или 100 € за eAT при первом выпуске, фото на месте 6 €", kind: "official" }, ...facts],
    steps: [agreement,
      step("Въезжайте и зарегистрируйте адрес", "Регистрация в течение двух недель после заселения.", "Лично", routes.anmeldung, act("§ 41 AufenthV: въезд без визы", o.law41)),
      step("Подайте онлайн-заявление в LEA", "Форма «Befristeter Aufenthaltstitel zur Beschäftigung»; приложите оригинал договора, страховку и подтверждение адреса. Сохраните PDF-подтверждение.", "Онлайн", act("Берлин: вид на жительство для волонтёрской службы", o.berlinVolunteer)),
      step("Придите на приём с оригиналами", "Наклейку выдают на месте, eAT готов через 4–6 недель.", "Лично", act("Берлин: вид на жительство для волонтёрской службы", o.berlinVolunteer)),
    ],
  });
  return {
    fit: "fits", why,
    title: bfd ? "Виза для Bundesfreiwilligendienst (BFD)" : "Виза для Европейского корпуса солидарности",
    summary: bfd ? "С договором о службе виза выдаётся для волонтёрской работы. Место службы платит карманные деньги и страховые взносы, может дать жильё и питание." : "Служба по программе ЕС: принимающая организация берёт на себя жильё и расходы на жизнь по договору. Вид на жительство выдают на срок службы, но не больше года.",
    methods, steps: methods[0].steps,
    next: visaFree ? routes.anmeldung : routes.lea, note,
  };
}

// ---------------------------------------------------------------------------
// 5. Виза для учёбы и Ausbildung
// ---------------------------------------------------------------------------
export const studyVisaQuestions = [
  q("goal", "Какая у вас цель?", [["study", "Учёба: есть Zulassung в вуз или Studienkolleg"], ["apply", "Поступление: подаю документы или жду ответа вуза"], ["ausbildung", "Ausbildung: есть договор или место"], ["search", "Поиск места Ausbildung на месте"]]),
  q("admission", "Есть ли в письме о Zulassung условие?", [["full", "Без условий"], ["prep", "С условием: сначала языковой курс или Studienkolleg"]]),
  q("age", "Сколько вам лет?", [["to34", "До 35 лет"], ["over", "35 и больше"]]),
  q("german", "Какой у вас немецкий?", [["b1", "B1 или выше"], ["below", "Ниже B1"]]),
  q("type", "Где проходит Ausbildung?", [["company", "На предприятии с зарплатой за обучение"], ["school", "В профессиональной школе"]]),
  q("pay", "Сколько платят за обучение в месяц по договору?", [["enough", "Не меньше 1 048 € брутто или 822 € нетто"], ["less", "Меньше"]]),
  q("languageEvidence", "Есть ли подтверждение достаточного немецкого для Ausbildung без сертификата B1?", [["tested", "Место обучения проверило язык и письменно подтвердило, что его достаточно"], ["course", "Есть подтверждение записи на подготовительный курс немецкого"], ["none", "Нет ни одного из этих подтверждений"]]),
  q("funds", "Чем вы подтвердите средства на жизнь?", [["blocked", "Sperrkonto"], ["commitment", "Verpflichtungserklärung от человека в Германии"], ["grant", "Стипендия"]]),
] as const;

export function studyVisaVisible(a: Answers): readonly Question[] {
  const [goal, admission, age, german, type, pay, languageEvidence, funds] = studyVisaQuestions;
  if (!a.goal) return [goal];
  const list: Question[] = [goal];
  if (a.goal === "study") list.push(admission);
  if (a.goal === "search") { list.push(age); if (a.age !== "to34") return list; }
  if (a.goal === "search") { list.push(german); if (a.german !== "b1") return list; }
  if (a.goal === "ausbildung") {
    list.push(german);
    if (!a.german) return list;
    list.push(type);
    if (!a.type) return list;
    if (a.type === "company") { list.push(pay); if (!a.pay) return list; }
    if (a.german === "below") { list.push(languageEvidence); if (!a.languageEvidence || a.languageEvidence === "none") return list; }
    if (a.type === "company" && a.pay !== "less") return list;
  }
  list.push(funds);
  return list;
}

export function studyVisaPlan(a: Answers): Plan {
  const searchPdf = act("Make it in Germany: виза для поиска места Ausbildung", o.ausbildungSearch);
  const ausbildung = act("Make it in Germany: виза для Ausbildung", o.ausbildungVisa);
  const goalWhy = ({ study: "Цель: учёба", apply: "Цель: поступление", ausbildung: "Цель: Ausbildung", search: "Цель: поиск места Ausbildung" } as Record<string, string>)[a.goal];
  if (a.goal === "search" && a.age === "over") return {
    fit: "redirect", why: [goalWhy, "Возраст 35 и больше"], title: "Виза для поиска места Ausbildung: до 35 лет",
    summary: "Приехать искать место Ausbildung можно только до 35 лет. После этого возраста виза выдаётся, если договор на Ausbildung уже есть: искать место можно из своей страны.",
    steps: [step("Ищите место Ausbildung из своей страны", "Маршрут поступления покажет поиск мест Ausbildung Arbeitsagentur.", "Онлайн", routes.study, searchPdf), step("С договором вернитесь к маршруту", "Выберите цель «Ausbildung: есть договор или место».", "Выбор", routes.studyVisa, ausbildung)],
    next: routes.study, note,
  };
  if ((a.goal === "search" && a.german === "below") || (a.goal === "ausbildung" && a.german === "below" && (!a.languageEvidence || a.languageEvidence === "none"))) return {
    fit: "insufficient", why: [goalWhy, "Немецкий ниже B1"], title: "Для Ausbildung нужен немецкий B1",
    summary: a.goal === "search" ? "Для визы поиска места Ausbildung нужен сертификат немецкого B1." : "Для Ausbildung обычно нужен немецкий B1. Без сертификата приложите письменное подтверждение места обучения, что немецкого достаточно, или подтверждение записи на подготовительный курс немецкого. Пока такого документа нет, сначала получите подтверждение языка.",
    steps: [step("Выберите языковой курс с сертификатом", "Маршрут покажет курсы, которые заканчиваются признаваемым экзаменом.", "Выбор", routes.course, a.goal === "search" ? searchPdf : ausbildung), step("С сертификатом B1 вернитесь к маршруту", "Маршрут покажет средства и подачу.", "Выбор", routes.studyVisa)],
    next: routes.course, note,
  };
  const blocked = a.funds === "blocked";
  const companyPaid = a.goal === "ausbildung" && a.type === "company" && a.pay === "enough";
  const fundsWhy = companyPaid ? "Средства: зарплата за обучение" : ({ blocked: "Средства: Sperrkonto", commitment: "Средства: Verpflichtungserklärung", grant: "Средства: стипендия" } as Record<string, string>)[a.funds];
  const languageEvidenceText = a.languageEvidence === "tested" ? "Место обучения проверило язык и письменно подтвердило, что его достаточно" : a.languageEvidence === "course" ? "Есть подтверждение записи на подготовительный курс немецкого" : undefined;
  const why = [goalWhy, ...(a.admission ? [a.admission === "prep" ? "Zulassung с подготовкой" : "Zulassung без условий"] : []), ...(a.german === "b1" ? ["Немецкий B1 или выше"] : []), ...(languageEvidenceText ? [languageEvidenceText] : []), ...(a.type ? [a.type === "company" ? "Ausbildung на предприятии" : "Ausbildung в школе"] : []), ...(a.pay === "less" ? ["Зарплата за обучение ниже порога"] : []), fundsWhy].filter((x): x is string => Boolean(x));
  const amount = a.goal === "study" ? "992 € в месяц, 11 904 € на год" : a.goal === "ausbildung" ? (a.type === "school" ? "959 € нетто в месяц" : "разница между зарплатой за обучение и 822 € нетто в месяц") : "1 091 € в месяц";
  const fundsDoc = companyPaid ? "Договор на Ausbildung с суммой зарплаты за обучение" : blocked ? `Подтверждение Sperrkonto: ${amount}` : a.funds === "commitment" ? "Оригинал Verpflichtungserklärung из ведомства по делам иностранцев в Германии" : "Письмо о стипендии с суммой и сроком";
  const titles: Record<string, string> = { study: a.admission === "prep" ? "Виза для учёбы с подготовительным курсом" : "Виза для учёбы", apply: "Виза для поступления в вуз", ausbildung: "Виза для Ausbildung", search: "Виза для поиска места Ausbildung" };
  const summaries: Record<string, string> = {
    study: a.admission === "prep" ? "Языковой курс или Studienkolleg, от которого зависит Zulassung, входит в цель учёбы: отдельная виза для курса не нужна. Подайте заявление с документом о допуске или о приёме на Studienkolleg." : "С Zulassung выдают визу для учёбы; в Берлине затем оформляют вид на жительство обычно на два года, не меньше чем на год.",
    apply: "Виза для поступления позволяет приехать без Zulassung и подавать документы в вузы на месте, сдать вступительный экзамен или пройти подготовку. Срок: до девяти месяцев.",
    ausbildung: "С договором или подтверждённым местом обучения выдают визу для Ausbildung. Для обучения на предприятии Bundesagentur für Arbeit проверяет условия сама: от вас ничего не требуется.",
    search: "До 35 лет можно приехать на срок до девяти месяцев и искать место Ausbildung на месте, подрабатывая до 20 часов в неделю.",
  };
  const factsByGoal: Record<string, Fact[]> = {
    study: [
      { label: "Средства на 2026 год", value: "992 € в месяц, 11 904 € на год", kind: "official" },
      { label: "Работа", value: "до 140 полных или 280 половинных рабочих дней в году; студенческие подработки в вузе не считаются", kind: "official" },
      { label: "Если допуск потерян не по вашей вине", value: "дают до девяти месяцев, чтобы поступить в другой вуз", kind: "official" },
    ],
    apply: [
      { label: "Средства на 2026 год", value: "1 091 € в месяц", kind: "official" },
      { label: "Срок", value: "до девяти месяцев", kind: "official" },
      { label: "Работа", value: "до 20 часов в неделю и пробная работа до двух недель в сумме", kind: "official" },
      { label: "Смена цели", value: "во время этого пребывания другую цель обычно разрешают только для учёбы, Ausbildung, работы по профессиональному опыту или при праве по закону", kind: "official" },
      { label: "Язык", value: "если обучение на немецком, обычно нужен B2", kind: "official" },
    ],
    ausbildung: [
      { label: "Средства на 2026 год", value: a.type === "school" ? "959 € нетто в месяц для обучения в школе" : "зарплата за обучение засчитывается, если она не меньше 1 048 € брутто или 822 € нетто в месяц; недостающее покрывают Sperrkonto или Verpflichtungserklärung", kind: "official" },
      ...(languageEvidenceText ? [{ label: "Язык", value: languageEvidenceText, kind: "official" as const }] : []),
      { label: "Подработка", value: "до 20 часов в неделю, если она не связана с обучением", kind: "official" },
      ...(a.type === "company" ? [{ label: "Согласие Bundesagentur für Arbeit", value: "нужно; это внутренняя проверка ведомств", kind: "official" as const }] : []),
    ],
    search: [
      { label: "Средства на 2026 год", value: "1 091 € в месяц", kind: "official" },
      { label: "Условия", value: "до 35 лет, немецкий B1, школьный аттестат с правом поступления в вуз", kind: "official" },
      { label: "Срок и работа", value: "до девяти месяцев; подработка до 20 часов в неделю и пробная работа до двух недель в сумме", kind: "official" },
    ],
  };
  const documentsByGoal: Record<string, string[]> = {
    study: ["Паспорт", a.admission === "prep" ? "Zulassung с условием или подтверждение приёма на Studienkolleg" : "Zulassung в вуз", "Аттестат и дипломы", fundsDoc, "Подтверждение медицинской страховки"],
    apply: ["Паспорт", "Аттестат с правом поступления в вуз", "Переписка с вузом или uni-assist: заявление, условный допуск или подтверждение подачи", "Сертификат языка обучения", fundsDoc, "Подтверждение медицинской страховки"],
    ausbildung: ["Паспорт", "Договор на Ausbildung или подтверждение места", a.german === "b1" ? "Сертификат немецкого B1" : languageEvidenceText, "Школьный аттестат", fundsDoc, "Подтверждение медицинской страховки"].filter((item): item is string => Boolean(item)),
    search: ["Паспорт", "Школьный аттестат с правом поступления в вуз или аттестат немецкой школы за рубежом", "Сертификат немецкого B1", fundsDoc, "Подтверждение медицинской страховки: после въезда оформляется немецкая"],
  };
  const sources: Record<string, Action> = {
    study: act("Make it in Germany: условия учёбы", o.studyRequirements),
    apply: act("Make it in Germany: виза для поиска места учёбы", o.studySearch),
    ausbildung,
    search: searchPdf,
  };
  const law = a.goal === "study" ? act("§ 16b AufenthG: учёба", o.law16b) : a.goal === "ausbildung" ? undefined : act("§ 17 AufenthG: поиск места учёбы или Ausbildung", o.law17);
  const prefix: Step[] = companyPaid ? [] : blocked
    ? [step("Откройте Sperrkonto", "Положите на счёт нужную сумму; банк выдаёт подтверждение для заявления. Получателем блокировки до въезда указывают представительство, после въезда: ведомство по делам иностранцев. Варианты провайдеров ниже.", "Онлайн", act("Auswärtiges Amt: Sperrkonto", o.blockedAccount), sources[a.goal], law)]
    : a.funds === "commitment"
      ? [step("Получите Verpflichtungserklärung", "Человек в Германии подписывает обязательство покрыть ваши расходы в своём ведомстве по делам иностранцев и присылает вам оригинал.", "Выбор", act("Study in Germany: как подтвердить средства", o.financeProof), sources[a.goal], law)]
      : [step("Получите письмо о стипендии", "Стипендию от признанного стипендиального фонда принимают вместо Sperrkonto, если сумма покрывает расходы.", "Выбор", act("Study in Germany: как подтвердить средства", o.financeProof), sources[a.goal], law)];
  const methods = visaMethods(documentsByGoal[a.goal], factsByGoal[a.goal], blockedExtra(blocked && !companyPaid), prefix);
  return {
    fit: a.goal === "ausbildung" && a.type === "company" && a.pay === "less" ? "conditional" : "fits",
    why, title: titles[a.goal], summary: summaries[a.goal], methods, steps: methods[0].steps,
    next: a.goal === "study" ? act("Берлин: вид на жительство для учёбы после въезда", o.berlinStudy) : a.goal === "apply" ? routes.study : routes.lea,
    note,
  };
}
