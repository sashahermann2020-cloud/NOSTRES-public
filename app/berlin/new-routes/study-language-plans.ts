import type { Action, Answers, Fact, Method, Plan, Provider, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

/** Официальные источники маршрутов «Языковые курсы» и «Учёба». Проверены 29 октября 2026. */
export const studyOfficial = {
  vhsCourses: "https://www.berlin.de/vhs/kurse/deutsch-integration/deutsch-und-integrationsangebote/",
  vhsLanguages: "https://www.berlin.de/vhs/kurse/sprachen/vhs-sprachleitfaden-2026-2027_web.pdf",
  vhsContact: "https://www.berlin.de/vhs/service/formular.406135.php",
  goetheBerlin: "https://www.goethe.de/ins/de/de/ort/ber.html",
  goetheExams: "https://www.goethe.de/ins/de/de/prf/ort/ber.html",
  navi: "https://bamf-navi.bamf.de/de/",
  courseKinds: "https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Integrationskurse/SpezielleKursarten/speziellekursarten-node.html",
  secondScript: "https://www.BAMF.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Integrationskurse/SpezielleKursarten/Zweitschrift/zweitschrift-node.html",
  literacy: "https://www.BAMF.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Integrationskurse/SpezielleKursarten/Alphabetisierung/alphabetisierung.html",
  jobLanguage: "https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/sprachkurse",
  anabin: "https://anabin.kmk.org/",
  uniAssist: "https://www.uni-assist.de/",
  uniAssistKolleg: "https://www.uni-assist.de/bewerben/vorab-informieren/studienkolleg/",
  kollegFu: "https://www.fu-berlin.de/studienkolleg",
  hwr: "https://www.hwr-berlin.de/studium/bewerbung/voraussetzungen-fuer-dein-studium",
  daadProgrammes: "https://www.daad.de/en/studying-in-germany/advisory-service/international-programmes/",
  myGuide: "https://www.myguide.de/en/",
  compass: "https://www.hochschulkompass.de/",
  ausbildung: "https://www.arbeitsagentur.de/arbeiten-in-deutschland/ausbildung-in-deutschland",
  ausbildungBoard: "https://www.make-it-in-germany.com/de/arbeiten-in-deutschland/jobboerse/ausbildung",
  ihkBoard: "https://www.ihk.de/berlin/ausbildung/infos-fuer-azubis/fuer-schueler-und-studenten/weg-zur-ausbildung/neue-lehrstellenboerse-2252088",
  uniAssistDocs: "https://www.uni-assist.de/bewerben/dokumente-sammeln/zeugnisse/",
  uniAssistTranslations: "https://www.uni-assist.de/en/how-to-apply/assemble-your-documents/certified-copies-and-translations/",
  hwrHzb: "https://www.hwr-berlin.de/fileadmin/portal/Dokumente/Studium/Beratung/Handreichung-HZB.pdf",
  baAdvice: "https://web.arbeitsagentur.de/fbwo/fbwo-ui/pd/anfrage",
  baNow: "https://mein-now.de/weiterbildungssuche/",
  baAusbildungBerlin: "https://www.arbeitsagentur.de/jobsuche/suche?suchbereich=ausbildung&wo=Berlin",
  nowBeratungBerlin: "https://mein-now.de/privatpersonen/beratung/berlin",
  hkOhneAbitur: "https://www.hochschulkompass.de/studium/studiengangsuche/studieren-ohne-abitur.html",
  hkBerlin: "https://www.hochschulkompass.de/studium/studiengangsuche/erweiterte-studiengangsuche.html?tx_szhrksearch_pi1%5Bsearch%5D=1&tx_szhrksearch_pi1%5Bstudtyp%5D=3&tx_szhrksearch_pi1%5Bbundesland%5D%5B0%5D=3&tx_szhrksearch_pi1%5Bresults_at_a_time%5D=100",
  hkBerlinDe: "https://www.hochschulkompass.de/studium/studiengangsuche/erweiterte-studiengangsuche.html?tx_szhrksearch_pi1%5Bsearch%5D=1&tx_szhrksearch_pi1%5Bstudtyp%5D=3&tx_szhrksearch_pi1%5Bbundesland%5D%5B0%5D=3&tx_szhrksearch_pi1%5Bsprache%5D=1&tx_szhrksearch_pi1%5Bresults_at_a_time%5D=100",
  hkBerlinEn: "https://www.hochschulkompass.de/studium/studiengangsuche/erweiterte-studiengangsuche.html?tx_szhrksearch_pi1%5Bsearch%5D=1&tx_szhrksearch_pi1%5Bstudtyp%5D=3&tx_szhrksearch_pi1%5Bbundesland%5D%5B0%5D=3&tx_szhrksearch_pi1%5Bsprache%5D=2&tx_szhrksearch_pi1%5Bresults_at_a_time%5D=100",
  baDocs: "https://web.arbeitsagentur.de/fbwo/fbwo-ui/pd/dokumente-einreichen",
  visa: "https://www.auswaertiges-amt.de/de/service/visa-und-aufenthalt/nationale-visa",
};
const o = studyOfficial;

/** Языки, письменность которых не латинская: им подходит курс для тех, кто учит латиницу. */
const nonLatin = new Set(["ru", "uk", "ar"]);

// ---------------------------------------------------------------------------
// Языковые курсы
// ---------------------------------------------------------------------------
export const sprachkursQuestions = [
  q("learn", "Какой язык вы хотите учить?", [["de", "Немецкий"], ["en", "Английский"], ["other", "Другой язык: испанский, итальянский, русский и другие"]]),
  q("support", "На каком языке вам удобно получать объяснения?", [["de", "Достаточно немецкого"], ["ru", "Русский"], ["uk", "Украинский"], ["en", "Английский"], ["tr", "Турецкий"], ["ar", "Арабский"], ["es", "Испанский"], ["it", "Итальянский"], ["fr", "Французский"], ["pl", "Польский"], ["other", "Другой язык"]]),
  q("level", "Какой у вас уровень языка, который вы хотите учить?", [["none", "Начинаю с нуля"], ["basic", "Уровень A1 или A2: простые фразы"], ["advanced", "Уровень B1 и выше"]]),
  q("funding", "Кто оплачивает курс?", [["integration", "У меня есть право на Integrationskurs: первый вид на жительство или статус, который это даёт"], ["agency", "Меня направляют Jobcenter или Arbeitsagentur на языковой курс для работы"], ["own", "Оплачу сам(а)"]]),
  q("goal", "Для чего вам немецкий?", [["daily", "Повседневная жизнь и общение"], ["work", "Работа и профессия"], ["exam", "Сертификат или экзамен"], ["study", "Поступление в вуз"]]),
] as const;

export function sprachkursVisible(a: Answers): readonly Question[] {
  const [learn, support, level, funding, goal] = sprachkursQuestions;
  const list: Question[] = [learn, support, level];
  if (a.learn === "de") list.push(funding, goal);
  return list;
}

export function sprachkursPlan(a: Answers): Plan {
  const german = a.learn === "de";
  const learnName = a.learn === "de" ? "немецкий" : a.learn === "en" ? "английский" : "другой";
  const note = "Это общая информация, а не юридическая консультация. Условия взяты с официальных страниц Berlin vhs, BAMF, Arbeitsagentur и Goethe-Institut; цены и свободные места указывает организатор курса.";

  const supportFact: Fact = {
    label: "Язык объяснений",
    value: a.support === "de"
      ? "на официальных страницах он не указан; курсы идут на языке, который вы учите"
      : "на официальных страницах язык объяснений не указан, и фильтра по нему в официальных каталогах нет. Курсы идут на языке, который вы учите. Если вам нужны пояснения на вашем языке, ищите организатора, который сам называет его в описании курса",
    kind: "none",
  };

  // Не немецкий: городские курсы иностранных языков.
  if (!german) {
    const vhs: Method = {
      id: "vhs-languages", kind: "in-person", title: "Курсы иностранных языков в vhs Берлина",
      summary: "Городская народная школа Берлина (Volkshochschule) ведёт курсы почти пятидесяти языков по шкале от A1 до C2.",
      availability: "available", availabilityLabel: "Доступно всем жителям",
      conditions: ["Набор языков и уровней зависит от района: в справочнике есть таблица по каждому vhs"],
      documents: ["Документ, удостоверяющий личность, при записи"],
      facts: [
        { label: "Языки", value: "справочник vhs 2026/2027 перечисляет, среди прочих, английский, испанский, итальянский, французский, русский, украинский, турецкий, арабский и польский", kind: "official" },
        { label: "Уровни", value: "от A1 до C2; не во всех районах есть каждый уровень", kind: "official" },
        supportFact,
      ],
      steps: [
        step("Выберите язык и уровень в справочнике", "В справочнике vhs найдите нужный язык и таблицу районов: она показывает, где есть ваш уровень.", "Онлайн", act("Справочник языков vhs Берлина", o.vhsLanguages)),
        step("Запишитесь на курс в выбранном vhs", "Откройте страницу района, найдите курс по языку и уровню и запишитесь. По вопросам свободных мест и оплаты есть контактная форма vhs Берлина.", "Онлайн", act("Курсы vhs Берлина", o.vhsCourses), act("Контактная форма vhs Берлина", o.vhsContact)),
      ],
    };
    return { fit: "fits", why: [`Язык для изучения: ${learnName}`, `Уровень: ${a.level === "none" ? "с нуля" : a.level === "basic" ? "A1–A2" : "B1 и выше"}`], title: a.learn === "en" ? "Курсы: английский язык в Берлине" : "Курсы: другой язык в Берлине", summary: "Для других языков, кроме немецкого, официальный путь в Берлине идёт через городскую vhs: выберите язык, район и уровень.", methods: [vhs], singleMethodNote: "Способ один: курс в vhs. Государственного допуска для таких курсов не нужно.", steps: vhs.steps, note };
  }

  // Немецкий: письменность и уровень определяют форму курса.
  const script = a.support !== "de" && nonLatin.has(a.support);
  const scriptStep = script && a.level === "none"
    ? step("Выберите курс для тех, кто учит латиницу", "Ваш язык пишется не латиницей. В интеграционных курсах для таких случаев есть формат Zweitschriftlernende (для людей со школьным образованием, которым нужно освоить латинский алфавит); для тех, кто мало читал и писал на родном языке, есть Alphabetisierungskurs (курс с обучением чтению и письму).", "Выбор", act("BAMF: курс для изучающих вторую письменность", o.secondScript), act("BAMF: курс с обучением письму", o.literacy))
    : undefined;

  const integration: Method = {
    id: "integration", kind: "combined", title: "Integrationskurs (интеграционный курс по допуску)",
    summary: "Государственный курс немецкого и ориентации в стране; цена для участника ограничена, возможно освобождение.",
    availability: "conditional", availabilityLabel: "Нужен допуск от Ausländerbehörde или BAMF",
    conditions: ["Допуск (Teilnahmeberechtigung) от ведомства по делам иностранцев или решение BAMF"],
    documents: ["Справка о допуске к курсу или решение BAMF", "Документ, удостоверяющий личность"],
    facts: [
      { label: "Объём", value: "общий курс: языковая часть и Orientierungskurs; точные часы, цену и освобождение от взноса показывает отдельный маршрут Integrationskurs", kind: "official" },
      { label: "Формы курса", value: "кроме общего есть Alphabetisierung, Zweitschriftlernende, Förderkurs и Intensivkurs", kind: "official" },
      supportFact,
    ],
    steps: [
      step("Проверьте допуск и порядок записи", "Допуск, цена и освобождение от взноса разобраны в отдельном маршруте. Откройте его и пройдите вопросы.", "Онлайн", act("Маршрут: Integrationskurs", "/berlin/integrationskurs"), act("BAMF: специальные курсы", o.courseKinds)),
      ...(scriptStep ? [scriptStep] : []),
      step("Найдите организатора курса рядом с домом", "В официальной системе BAMF-NAvI покажите курсы поблизости и выберите организатора с подходящей формой курса.", "Онлайн", act("BAMF-NAvI: поиск курсов", o.navi), act("BAMF: специальные курсы", o.courseKinds)),
    ],
  };

  const job: Method = {
    id: "job-language", kind: "combined", title: "Berufssprachkurs (немецкий для работы)",
    summary: "Курс профессионального немецкого. Бесплатен при направлении Arbeitsagentur или Jobcenter и для некоторых работающих.",
    availability: "conditional", availabilityLabel: a.funding === "agency" ? "По вашему направлению" : "Нужно право или направление",
    conditions: ["Право или направление от Arbeitsagentur либо Jobcenter, либо участие как работающий человек по правилам курса", "Предложение курсов сейчас временно ограничено, по данным Arbeitsagentur"],
    documents: ["Направление или подтверждение права на курс", "Документ, удостоверяющий личность", "Подтверждённый уровень немецкого, если его требует курс"],
    facts: [
      { label: "Стоимость", value: "бесплатно при направлении или праве от Arbeitsagentur и Jobcenter, для Auszubildende и работающих с низким доходом; иначе нужен взнос, половину можно вернуть через BAMF", kind: "official" },
      { label: "Уровни", value: "базовые курсы повседневного рабочего немецкого и специальные курсы по профессиям, например для ухода, ремесла и торговли; в конце обычно экзамен и сертификат", kind: "official" },
      supportFact,
    ],
    steps: [
      step("Получите направление или подтвердите право", "Обратитесь в Arbeitsagentur или Jobcenter с запросом на Berufssprachkurs. Они выдают направление или подтверждают право.", "Лично", act("Arbeitsagentur: языковые курсы", o.jobLanguage), act("Berlin vhs: Berufssprachkurse", o.vhsCourses)),
      step("Найдите организатора через поиск Arbeitsagentur", "Поиск организаторов Berufssprachkurse находится на сайте Arbeitsagentur. vhs Берлина тоже проводит такие курсы с уровнями B2–C2.", "Онлайн", act("Arbeitsagentur: поиск курсов", o.jobLanguage), act("Berlin vhs: Berufssprachkurse", o.vhsCourses)),
    ],
  };

  const providers: Provider[] = [
    {
      id: "vhs", name: "Berlin vhs (городская народная школа)", label: "Городской организатор",
      summary: "Offene Deutschkurse: уровни A1–C2, интенсивные, еженедельные, онлайн и смешанные форматы; для женщин и для родителей есть отдельные предложения.",
      facts: [
        { label: "Уровни", value: "A1–C2", kind: "official" },
        { label: "Цена", value: "зависит от длины и формата курса; единой цены на странице нет", kind: "none" },
        { label: "Язык объяснений", value: "на странице не указан", kind: "none" },
      ],
      links: [act("Deutsch- und Integrationsangebote", o.vhsCourses), act("Контактная форма vhs Берлина", o.vhsContact)],
    },
    {
      id: "goethe", name: "Goethe-Institut Berlin", label: "Федеральный культурный институт",
      summary: "Курсы немецкого: интенсивные, утренние, вечерние, индивидуальные и онлайн. Перед началом проходят входной тест. Экзамены Goethe-Zertifikat, Goethe-Test PRO и TestDaF сдают в Берлине.",
      facts: [
        { label: "Уровни", value: "A1–C2", kind: "official" },
        { label: "Формат", value: "интенсивный курс 50 учебных часов за две недели; есть вечерние и онлайн-курсы", kind: "official" },
        { label: "Язык объяснений", value: "на странице не указан", kind: "none" },
      ],
      links: [act("Goethe-Institut Berlin: курсы", o.goetheBerlin), act("Goethe-Institut Berlin: экзамены", o.goetheExams)],
    },
  ];
  const own: Method = {
    id: "own", kind: "in-person", title: "Платный курс по вашему выбору",
    summary: a.goal === "exam" || a.goal === "study" ? "Курс с подготовкой к экзамену и сам экзамен: выберите организатора ниже." : "Выберите организатора ниже: городскую школу vhs или Goethe-Institut.",
    availability: "available", availabilityLabel: "Без допуска, за свой счёт",
    conditions: ["Цена и свободные места указаны у организатора курса"],
    documents: ["Документ, удостоверяющий личность, при записи"],
    facts: [supportFact],
    providers, providersTitle: "Организаторы с официальных страниц", providersNote: "Это городской и федеральный организаторы. Частные школы в список не входят: у них нет официального каталога с проверяемыми условиями.",
    steps: [
      step("Определите уровень", a.level === "none" ? "Начните с A1. Многие организаторы предлагают входной тест, чтобы подобрать группу." : "Пройдите входной тест у выбранного организатора, чтобы попасть в группу вашего уровня.", "Онлайн", act("Goethe-Institut Berlin: курсы", o.goetheBerlin), act("Berlin vhs: курсы", o.vhsCourses)),
      step(a.goal === "exam" || a.goal === "study" ? "Запишитесь на курс с подготовкой к экзамену" : "Запишитесь на курс", a.goal === "study" ? "Для поступления в вуз обычно нужен уровень C1. Подготовка и сам экзамен разобраны в маршруте об учёбе." : a.goal === "exam" ? "Экзамены Goethe-Zertifikat, Goethe-Test PRO и TestDaF проходят в Берлине; даты и цены есть на странице экзаменов." : a.goal === "work" ? "Для рабочего немецкого подходит Berufssprachkurs. Если направления нет, возьмите обычный курс и выбирайте тему «для работы» у организатора." : "Выберите расписание: утро, вечер, интенсив или онлайн.", "Онлайн", act("Goethe-Institut Berlin: курсы", o.goetheBerlin), act("Berlin vhs: курсы", o.vhsCourses), a.goal === "exam" ? act("Goethe-Institut Berlin: экзамены", o.goetheExams) : undefined),
    ],
  };

  const methods: Method[] = a.funding === "integration" ? [integration, own] : a.funding === "agency" ? [job, own] : a.goal === "work" ? [own, job] : [own];
  const fitIs: Plan["fit"] = a.funding === "own" ? "fits" : "conditional";
  const next: Action = a.goal === "study" ? act("Маршрут: учёба в вузе или Ausbildung", "/berlin/studium-ausbildung") : act("Маршрут: Integrationskurs", "/berlin/integrationskurs");
  return {
    fit: fitIs,
    why: [`Учите: немецкий`, a.support === "de" ? "Объяснения на немецком подходят" : "Нужны объяснения на вашем языке", a.funding === "integration" ? "Есть право на Integrationskurs" : a.funding === "agency" ? "Направление от Arbeitsagentur или Jobcenter" : "Оплата своими силами", `Цель: ${a.goal === "daily" ? "повседневная жизнь" : a.goal === "work" ? "работа" : a.goal === "exam" ? "экзамен" : "поступление в вуз"}`],
    title: a.funding === "integration" ? "Начните с Integrationskurs" : a.funding === "agency" ? "Получите направление на Berufssprachkurs" : "Выберите курс немецкого",
    summary: a.funding === "integration" ? "При праве на Integrationskurs он обычно самый выгодный путь. Платные курсы остаются запасным вариантом." : a.funding === "agency" ? "Курс для работы бесплатен по направлению. Платные курсы идут запасным вариантом." : "Без допуска остаются платные курсы: городская vhs и Goethe-Institut.",
    methods, steps: methods[0].steps, next, note,
  };
}

// ---------------------------------------------------------------------------
// Учёба: университет, Studienkolleg, Ausbildung
// ---------------------------------------------------------------------------
export const studyQuestions = [
  q("goal", "Куда вы хотите поступить?", [["uni", "В университет или Fachhochschule (вуз прикладных наук)"], ["kolleg", "В Studienkolleg (подготовительный год к вузу)"], ["ausbildung", "На Ausbildung (профессиональное обучение с оплатой от работодателя)"], ["weiter", "На Weiterbildung или Umschulung (повышение квалификации или переподготовка) через Arbeitsagentur"]]),
  q("cert", "Признают ли в Германии ваш школьный аттестат или диплом?", [["yes", "Да, проверено в базе anabin"], ["unsure", "Не знаю"], ["none", "Школьного аттестата нет"]]),
  q("teach", "На каком языке вы хотите учиться?", [["de", "На немецком"], ["en", "На английском"], ["any", "Подойдёт любой"]]),
  q("german", "Какой у вас немецкий?", [["none", "Почти нет"], ["b1", "B1: могу объясниться в повседневных ситуациях"], ["c1", "C1 и выше: свободно"]]),
  q("place", "Где вы сейчас?", [["abroad", "За пределами Германии"], ["inde", "В Германии, есть вид на жительство"]]),
  q("voc", "Есть ли у вас профессиональная квалификация?", [["master", "Да: Meister, Fachwirt или другое повышение квалификации от 400 часов"], ["trained", "Да: профессиональное обучение длиной от двух лет"], ["none", "Нет"]]),
  q("work", "Какая у вас сейчас ситуация с работой?", [["jobless", "Без работы или работа под угрозой"], ["employed", "Работаю"]]),
] as const;

export function studyVisible(a: Answers): readonly Question[] {
  const [goal, cert, teach, german, place, voc, work] = studyQuestions;
  if (a.goal === "weiter") return [goal, work];
  const list: Question[] = [goal, cert];
  if (a.cert === "none" && a.goal === "uni") return [...list, voc];
  if (a.cert === "none" && a.goal !== "ausbildung") return list;
  if (a.goal === "uni") list.push(teach);
  const skipGerman = a.goal === "uni" && a.teach === "en" && a.cert === "yes";
  if (!skipGerman) list.push(german);
  list.push(place);
  return list;
}

export function studyPlan(a: Answers): Plan {
  const note = "Это общая информация, а не юридическая консультация. Условия взяты с официальных страниц uni-assist, DAAD, HWR Berlin, Arbeitsagentur и Auswärtiges Amt; требования называет каждый вуз или работодатель.";
  const course = act("Маршрут: языковые курсы", "/berlin/sprachkurs");
  const visaStep = a.place === "abroad"
    ? [step("Оформите национальную визу", "За пределами Германии нужна национальная виза с целью обучения. Порядок, документы и сбор называет посольство; для учёбы нужен документ о приёме, для Ausbildung договор или подтверждённое место.", "Лично", act("Auswärtiges Amt: национальные визы", o.visa))]
    : [step("Проверьте вид на жительство для учёбы", "В Германии вид на жительство для учёбы или Ausbildung оформляют в Landesamt für Einwanderung (берлинском ведомстве по делам иностранцев). Откройте маршрут вида на жительство.", "Онлайн", act("Маршрут: Aufenthaltstitel", "/berlin/aufenthalt"), act("Auswärtiges Amt: национальные визы", o.visa))];

  // Weiterbildung и Umschulung через Arbeitsagentur
  if (a.goal === "weiter") {
    const jobless = a.work !== "employed";
    const steps: Step[] = [
      step("Запишитесь на консультацию в Arbeitsagentur", jobless ? "Консультацию по Weiterbildung запрашивают онлайн. Консультант решает, нужна ли вам Weiterbildung или Umschulung, и выдаёт Bildungsgutschein: документ, по которому Arbeitsagentur оплачивает курс." : "Консультацию по Weiterbildung запрашивают онлайн. Если вы работаете, Arbeitsagentur рассматривает поддержку отдельно, и консультант называет, что доступно в вашем случае.", "Онлайн", act("Arbeitsagentur: запрос консультации", o.baAdvice), act("mein NOW: консультация в Берлине", o.nowBeratungBerlin)),
      step("Найдите курс в каталоге mein NOW", "Каталог mein NOW собирает курсы Weiterbildung по профессии и городу. Выберите курс у организатора, прошедшего официальную сертификацию. Условия по языку и допуску названы в описании курса.", "Онлайн", act("mein NOW: поиск курса", o.baNow), act("Arbeitsagentur: Ausbildung", o.ausbildung)),
      step("Передайте документы в Arbeitsagentur", jobless ? "Документы по Bildungsgutschein загружают онлайн. Пока идёт курс, обычно сохраняется Arbeitslosengeld, а дополнительно возможно Weiterbildungsgeld 150 € в месяц." : "Документы для поддержки загружают онлайн; решение принимает Arbeitsagentur.", "Онлайн", act("Arbeitsagentur: загрузка документов", o.baDocs), act("mein NOW: поиск курса", o.baNow)),
    ];
    return {
      fit: jobless ? "fits" : "conditional",
      why: ["Цель: Weiterbildung или Umschulung", jobless ? "Без работы или работа под угрозой" : "Вы работаете"],
      title: "Путь к Weiterbildung через Arbeitsagentur",
      summary: jobless ? "Курс по профессии можно пройти за счёт Arbeitsagentur по Bildungsgutschein. Начните с консультации." : "Работающим помощь рассматривается отдельно. Начните с консультации в Arbeitsagentur.",
      steps, next: course, note,
    };
  }

  // Ausbildung
  if (a.goal === "ausbildung") {
    const certStep = a.cert === "yes" ? undefined : a.cert === "none"
      ? step("Узнайте, какой аттестат нужен", "Для Ausbildung нужен школьный аттестат, признанный в Германии. Если его нет, начните с консультации Berufsberatung в Arbeitsagentur: специалист подскажет путь.", "Лично", act("Arbeitsagentur: Ausbildung", o.ausbildung))
      : step("Проверьте аттестат в базе anabin", "В базе anabin ищут страну и тип документа. Признание платное, документ подтверждают перед Berufsschule.", "Онлайн", act("anabin: база оценки зарубежных документов", o.anabin), act("Arbeitsagentur: Ausbildung", o.ausbildung));
    const language = a.german === "none"
      ? step("Начните с немецкого", "Занятия в Berufsschule идут на немецком, и для визы обычно нужен уровень B1. Сначала выберите курс.", "Выбор", course, act("Arbeitsagentur: Ausbildung", o.ausbildung))
      : step(a.german === "b1" ? "Подтвердите B1 сертификатом" : "Сохраните сертификат немецкого", a.german === "b1" ? "B1 обычно достаточно для визы. Для поступления приготовьте сертификат; Berufsschule всё равно преподаёт на немецком." : "С уровнем C1 вы закрываете требование визы и языка Berufsschule. Приготовьте сертификат для работодателя и посольства.", "Выбор", act("Arbeitsagentur: Ausbildung", o.ausbildung), act("Arbeitsagentur: Ausbildung", o.ausbildung));
    const steps: Step[] = [
      ...(certStep ? [certStep] : []),
      language,
      step("Найдите место Ausbildung", "Подавайте заявки работодателям напрямую; Arbeitsagentur помогает с поиском бесплатно. Начало обычно весной или осенью. Места ищут в бирже Make it in Germany и в бирже IHK Берлина.", "Онлайн", act("Arbeitsagentur: места Ausbildung в Берлине", o.baAusbildungBerlin), act("Make it in Germany: биржа Ausbildung", o.ausbildungBoard), act("IHK Берлин: Lehrstellenbörse", o.ihkBoard)),
      ...visaStep,
    ];
    return {
      fit: a.german === "none" || a.cert !== "yes" ? "insufficient" : "fits",
      why: ["Цель: Ausbildung", a.cert === "yes" ? "Аттестат признан" : a.cert === "unsure" ? "Признание аттестата не проверено" : "Школьного аттестата нет", a.german === "none" ? "Немецкого почти нет" : a.german === "b1" ? "Немецкий B1" : "Немецкий C1", a.place === "abroad" ? "Вы за пределами Германии" : "Вы уже в Германии"],
      title: "Путь к Ausbildung в Берлине",
      summary: "Обучение идёт на немецком: в школе Berufsschule и на предприятии. Работодатель платит вам Ausbildungsvergütung (оплату обучающегося), срок обучения от двух до трёх с половиной лет.",
      steps, next: act("Маршрут: Anerkennung", "/berlin/anerkennung"), note,
    };
  }

  // Studieren ohne Abitur: профессиональная квалификация вместо аттестата
  if (a.cert === "none" && a.goal === "uni" && (a.voc === "master" || a.voc === "trained")) {
    const master = a.voc === "master";
    return {
      fit: "conditional",
      why: ["Школьного аттестата нет", master ? "Квалификация Meister, Fachwirt или от 400 часов" : "Профессиональное обучение от двух лет"],
      title: "Поступление в вуз без аттестата",
      summary: master ? "Квалификация Meister, Fachwirt или повышение квалификации от 400 часов даёт общий допуск к вузу." : "Профессиональное обучение от двух лет даёт допуск к направлениям, близким к вашей профессии. Остальные открывает вступительное испытание Zugangsprüfung.",
      steps: [
        step(master ? "Подтвердите общий допуск" : "Подтвердите допуск по профессии", master ? "Повышение квалификации вроде Meister или Fachwirt от 400 часов приравнивается к аттестату и открывает любое направление." : "Обучение от двух лет по регулируемой государством профессии открывает направления по профилю. Для других направлений сдают Zugangsprüfung. Опыт работы с 2021 года не нужен.", "Онлайн", act("HWR Berlin: допуск без аттестата", o.hwrHzb), act("HWR Berlin: условия поступления", o.hwr)),
        step("Подтвердите зарубежную квалификацию", "Зарубежная квалификация учитывается, если признана равноценной немецкой. Равноценность подтверждает процедура Anerkennung.", "Онлайн", act("Маршрут: Anerkennung", "/berlin/anerkennung"), act("HWR Berlin: допуск без аттестата", o.hwrHzb)),
        step("Найдите программу", "Все программы Германии ищите в Hochschulkompass. Язык обучения указан в описании программы.", "Онлайн", act("Hochschulkompass: каталог программ", o.compass), act("Hochschulkompass: программы без аттестата", o.hkOhneAbitur)),
        step("Приготовьте документы и подайте заявку", "Заявки международных абитуриентов обычно идут через uni-assist: сервис проверяет документы. Перечень и переводы разобраны на страницах uni-assist.", "Онлайн", act("uni-assist: документы", o.uniAssistDocs), act("uni-assist: переводы", o.uniAssistTranslations)),
      ],
      next: act("Маршрут: Anerkennung", "/berlin/anerkennung"), note,
    };
  }

  // Нет аттестата
  if (a.cert === "none") return {
    fit: "redirect",
    why: ["Школьного аттестата нет"],
    title: "Без аттестата путь в вуз другой",
    summary: "Для вуза нужна признанная в Германии Hochschulzugangsberechtigung (документ о допуске к вузу). Если её нет, есть Ausbildung, а при профессиональной квалификации и опыте работы у вузов есть отдельные правила допуска.",
    steps: [
      step("Посмотрите правила допуска вуза", "На странице HWR Berlin видно, что при профессиональной квалификации и нескольких годах опыта вместо аттестата действует отдельный порядок «Studieren ohne Abitur». Каждый вуз называет условия сам.", "Онлайн", act("HWR Berlin: условия поступления", o.hwr), act("uni-assist: подготовка", o.uniAssist)),
      step("Рассмотрите Ausbildung", "Профессиональное обучение не требует вузовского допуска. Измените ответ на «Ausbildung» вверху, и маршрут покажет шаги.", "Выбор", act("Arbeitsagentur: Ausbildung", o.ausbildung)),
    ],
    next: act("Маршрут: Anerkennung", "/berlin/anerkennung"), note,
  };

  // Studienkolleg
  if (a.goal === "kolleg") {
    const steps: Step[] = [
      step(a.cert === "yes" ? "Убедитесь, что вам нужен Studienkolleg" : "Проверьте, нужен ли вам Studienkolleg", a.cert === "yes" ? "Если ваш аттестат даёт прямой доступ к вузу, Studienkolleg не нужен. Проверку делает uni-assist." : "Если аттестата или предыдущего образования не хватает для прямого поступления, помогает Studienkolleg: год подготовки и экзамен Feststellungsprüfung. Сначала проверьте доступ в базе anabin и через uni-assist.", "Онлайн", act("uni-assist: Studienkolleg", o.uniAssistKolleg), act("anabin: база оценки зарубежных документов", o.anabin)),
      a.german === "none"
        ? step("Начните с немецкого", "В Studienkolleg преподают на немецком, нужен подтверждённый уровень. Это относится и к тем, кто потом хочет учиться на английском. Выберите курс.", "Выбор", course, act("uni-assist: Studienkolleg", o.uniAssistKolleg))
        : step("Подготовьте сертификат немецкого", "Принимаемые сертификаты и уровень у каждого Studienkolleg свои. Подайте заявку раньше срока: результат приходит за четыре–шесть недель, рекомендуют минимум за восемь недель до дедлайна.", "Онлайн", act("uni-assist: Studienkolleg", o.uniAssistKolleg), act("Studienkolleg FU Berlin", o.kollegFu)),
step("Соберите документы для заявки", "Для бакалавриата и Studienkolleg: школьный аттестат, дающий право на вуз, целиком вместе с таблицей предметов и оценок; подтверждение вступительного экзамена, если вы его сдавали; при прежней учёбе вне Германии таблица предметов и оценок, а после выпуска диплом. Для магистратуры: диплом и таблица предметов и оценок. Систему оценок вашего вуза приложите в виде ссылки на сайт вуза или PDF с официальной системой; ссылки на anabin и Wikipedia не подходят. Документы загружают целиком, без пропущенных страниц, двусторонние с обеих сторон. Подлинными считаются документы с подписью и печатью, пометкой о машинной выдаче или кодом проверки. Каждый документ загружают один раз, даже при заявках в несколько вузов.", "Онлайн", act("uni-assist: документы", o.uniAssistDocs), act("uni-assist: переводы", o.uniAssistTranslations)),
      step("Переведите документы", "Загружайте оригинал вместе с переводом на немецкий или английский, включая таблицу оценок. Переводить может присяжный переводчик, лицо, уполномоченное судом, или уполномоченный отдел школы либо вуза, выдавшего документ. Если ваша страна выдаёт документы на немецком или английском, перевод не нужен. Исключения указаны на странице вашей страны.", "Онлайн", act("uni-assist: переводы", o.uniAssistTranslations), act("uni-assist: документы", o.uniAssistDocs)),
      step("Подайте заявку в Studienkolleg", "В Берлине действует Studienkolleg Свободного университета (FU Berlin). Есть не по всем направлениям, поэтому проверьте нужное на странице колледжа. Платежи по заявке идут только через портал uni-assist.", "Онлайн", act("Studienkolleg FU Berlin", o.kollegFu), act("uni-assist: Studienkolleg", o.uniAssistKolleg)),
      ...visaStep,
    ];
    return { fit: a.german === "none" ? "insufficient" : "fits", why: ["Цель: Studienkolleg", a.cert === "yes" ? "Аттестат признан" : "Признание аттестата не проверено", a.german === "none" ? "Немецкого почти нет" : "Немецкий есть", a.place === "abroad" ? "Вы за пределами Германии" : "Вы уже в Германии"], title: "Путь в Studienkolleg", summary: "Studienkolleg готовит к вузу по предмету и языку. Обучение идёт на немецком. После экзамена Feststellungsprüfung можно поступать на выбранные направления.", steps, next: act("Маршрут: языковые курсы", "/berlin/sprachkurs"), note };
  }

  // Университет или Fachhochschule
  const uniLists: Step[] = [];
  const needDe = a.teach !== "en";
  const needEn = a.teach !== "de";
  const cStep = needDe
    ? (a.german === "c1"
      ? step("Подготовьте сертификат немецкого C1", "Для программ на немецком HWR Berlin требует минимум C1. Принимаются DSH-2, TestDaF с результатом TDN 4, немецкая часть экзамена Studienkolleg, Goethe-Zertifikat C2 и telc Deutsch C1 Hochschule.", "Онлайн", act("HWR Berlin: условия поступления", o.hwr), act("Goethe-Institut Berlin: экзамены", o.goetheExams))
      : step("Дойдите до C1 по немецкому", "Для программ на немецком нужен уровень C1 с сертификатом: DSH-2, TestDaF TDN 4, telc Deutsch C1 Hochschule или Goethe-Zertifikat C2. Выберите курс и экзамен.", "Выбор", course, act("HWR Berlin: условия поступления", o.hwr)))
    : undefined;
  const find = step(
    a.teach === "en" ? "Найдите программу на английском" : a.teach === "de" ? "Найдите программу на немецком" : "Найдите программу на нужном языке",
    a.teach === "en"
      ? "Каталог DAAD International Programmes собирает программы, где занятия идут преимущественно на английском. Он встроен в поиск My GUIDE. Знание английского подтверждается по требованиям программы; немецкий для самой программы смотрите на её странице."
      : a.teach === "de"
        ? "Все программы Германии по языку и городу ищите в Hochschulkompass, каталоге ректоров вузов. Найдите программы по предмету и городу Берлин: язык обучения указан в описании каждой программы."
        : "Hochschulkompass показывает все программы Германии; программы с занятиями преимущественно на английском собраны в DAAD International Programmes в поиске My GUIDE. Сравните оба каталога и выберите язык под себя.",
    "Онлайн",
    a.teach === "de" ? act("Hochschulkompass: Берлин, обучение на немецком", o.hkBerlinDe) : a.teach === "en" ? act("Hochschulkompass: Берлин, обучение на английском", o.hkBerlinEn) : act("Hochschulkompass: программы в Берлине", o.hkBerlin),
    a.teach === "de" ? act("Hochschulkompass: каталог программ", o.compass) : act("DAAD: программы на английском", o.myGuide),
    a.teach === "de" ? undefined : act("DAAD: International Programmes", o.daadProgrammes),
  );
  uniLists.push(find);
  if (cStep) uniLists.push(cStep);
  if (needEn && !needDe) uniLists.push(step("Проверьте требования к английскому", "На странице программы указано, какой экзамен по английскому нужен. HWR Berlin отмечает, что для программ не на немецком обычно требуют английский или французский без указания единого теста.", "Онлайн", act("HWR Berlin: условия поступления", o.hwr), act("DAAD: International Programmes", o.daadProgrammes)));
  if (a.cert === "unsure") uniLists.push(step("Проверьте допуск аттестата в базе anabin", "В базе anabin видно, даёт ли аттестат прямой доступ к вузу или нужен Studienkolleg. Для магистратуры первая степень должна быть признана сопоставимой с немецким бакалавром.", "Онлайн", act("anabin: база оценки зарубежных документов", o.anabin), act("uni-assist: Studienkolleg", o.uniAssistKolleg)));
  uniLists.push(step("Соберите документы для заявки", "Для бакалавриата и Studienkolleg: школьный аттестат, дающий право на вуз, целиком вместе с таблицей предметов и оценок; подтверждение вступительного экзамена, если вы его сдавали; при прежней учёбе вне Германии таблица предметов и оценок, а после выпуска диплом. Для магистратуры: диплом и таблица предметов и оценок. Систему оценок вашего вуза приложите в виде ссылки на сайт вуза или PDF с официальной системой; ссылки на anabin и Wikipedia не подходят. Документы загружают целиком, без пропущенных страниц, двусторонние с обеих сторон. Подлинными считаются документы с подписью и печатью, пометкой о машинной выдаче или кодом проверки. Каждый документ загружают один раз, даже при заявках в несколько вузов.", "Онлайн", act("uni-assist: документы", o.uniAssistDocs), act("uni-assist: переводы", o.uniAssistTranslations)));
  uniLists.push(step("Переведите документы", "Загружайте оригинал вместе с переводом на немецкий или английский, включая таблицу оценок. Переводить может присяжный переводчик, лицо, уполномоченное судом, или уполномоченный отдел школы либо вуза, выдавшего документ. Если ваша страна выдаёт документы на немецком или английском, перевод не нужен. Исключения указаны на странице вашей страны.", "Онлайн", act("uni-assist: переводы", o.uniAssistTranslations), act("uni-assist: документы", o.uniAssistDocs)));
  uniLists.push(step("Подайте документы через uni-assist", "Заявки международных абитуриентов на бакалавриат и магистратуру обычно идут через uni-assist: сервис проверяет документы об образовании. Сроки у каждого вуза свои, а у Studienkolleg они раньше.", "Онлайн", act("uni-assist: подача заявки", o.uniAssist), act("HWR Berlin: условия поступления", o.hwr)));
  uniLists.push(...visaStep);

  return {
    fit: needDe && a.german !== "c1" ? "conditional" : "fits",
    why: ["Цель: университет или Fachhochschule", a.teach === "en" ? "Язык обучения: английский" : a.teach === "de" ? "Язык обучения: немецкий" : "Язык обучения: любой", a.cert === "yes" ? "Аттестат признан" : "Признание аттестата не проверено", ...(a.german ? [a.german === "none" ? "Немецкого почти нет" : a.german === "b1" ? "Немецкий B1" : "Немецкий C1"] : []), a.place === "abroad" ? "Вы за пределами Германии" : "Вы уже в Германии"],
    title: a.teach === "en" ? "Путь на программу на английском" : a.teach === "de" ? "Путь на программу на немецком" : "Путь в вуз Берлина",
    summary: a.teach === "en" ? "Программы на английском собраны в каталоге DAAD. Для самой программы немецкий обычно не нужен, но требования называет вуз." : "Для программ на немецком нужен сертификат C1. Каждый вуз Берлина называет свои сроки и условия.",
    steps: uniLists,
    next: course, note,
  };
}
