import type { Action, Answers, Fact, Method, Plan, Provider, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

/** Официальные источники маршрутов о животных. Прочитаны 30 октября 2026. */
export const petsOfficial = {
  euEntry: "https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets/bringing-pet-eu-non-eu-country_en",
  euListed: "https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets/listing-territories-and-non-eu-countries_en",
  euFaq: "https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets/faqs_en",
  yourEurope: "https://europa.eu/youreurope/citizens/travel/carry/pets-and-other-animals/index_en.htm",
  bmlehTravel: "https://www.bmleh.de/DE/themen/tiere/haus-und-zootiere/reisen-hunde-katzen-frettchen.html",
  bmlehCertificate: "https://www.bmleh.de/DE/themen/tiere/haus-und-zootiere/tiergesundheitsbescheinigung.html",
  bmlehEntryPoints: "https://www.bmleh.de/DE/themen/tiere/haus-und-zootiere/heimtiere-einreiseregelung.html",
  entryPointsList: "https://www.bmleh.de/SharedDocs/Downloads/DE/_Tiere/Haus-Zootiere/Liste_Einreiseorte_Bundesrepublik_Deutschland.pdf?__blob=publicationFile&v=4",
  bmlehPassport: "https://www.bmleh.de/DE/themen/tiere/haus-und-zootiere/eu-heimtierausweis.html",
  bmlehBirds: "https://www.bmleh.de/DE/themen/tiere/haus-und-zootiere/einreise-voegel.html",
  zollPets: "https://www.zoll.de/DE/Privatpersonen/Reisen/Reisen-nach-Deutschland-aus-einem-nicht-eu-Staat/Einschraenkungen/Tiere-und-Pflanzen/Schutz-Tierseuchen/Regelungen-Heimtiere/regelungen-heimtiere.html",
  dogImportBan: "https://www.gesetze-im-internet.de/hundverbreinfg/__2.html",
  dogImportExceptions: "https://www.gesetze-im-internet.de/hundverbreinfvo/__2.html",
  vetEmergency: "https://tieraerztekammer-berlin.de/notdienst/",
  vetFees: "https://www.gesetze-im-internet.de/got_2022/__2.html",
  vetEmergencyFees: "https://www.gesetze-im-internet.de/got_2022/__4.html",
  dogLawFaq: "https://www.berlin.de/sen/verbraucherschutz/aufgaben/hundehaltung/artikel.1485419.php",
  dogExperts: "https://www.berlin.de/sen/verbraucherschutz/aufgaben/hundehaltung/anerkannte-sachverstaendige/",
  trainerPermitLaw: "https://www.gesetze-im-internet.de/tierschg/__11.html",
  trainerPermitBerlin: "https://www.berlin.de/ba-neukoelln/politik-und-verwaltung/aemter/ordnungsamt/veterinaer-und-lebensmittelaufsicht/beruflicher-umgang-mit-tieren-1403430.php",
  ordnungsaemter: "https://service.berlin.de/standorte/ordnungsaemter/",
};
const o = petsOfficial;

const dogRoute = act("Маршрут: собака в Берлине (реестр, налог, прогулки)", "/berlin/sobaka/marshrut");
const passportRoute = act("Маршрут: EU-Heimtierausweis (паспорт животного)", "/berlin/heimtierausweis");
const vetRoute = act("Маршрут: ветеринар в Берлине", "/berlin/veterinar");
const bannedBreeds = "Pit Bull Terrier, American Staffordshire Terrier, Staffordshire Bull Terrier, Bull Terrier и их помеси";

// ---------------------------------------------------------------------------
// Переезд в Германию с животным
// ---------------------------------------------------------------------------
export const petMoveQuestions = [
  q("animal", "Какое животное переезжает с вами?", [["dog", "Собака"], ["cat", "Кошка или хорёк"], ["bird", "Птица"], ["other", "Другое: кролик, грызун, рептилия"]]),
  q("from", "Откуда вы въезжаете с животным?", [["eu", "Из страны ЕС"], ["listed", "Из страны вне ЕС из списка ЕС: США, Великобритания, Канада, Сербия, Япония и другие"], ["unlisted", "Из страны вне этого списка: Россия, Украина, Беларусь, Казахстан, Турция, Грузия, Армения, Израиль и другие"], ["unknown", "Не знаю, есть ли моя страна в списке"]]),
  q("breed", "Собака относится к породам Pit Bull Terrier, American Staffordshire Terrier, Staffordshire Bull Terrier, Bull Terrier или это их помесь?", [["no", "Нет"], ["yes", "Да"]]),
  q("euDocs", "Есть ли паспорт ЕС, микрочип и действующая прививка от бешенства?", [["yes", "Да, всё есть"], ["no", "Не всё есть"], ["unknown", "Не знаю"]]),
  q("prep", "Что уже сделано для поездки?", [["none", "Ещё нет чипа или прививки от бешенства"], ["vaccinated", "Чип и прививка от бешенства есть"], ["titer", "Чип, прививка и тест на антитела к бешенству уже есть"]]),
] as const;

export function petMoveVisible(a: Answers): readonly Question[] {
  const [animal, from, breed, euDocs, prep] = petMoveQuestions;
  const out: Question[] = [animal];
  if (!a.animal || a.animal === "other") return out;
  out.push(from);
  if (!a.from) return out;
  if (a.animal === "dog") { out.push(breed); if (!a.breed || a.breed === "yes") return out; }
  if (a.animal !== "bird" && a.from === "eu") out.push(euDocs);
  if (a.animal !== "bird" && (a.from === "listed" || a.from === "unlisted")) {
    out.push(a.from === "listed" ? { ...prep, options: prep.options.filter(([value]) => value !== "titer") } : prep);
  }
  return out;
}

const certificateFact: Fact = { label: "Ветеринарный сертификат ЕС", value: "выдаёт официальный или уполномоченный ветеринар страны выезда, затем его заверяет ведомство; действует 10 дней от выдачи до проверки при въезде, для дальнейших поездок по ЕС – 6 месяцев или до конца срока прививки", kind: "official" };
const vaccineFact: Fact = { label: "Прививка от бешенства", value: "делается животному не младше 12 недель; начинает действовать не раньше чем через 21 день после первичной прививки", kind: "official" };
const titerFact: Fact = { label: "Тест на антитела к бешенству", value: "кровь берут не раньше 30 дней после прививки; результат не ниже 0,5 МЕ/мл в лаборатории, назначенной ЕС; сертификат можно выдать не раньше чем через 90 дней после взятия крови", kind: "official" };
// Страны Annex I DVO (EU) 2026/636 (EC, BMLEH, Zoll, 05.11.2026): пункт ввоза не нужен; Норвегию источники называют по-разному, поэтому она не указана.
const annexOneFact: Fact = { label: "Швейцария и соседние страны", value: "из Швейцарии, Исландии, Лихтенштейна, Андорры, Монако, Сан-Марино, Ватикана, Гибралтара, Гренландии и с Фарерских островов пункт ввоза не нужен; с паспортом животного, выданным в одной из этих стран, сертификат не нужен", kind: "official" };
const limitFact: Fact = { label: "Сколько животных", value: "не больше 5 в одном транспортном средстве, если поездка не связана с продажей; владелец едет с животным или в пределах 5 дней до или после него", kind: "official" };
const berFact: Fact = { label: "Пункт ввоза в Берлине", value: "аэропорт BER, Grenzveterinärdienst (пограничная ветеринарная служба): пн–пт 6:00–22:00, сб, вс и праздники 8:30–17:00, тел. (0331) 8683 550, Gvd.BER@lavg.brandenburg.de", kind: "official" };

function afterArrival(a: Answers): Step[] {
  const steps: Step[] = [];
  if (a.animal === "dog") steps.push(step("После въезда зарегистрируйте собаку в Берлине", "Собаку вносят в центральный реестр (Hunderegister) сразу после начала содержания в Берлине; у неё должен быть микрочип. Порядок регистрации и налога: в маршруте о собаке.", "Онлайн", dogRoute, act("Service Berlin: регистрация собаки", "https://service.berlin.de/dienstleistung/330785/")));
  if (a.from !== "eu" && (a.animal === "dog" || a.animal === "cat")) steps.push(step("Оформите EU-Heimtierausweis (паспорт животного)", "Паспорт ЕС выдают животным, хозяева которых живут в ЕС. Он нужен для поездок между странами ЕС. Порядок: в маршруте о паспорте.", "Лично", passportRoute, act("BMLEH: EU-Heimtierausweis", o.bmlehPassport)));
  steps.push(step("Выберите ветеринара в Берлине", "Маршрут покажет срочную помощь по ночам и в выходные и практики, где говорят на вашем языке.", "Выбор", vetRoute));
  return steps;
}

function petMovePlan(a: Answers): Plan {
  if (a.animal === "other") return {
    fit: "clarify",
    why: ["Кролик, грызун или рептилия"],
    title: "Для этого животного напишите в пограничную ветеринарную службу",
    summary: "Правила ЕС для поездок с животными на проверенных официальных страницах описаны для собак, кошек, хорьков и птиц. Для кроликов, грызунов и рептилий условия ввоза подтверждает ведомство на пункте ввоза.",
    steps: [
      step("Напишите в Grenzveterinärdienst BER до поездки", "Это ведомство проверяет животных, которые прилетают в Берлин из стран вне ЕС: тел. (0331) 8683 550, Gvd.BER@lavg.brandenburg.de. Укажите вид животного, страну выезда и дату.", "Звонок", act("BMLEH: список пунктов ввоза и их контакты", o.entryPointsList), act("BMLEH: пункты ввоза", o.bmlehEntryPoints)),
      step("Проверьте общие правила таможни для животных", "Таможня Германии проверяет документы и животное при въезде из стран вне ЕС.", "Онлайн", act("Zoll: ввоз домашних животных", o.zollPets), act("Your Europe: поездки с животными", o.yourEurope)),
    ],
  };
  if (a.animal === "bird") {
    const eu = a.from === "eu";
    return {
      fit: eu ? "fits" : "conditional",
      why: ["Птица", eu ? "Въезд из страны ЕС" : "Въезд из страны вне ЕС"],
      title: eu ? "Птица из страны ЕС: не больше трёх, для попугаев нужен сертификат" : "Птица из страны вне ЕС: метка, сертификат, заявление и проверка на границе",
      summary: eu ? "При въезде в Германию из другой страны ЕС можно провезти не больше трёх птиц. Для попугаев и попугайчиков (Psittacidae) нужен сертификат официального ветеринара страны выезда, не старше 10 дней в день въезда." : "С 22 апреля 2026 действуют новые правила ЕС. Каждую птицу заранее метят кольцом или чипом, владелец везёт письменное заявление, что поездка не для продажи. Не больше пяти птиц.",
      steps: eu ? [
        step("Посчитайте птиц", "Не больше трёх птиц в поездке. Если больше, действуют правила торговли.", "Выбор", act("BMLEH: поездки с птицами", o.bmlehBirds)),
        step("Для попугаев получите сертификат", "Сертификат официального ветеринара страны выезда; в день въезда ему не больше 10 дней.", "Лично", act("BMLEH: поездки с птицами", o.bmlehBirds)),
        ...afterArrival(a),
      ] : [
        step("Пометьте каждую птицу", "Закрытое кольцо на лапе или чип, с уникальным кодом. Метку ставят до всех ветеринарных мер.", "Лично", act("BMLEH: поездки с птицами", o.bmlehBirds)),
        step("Получите ветеринарный сертификат для птиц", "Сертификат по образцу ЕС (Anhang IV Teil 1 Durchführungsverordnung (EU) 2026/705) подписывает официальный ветеринар страны выезда; он действует 10 дней после выдачи. До отъезда птицы проходят одну из мер: 30 дней изоляции, прививку от птичьего гриппа H5/H7 не позже чем за 60 дней или 14 дней изоляции с отрицательным тестом.", "Лично", act("BMLEH: поездки с птицами", o.bmlehBirds)),
        step("Подготовьте письменное заявление", "Заявление владельца по образцу ЕС (Anhang V Teil 3 Durchführungsverordnung (EU) 2026/705): поездка не для продажи. Если птицу везёт доверенное лицо, владелец едет в пределах 5 дней.", "Выбор", act("BMLEH: поездки с птицами", o.bmlehBirds)),
        step("Напишите в Grenzveterinärdienst BER о ветеринарных требованиях", "Требования к здоровью птиц из вашей страны подтверждает пограничная ветеринарная служба: тел. (0331) 8683 550, Gvd.BER@lavg.brandenburg.de.", "Звонок", act("BMLEH: список пунктов ввоза и их контакты", o.entryPointsList)),
        step("После въезда держите птиц отдельно 30 дней", "Не меньше 30 дней после прибытия птиц содержат отдельно от других птиц.", "Выбор", act("BMLEH: поездки с птицами", o.bmlehBirds)),
        ...afterArrival(a),
      ],
    };
  }
  if (a.breed === "yes") return {
    fit: "insufficient",
    why: ["Собака одной из пород, ввоз которых запрещён"],
    title: "Ввезти собаку этой породы в Германию для постоянного содержания нельзя",
    summary: `Федеральный закон запрещает ввоз и провоз в Германию собак пород ${bannedBreeds}. Исключения: служебные собаки, собаки-поводыри и собаки помощи людям с инвалидностью, спасательные собаки, а также собака, которая уже законно живёт в Германии и возвращается из поездки.`,
    steps: [
      step("Проверьте, подходит ли ваше исключение", "Исключения перечислены в постановлении: служебные собаки государства, собаки-поводыри (Blindenhunde), собаки помощи (Behindertenbegleithunde), спасательные собаки; возвращение собаки, которая законно содержится в Германии; временный приезд до 4 недель с человеком, который не живёт в Германии.", "Выбор", act("Исключения из запрета (HundVerbrEinfVO § 2)", o.dogImportExceptions), act("Запрет ввоза (HundVerbrEinfG § 2)", o.dogImportBan)),
      step("Если исключение подходит, подготовьте документы для ввоза", "Для собаки действуют общие правила ЕС: чип, прививка от бешенства и документы по стране выезда. Для собаки этой породы в Берлине затем действует особый порядок регистрации.", "Онлайн", dogRoute, act("Таможня: ввоз домашних животных", o.zollPets)),
    ],
  };
  if (a.from === "unknown") return {
    fit: "clarify",
    why: ["Неизвестно, есть ли страна выезда в списке ЕС"],
    title: "Сначала найдите свою страну в списке ЕС",
    summary: "От списка зависит, нужен ли тест на антитела к бешенству за 3 месяца до поездки. В список входят, например, США, Великобритания, Канада, Сербия и Япония. Россия, Украина, Беларусь, Казахстан, Турция, Грузия, Армения и Израиль в список не входят.",
    steps: [step("Найдите страну в списке ЕС", "Если страны в списке нет, нужен тест на антитела. Затем откройте маршрут ещё раз и выберите свой вариант.", "Онлайн", act("Европейская комиссия: список стран", o.euListed), act("Европейская комиссия: ввоз животного из страны вне ЕС", o.euEntry))],
  };
  if (a.from === "eu") {
    const docs = ["EU-Heimtierausweis (паспорт животного ЕС) с номером чипа и действующей прививкой от бешенства"];
    const method: Method = {
      id: "eu-travel", kind: "in-person", title: "Поездка из страны ЕС с паспортом животного", summary: "Паспорт ЕС выдаёт ветеринар страны, где вы живёте сейчас. Отдельный пункт ввоза и сертификат не нужны.", availability: a.euDocs === "yes" ? "available" : "conditional", availabilityLabel: a.euDocs === "yes" ? "Документы подтверждены" : "После подготовки документов",
      conditions: ["Микрочип", "Паспорт ЕС", "Действующая прививка от бешенства"], documents: docs,
      facts: [vaccineFact, limitFact],
      steps: [
        step("Проверьте паспорт животного", "В паспорте должны быть номер чипа и действующая прививка от бешенства.", "Выбор", act("BMLEH: поездки с собаками, кошками и хорьками", o.bmlehTravel)),
        step("Если прививки нет, сделайте её до поездки", "Прививку делают животному не младше 12 недель; она действует не раньше чем через 21 день.", "Лично", act("Your Europe: поездки с животными", o.yourEurope)),
        ...afterArrival(a),
      ],
    };
    return { fit: a.euDocs === "yes" ? "fits" : "conditional", why: [a.animal === "dog" ? "Собака" : "Кошка или хорёк", "Въезд из страны ЕС", a.euDocs === "yes" ? "Документы подтверждены" : "Документы ещё не подтверждены"], title: "Въезд из страны ЕС: нужны чип, паспорт ЕС и прививка от бешенства", summary: "Внутри ЕС животное путешествует с паспортом ЕС. Пункт ввоза и ветеринарный сертификат не нужны.", methods: [method], singleMethodNote: "Способ один: поездка с паспортом животного ЕС.", steps: method.steps };
  }
  const unlisted = a.from === "unlisted";
  const prep = a.prep ?? "none";
  const docs = ["Ветеринарный сертификат ЕС (EU-Tiergesundheitsbescheinigung) не старше 10 дней", "Письменное заявление, что поездка не для продажи", "Записи о прививке от бешенства", ...(unlisted ? ["Результат теста на антитела к бешенству из лаборатории, назначенной ЕС"] : [])];
  const prepSteps: Step[] = [];
  if (prep === "none") {
    prepSteps.push(step("Поставьте чип", "Животное метят микрочипом. Номер чипа вносится во все документы.", "Лично", act("Европейская комиссия: ввоз животного из страны вне ЕС", o.euEntry)));
    prepSteps.push(step("Сделайте прививку от бешенства", "У уполномоченного ветеринара; животному не меньше 12 недель. Прививка действует не раньше чем через 21 день после первичной.", "Лично", act("Европейская комиссия: ввоз животного из страны вне ЕС", o.euEntry)));
  }
  if (unlisted && prep !== "titer") prepSteps.push(step("Сдайте тест на антитела к бешенству", "Кровь берёт уполномоченный ветеринар не раньше 30 дней после прививки; тест делает лаборатория, назначенная ЕС; нужен результат не ниже 0,5 МЕ/мл. После взятия крови ждите 90 дней: только потом выдают сертификат. Если прививку обновлять вовремя, тест не повторяют.", "Ожидание", act("Европейская комиссия: тест на антитела", o.euEntry), act("Таможня: ввоз домашних животных", o.zollPets)));
  const travelSteps: Step[] = [
    ...prepSteps,
    step("Получите ветеринарный сертификат ЕС", "За 10 дней до въезда или ближе: сертификат заполняет официальный или уполномоченный ветеринар страны выезда, затем его заверяет ведомство. В нём номер чипа, прививка и, если нужен, тест.", "Лично", act("BMLEH: сертификат и заявление", o.bmlehCertificate), act("Европейская комиссия: ввоз животного из страны вне ЕС", o.euEntry)),
    step("Подготовьте письменное заявление", "Заявление владельца по образцу ЕС (Anhang V Teil 2 Durchführungsverordnung (EU) 2026/705): поездка не для продажи. Если животное везёт доверенное лицо, владелец едет в пределах 5 дней.", "Выбор", act("BMLEH: сертификат и заявление", o.bmlehCertificate)),
    step("Въезжайте через пункт ввоза и предъявите животное", "Въезд из страны вне ЕС: только через пункт ввоза для путешественников, назначенный страной ЕС, куда вы въезжаете. В Берлине это аэропорт BER. Сообщите о животном на таможне: проверяют документы и считывают чип. Если чип не по стандарту ЕС, возьмите своё считывающее устройство.", "Лично", act("BMLEH: список пунктов ввоза в Германии", o.entryPointsList), act("Таможня: ввоз домашних животных", o.zollPets)),
    ...afterArrival(a),
  ];
  const timeFact: Fact = unlisted
    ? { label: "Сколько готовиться", value: prep === "titer" ? "если с даты взятия крови прошло 90 дней, остаётся сертификат за 10 дней до въезда" : "не меньше 120 дней от прививки до сертификата: 30 дней до взятия крови и 90 дней после", kind: "official" }
    : { label: "Сколько готовиться", value: prep === "none" ? "не меньше 21 дня от первичной прививки до поездки" : "сертификат: за 10 дней до въезда или ближе", kind: "official" };
  const method: Method = {
    id: "non-eu", kind: "in-person", title: "Въезд из страны вне ЕС через пункт ввоза", summary: "Сертификат страны выезда, заявление и проверка на пункте ввоза.", availability: "available", availabilityLabel: "Доступно",
    conditions: ["Микрочип", "Прививка от бешенства", ...(unlisted ? ["Тест на антитела к бешенству"] : []), "Въезд через пункт ввоза для путешественников"],
    documents: docs, facts: [timeFact, vaccineFact, ...(unlisted ? [titerFact] : []), certificateFact, berFact, limitFact, ...(unlisted ? [] : [annexOneFact])], steps: travelSteps,
  };
  return {
    fit: "fits",
    why: [a.animal === "dog" ? "Собака" : "Кошка или хорёк", unlisted ? "Страна вне списка ЕС: нужен тест на антитела" : "Страна из списка ЕС: тест на антитела не нужен", prep === "titer" ? "Тест уже сдан" : prep === "vaccinated" ? "Чип и прививка уже есть" : "Подготовка с нуля"],
    title: unlisted ? "Въезд из страны вне списка ЕС: тест на антитела и 90 дней ожидания" : "Въезд из страны вне ЕС из списка: сертификат и пункт ввоза",
    summary: unlisted
      ? "Из стран вне списка ЕС, например России, Украины, Беларуси, Казахстана или Турции, животному нужен тест на антитела к бешенству. Сертификат выдают не раньше чем через 90 дней после взятия крови, поэтому начинайте заранее."
      : "Для стран из списка ЕС тест на антитела не нужен. Нужны чип, прививка, сертификат ветеринара страны выезда и въезд через пункт ввоза.",
    methods: [method], singleMethodNote: "Способ один: въезд через пункт ввоза для путешественников.", steps: travelSteps,
  };
}

// ---------------------------------------------------------------------------
// EU-Heimtierausweis (паспорт животного ЕС)
// ---------------------------------------------------------------------------
export const petPassQuestions = [
  q("animal", "Для какого животного нужен паспорт?", [["pet", "Собака, кошка или хорёк"], ["other", "Другое животное"]]),
  q("status", "Какой у вас случай?", [["first", "Паспорта ещё нет: животное приехало из страны вне ЕС или появилось в Германии"], ["eu", "Есть паспорт другой страны ЕС, теперь живу в Берлине"]]),
  q("chip", "Есть ли у животного микрочип?", [["yes", "Да"], ["no", "Нет"], ["unknown", "Не знаю"]]),
  q("rabies", "Есть ли действующая прививка от бешенства?", [["yes", "Да, есть запись о прививке"], ["no", "Нет или срок истёк"]]),
] as const;

export function petPassVisible(a: Answers): readonly Question[] {
  const [animal, status, chip, rabies] = petPassQuestions;
  if (a.animal !== "pet") return [animal];
  if (a.status !== "first") return [animal, status];
  return [animal, status, chip, rabies];
}

const passportCostFact: Fact = { label: "Стоимость", value: "по тарифу Gebührenordnung für Tierärzte (GOT): от одинарной до тройной ставки, решает практика; фиксированной суммы для паспорта нет", kind: "official" };

function petPassPlan(a: Answers): Plan {
  if (a.animal === "other") return {
    fit: "redirect",
    why: ["Не собака, не кошка и не хорёк"],
    title: "Паспорт ЕС выдают только собакам, кошкам и хорькам",
    summary: "Для других животных паспорта ЕС нет. Правила поездок с ними: в маршруте о переезде с животным.",
    steps: [step("Откройте правила для вашего животного", "Для птиц, кроликов, грызунов и рептилий действуют другие правила ввоза.", "Онлайн", act("Маршрут: переезд с животным", "/berlin/pereezd-s-zhivotnym"), act("Европейская комиссия: вопросы и ответы", o.euFaq))],
    next: act("Маршрут: переезд с животным", "/berlin/pereezd-s-zhivotnym"),
  };
  if (a.status === "eu") return {
    fit: "fits",
    why: ["Паспорт ЕС уже есть"],
    title: "Паспорт другой страны ЕС остаётся действительным",
    summary: "Новый паспорт не нужен: паспорт ЕС действует во всех странах ЕС. Паспорта старого образца остаются действительными бессрочно, если записи о прививке от бешенства полные. С 1 января 2028 новые паспорта выдают по обновлённому образцу.",
    steps: [
      step("Проверьте прививку в паспорте", "Если срок прививки от бешенства истекает, обновите её у ветеринара в Берлине: он внесёт запись в тот же паспорт.", "Лично", vetRoute, act("BMLEH: EU-Heimtierausweis", o.bmlehPassport)),
      step("Обновите данные владельца, если они изменились", "В паспорте указаны контакты владельца; новые данные вносит ветеринар.", "Лично", vetRoute, act("Европейская комиссия: вопросы и ответы", o.euFaq)),
    ],
    next: vetRoute,
  };
  const needChip = a.chip !== "yes";
  const needVaccine = a.rabies === "no";
  const steps: Step[] = [
    step("Запишитесь к ветеринару в Берлине", "Паспорт выдаёт ветеринар, которому ведомство разрешило выдавать паспорта ЕС. Паспорт получают только владельцы, которые живут в ЕС.", "Выбор", vetRoute, act("BMLEH: EU-Heimtierausweis", o.bmlehPassport)),
    ...(needChip ? [step(a.chip === "unknown" ? "Проверьте чип у ветеринара" : "Поставьте микрочип", a.chip === "unknown" ? "Ветеринар считает чип сканером. Если чипа нет, его ставят на том же приёме, и номер вносят в паспорт." : "Чип ставит ветеринар; его номер вносят в паспорт. Чип в Берлине обязателен для каждой собаки.", "Лично", act("BMLEH: EU-Heimtierausweis", o.bmlehPassport), act("Сенат Берлина: правила содержания собак", o.dogLawFaq))] : []),
    ...(needVaccine ? [step("Сделайте прививку от бешенства", "Животному не меньше 12 недель. Для поездок прививка начинает действовать не раньше чем через 21 день после первичной.", "Лично", act("Your Europe: поездки с животными", o.yourEurope))] : []),
    step("Получите паспорт", "В паспорт вносят описание животного, номер чипа, прививку от бешенства и контакты владельца и ветеринара.", "Лично", act("BMLEH: EU-Heimtierausweis", o.bmlehPassport)),
  ];
  const method: Method = {
    id: "vet", kind: "in-person", title: "У ветеринара с правом выдавать паспорта", summary: "Паспорт оформляют на приёме в ветеринарной практике.", availability: "available", availabilityLabel: "Доступно",
    conditions: ["Вы живёте в ЕС", "Собака, кошка или хорёк"],
    documents: ["Записи о прививках и ветеринарный сертификат, если животное въехало из страны вне ЕС", "Ваше имя и адрес в Берлине: их вносят в паспорт"],
    facts: [passportCostFact, { label: "Где нужен", value: "обязателен для поездок между странами ЕС", kind: "official" }],
    steps,
  };
  return {
    fit: needChip || needVaccine ? "conditional" : "fits",
    why: ["Собака, кошка или хорёк", needChip ? (a.chip === "no" ? "Чипа нет" : "Неизвестно, есть ли чип") : "Чип есть", needVaccine ? "Прививки нет или срок истёк" : "Прививка есть"],
    title: needChip || needVaccine ? "Паспорт выдадут после чипа и прививки от бешенства" : "Оформите паспорт ЕС у ветеринара",
    summary: "Паспорт ЕС (EU-Heimtierausweis) нужен для поездок между странами ЕС. Его выдаёт ветеринар в Берлине; стоимость считают по тарифу ветеринаров (GOT).",
    methods: [method], singleMethodNote: "Способ один: приём у ветеринара.", steps,
    next: vetRoute,
  };
}

// ---------------------------------------------------------------------------
// Ветеринар в Берлине
// ---------------------------------------------------------------------------
export const vetQuestions = [
  q("need", "Что сейчас нужно?", [["routine", "Обычный приём: осмотр, прививка, чип, паспорт"], ["today", "Срочно сегодня, в обычные часы приёма"], ["night", "Срочно ночью, в выходные или праздник"], ["life", "Угроза жизни: тяжёлая травма, отравление, животное без сознания"]]),
  q("lang", "На каком языке вам нужен приём?", [["de", "Подойдёт немецкий"], ["ru", "Русский"], ["uk", "Украинский"], ["en", "Английский"], ["tr", "Турецкий"], ["ar", "Арабский"], ["es", "Испанский"], ["it", "Итальянский"], ["fr", "Французский"], ["pt", "Португальский"], ["pl", "Польский"]]),
] as const;

export function vetVisible(a: Answers): readonly Question[] {
  return a.need === "routine" || a.need === "today" ? vetQuestions : [vetQuestions[0]];
}

const VET_CHECKED = "Данные с собственных сайтов практик, проверены 5 ноября 2026 года.";
type VetPractice = Provider & { langs: string[] };
const lang = (value: string): Fact => ({ label: "Языки", value, kind: "provider" });
const where = (value: string): Fact => ({ label: "Адрес и запись", value, kind: "provider" });
const vetPractices: VetPractice[] = [
  { id: "hansavet", name: "Tierärzteteam Hansavet", label: "Хансафиртель · собаки и кошки", summary: "Практика только для собак и кошек. Онлайн-запись на немецком, английском или русском; можно написать в WhatsApp.", langs: ["de", "en", "ru", "uk"],
    facts: [lang("немецкий, английский, русский, украинский"), where("Bartningallee 5, 10557 Berlin; телефон и WhatsApp 030 39 88 69 66")], links: [act("Hansavet: сайт практики", "https://team-hansavet.de/?lang=en")] },
  { id: "peters", name: "Tierarztpraxis Dr. Anja Peters", label: "Вайсензе", summary: "Практика в районе Pankow, Prenzlauer Berg и Weißensee.", langs: ["de", "en", "pl", "ar", "es"],
    facts: [lang("немецкий, английский, польский, арабский, испанский"), where("Bizetstr. 48, 13088 Berlin; +49 30 927 34 41; пн 9–16, вт 12–18, ср 10–12, чт 12–18, пт 9–16")], links: [act("Dr. Anja Peters: сайт практики", "https://www.tierarztpraxis-peters-weissensee.de/en/")] },
  { id: "otto-suhr", name: "Tierarztpraxis Tante Käthe & Onkel Bolle", label: "Шарлоттенбург", summary: "Приём пн–пт 9–19 на немецком и английском. Приём на арабском – по понедельникам 10–12, на французском – по договорённости.", langs: ["de", "en", "ar", "fr"],
    facts: [lang("немецкий и английский; арабский по понедельникам 10–12; французский по договорённости"), where("Otto-Suhr-Allee 49, 10585 Berlin; 030 845 11 801")], links: [act("Tante Käthe & Onkel Bolle: сайт практики", "https://www.tierarzt-otto-suhr.de/")] },
  { id: "lorenz", name: "Tierarztpraxis Dr. Renate Lorenz", label: "Лихтерфельде", summary: "Практика пишет, что говорит по-английски, французски, итальянски, испански и немного по-португальски.", langs: ["de", "en", "fr", "it", "es", "pt"],
    facts: [lang("английский, французский, итальянский, испанский; португальский немного"), where("Oberhofer Weg 68, 12209 Berlin; (030) 711 63 57; пн–сб 9–12, пн, вт, чт, пт 16–18; приём и выезд на дом по договорённости")], links: [act("Dr. Renate Lorenz: о практике", "https://www.tier-arzt.berlin/a-brief-overview/")] },
  { id: "ulusal", name: "Kleintierpraxis G. Ulusal", label: "Веддинг · собаки, кошки, грызуны", summary: "Сайт и форма записи практики есть на немецком и турецком. Отдельно язык приёма на сайте не назван.", langs: ["de"],
    facts: [lang("сайт и запись на немецком и турецком"), where("Prinzenallee 72–73, 13357 Berlin; 030 493 60 60, запись по телефону")], links: [act("Kleintierpraxis Ulusal: сайт практики", "https://www.tierarzt-in-wedding.de/")] },
];

const feeFact: Fact = { label: "Стоимость приёма", value: "по тарифу Gebührenordnung für Tierärzte (GOT): от одинарной до тройной ставки; в обычные часы приёма надбавки за время нет", kind: "official" };
const emergencyFeeFact: Fact = { label: "Стоимость ночью, в выходные и праздники", value: "в рамках дежурной службы ставка не ниже двойной (до четверной) и плата за дежурство 50 € один раз за обращение", kind: "official" };

function vetPlan(a: Answers): Plan {
  if (a.need === "life") return {
    fit: "fits",
    why: ["Угроза жизни животного"],
    title: "Сразу везите животное в клинику с круглосуточной службой",
    summary: "Tierärztekammer Berlin (ветеринарная палата) просит обращаться в клиники только при угрозе жизни: из-за нагрузки там бывают очереди. Позвоните в клинику по дороге.",
    steps: [
      step("Позвоните в клинику с круглосуточной службой и выезжайте", "Круглосуточно: Klinik für Klein- und Heimtiere, Alt-Biesdorf 22, 030 51 43 760; Valera, Potsdamer Str. 23/24, 030 201 80 57 50; Tierarztpraxis Bärenwiese, Uhlandstr. 151, 030 23 36 26 27; Tierarztpraxis Rödiger, Scharnweberstr. 136, 030 412 73 57; VetZentrum Berlin, Märkische Allee 258, 030 93 22 093.", "Звонок", act("Tierärztekammer Berlin: дежурные клиники", o.vetEmergency)),
      step("Если отвезти нельзя, вызовите ветеринара на дом", "Tierärzte im Notdienst – Berlin & Brandenburg: 0157 859 49 631, круглосуточно, выезд на дом.", "Звонок", act("Tierärztekammer Berlin: дежурная служба", o.vetEmergency)),
      step("Возьмите документы животного", "Паспорт животного или записи о прививках и номер чипа, если они под рукой.", "Выбор", act("Тариф ветеринаров в дежурные часы (GOT § 4)", o.vetEmergencyFees)),
    ],
    methods: [{ id: "clinic", kind: "in-person", title: "Клиника с круглосуточной службой", summary: "Приём без записи по срочности.", availability: "available", availabilityLabel: "Круглосуточно", conditions: ["Угроза жизни животного"], documents: ["Паспорт животного или записи о прививках, если есть"], facts: [emergencyFeeFact], steps: [
      step("Позвоните в клинику с круглосуточной службой и выезжайте", "Круглосуточно: Klinik für Klein- und Heimtiere, Alt-Biesdorf 22, 030 51 43 760; Valera, Potsdamer Str. 23/24, 030 201 80 57 50; Tierarztpraxis Bärenwiese, Uhlandstr. 151, 030 23 36 26 27; Tierarztpraxis Rödiger, Scharnweberstr. 136, 030 412 73 57; VetZentrum Berlin, Märkische Allee 258, 030 93 22 093.", "Звонок", act("Tierärztekammer Berlin: дежурные клиники", o.vetEmergency)),
      step("Если отвезти нельзя, вызовите ветеринара на дом", "Tierärzte im Notdienst – Berlin & Brandenburg: 0157 859 49 631, круглосуточно, выезд на дом.", "Звонок", act("Tierärztekammer Berlin: дежурная служба", o.vetEmergency)),
      step("Приезжайте и предупредите о срочности", "Клиники принимают по степени срочности; ожидание бывает долгим.", "Лично", act("Tierärztekammer Berlin: дежурные клиники", o.vetEmergency)),
    ] }],
    singleMethodNote: "Способ один: клиника с круглосуточной службой.",
  };
  if (a.need === "night") return {
    fit: "fits",
    why: ["Нужна помощь ночью, в выходные или праздник"],
    title: "Выберите практику с дежурными часами или выезд на дом",
    summary: "Tierärztekammer Berlin публикует список практик, которые работают в выходные и праздники, и круглосуточный выезд на дом. Клиники нужны только при угрозе жизни.",
    steps: [
      step("Найдите ближайшую дежурную практику", "Например: Tiermedizinzentrum Evidensia, Kufsteiner Str. 22, 030 85 42 050, ежедневно 9–24; Tierklinik Freie Universität, Oertzenweg 19 b, 030 838 62422, в выходные и праздники 10–18, можно без звонка; Tierarztpraxis Lenk, Schönfließer Str. 1, 030 44 69 769, вс и праздники 10–18. Полный список с часами: у палаты.", "Выбор", act("Tierärztekammer Berlin: дежурные практики", o.vetEmergency)),
      step("Или вызовите ветеринара на дом", "Tierärzte im Notdienst – Berlin & Brandenburg: 0157 859 49 631, круглосуточно.", "Звонок", act("Tierärztekammer Berlin: дежурная служба", o.vetEmergency)),
      step("Учтите тариф дежурной службы", "Ставка не ниже двойной и плата за дежурство 50 € один раз за обращение.", "Выбор", act("Тариф ветеринаров в дежурные часы (GOT § 4)", o.vetEmergencyFees)),
    ],
    methods: [
      { id: "duty", kind: "in-person", title: "Дежурная ветеринарная практика", summary: "Приём в практике в объявленные дежурные часы.", availability: "conditional", availabilityLabel: "По графику дежурной службы", conditions: ["Срочно, но без угрозы жизни", "Проверьте актуальные часы и позвоните перед поездкой"], documents: ["Паспорт животного или записи о прививках, если есть"], facts: [emergencyFeeFact], steps: [
        step("Найдите ближайшую дежурную практику", "Например: Tiermedizinzentrum Evidensia, Kufsteiner Str. 22, 030 85 42 050, ежедневно 9–24; Tierklinik Freie Universität, Oertzenweg 19 b, 030 838 62422, в выходные и праздники 10–18, можно без звонка; Tierarztpraxis Lenk, Schönfließer Str. 1, 030 44 69 769, вс и праздники 10–18. Полный список с часами: у палаты.", "Выбор", act("Tierärztekammer Berlin: дежурные практики", o.vetEmergency)),
        step("Позвоните перед поездкой", "Подтвердите, что практика принимает сейчас, и сообщите о состоянии животного.", "Звонок", act("Tierärztekammer Berlin: дежурные практики", o.vetEmergency)),
      ] },
      { id: "home", kind: "phone", title: "Вызов ветеринара на дом", summary: "Позвоните в выездную ветеринарную службу и сообщите адрес и состояние животного.", availability: "conditional", availabilityLabel: "Доступность выезда подтверждают по телефону", conditions: ["Срочно, но без угрозы жизни", "Возможность и время выезда подтверждает служба"], documents: ["Паспорт животного или записи о прививках, если есть"], facts: [emergencyFeeFact], steps: [
        step("Вызовите ветеринара на дом", "Tierärzte im Notdienst – Berlin & Brandenburg: 0157 859 49 631, круглосуточно.", "Звонок", act("Tierärztekammer Berlin: дежурная служба", o.vetEmergency)),
        step("Подготовьте документы и адрес", "Назовите точный адрес и подготовьте записи о прививках, если они есть.", "Звонок", act("Tierärztekammer Berlin: дежурная служба", o.vetEmergency)),
      ] },
    ],
  };
  const code = a.lang ?? "de";
  const matching = code === "de" ? vetPractices : vetPractices.filter((practice) => practice.langs.includes(code));
  const providers: Provider[] = (matching.length ? matching : vetPractices.filter((practice) => practice.langs.includes("en"))).map(({ langs: _langs, ...practice }) => practice);
  const today = a.need === "today";
  const noMatch = code !== "de" && matching.length === 0;
  const steps: Step[] = [
    step(today ? "Позвоните в практику сегодня" : "Запишитесь в практику", today ? "Скажите, что дело срочное: практики принимают срочные случаи в часы работы. Если до конца часов приёма не успеваете, используйте список дежурных практик." : "Ниже практики, где язык приёма указан на их собственном сайте. Записаться можно по телефону или на сайте практики.", today ? "Звонок" : "Выбор", act("Tierärztekammer Berlin: дежурные практики", o.vetEmergency)),
    step("Возьмите документы животного", "Паспорт животного или записи о прививках, номер чипа, если он есть. Если нужен паспорт ЕС, его оформляют на этом же приёме.", "Выбор", passportRoute),
    step("Оплата по тарифу ветеринаров", "Стоимость считают по Gebührenordnung für Tierärzte (GOT): от одинарной до тройной ставки.", "Выбор", act("Тариф ветеринаров (GOT § 2)", o.vetFees)),
  ];
  const method: Method = {
    id: "practice", kind: "in-person", title: "Приём в ветеринарной практике", summary: "Практики с подтверждённым языком приёма.", availability: "available", availabilityLabel: "В часы работы практики",
    conditions: ["Запись по телефону или на сайте практики"], documents: ["Паспорт животного или записи о прививках"], facts: [feeFact], providers,
    providersTitle: code === "de" ? "Практики, где можно говорить и на других языках" : noMatch ? "Практики с английским языком" : "Практики, где говорят на выбранном языке",
    providersNote: `${VET_CHECKED} Это не рейтинг и не рекомендация. Официального списка ветеринаров по языкам нет ни у Tierärztekammer Berlin, ни у города, поэтому NOSTRES показывает только практики, которые сами называют язык на своём сайте.${noMatch ? " Практики, где на сайте указан выбранный язык, NOSTRES пока не нашёл." : ""}`,
    steps,
  };
  return {
    fit: noMatch ? "conditional" : "fits",
    why: [today ? "Срочно сегодня, в обычные часы приёма" : "Обычный приём", code === "de" ? "Подойдёт немецкий" : noMatch ? "Практик с выбранным языком пока нет" : "Нужен приём на выбранном языке"],
    title: noMatch ? "Практики с выбранным языком пока не подтверждены: ниже практики с английским" : today ? "Позвоните в практику сегодня" : "Выберите практику и запишитесь",
    summary: noMatch ? "Ниже практики, где на сайте указан английский язык. Срочную помощь ночью и в выходные покажет вариант «Срочно ночью»." : "Ниже практики, где язык приёма указан на их собственном сайте. Стоимость считают по тарифу ветеринаров (GOT).",
    methods: [method], singleMethodNote: "Способ один: приём в практике.", steps,
  };
}

// ---------------------------------------------------------------------------
// Дрессировка, Hundeschule и экзамен Hundeführerschein
// ---------------------------------------------------------------------------
export const dogTrainerQuestions = [
  q("goal", "Что вам нужно?", [["trainer", "Найти дрессировщика или Hundeschule (школу для собак)"], ["exam", "Сдать экзамен и гулять без поводка (Hundeführerschein)"], ["listed", "Wesenstest (проверка поведения) или экспертиза породы для собаки из списка опасных"]]),
  q("since", "Собака жила у вас в Берлине до 22 июля 2016 года?", [["no", "Нет"], ["yes", "Да, и это можно подтвердить"]]),
  q("age", "Сколько лет собаке?", [["adult", "Год или больше"], ["young", "Меньше года"]]),
] as const;

export function dogTrainerVisible(a: Answers): readonly Question[] {
  const [goal, since, age] = dogTrainerQuestions;
  if (a.goal !== "exam") return [goal];
  if (a.since !== "no") return [goal, since];
  return [goal, since, age];
}

function dogTrainerPlan(a: Answers): Plan {
  if (a.goal === "listed") return {
    fit: "fits",
    why: ["Собака из списка опасных пород"],
    title: "Wesenstest и экспертиза породы: у признанного эксперта Сената",
    summary: "Проверку поведения (Wesenstest) и экспертизу породы (Rassegutachten) проводят только эксперты, которых признал Сенат Берлина. Сроки и весь порядок для собаки из списка: в маршруте о собаке.",
    steps: [
      step("Выберите эксперта в официальном списке", "В списке Сената можно отфильтровать эксперта по виду проверки: Wesenstest или Rassegutachten. Там есть адрес, телефон и e-mail.", "Онлайн", act("Сенат Берлина: признанные эксперты", o.dogExperts)),
      step("Пройдите весь порядок для собаки из списка", "Уведомление Ordnungsamt, Sachkunde, страховка и Wesenstest: со сроками в маршруте о собаке.", "Онлайн", dogRoute),
    ],
    next: dogRoute,
  };
  if (a.goal === "trainer") return {
    fit: "fits",
    why: ["Нужен дрессировщик или Hundeschule"],
    title: "Выберите дрессировщика с разрешением ведомства",
    summary: "Кто за деньги дрессирует чужих собак или учит владельцев, обязан получить разрешение ветеринарного надзора по § 11 закона о защите животных (Tierschutzgesetz). Открытого списка таких дрессировщиков Берлин не публикует, поэтому проверяйте разрешение у самого дрессировщика.",
    steps: [
      step("Попросите показать разрешение по § 11 TierSchG", "Разрешение (Erlaubnis nach § 11 Abs. 1 Nr. 8 f TierSchG) выдаёт отдел Veterinär- und Lebensmittelaufsicht района, где работает школа. Дрессировщик без него работать за деньги не вправе.", "Выбор", act("Закон о защите животных, § 11", o.trainerPermitLaw), act("Нойкёльн: профессиональная работа с животными", o.trainerPermitBerlin)),
      step("Если сомневаетесь в разрешении, напишите в ветеринарный надзор района", "Разрешение выдаёт Veterinär- und Lebensmittelaufsicht района, где находится школа. Контакты отделов: в списке Ordnungsämter.", "Онлайн", act("Service Berlin: Ordnungsämter и ветеринарный надзор", o.ordnungsaemter)),
      step("Если цель: гулять без поводка, после занятий сдайте экзамен", "Освобождение от поводка даёт Sachkundebescheinigung (Hundeführerschein). Экзамен принимает признанный эксперт Сената.", "Онлайн", act("Сенат Берлина: правила и экзамен", o.dogLawFaq), act("Сенат Берлина: признанные эксперты", o.dogExperts)),
    ],
    next: dogRoute,
  };
  if (a.since === "yes") return {
    fit: "fits",
    why: ["Собака жила у вас в Берлине до 22 июля 2016 года"],
    title: "Экзамен не нужен: подтвердите, что собака жила у вас до 22 июля 2016",
    summary: "Для собак, которые жили у владельца до 22 июля 2016 года (Bestandshunde), Sachkundebescheinigung не требуется. Подтверждение: например, полис страховки, налоговое уведомление или запись в паспорте животного.",
    steps: [
      step("Подготовьте подтверждение", "Подойдут полис страхования ответственности, налоговое уведомление о собаке или запись в паспорте животного, датированные до 22 июля 2016.", "Выбор", act("Сенат Берлина: правила и экзамен", o.dogLawFaq)),
      step("Соблюдайте места, где поводок обязателен всегда", "Даже без общего правила поводок обязателен в парках, лесах без знака зоны без поводка, в общих зонах домов, в пешеходных зонах, в людных местах и в транспорте. На детские площадки, в купальни и на места для купания собак брать нельзя.", "Выбор", act("Сенат Берлина: правила и экзамен", o.dogLawFaq)),
    ],
    next: dogRoute,
  };
  const young = a.age === "young";
  const steps: Step[] = [
    ...(young ? [step("Дождитесь, когда собаке исполнится год", "К практической части экзамена допускают собаку не младше одного года. До этого можно заниматься с дрессировщиком.", "Ожидание", act("Сенат Берлина: правила и экзамен", o.dogLawFaq))] : []),
    step("Выберите эксперта для экзамена", "В официальном списке Сената отфильтруйте вид «Sachkundeprüfung». Там адрес, телефон и e-mail эксперта.", "Онлайн", act("Сенат Берлина: признанные эксперты", o.dogExperts)),
    step("Сдайте теорию и практику", "Теория: 30 вопросов с вариантами ответа, 45 минут, нужно 70 % правильных, под наблюдением. Практика: проверка послушания с вашей собакой.", "Лично", act("Сенат Берлина: правила и экзамен", o.dogLawFaq)),
    step("Подайте заявление в Ordnungsamt своего района", "С результатом экзамена Ordnungsamt выдаёт Sachkundebescheinigung. Она действует для вас и этой собаки. С документом из другой земли Германии Ordnungsamt выдаст берлинский без повторного экзамена.", "Лично", act("Service Berlin: Ordnungsämter", o.ordnungsaemter), act("Сенат Берлина: правила и экзамен", o.dogLawFaq)),
  ];
  const method: Method = {
    id: "exam", kind: "in-person", title: "Экзамен у признанного эксперта и заявление в Ordnungsamt", summary: "Экзамен из двух частей, затем документ из Ordnungsamt района.", availability: young ? "conditional" : "available", availabilityLabel: young ? "После того как собаке исполнится год" : "Доступно",
    conditions: ["Собаке не меньше года", "Экзамен у эксперта из списка Сената"], documents: ["Результат экзамена от эксперта", "Документ, удостоверяющий личность"],
    facts: [{ label: "Без экзамена", value: "Sachkundebescheinigung получают и без экзамена ветеринары, проводники служебных собак и те, кто держал собаку 3 года без происшествий за последние 5 лет", kind: "official" }, { label: "Стоимость экзамена", value: "на странице Сената не указана: её называет эксперт", kind: "none" }],
    steps,
  };
  return {
    fit: young ? "conditional" : "fits",
    why: ["Хотите гулять без поводка", "Собака появилась после 22 июля 2016 года", young ? "Собаке меньше года" : "Собаке год или больше"],
    title: young ? "Экзамен: после того как собаке исполнится год" : "Сдайте экзамен у эксперта и получите документ в Ordnungsamt",
    summary: "Hundeführerschein (Sachkundebescheinigung) добровольный: он освобождает от общего правила о поводке в Берлине. В парках, лесах без знака зоны без поводка и в транспорте поводок всё равно обязателен.",
    methods: [method], singleMethodNote: "Способ один: экзамен у признанного эксперта.", steps,
    next: dogRoute,
  };
}

export type PetRouteId = "petmove" | "petpass" | "vet" | "dogtrainer";
export function petsVisible(id: PetRouteId, a: Answers): readonly Question[] {
  if (id === "petmove") return petMoveVisible(a);
  if (id === "petpass") return petPassVisible(a);
  if (id === "vet") return vetVisible(a);
  return dogTrainerVisible(a);
}
export function petsPlan(id: PetRouteId, a: Answers): Plan {
  if (id === "petmove") return petMovePlan(a);
  if (id === "petpass") return petPassPlan(a);
  if (id === "vet") return vetPlan(a);
  return dogTrainerPlan(a);
}
