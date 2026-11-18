import type { Action, Answers, Fact, Method, Plan, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

const ba = "https://www.arbeitsagentur.de";
export const familyWorkOfficial = {
  kindergeld: `${ba}/familie-und-kinder/infos-rund-um-kindergeld/kindergeld-anspruch-hoehe-dauer`,
  kindergeldAbroad: `${ba}/familie-und-kinder/infos-rund-um-kindergeld/kindergeld-ausland`,
  kindergeldProofs: `${ba}/familie-und-kinder/infos-rund-um-kindergeld/nachweise-einreichen`,
  kindergeldServices: `${ba}/familie-und-kinder/eservices-fuer-familien`,
  unemployedRegister: `${ba}/arbeitslos-arbeit-finden/arbeitslosengeld/ihre-schritte-wenn-sie-arbeitslos-werden/wie-sie-sich-arbeitslos-melden`,
  jobSeekerRegister: `${ba}/arbeitslos-arbeit-finden/arbeitslosengeld/ihre-schritte-wenn-sie-arbeitslos-werden/wie-sie-sich-arbeitsuchend-melden`,
  unemploymentBenefit: `${ba}/arbeitslos-arbeit-finden/arbeitslosengeld/finanzielle-hilfen/arbeitslosengeld-anspruch-hoehe-dauer`,
  basicIncome: `${ba}/grundsicherung/grundsicherungsgeld-beantragen`,
  jobcenterServices: `${ba}/grundsicherung/online-services-im-ueberblick`,
};
const o = familyWorkOfficial;

export const kindergeldQuestions = [
  q("stage", "Что вам нужно?", [["new", "Подать заявление на Kindergeld впервые"], ["waiting", "Заявление подано, ответа нет"], ["change", "Уже получаю Kindergeld, нужно сообщить об изменении"]]),
  q("citizen", "Какое у вас гражданство?", [["eu", "Страна ЕС, ЕЭЗ или Швейцария"], ["noneu", "Другая страна"]]),
  q("permit", "Какой у вас статус пребывания?", [["work", "Вид на жительство или иной документ, который разрешает работать в Германии"], ["refugee", "Признанный беженец или убежище"], ["listed", "Гражданство Алжира, Боснии и Герцеговины, Косова, Марокко, Черногории, Сербии, Туниса или Турции, и есть работа с соцвзносами, Arbeitslosengeld или Krankengeld"], ["none", "Ничего из этого"]]),
] as const;

export function kindergeldVisible(a: Answers): readonly Question[] {
  if (a.stage !== "new") return [kindergeldQuestions[0]];
  if (a.citizen === "noneu") return [kindergeldQuestions[0], kindergeldQuestions[1], kindergeldQuestions[2]];
  return [kindergeldQuestions[0], kindergeldQuestions[1]];
}

const kindergeldFacts: Fact[] = [
  { label: "Размер", value: "259 € в месяц на ребёнка; на официальной странице год не указан", kind: "official" },
  { label: "Возраст ребёнка", value: "до 18 лет; для взрослых детей действуют отдельные условия", kind: "official" },
  { label: "Выплата за прошлое", value: "не больше 6 месяцев назад", kind: "official" },
  { label: "Доход", value: "на право не влияет", kind: "official" },
];

export function kindergeldPlan(a: Answers): Plan {
  const main = act("Familienkasse: Kindergeld", o.kindergeld);
  const proofs = act("Familienkasse: какие документы нужны", o.kindergeldProofs);
  if (a.stage === "waiting") return {
    fit: "fits",
    why: ["Заявление уже подано, ответа нет"],
    title: "Заявление на Kindergeld подано: что делать, пока ждёте",
    summary: "Familienkasse проверяет полноту документов и может позвонить или написать. Если через 6 недель ответа нет, позвоните на общую линию. Долгое рассмотрение не меняет размер выплаты.",
    steps: [
      step("Позвоните, если прошло 6 недель", "Общая бесплатная линия Familienkasse: 0800 4 555530. Назовите дату подачи и Kindergeld-номер, если он уже есть.", "Звонок", main),
      step("Ответьте на запросы в срок", "Если Familienkasse прислала письмо с вопросами или просит документы, ответьте до срока в письме. Если нужно больше времени, сообщите об этом. Отправляйте только копии, не оригиналы.", "Онлайн", proofs),
      step("Не возвращайте деньги по своей инициативе", "Если Familienkasse считает, что выплатила лишнее, она пришлёт письменное требование. До него ничего не переводите.", "Ожидание", main),
      step("Помните срок на возражение", "На решение можно возразить в течение одного месяца после его получения. Возражение отправляется отправителю письма, в том числе по почте.", "Онлайн", main),
    ],
  };
  if (a.stage === "change") return {
    fit: "fits",
    why: ["Вы уже получаете Kindergeld и должны сообщить об изменении"],
    title: "Сообщите Familienkasse об изменении",
    summary: "О любом изменении, которое влияет на право, нужно сообщать сразу и по своей инициативе. Это можно сделать онлайн через услугу «Änderungen mitteilen», по почте или по факсу.",
    steps: [
      step("Подготовьте копии документов", "Для ребёнка старше 18 лет это справка об учёбе или обучении, договор об обучении, подтверждение регистрации ищущим работу, справка об инвалидности и другие документы по случаю. Ребёнок до 18 лет: обычно достаточно Steuer-ID.", "Выбор", proofs),
      step("Отправьте сообщение об изменении", "Онлайн: услуга «Änderungen mitteilen» на портале Familienkasse. Также можно почтой или по факсу. Отправляйте только копии: «niemals Originale».", "Онлайн", proofs, main),
      step("Следите за письмами", "Если не хватает документов, Familienkasse напишет и укажет срок. Пропуск срока может задержать или отменить выплату.", "Ожидание", proofs),
    ],
  };
  if (a.citizen === "noneu" && a.permit === "none") return {
    fit: "redirect",
    why: ["Гражданство не ЕС", "Нет документа или статуса из перечня Familienkasse"],
    title: "Kindergeld сейчас недоступен без подходящего статуса",
    summary: "По официальной странице Kindergeld получают граждане не из ЕС с видом на жительство, который разрешает работать, признанные беженцы и граждане восьми стран из перечня при работе с соцвзносами или пособии. Сначала решите вопрос с документом, затем подайте заявление.",
    steps: [step("Откройте маршрут по виду на жительство", "Подача или продление документа идёт через ведомство по делам иностранцев (LEA). Когда документ изменится, вернитесь к Kindergeld: выплата за прошлое возможна не больше чем за 6 месяцев.", "Онлайн", act("Маршрут: вид на жительство", "/berlin/aufenthalt"), main)],
    next: act("Маршрут: продление вида на жительство", "/berlin/aufenthalt"),
  };
  const eu = a.citizen === "eu";
  const bundId: Method = {
    id: "online-bundid", kind: "online", title: "Онлайн с Bund-ID, без подписи", summary: "Заявление отправляется онлайн, печатать и подписывать его не нужно.",
    availability: "conditional", availabilityLabel: "Нужна Bund-ID",
    conditions: ["У вас есть Bund-ID (федеральная учётная запись для госуслуг)", "Ребёнок младше 18 лет и живёт в вашем доме; это касается и приёмных, и внуков, и детей супруга", "Вы живёте в Германии или другой стране ЕС, Норвегии, Лихтенштейне, Исландии или Швейцарии"],
    documents: ["Steuer-ID ребёнка и ваш Steuer-ID", "Свидетельство о рождении ребёнка, если он родился или живёт за границей"],
    facts: [...kindergeldFacts, { label: "Срок ответа", value: "если за 6 недель ответа нет, можно позвонить на 0800 4 555530", kind: "authority" }],
    steps: [
      step("Найдите Steuer-ID", "Для ребёнка до 18 лет обычно нужны только налоговые номера: ваш и ребёнка. Для ребёнка, родившегося в Германии, Bundeszentralamt für Steuern присылает номер в Familienkasse автоматически. Свой номер ищите по маршруту Steuer-ID.", "Выбор", act("Маршрут: Steuer-ID", "/berlin/steuer-id"), main),
      step("Заполните онлайн-заявление", "Откройте «Kindergeld online beantragen» на сайте Bundesagentur für Arbeit, внесите данные и приложите подтверждения.", "Онлайн", main, main),
      step("Отправьте с Bund-ID", "С Bund-ID онлайн-заявление не нужно распечатывать и подписывать.", "Онлайн", main),
      step("Подайте заявление как можно раньше", "Выплата за прошлое возможна не больше чем за 6 месяцев, поэтому каждый месяц ожидания может стоить денег.", "Выбор", main),
    ],
  };
  const printed: Method = {
    id: "online-print", kind: "mail", title: "Онлайн-форма и бумажная отправка с подписью", summary: "Вы заполняете заявление онлайн, затем печатаете, подписываете и отправляете в Familienkasse.",
    availability: "available", availabilityLabel: "Доступно без Bund-ID",
    conditions: ["Ребёнок младше 18 лет и живёт в вашем доме", "Заявление действительно только с подписью"],
    documents: ["Steuer-ID ребёнка и ваш Steuer-ID", "Свидетельство о рождении ребёнка, если он родился или живёт за границей"],
    facts: kindergeldFacts,
    steps: [
      step("Найдите Steuer-ID", "Для ребёнка до 18 лет обычно нужны только налоговые номера: ваш и ребёнка. Свой номер ищите по маршруту Steuer-ID.", "Выбор", act("Маршрут: Steuer-ID", "/berlin/steuer-id"), main),
      step("Заполните заявление онлайн", "Откройте «Kindergeld online beantragen» на сайте Bundesagentur für Arbeit и заполните форму.", "Онлайн", main, main),
      step("Распечатайте, подпишите и отправьте", "Без Bund-ID онлайн-заявление нужно распечатать, подписать и отправить в вашу Familienkasse. Форма на бумаге: Antrag auf Kindergeld (KG1) и Anlage Kind (KG1-AnK).", "Выбор", main),
      step("Подайте как можно раньше", "Выплата за прошлое возможна не больше чем за 6 месяцев.", "Выбор", main),
    ],
  };
  const conditional = eu;
  return {
    fit: conditional ? "conditional" : "fits",
    why: eu ? ["Гражданство ЕС, ЕЭЗ или Швейцарии"] : ["Гражданство не ЕС", a.permit === "refugee" ? "Признанный беженец или убежище" : a.permit === "listed" ? "Гражданство страны из перечня Familienkasse и работа с соцвзносами или пособие" : "Документ разрешает работать в Германии"],
    title: "Можно подать заявление на Kindergeld",
    summary: eu
      ? "Если вы приехали после августа 2019 года, с четвёртого месяца после въезда нужно выполнять условия закона о свободе передвижения: работа, поиск работы, право от члена семьи, достаточные средства со страховкой или постоянное право проживания. Familienkasse проверяет каждый случай отдельно."
      : "Ваш статус входит в перечень Familienkasse. Familienkasse всё равно проверяет каждый случай отдельно, поэтому заявление подают в любом случае: решение выносит она.",
    methods: [bundId, printed],
    steps: bundId.steps,
    note: "Это общая информация, а не юридическая консультация. Размер и условия указаны на официальной странице Bundesagentur für Arbeit.",
    next: act("Маршрут: Steuer-ID", "/berlin/steuer-id"),
  };
}

export const jobcenterQuestions = [
  q("goal", "Что вам нужно?", [["lost", "Я теряю работу или уже без работы, нужно Arbeitslosengeld"], ["money", "Работы нет, денег не хватает, нужна Grundsicherung (бывшее Bürgergeld)"]]),
  q("timing", "На каком вы этапе?", [["before", "Ещё работаю, увольнение или конец договора скоро"], ["after", "Уже без работы"]]),
  q("eid", "Есть ли у вас электронная идентификация для онлайн-входа?", [["yes", "Да: немецкий Personalausweis или eID с включённой онлайн-функцией, либо eID ЕС/ЕЭЗ"], ["no", "Нет или не знаю"]]),
] as const;

export function jobcenterVisible(a: Answers): readonly Question[] {
  if (a.goal === "money") return [jobcenterQuestions[0]];
  if (a.goal === "lost") return [jobcenterQuestions[0], jobcenterQuestions[1], jobcenterQuestions[2]];
  return [jobcenterQuestions[0]];
}

export function jobcenterPlan(a: Answers): Plan {
  if (a.goal === "money") {
    const apply = act("Bundesagentur: Grundsicherungsgeld", o.basicIncome);
    const services = act("Онлайн-услуги Jobcenter", o.jobcenterServices);
    const online: Method = {
      id: "online", kind: "online", title: "Онлайн в кабинете Bundesagentur", summary: "Вы создаёте онлайн-заявление, вносите данные, загружаете подтверждения и отправляете его.",
      availability: "available", availabilityLabel: "Доступно",
      conditions: ["Нужна учётная запись (Benutzerkonto) Bundesagentur für Arbeit", "Заявление можно подать и продлить онлайн"],
      documents: ["Подтверждение расходов на жильё (аренда)", "Подтверждение дохода", "Другие подтверждения по вашему случаю: их примеры приведены на странице «Antrag und Bescheid»"],
      facts: [{ label: "С какого времени действует название", value: "Grundsicherungsgeld заменило Bürgergeld с 1 июля 2026 года; прежние решения и формы остаются в силе", kind: "official" }],
      steps: [
        step("Найдите свой Jobcenter", "Ответственный Jobcenter определяется через поиск «Jobcenter finden» на сайте Bundesagentur für Arbeit.", "Онлайн", services, apply),
        step("Создайте кабинет и заявление", "Войдите в Benutzerkonto Bundesagentur für Arbeit или создайте его, заполните заявление и загрузите подтверждения.", "Онлайн", apply),
        step("Приложите подтверждения", "Заявление можно окончательно проверить, только когда у Jobcenter есть все нужные подтверждения: аренда и доход как минимум.", "Онлайн", apply),
        step("Продлите заявление вовремя", "Продление (Weiterbewilligung) тоже можно подать онлайн.", "Онлайн", apply),
      ],
    };
    const paper: Method = {
      id: "post", kind: "mail", title: "По почте на бумаге", summary: "Заявление на нужных формах отправляется в ваш Jobcenter почтой.",
      availability: "available", availabilityLabel: "Доступно",
      conditions: ["Заявление отправляется на официальных формах вашего Jobcenter"],
      documents: ["Подтверждение расходов на жильё (аренда)", "Подтверждение дохода"],
      facts: [
        { label: "Как подать", value: "заявление не привязано к форме: его можно подать онлайн, лично, по телефону или письменно; бумажные формы берут в Download-Center или в самом Jobcenter, если нет принтера", kind: "official" },
        { label: "С какого дня платят", value: "при подаче в середине месяца выплата, как правило, идёт за весь месяц, если право есть", kind: "official" },
        { label: "Срок рассмотрения", value: "на официальной странице срок рассмотрения не назван", kind: "none" },
        { label: "Подтверждения", value: "не обязательно прикладывать сразу, но лучше как можно раньше; оригиналы не отправляйте: документы оцифровывают и уничтожают через 8 недель", kind: "official" },
        { label: "Расходы", value: "онлайн-подача экономит печать, почтовые расходы и дорогу; отдельной платы за заявление страница не называет", kind: "official" },
      ],
      steps: [
        step("Найдите свой Jobcenter", "Адрес и контакты ответственного Jobcenter указаны через поиск «Jobcenter finden».", "Онлайн", services, apply),
        step("Отправьте формы с подтверждениями", "Заполненные формы и копии подтверждений отправьте почтой в свой Jobcenter.", "Выбор", apply),
      ],
    };
    return {
      fit: "fits",
      why: ["Работы нет, денег не хватает"],
      title: "Подайте заявление на Grundsicherungsgeld в Jobcenter",
      summary: "Grundsicherungsgeld (до июля 2026 года Bürgergeld) выплачивает Jobcenter. Решение о праве принимает Jobcenter по вашему заявлению и подтверждениям. Заявление можно подать онлайн в кабинете Bundesagentur или по почте.",
      methods: [online, paper],
      steps: online.steps,
      note: "Это общая информация, а не юридическая консультация. Условия для граждан других стран на официальной странице не описаны: их проверяет Jobcenter при рассмотрении заявления.",
    };
  }
  const register = act("Bundesagentur: как зарегистрироваться безработным", o.unemployedRegister);
  const seeker = act("Bundesagentur: как зарегистрироваться ищущим работу", o.jobSeekerRegister);
  const benefit = act("Bundesagentur: Arbeitslosengeld", o.unemploymentBenefit);
  const before = a.timing === "before";
  const benefitFacts: Fact[] = [
    { label: "Условие по стажу", value: "не меньше 12 месяцев с социальными взносами за последние 30 месяцев перед регистрацией", kind: "official" },
    { label: "Размер", value: "60% от расчётного дохода после вычетов, 67%, если у вас или у партнёра есть ребёнок", kind: "official" },
    { label: "Срок выплаты", value: "6 месяцев при 12 месяцах стажа; до 12 месяцев при 24 и более месяцах", kind: "official" },
    { label: "Страны ЕС", value: "периоды работы в ЕС, ЕЭЗ и Швейцарии могут засчитываться", kind: "official" },
  ];
  const stepsBefore: Step[] = before ? [
    step("Зарегистрируйтесь ищущим работу", "Сделайте это как можно раньше и не позднее чем за 3 месяца до конца работы. Если вы узнали об увольнении меньше чем за 3 месяца, нужно успеть за 3 дня. Регистрация ищущим работу не заменяет регистрацию безработным.", "Онлайн", seeker),
  ] : [];
  const registerStep = step("Зарегистрируйтесь безработным", "Сделайте это не позднее первого дня безработицы. Онлайн можно указать только сегодняшнюю дату или дату в ближайшие 3 месяца. Если Agentur закрыта в первый день, зарегистрируйтесь в следующий рабочий день. Выплата начинается не раньше дня регистрации.", "Онлайн", register);
  const benefitStep = step("Подайте заявление на Arbeitslosengeld", "Регистрация безработным считается подачей заявления, если вы не указали иное. Заявление подают онлайн в цифровом сервисе, лучше примерно за 2 недели до начала безработицы.", "Онлайн", benefit);
  const talkStep = step("Придите на беседу", "После регистрации Agentur проводит консультацию: она назначается при онлайн-регистрации или Agentur сама свяжется с вами. Прочитайте Merkblatt 1 о правах и обязанностях безработных.", "Лично", register);
  const online: Method = {
    id: "online", kind: "online", title: "Онлайн через BundID", summary: "Вы регистрируетесь безработным в цифровом сервисе и сразу подаёте заявление.",
    availability: a.eid === "yes" ? "available" : "conditional", availabilityLabel: a.eid === "yes" ? "Доступно" : "Нужна электронная идентификация",
    conditions: ["Идентификация через BundID: немецкий Personalausweis или eID с включённой онлайн-функцией, либо eID ЕС/ЕЭЗ и PIN от Bürgeramt", "Телефон или планшет с NFC, считыватель карт или Smart-eID", "Для регистрации безработным нужна уже сделанная регистрация ищущим работу"],
    documents: ["Документ с онлайн-функцией и PIN", "Дата окончания работы или предполагаемая дата"],
    facts: benefitFacts,
    steps: [...stepsBefore, registerStep, benefitStep, talkStep],
  };
  const person: Method = {
    id: "in-person", kind: "in-person", title: "Лично в Agentur für Arbeit", summary: "Вы регистрируетесь в Agentur по месту жительства. Рекомендуется записаться заранее онлайн.",
    availability: "available", availabilityLabel: "Доступно без электронной идентификации",
    conditions: ["Ответственна Agentur по месту вашего жительства"],
    documents: ["Действующий документ с вашим актуальным адресом", "Или паспорт либо замещающий документ и актуальная Meldebescheinigung (справка о регистрации по месту жительства)"],
    facts: benefitFacts,
    steps: [...(before ? [step("Позвоните или зарегистрируйтесь ищущим работу онлайн", "Регистрироваться ищущим работу можно онлайн или по телефону 0800 4 555500 (бесплатно). Используйте только один способ.", "Звонок", seeker)] : []), step("Запишитесь и придите в Agentur", "Рекомендуется записаться онлайн заранее. Возьмите документ с адресом или паспорт с Meldebescheinigung.", "Лично", register), benefitStep, talkStep],
  };
  const methods = a.eid === "yes" ? [online, person] : [person, online];
  return {
    fit: "fits",
    why: [before ? "Работа скоро заканчивается" : "Вы уже без работы", a.eid === "yes" ? "Есть электронная идентификация" : "Электронной идентификации нет или она неизвестна"],
    title: before ? "Зарегистрируйтесь в Agentur für Arbeit заранее" : "Зарегистрируйтесь безработным и подайте на Arbeitslosengeld",
    summary: "Первый шаг одинаков: регистрация в Agentur für Arbeit. Затем заявление на Arbeitslosengeld. Если стажа меньше 12 месяцев за последние 30, Agentur проверит право на пособие; тогда подайте заявление на Grundsicherungsgeld в Jobcenter.",
    methods,
    steps: methods[0].steps,
    note: "Это общая информация, а не юридическая консультация. Право на пособие определяет Agentur по вашему заявлению.",
    next: act("Если стажа не хватает: Grundsicherungsgeld", "/berlin/jobcenter"),
  };
}

// ---------------------------------------------------------------------------
// Kita, Schule и рождение ребёнка (Berlin)
// ---------------------------------------------------------------------------
export const careOfficial = {
  kita: "https://service.berlin.de/dienstleistung/324873/",
  school: "https://willkommenszentrum.berlin.de/familie/schulen",
  birth: "https://service.berlin.de/dienstleistung/318957/",
  birthAbroad: "https://service.berlin.de/dienstleistung/318959/standort/122908/",
  kitaNavigator: "https://kita-navigator.berlin.de/",
  kitaRules: "https://www.berlin.de/sen/bjf/service/formulare/erlaeuterungen-zum-anmeldeverfahren-kita-kindertagespflege.pdf",
};

export const kitaQuestions = [
  q("need", "Что вам нужно?", [["kita", "Место в детском саду или у Tagespflegeperson (Kita-Gutschein)"], ["school", "Записать ребёнка в школу"], ["birth", "Оформить рождение ребёнка"]]),
  q("address", "Зарегистрирован ли ребёнок или семья по адресу в Берлине?", [["yes", "Да, Anmeldung в Берлине уже есть"], ["no", "Ещё нет"]]),
  q("age", "Сколько ребёнку?", [["tiny", "Меньше 8 недель"], ["baby", "От 8 недель до года"], ["older", "Год и больше"]]),
  q("hours", "Сколько часов в день нужно?", [["seven", "До 7 часов"], ["more", "Больше 7 часов"]]),
  q("child", "Кого вы записываете в школу?", [["first", "Ребёнка, которому исполнится 6 лет до 30 сентября: первый класс"], ["newcomer", "Ребёнка школьного возраста, который приехал из другой страны"]]),
  q("age8", "Сколько лет ребёнку?", [["from8", "8 лет и старше"], ["under8", "Младше 8 лет"]]),
  q("place", "Где родился ребёнок?", [["clinic", "В больнице или родильном доме в Берлине"], ["home", "Дома в Берлине, с акушеркой или врачом"], ["abroad", "За границей"]]),
  q("citizenship", "Какое гражданство у ребёнка?", [["german", "Немецкое, либо ребёнок без гражданства или признанный беженец"], ["other", "Только иностранное"]]),
  q("docs", "На каком языке документы родителей?", [["german", "Документы выданы в Германии, на немецком"], ["foreign", "Есть иностранные документы не на немецком"]]),
] as const;

export function kitaVisible(a: Answers): readonly Question[] {
  const [need, address, age, hours, child, age8, place, citizenship, docs] = kitaQuestions;
  if (a.need === "school") return a.child === "newcomer" ? [need, child, age8] : [need, child];
  if (a.need === "birth") return a.place === "abroad" ? [need, place, citizenship] : [need, place, docs];
  if (a.need === "kita") return a.age === "older" ? [need, address, age, hours] : [need, address, age];
  return [need];
}

const kitaLink = act("Берлин: Kita-Gutschein", careOfficial.kita);
const kitaRules = act("Берлин: правила записи в Kita", careOfficial.kitaRules);
const kitaNavigator = act("Kita-Navigator Берлина", careOfficial.kitaNavigator);
const schoolLink = act("Берлинский центр приветствия: школы", careOfficial.school);
const birthLink = act("Берлин: сообщить о рождении ребёнка", careOfficial.birth);

function kitaPlan(a: Answers): Plan {
  const register = a.address === "yes" ? [] : [step("Сначала зарегистрируйте адрес", "Для Kita-Gutschein нужен Wohnsitz в Берлине, то есть место жительства. Маршрут Anmeldung показывает, как зарегистрироваться онлайн или в Bürgeramt.", "Онлайн", act("Маршрут: Anmeldung", "/berlin/anmeldung"), kitaLink)];
  if (a.age === "tiny") return {
    fit: "insufficient",
    why: ["Ребёнку меньше 8 недель", a.address === "yes" ? "Адрес в Берлине зарегистрирован" : "Адрес в Берлине ещё не зарегистрирован"],
    title: "Kita-Gutschein можно подать, когда ребёнку исполнится 8 недель",
    summary: "По официальной странице Берлина Kita-Gutschein (ваучер на место в детском саду) выдают, если ребёнку не меньше 8 недель. Первое заявление принимают не раньше чем за 9 месяцев и не позже чем за 2 месяца до начала ухода. Подготовьтесь заранее, подавать пока рано.",
    steps: [...register, step("Рассчитайте срок подачи", "Заявление подают от 9 до 2 месяцев до желаемого начала. Обработка в среднем занимает 6–8 недель, поэтому не откладывайте до последнего месяца.", "Выбор", kitaLink), step("Подготовьте подтверждения заранее", "В первый год жизни нужно подтвердить, что вы не можете ухаживать за ребёнком сами: справка от работодателя, подтверждение учёбы или самозанятости.", "Выбор", kitaLink)],
    next: act("Маршрут: Kindergeld", "/berlin/kindergeld"),
  };
  const baby = a.age === "baby";
  const more = a.age === "older" && a.hours === "more";
  const proof = baby || more;
  const docs = [
    "Заявление: заполните онлайн-помощником или в PDF-форме, распечатайте и подпишите всеми, кто имеет право опеки (Sorgeberechtigte)",
    "Согласие второго родителя (Vollmacht) или подтверждение единоличной опеки: Negativbescheinigung или решение суда",
    ...(proof ? ["Подтверждение потребности: справка от работодателя, подтверждение учёбы, обучения, курса интеграции или немецкого языка, документ о самозанятости. Тем, кто ищет работу, обычно признают полдня"] : []),
    "Jugendamt может запросить другие документы",
  ];
  const facts: Fact[] = [
    { label: "Когда подавать", value: "не раньше чем за 9 месяцев и не позже чем за 2 месяца до начала ухода; при переезде в Берлин и некоторых других случаях возможна подача в короткий срок, но ожидание не всегда избежать", kind: "official" },
    { label: "Стоимость", value: "уход бесплатный, за обед платят 23 € в месяц; за заявление платы нет", kind: "official" },
    { label: "Право на место", value: "с первого дня рождения до школы есть право на уход до 7 часов в день без проверки потребности; в списке официальных страниц нет условия по виду на жительство", kind: "official" },
    { label: "Обработка", value: "в среднем 6–8 недель", kind: "official" },
    { label: "Объём ухода", value: baby ? "в первый год нужно подтвердить потребность независимо от часов" : more ? "до 7 часов даётся без причины, больше нужно подтвердить работой, учёбой или семейными причинами" : "с первого дня рождения до 7 часов в день без объяснения причин", kind: "official" },
  ];
  const mk = (id: string, kind: "mail" | "in-person", title: string, summary: string, where: string): Method => ({
    id, kind, title, summary, availability: "available", availabilityLabel: "Доступно",
    conditions: ["Ответственное Jugendamt определяется по месту жительства, даже если ребёнок пойдёт в Kita в другом районе", "Заявление действительно только с подписями"],
    documents: docs, facts,
    steps: [
      ...register,
      step("Заполните заявление", "Используйте онлайн-помощник на странице услуги Берлина или PDF-форму. Затем распечатайте, подпишите и приложите подтверждения.", "Онлайн", kitaLink),
      step(where, id === "mail" ? "Отправьте подписанное заявление в Jugendamt вашего района." : "Принесите подписанное заявление в FamilienServiceBüro вашего района (центр помощи семьям).", id === "mail" ? "Выбор" : "Лично", kitaLink),
      step("Дождитесь Kita-Gutschein по почте", "Jugendamt получает данные и обрабатывает заявление. Ваучер приходит по почте.", "Ожидание", kitaLink),
      step("Найдите место в Kita-Navigator", "Kita-Navigator Берлина ищет по языку, возрасту и доступности и показывает свободные места. Jugendamt тоже может назвать свободные места, в том числе в соседнем районе. До 30 минут пути на транспорте считается приемлемым.", "Онлайн", kitaNavigator, kitaRules),
      step("Заключите договор с Kita", "Ваучер показывают при заключении договора. С Kita или её организацией договор заключается напрямую. В Kindertagespflege свяжитесь с Jugendamt. Закладывайте на привыкание (Eingewöhnung) до четырёх недель: Jugendamt это принимает.", "Выбор", kitaLink, kitaRules),
    ],
  });
  const methods = [mk("mail", "mail", "По почте в Jugendamt", "Вы печатаете заявление, подписываете и отправляете почтой.", "Отправьте заявление почтой"), mk("in-person", "in-person", "Лично в FamilienServiceBüro", "Вы приносите подписанное заявление в центр помощи семьям в своём районе.", "Принесите заявление лично")];
  return {
    fit: "fits",
    why: [a.address === "yes" ? "Адрес в Берлине зарегистрирован" : "Адрес в Берлине ещё не зарегистрирован", baby ? "Ребёнку от 8 недель до года" : more ? "Нужно больше 7 часов" : "Ребёнку год и больше, до 7 часов"],
    title: "Подайте заявление на Kita-Gutschein в Jugendamt",
    summary: "Kita-Gutschein выдаёт Jugendamt вашего района. Без него нельзя заключить договор с Kita или Tagespflegeperson. Заявление подают по почте или лично в FamilienServiceBüro.",
    methods,
    steps: methods[0].steps,
    note: "Это общая информация, а не юридическая консультация. Официальные страницы Берлина называют условием только Wohnsitz в Берлине и право опеки: требований к виду на жительство в них нет. Другие районы и Brandenburg действуют по своим правилам.",
    next: act("Маршрут: Kindergeld", "/berlin/kindergeld"),
  };
}

function schoolPlan(a: Answers): Plan {
  if (a.child === "first") return {
    fit: "fits",
    why: ["Ребёнок идёт в первый класс"],
    title: "Запишите ребёнка в школу в первый класс",
    summary: "Школьная обязанность начинается, когда ребёнку исполняется 6 лет до 30 сентября. Запись проходит примерно за 10 месяцев до начала школы, в две школьные недели перед осенними каникулами. Школа ребёнка определяется по Einzugsbereich, то есть району приписки по адресу.",
    steps: [
      step("Сходите на день открытых дверей", "Школы проводят Tag der offenen Tür. Там можно познакомиться со школой и узнать формы записи.", "Лично", schoolLink),
      step("Пройдите медосмотр перед школой", "Schuleingangsuntersuchung проводит Kinder- und Jugendgesundheitsdienst. Запись на него в каждом районе устроена по-своему, часто через онлайн-портал района.", "Лично", schoolLink),
      step("Найдите школу по адресу", "У каждой школы есть район приписки (Einzugsbereich). Дети из этого района имеют гарантированное место и записываются сначала туда. Другую школу можно запросить заявлением Umschulungsantrag (форма Schul 123), решение зависит от свободных мест.", "Онлайн", schoolLink),
      step("Запишите ребёнка в школу в срок", "Придите в двухнедельное окно записи с формой медосмотра (Schul 109), документами личности ваших и ребёнка и школьной анкетой (Schulanmeldebogen) школы. Форму можно взять в секретариате или получить по почте.", "Лично", schoolLink),
    ],
    note: "Порядок в разных районах отличается. Помощь с формами на нескольких языках оказывает FamilienServiceBüro района.",
    next: act("Маршрут: Kindergeld", "/berlin/kindergeld"),
  };
  const from8 = a.age8 === "from8";
  return {
    fit: "fits",
    why: ["Ребёнок приехал из другой страны", from8 ? "Ребёнку 8 лет и старше" : "Ребёнок младше 8 лет"],
    title: from8 ? "Запишите ребёнка в школу: подойдёт Willkommensklasse" : "Запишите ребёнка в школу или подготовьте к ней",
    summary: from8
      ? "Для детей от 8 лет, которые только приехали, в Берлине есть Willkommensklassen: классы для начала обучения с немецким языком. Школу назначает Schulamt, а FamilienServiceBüro района помогает с формами на нескольких языках."
      : "Для ребёнка младше 8 лет Willkommensklasse не предусмотрена. Школа приписывается по адресу, а подготовку к школе и немецкому языку дают Kita и курсы Vorkurs Deutsch перед школой.",
    steps: [
      step("Откройте страницу Берлина о школах", "На ней описаны Schulamt, медосмотр перед школой и поддержка для новоприбывших. Поиск школы доступен онлайн.", "Онлайн", schoolLink),
      step(from8 ? "Обратитесь за местом в Willkommensklasse" : "Подготовьте ребёнка к школе", from8 ? "Помощь с записью и формами предоставляет FamilienServiceBüro вашего района на нескольких языках. Школьное место назначает Schulamt." : "Поддержка языка идёт в Kita, затем в Vorkurs Deutsch перед школой и в самой школе.", "Лично", schoolLink),
      step("Соберите документы", "Документы личности ваших и ребёнка, форма медосмотра Schul 109 и анкета школы. Другие документы школа укажет сама.", "Выбор", schoolLink),
      ...(from8 ? [] : [step("Помните о сроке записи", "Запись в первый класс идёт в две школьные недели перед осенними каникулами, примерно за 10 месяцев до начала школы.", "Выбор", schoolLink)]),
    ],
    note: "Порядок в разных районах отличается: формы и записи размещены на сайте района.",
    next: act("Маршрут: Kindergeld", "/berlin/kindergeld"),
  };
}

function birthAbroadPlan(a: Answers): Plan {
  const link = act("Берлин: Nachbeurkundung (внесение рождения в немецкий реестр)", careOfficial.birthAbroad);
  const eligible = a.citizenship === "german";
  const registerChild = step("Зарегистрируйте ребёнка по месту жительства", "Если вы живёте в Германии и не вносите рождение в немецкий реестр, ребёнка нужно зарегистрировать в Bürgeramt по месту жительства (Meldebehörde).", "Онлайн", act("Маршрут: Anmeldung", "/berlin/anmeldung"), link);
  if (!eligible) return {
    fit: "fits",
    why: ["Ребёнок родился за границей", "Гражданство ребёнка только иностранное"],
    title: "Иностранное свидетельство признаётся, внесение в реестр не нужно",
    summary: "Обязанности вносить рождение за границей в немецкий реестр (Nachbeurkundung) нет. Иностранные свидетельства о рождении в Германии, как правило, признаются. По условиям услуги Берлина внести рождение могут, если ребёнок гражданин Германии, без гражданства или признанный беженец с постоянным пребыванием в Германии, поэтому для ребёнка только с иностранным гражданством эта услуга не подходит.",
    steps: [
      registerChild,
      step("Храните оригинал свидетельства и переводы", "Для ведомств понадобятся оригинал, перевод присяжного переводчика, зарегистрированного в Германии, и при необходимости апостиль или легализация.", "Выбор", link),
      step("Оформите документы ребёнка в своей стране", "Паспорт и гражданство оформляют консульство вашей страны.", "Выбор", link),
    ],
    next: act("Маршрут: Kindergeld", "/berlin/kindergeld"),
    note: "Это общая информация, а не юридическая консультация. Условия взяты со страницы услуги в Берлине.",
  };
  return {
    fit: "conditional",
    why: ["Ребёнок родился за границей", "У ребёнка немецкое гражданство, без гражданства или признанный беженец"],
    title: "Можно внести рождение в немецкий реестр, но это не обязательно",
    summary: "Nachbeurkundung (внесение рождения за границей в немецкий реестр) делает возможным немецкое свидетельство о рождении: переводы и заверения тогда больше не нужны. Услуга стоит 80 €, или 160 €, если применяют иностранное право. Подать заявление могут ребёнок, родители, супруг ребёнка или его дети. Необходим немецкий Wohnsitz у ребёнка или заявителя в прошлом или сейчас.",
    steps: [
      step("Определите ответственный Standesamt", "Ответственен Standesamt вашего района проживания, а без нынешнего адреса в Германии Standesamt последнего адреса. Страница, которую я использую, описывает Standesamt Mitte.", "Онлайн", link),
      step("Соберите документы", "Заявление (PDF на странице), свидетельство о рождении ребёнка, свидетельства о рождении обоих родителей, свидетельство о браке при наличии, подтверждение отцовства и заявления об опеке при необходимости, паспорта родителей. Иностранные документы нужны с заверенным немецким переводом и при необходимости с апостилем или легализацией. Только оригиналы или заверенные копии.", "Выбор", link),
      step("Подайте заявление письменно, по телефону или цифровым способом", "Личный визит нужен только когда его требует закон, и тогда по записи. Контакты: Standesamt Mitte, (030) 115, standesamt@ba-mitte.berlin.de.", "Онлайн", link),
      step("Закажите свидетельства", "Свидетельство о рождении стоит 12 €, каждое дополнительное в то же время 6 €. Международное свидетельство 12 € плюс 6 €. Оплата кредитной картой заранее ускоряет отправку.", "Онлайн", link),
      registerChild,
    ],
    next: act("Маршрут: Kindergeld", "/berlin/kindergeld"),
    note: "Это общая информация, а не юридическая консультация. Условия взяты со страницы услуги Standesamt Mitte.",
  };
}

function birthPlan(a: Answers): Plan {
  if (a.place === "abroad") return birthAbroadPlan(a);
  const home = a.place === "home";
  const foreign = a.docs === "foreign";
  const docs = [
    home ? "Geburtsbescheinigung от акушерки, помощницы при родах или врача" : "Geburtsanzeige: больница или родильный дом отправляет её в Standesamt сами",
    "Заявление об имени ребёнка (Namenserklärung), подписанное обоими родителями, если оно нужно. Больница часто даёт его вместе с уведомлением",
    "Действующий паспорт или удостоверение обоих родителей",
    "Свидетельство о рождении матери, а при необходимости и отца",
    "Свидетельство о браке, если вы в браке",
    "Признание отцовства и заявление об опеке, если вы не в браке и они сделаны",
    ...(foreign ? ["Иностранные документы в оригинале с переводом присяжного переводчика, зарегистрированного в Германии", "Для некоторых стран нужен апостиль или легализация, поставленные на оригинал или присоединённые к нему", "Имена из документов на кириллице транслитерируют по указанным стандартам ISO, DIN или ELOT"] : []),
  ];
  const facts: Fact[] = [
    { label: "Куда сообщать", value: "в Standesamt района, где родился ребёнок, независимо от адреса родителей", kind: "official" },
    { label: "Срок", value: home ? "одна неделя после рождения, если ребёнок родился дома" : "больница или родильный дом сообщают сами", kind: "official" },
    { label: "Стоимость", value: "сообщить о рождении бесплатно; три бесплатных свидетельства для Elterngeld, Kindergeld и страховки; другие по 12 €", kind: "official" },
  ];
  return {
    fit: "fits",
    why: [home ? "Роды дома" : "Роды в больнице или родильном доме", foreign ? "Есть иностранные документы" : "Документы выданы в Германии"],
    title: home ? "Сообщите о рождении в Standesamt в течение недели" : "Получите свидетельство о рождении в Standesamt",
    summary: home
      ? "При родах дома акушерка или врач выдают Geburtsbescheinigung. Родители должны сообщить о рождении в Standesamt района рождения в течение одной недели и принести этот документ."
      : "При родах в больнице или родильном доме учреждение само сообщает о рождении и отправляет Geburtsanzeige в Standesamt. Родителям остаётся принести документы и получить свидетельство.",
    steps: [
      step(home ? "Получите Geburtsbescheinigung" : "Проверьте, что больница отправила Geburtsanzeige", home ? "Её выдаёт акушерка, помощница при родах или врач, который принимал роды." : "Это делает учреждение, где родился ребёнок. Вам остаётся прийти в Standesamt с документами.", "Выбор", birthLink),
      step("Соберите документы", docs.join(". ") + ".", "Выбор", birthLink),
      step("Придите в Standesamt района рождения", "Оригиналы без пометок и ламинации. Оплата только наличными или картой Girocard. Адрес и часы приёма указаны на странице вашего Standesamt.", "Лично", birthLink),
      step("Попросите три бесплатных свидетельства", "Они нужны для Elterngeld, Kindergeld и медицинского страхования ребёнка. Остальные стоят 12 €, копии при заказе в одно время по 6 €.", "Выбор", birthLink),
    ],
    note: "Это общая информация, а не юридическая консультация. Рождение за границей оформляют по отдельной услуге Берлина: выберите «За границей» в вопросе о месте рождения.",
    next: act("Маршрут: Kindergeld", "/berlin/kindergeld"),
  };
}

export function kitaGuidedPlan(a: Answers): Plan {
  if (a.need === "school") return schoolPlan(a);
  if (a.need === "birth") return birthPlan(a);
  return kitaPlan(a);
}

// ---------------------------------------------------------------------------
// Работа по найму: можно ли работать, где искать вакансии, что делать при нарушении
// ---------------------------------------------------------------------------
export const employmentOfficial = {
  jobSearch: "https://www.arbeitsagentur.de/jobsuche/",
  makeItJobs: "https://www.make-it-in-germany.com/de/arbeiten-in-deutschland/jobboerse",
  eures: "https://eures.europa.eu/jobseekers_en",
  stateJobs: "https://www.karriereportal-stellen.berlin.de/stellenangebote.html",
  merkblatt: "https://arbeitsagentur.de/vor-ort/datei/merkblatt-7_ba216994.pdf",
  minimumWage: "https://www.zoll.de/DE/Fachthemen/Arbeit/Mindestarbeitsbedingungen/Mindestlohn-Mindestlohngesetz/Zustaendigkeiten-Auskunftserteilung/zustaendigkeiten-auskunftserteilung_node.html",
  zollReport: "https://www.zoll.de/DE/Privatpersonen/Arbeit/Fragen-Antworten/_akkordeon/frage_4.html",
  senateLabour: "https://www.berlin.de/sen/arbeit/beschaeftigung/",
  labourCourt: "https://www.berlin.de/gerichte/arbeitsgericht/service/rechtsantragstelle/",
};
const e = employmentOfficial;

export const employmentQuestions = [
  q("goal", "Что вам нужно?", [["search", "Найти вакансии и откликнуться"], ["permit", "Понять, можно ли мне работать по найму"], ["problem", "Проблема с работодателем"]]),
  q("citizen", "Какое у вас гражданство?", [["eu", "Страна ЕС, ЕЭЗ или Швейцария"], ["noneu", "Другая страна"]]),
  q("status", "Какой у вас документ на пребывание?", [["title", "Вид на жительство, в котором работа разрешена"], ["refugee", "Признанный беженец или убежище"], ["duldung", "Duldung или Aufenthaltsgestattung"], ["none", "Документа нет или я ещё не въехал(а)"]]),
  q("issue", "Что случилось?", [["pay", "Платят меньше минимальной зарплаты или не платят"], ["informal", "Работодатель не оформляет меня официально"]]),
] as const;

export function employmentVisible(a: Answers): readonly Question[] {
  const [goal, citizen, status, issue] = employmentQuestions;
  if (a.goal === "problem") return [goal, issue];
  if (a.goal === "search" || a.goal === "permit") return a.citizen === "noneu" ? [goal, citizen, status] : [goal, citizen];
  return [goal];
}

function employmentProblem(a: Answers): Plan {
  const pay = a.issue === "pay";
  const hotline = act("Mindestlohn-Hotline и Hauptzollamt", e.minimumWage);
  const senate = act("Берлин: услуги для работающих", e.senateLabour);
  const court = act("Arbeitsgericht Berlin: Rechtsantragstelle", e.labourCourt);
  const zoll = act("Zoll: как сообщить о нарушении", e.zollReport);
  return {
    fit: "fits",
    why: [pay ? "Зарплата ниже минимума или не выплачена" : "Работодатель не оформляет официально"],
    title: pay ? "Сообщите о нарушении минимальной зарплаты" : "Сообщите о работе без оформления",
    summary: pay
      ? "Соблюдение Mindestlohn (минимальной зарплаты) проверяет Finanzkontrolle Schwarzarbeit при Zoll. Общие вопросы принимает Mindestlohn-Hotline: 030 60280028, пн–чт 8:00–17:00, пт 8:00–12:00. Сообщение о нарушении принимает Hauptzollamt, на него Hotline и направляет."
      : "О работе без оформления сообщают Zoll: порядок и нужные сведения описаны на официальной странице. Учтите, что работа без нужного документа на работу считается нарушением и для самого работника, поэтому сначала проверьте свой статус по соседнему маршруту.",
    steps: pay ? [
      step("Позвоните на Mindestlohn-Hotline", "Номер 030 60280028 или mindestlohn@buergerservice.bund.de. Горячая линия отвечает на общие вопросы о минимальной зарплате. Сообщения о нарушениях она сама не обрабатывает.", "Звонок", hotline),
      step("Сообщите о нарушении в Hauptzollamt", "Hotline называет ответственный Hauptzollamt, его телефон и адрес. Туда и направляют сообщение о нарушении.", "Звонок", hotline),
      step("Для спора о выплате подайте иск через Rechtsantragstelle", "Rechtsantragstelle Arbeitsgericht Berlin принимает иск и заявления, подача бесплатная, копии стоят 0,10 € за страницу. Для иска о деньгах сумму нужно указать и подробно рассчитать. Принесите контакты работодателя, трудовой договор, расчётные листки, записи о сверхурочных. Переводчиков нет: приходите с человеком, который говорит по-немецки. Консультацию по праву Rechtsantragstelle не даёт.", "Лично", court, senate),
    ] : [
      step("Проверьте свой статус и право на работу", "Работа без нужного разрешения может быть нарушением и для работника, и для работодателя. Сначала проверьте, что ваш документ разрешает работу.", "Выбор", act("Маршрут: можно ли мне работать", "/berlin/rabota-po-najmu"), act("Bundesagentur: Merkblatt 7", e.merkblatt)),
      step("Сообщите в Zoll о работе без оформления", "Zoll описывает, куда и с какими сведениями можно сообщить о Schwarzarbeit.", "Онлайн", zoll),
      step("Если работодатель отказывает, подайте иск", "Требования к работодателю принимает Rechtsantragstelle Arbeitsgericht Berlin. Подача бесплатна. Принесите всё, что подтверждает работу: договор, расчётные листки, записи о часах.", "Лично", court, senate),
    ],
    note: "Это общая информация, а не юридическая консультация. Ведомства принимают сообщения по своим каналам: сроки они не называют.",
  };
}

export function employmentPlan(a: Answers): Plan {
  if (a.goal === "problem") return employmentProblem(a);
  const merk = act("Bundesagentur: Merkblatt 7, работа иностранцев", e.merkblatt);
  const jobs = act("Bundesagentur: Jobsuche", e.jobSearch);
  const makeIt = act("Make it in Germany: поиск работы", e.makeItJobs);
  const search = a.goal === "search";
  const jobSteps: Step[] = [
    step("Ищите вакансии на официальных биржах", "Jobsuche Bundesagentur на немецком: введите должность и город, отфильтруйте по занятости (полная, неполная, Minijob, дистанционная). Make it in Germany описывает поиск по востребованным профессиям. EURES ищет вакансии по 31 стране и бесплатно консультирует. Karriereportal Берлина публикует все вакансии земли: районные ведомства, школы, полицию; справка о портале есть на русском.", "Онлайн", jobs, makeIt),
    step("Посмотрите вакансии на других официальных площадках", "EURES: около 3 миллионов вакансий в Европе, консультанты помогают с резюме и видеособеседованиями. Karriereportal земли Берлин: работа в администрации и учреждениях Берлина.", "Онлайн", act("EURES: поиск работы", e.eures), act("Karriereportal Берлина: вакансии", e.stateJobs)),
    step("Откликайтесь на конкретные вакансии", "Отклики на конкретную вакансию чаще приводят к приглашению, чем общая анкета. На ярмарках вакансий возьмите папки с резюме и запишите имя контактного лица для повторного письма.", "Онлайн", makeIt),
    step("Получите консультацию, если нужна помощь", "Вы уже в Германии: местный Agentur für Arbeit бесплатно консультирует по поиску работы. Горячая линия «Arbeiten und Leben in Deutschland»: +49 30 1815-1111, на немецком и английском.", "Звонок", makeIt),
  ];
  const next = act("Маршрут: Steuer-ID", "/berlin/steuer-id");
  const title = (a1: string, a2: string) => search ? a1 : a2;
  if (a.citizen === "eu") return {
    fit: "fits",
    why: ["Гражданство ЕС, ЕЭЗ или Швейцарии"],
    title: title("Ищите работу: разрешение на работу не нужно", "Вам не нужно разрешение на работу"),
    summary: "Граждане ЕС, ЕЭЗ и Швейцарии работают в Германии без разрешения и по правам равны немецким работникам.",
    steps: search ? jobSteps : [step("Работайте без отдельного разрешения", "Ограничений на найм по документу нет. Работодателю нужны ваши паспорт и данные для оформления.", "Выбор", merk, jobs)],
    note: "Это общая информация, а не юридическая консультация. Источник: Merkblatt 7 Bundesagentur für Arbeit.",
    next,
  };
  if (a.status === "none") return {
    fit: "redirect",
    why: ["Гражданство не ЕС", "Документа на пребывание нет или въезда ещё не было"],
    title: "Сначала нужен документ, который разрешает работу",
    summary: "Гражданам не из ЕС для работы нужен вид на жительство, в котором работа разрешена. Новоприбывшим обычно нужна виза от немецкого представительства в стране проживания до въезда. Затем документ получают или меняют через ведомство по делам иностранцев.",
    steps: [
      step("Узнайте путь для работы в Германии", "Make it in Germany описывает поиск работы и въезд с рабочей целью. Консультация: +49 30 1815-1111 или make-it-in-germany@arbeitsagentur.de.", "Онлайн", makeIt, merk),
      step("Оформите документ через ведомство по делам иностранцев", "Если вы уже в Берлине, документ получают или продлевают через LEA. Ведомство само запрашивает согласие Bundesagentur, если оно нужно.", "Онлайн", act("Маршрут: вид на жительство", "/berlin/aufenthalt"), merk),
    ],
    next: act("Маршрут: вид на жительство", "/berlin/aufenthalt"),
    note: "Это общая информация, а не юридическая консультация. Источник: Merkblatt 7 Bundesagentur für Arbeit.",
  };
  if (a.status === "duldung") return {
    fit: "conditional",
    why: ["Гражданство не ЕС", "Duldung или Aufenthaltsgestattung"],
    title: title("Работа возможна с разрешением, оно выдаётся не сразу", "Работать можно с разрешением, оно выдаётся не сразу"),
    summary: "При Duldung или Aufenthaltsgestattung согласие на работу возможно после 3 месяцев законного пребывания. Для тех, кто обязан жить в центре приёма, срок до 6 месяцев. Для граждан безопасных стран происхождения есть общий запрет на работу, если они подали ходатайство после 31 августа 2015 года или его отклонили.",
    steps: [
      step("Подайте запрос на разрешение на работу", "Разрешение на работу оформляет Ausländerbehörde: она сама запрашивает согласие Bundesagentur, если оно нужно. Работодатель не может начать работу без него.", "Онлайн", act("Маршрут: вид на жительство", "/berlin/aufenthalt"), merk),
      ...(search ? jobSteps : []),
    ],
    next: act("Маршрут: вид на жительство", "/berlin/aufenthalt"),
    note: "Это общая информация, а не юридическая консультация. Источник: Merkblatt 7 Bundesagentur für Arbeit.",
  };
  if (a.status === "refugee") return {
    fit: "fits",
    why: ["Гражданство не ЕС", "Признанный беженец или убежище"],
    title: title("Ищите работу: доступ к рынку труда широкий", "Вы можете работать, доступ к рынку труда широкий"),
    summary: "Признанные беженцы имеют широкий доступ к рынку труда, как правило без ограничений. Работодатель при этом проверяет документ.",
    steps: search ? jobSteps : [step("Проверьте документ", "Широкий доступ к рынку труда у признанных беженцев описан в Merkblatt 7. Работодатель попросит документ, где указан ваш статус.", "Выбор", merk, jobs)],
    next,
    note: "Это общая информация, а не юридическая консультация. Источник: Merkblatt 7 Bundesagentur für Arbeit.",
  };
  return {
    fit: "conditional",
    why: ["Гражданство не ЕС", "Вид на жительство, в котором работа разрешена"],
    title: title("Ищите работу, но проверьте ограничения в документе", "Работать можно, проверьте ограничения в документе"),
    summary: "Если ваш вид на жительство разрешает работу, вы можете работать по найму. Согласие Bundesagentur может быть ограничено по работодателю, месту, профессии или часам, до 4 лет.",
    steps: [
      step("Прочитайте ограничения в документе", "Посмотрите, указаны ли конкретный работодатель, профессия, место или часы работы. Если вы хотите сменить работодателя, а в документе есть привязка, обращайтесь в ведомство по делам иностранцев до выхода на новую работу.", "Выбор", merk, act("Маршрут: вид на жительство", "/berlin/aufenthalt")),
      ...(search ? jobSteps : []),
    ],
    next,
    note: "Это общая информация, а не юридическая консультация. Источник: Merkblatt 7 Bundesagentur für Arbeit.",
  };
}
