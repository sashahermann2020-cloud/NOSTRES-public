import type { Action, Answers, Fact, Method, Plan, Question, Step } from "./route-model.ts";
import { familyWorkOfficial as fw } from "./family-work-plans.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

export const statusOfficial = {
  basicNeeds: "https://www.arbeitsagentur.de/en/node/4645",
  alToBasic: "https://www.arbeitsagentur.de/en/node/4680",
  merkblatt: "https://www.arbeitsagentur.de/datei/merkblatt-sgb2_ba043375.pdf",
  basicChanges: "https://www.bmas.de/DE/Arbeit/Grundsicherung-fuer-Arbeitsuchende/FAQ-Was-aendert-sich-mit-der-neuen-Grundsicherung-Leistungsberechtigte/faq-was-aendert-sich-mit-der-neuen-grundsicherung-leistungsberechtigte.html",
  basicHousing: "https://www.arbeitsagentur.de/grundsicherung/wohnen",
  basicDuties: "https://www.arbeitsagentur.de/grundsicherung/pflichten-verstehen-und-beachten/rechte-pflichten-minderungen",
  berlinRent: "https://www.berlin.de/sen/soziales/soziale-sicherung/kosten-der-unterkunft-av-wohnen/flyer-uebernahme-von-wohn--und-heizkosten-_-fragen-und-antworten---stand-2026.pdf",
  kfzDuty: "https://www.gesetze-im-internet.de/fzv_2023/__15.html",
  kfzTypes: "https://www.gesetze-im-internet.de/fzv_2023/__2.html",
  multiCitizen: "https://www.bundesregierung.de/breg-de/aktuelles/modernisierung-staatsangehoerigkeitsrecht-2215610",
  rates: "https://www.bundesregierung.de/breg-de/service/fragen-und-anworten/nullrunde-buergergeld-2383676",
  kfzFromOutside: "https://service.berlin.de/dienstleistung/120918/",
  kfzWithin: "https://service.berlin.de/dienstleistung/120658/standort/121364/",
  kfzSlot: "https://service.berlin.de/terminvereinbarung/termin/provider/121364/120918/",
  plate: "https://service.berlin.de/dienstleistung/121484/",
  naturalisation: "https://service.berlin.de/dienstleistung/318998/",
  naturalisationTest: "https://service.berlin.de/dienstleistung/351180/",
  welcomeCentre: "https://willkommenszentrum.berlin.de/en/residence-status/einburgerung-naturalization",
};
const s = statusOfficial;

// ---------------------------------------------------------------------------
// Arbeitslosengeld
// ---------------------------------------------------------------------------
export const alQuestions = [
  q("months", "Сколько месяцев вы платили взносы по безработице за последние 30 месяцев?", [["m24", "24 месяца или больше"], ["m12", "От 12 до 23 месяцев"], ["short", "Меньше 12, но я часто работал по коротким срочным договорам до 14 недель"], ["less", "Меньше 12 месяцев, коротких договоров нет"]]),
  q("status", "Какое у вас гражданство и право на работу?", [["eu", "ЕС, ЕЭЗ или Швейцария"], ["permit", "Другое гражданство, вид на жительство с правом работать"], ["nopermit", "Права работать в Германии нет"]]),
  q("kids", "Есть ли у вас или у вашего партнёра ребёнок по налоговому праву?", [["yes", "Да"], ["no", "Нет"]]),
  q("end", "Как закончилась или заканчивается работа?", [["employer", "Работодатель уволил не из-за моего поведения или срок договора истёк"], ["own", "Я уволился сам"], ["agreement", "Подписал соглашение о расторжении (Aufhebungsvertrag)"], ["behaviour", "Уволили из-за нарушения"]]),
  q("age", "Сколько вам лет?", [["u50", "Меньше 50"], ["o50", "50 и больше"]]),
] as const;

export function alVisible(a: Answers): readonly Question[] {
  const [months, status, kids, end, age] = alQuestions;
  if (a.months === "less") return [months];
  if (a.status === "nopermit") return [months, status];
  if (a.months === "m12" || a.months === "m24") return [months, status, kids, end, age];
  return [months, status, kids, end];
}

export function alPlan(a: Answers): Plan {
  const benefit = act("Bundesagentur: Arbeitslosengeld", fw.unemploymentBenefit);
  const register = act("Bundesagentur: регистрация безработным", fw.unemployedRegister);
  const note = "Это общая информация, а не юридическая консультация. Условия взяты со страницы Bundesagentur für Arbeit об Arbeitslosengeld.";
  const next = act("Маршрут: Jobcenter", "/berlin/jobcenter");
  if (a.months === "less") return {
    fit: "redirect",
    why: ["Меньше 12 месяцев взносов", "Коротких договоров нет"],
    title: "Права на Arbeitslosengeld пока нет: нужен стаж взносов",
    summary: "Для Arbeitslosengeld нужно не меньше 12 месяцев обязательного или добровольного страхования за последние 30 месяцев до регистрации. Если работы нет, а денег не хватает, помощь даёт Grundsicherungsgeld.",
    steps: [step("Подайте на Grundsicherungsgeld", "Grundsicherungsgeld (до июля 2026 года Bürgergeld) платит Jobcenter, оно не зависит от стажа взносов. Маршрут показывает сумму, условия и заявление.", "Онлайн", act("Маршрут: Grundsicherungsgeld", "/berlin/grundsicherungsgeld"), benefit)],
    next: act("Маршрут: Grundsicherungsgeld", "/berlin/grundsicherungsgeld"),
    note,
  };
  if (a.status === "nopermit") return {
    fit: "redirect",
    why: ["Нет права работать в Германии"],
    title: "Без права работать Arbeitslosengeld не выплачивают",
    summary: "Иностранцы вне ЕС, ЕЭЗ и Швейцарии получают Arbeitslosengeld только с действующим видом на жительство или разрешением на пребывание, которое позволяет работать в Германии.",
    steps: [step("Проверьте свой статус", "Маршрут показывает, как продлить вид на жительство и какие основания дают право работать.", "Онлайн", act("Маршрут: Aufenthaltstitel", "/berlin/aufenthalt"), benefit)],
    next: act("Маршрут: Aufenthaltstitel", "/berlin/aufenthalt"),
    note,
  };
  const short = a.months === "short";
  const long = a.months === "m24";
  const over = a.end === "own" || a.end === "agreement" || a.end === "behaviour";
  const kid = a.kids === "yes";
  const facts: Fact[] = [
    { label: "Размер", value: `${kid ? "67%" : "60%"} от расчётного дохода после вычетов налога и 20% на соцвзносы за последние 12 месяцев`, kind: "official" },
    { label: "Срок выплаты", value: short ? "по сокращённому правилу 8 месяцев стажа дают 4 месяца выплаты" : a.age === "o50" ? `от 50 лет срок растёт ступенями, максимум 24 месяца с 58 лет и при 48 и более месяцах стажа${long ? "" : "; при вашем стаже верхняя граница ниже"}` : long ? "до 12 месяцев при 24 и более месяцах стажа" : "при 12 месяцах стажа 6 месяцев, при большем стаже срок растёт до 12 месяцев", kind: "official" },
    { label: "Рамка поиска стажа", value: "5 лет: 2 года плюс 30 месяцев до регистрации", kind: "official" },
    { label: "Страны ЕС", value: "периоды работы в ЕС, ЕЭЗ и Швейцарии могут засчитываться, если после возвращения вы работали в Германии с соцстрахованием", kind: "official" },
    ...(over ? [{ label: "Блокировка выплаты (Sperrzeit)", value: "до 12 недель при увольнении по своей инициативе, соглашении о расторжении или увольнении из-за нарушения; блокировки нет, если есть уважительная причина и доказательства, например переезд к партнёру или уход по совету врача по болезни", kind: "official" as const }] : []),
  ];
  const online: Method = {
    id: "online", kind: "online", title: "Регистрация и заявление онлайн", summary: "Регистрация безработным считается заявлением, если вы не указали иное.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Вы готовы работать минимум 15 часов в неделю и ищете работу с социальным страхованием", "Заявление можно подать примерно за 2 недели до начала безработицы", short ? "Сокращённое правило: не меньше 6 месяцев стажа за 30 месяцев, работа в основном по договорам, заранее ограниченным 14 неделями, и заработок за последние 12 месяцев не выше установленного предела; остальные условия в Merkblatt" : "Стаж не меньше 12 месяцев за последние 30"],
    documents: ["Данные последнего работодателя и справки о работе", "Подтверждение периодов страхования", ...(kid ? ["Данные о ребёнке для ставки 67%"] : []), ...(a.status === "permit" ? ["Вид на жительство, разрешающий работать"] : [])],
    facts,
    steps: [
      step(over ? "Зарегистрируйтесь сразу, чтобы не получить блокировку за позднюю регистрацию" : "Зарегистрируйтесь безработным", over ? "Поздняя регистрация тоже даёт Sperrzeit. Зарегистрируйтесь онлайн или лично в Agentur für Arbeit, как только знаете дату конца работы." : "Зарегистрируйтесь онлайн или лично в Agentur für Arbeit; регистрация считается заявлением. Подать можно примерно за 2 недели до начала безработицы.", "Онлайн", register, benefit),
      step("Подтвердите поиск работы и стаж", "Ищите работу с социальным страхованием и сохраняйте подтверждения поиска: их отсутствие тоже может привести к Sperrzeit.", "Выбор", benefit),
      step("Сообщайте об изменениях", "Подработка на меньшее число часов уменьшает выплату, об этом нужно сообщить. Смену налогового класса согласуйте с Agentur до изменения.", "Выбор", benefit),
      step("Если выплаты не хватает", "Arbeitslosengeld можно дополнить Grundsicherungsgeld; после окончания выплаты Grundsicherungsgeld автоматически не начинается.", "Онлайн", act("Маршрут: Grundsicherungsgeld", "/berlin/grundsicherungsgeld"), act("Bundesagentur: переход к Grundsicherungsgeld", s.alToBasic)),
    ],
  };
  return {
    fit: over || short ? "conditional" : "fits",
    why: [short ? "Короткие срочные договоры" : long ? "24 месяца и больше" : "От 12 до 23 месяцев", a.status === "eu" ? "ЕС, ЕЭЗ или Швейцария" : "Вид на жительство с правом работать", kid ? "Есть ребёнок: 67%" : "Ребёнка нет: 60%", a.end === "employer" ? "Увольнение не по вашей вине" : a.end === "own" ? "Вы уволились сами" : a.end === "agreement" ? "Соглашение о расторжении" : "Увольнение из-за нарушения", ...(a.age ? [a.age === "o50" ? "От 50 лет" : "Младше 50 лет"] : [])],
    title: short ? "Проверьте право на Arbeitslosengeld по сокращённому правилу" : over ? "Подайте на Arbeitslosengeld, но учтите возможную блокировку" : "Зарегистрируйтесь и подайте на Arbeitslosengeld",
    summary: short ? "Право возможно по сокращённому правилу, если выполнены его условия: не меньше 6 месяцев стажа за 30 месяцев, работа в основном по договорам до 14 недель и заработок не выше установленного предела. Подтверждает Agentur für Arbeit при регистрации." : over ? "Право на Arbeitslosengeld есть, но при увольнении по своей инициативе, соглашении о расторжении или увольнении из-за нарушения возможна блокировка на срок до 12 недель. Блокировки нет при уважительной причине с доказательствами." : "Право на Arbeitslosengeld есть. Размер зависит от прежнего дохода, срок от стажа и возраста.",
    methods: [online],
    singleMethodNote: "Способ один: регистрация в Agentur für Arbeit онлайн или лично одновременно служит заявлением.",
    steps: online.steps,
    next,
    note,
  };
}

// ---------------------------------------------------------------------------
// Grundsicherungsgeld
// ---------------------------------------------------------------------------
export const basicQuestions = [
  q("who", "Для кого заявление?", [["alone", "Для меня одного"], ["lone", "Для меня как одинокого родителя с детьми"], ["partner", "Для меня и партнёра, без детей"], ["family", "Для пары с детьми"]]),
  q("size", "Сколько человек в домохозяйстве?", [["3", "3 человека"], ["4", "4 человека"], ["5", "5 человек и больше"]]),
  q("status", "Какое у вас гражданство и право на пребывание?", [["permit", "Гражданин Германии или вид на жительство с правом работать"], ["eu", "Гражданин ЕС, ЕЭЗ или Швейцарии"], ["other", "Другой статус: убежище, Duldung, § 24, поиск работы или иное"]]),
  q("al", "Получаете ли вы Arbeitslosengeld?", [["none", "Нет"], ["top", "Да, но его не хватает"], ["ends", "Да, скоро закончится"]]),
  q("home", "Какая у вас ситуация с жильём?", [["stay", "Остаюсь в своей квартире"], ["move", "Собираюсь переехать или подписать новый договор"]]),
  q("income", "Есть ли у вас другие доходы?", [["none", "Нет"], ["work", "Есть заработок"], ["other", "Kindergeld, пенсия, Unterhaltsvorschuss или другая выплата"]]),
  q("special", "Есть ли особая ситуация?", [["none", "Нет"], ["pregnant", "Беременность"], ["single", "Одинокий родитель"], ["medical", "Хроническая болезнь или врачебная диета"]]),
  q("age", "Сколько вам лет?", [["u25", "Младше 25"], ["u30", "От 25 до 30"], ["u40", "От 31 до 40"], ["u50", "От 41 до 50"], ["o51", "51 и больше"]]),
  q("savings", "Есть ли у вас сбережения выше порога для вашего возраста?", [["no", "Нет"], ["yes", "Да"]]),
  q("children", "Сколько у вас детей, которые живут с вами?", [["1", "1 ребёнок"], ["2", "2 ребёнка"], ["3", "3 ребёнка"], ["4", "4 ребёнка и больше"]]),
] as const;

export function basicVisible(a: Answers): readonly Question[] {
  const [who, size, status, al, home, income, special, age, savings, children] = basicQuestions;
  const head = a.who === "family" ? [who, size, status] : a.who === "lone" ? [who, children, status] : [who, status];
  if (a.status === "other") return head;
  return [...head, al, home, income, special, age, savings];
}

export function basicPlan(a: Answers): Plan {
  const bedarfe = act("Bundesagentur: из чего состоит Grundsicherungsgeld", s.basicNeeds);
  const apply = act("Bundesagentur: Grundsicherungsgeld", fw.basicIncome);
  const merk = act("Merkblatt Bundesagentur", s.merkblatt);
  const rates = act("Bundesregierung: Regelbedarf 2026", s.rates);
  const services = act("Онлайн-услуги Jobcenter", fw.jobcenterServices);
  const note = "Это общая информация, а не юридическая консультация. Условия взяты с официальных страниц Bundesagentur für Arbeit, BMAS, Bundesregierung и Senatsverwaltung Берлина (предельные суммы аренды с 1 января 2026 года); итоговую сумму называет решение Jobcenter.";
  const next = act("Маршрут: Bildungspaket", "/berlin/bildungspaket");
  if (a.status === "other") return {
    fit: "redirect",
    why: ["Другой статус пребывания"],
    title: "При вашем статусе Grundsicherungsgeld назначается не во всех случаях",
    summary: "Grundsicherungsgeld получают работоспособные люди с постоянным местом жительства в Германии, у которых есть законное пребывание и допуск к работе. Для ищущих убежище, людей с Duldung и ряда других статусов действуют отдельные правила и выплаты, поэтому сначала посмотрите, что даёт ваш статус.",
    steps: [step("Проверьте свой статус", "Маршрут показывает, как продлить вид на жительство и какие основания дают право на пребывание.", "Онлайн", act("Маршрут: Aufenthaltstitel", "/berlin/aufenthalt"), merk)],
    next: act("Маршрут: Aufenthaltstitel", "/berlin/aufenthalt"),
    note,
  };
  const partner = a.who === "partner";
  const family = a.who === "family";
  const lone = a.who === "lone";
  const persons = family ? Number(a.size ?? "3") : lone ? 1 + Number(a.children ?? "1") : partner ? 2 : 1;
  const rent = ({ 1: "449,00", 2: "543,40", 3: "668,80", 4: "752,40", 5: "903,72" } as Record<number, string>)[Math.min(persons, 5)];
  const allowance = ({ u25: "5.000", u30: "5.000", u40: "10.000", u50: "12.500", o51: "20.000" } as Record<string, string>)[a.age ?? "u30"];
  const youth = a.age === "u25";
  const savings = a.savings === "yes";
  const facts: Fact[] = [
    { label: "Предел аренды в Берлине (Bruttokaltmiete)", value: `${rent} € в месяц для ${persons >= 5 ? "5 человек" : persons === 1 ? "1 человека" : `${persons} человек`}${a.home === "move" ? " при новом договоре из-за необходимого переезда; в тяжёлых случаях предел можно превысить до 10%" : "; в первый год аренда признаётся полностью (Karenzzeit), расходы на отопление проверяются сразу"}`, kind: "official" },
    { label: "Необлагаемое имущество (Vermögensfreibetrag)", value: `${allowance} € для вашего возраста; пороги: до 30 лет 5.000 €, с 31 года 10.000 €, с 41 года 12.500 €, с 51 года 20.000 €; домашняя утварь и разумное накопление на старость защищены`, kind: "official" },
    { label: "Обязанности и санкции", value: "первая беседа в Jobcenter всегда лично, затем Kooperationsplan (план сотрудничества); второй пропущенный без уважительной причины срок: минус 30% Regelbedarf на месяц; отказ от подходящей работы: минус 30% на 3 месяца; три пропуска подряд: право на выплату прекращается до личной явки", kind: "official" },
    { label: "Regelbedarf в месяц", value: family ? "взрослый один: 563 €, партнёры по 506 €; дети: до 5 лет 357 €, 6–13 лет 390 €, 14–17 лет 471 €" : lone ? "563 € вам; на детей: до 5 лет 357 €, 6–13 лет 390 €, 14–17 лет 471 €" : partner ? "506 € каждому партнёру" : "563 € для одного взрослого", kind: "official" },
    { label: "С какого месяца платят", value: "с первого дня месяца, в котором подано заявление", kind: "authority" },
    { label: "Срок решения", value: "обычно назначают на 12 месяцев, затем нужно заявление на продление", kind: "official" },
  ];
  const online: Method = {
    id: "online", kind: "online", title: "Онлайн в кабинете Bundesagentur", summary: "Создаёте онлайн-заявление, загружаете подтверждения и отправляете.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Учётная запись Bundesagentur für Arbeit (Benutzerkonto)", a.status === "eu" ? "Для граждан ЕС работает правило: нельзя находиться в Германии только для поиска работы" : "Законное пребывание и право работать"],
    documents: ["Подтверждение расходов на жильё (аренда)", "Подтверждение дохода", ...(a.income === "other" ? ["Подтверждения Kindergeld, пенсии или других выплат"] : []), ...(family ? ["Данные о детях"] : [])],
    facts,
    steps: [
      step("Найдите свой Jobcenter", "Ответственный Jobcenter определяется поиском на сайте Bundesagentur.", "Онлайн", services, apply),
      step("Создайте заявление и загрузите подтверждения", "Войдите в кабинет, заполните заявление, загрузите подтверждения аренды и дохода. Проверка не завершена, пока Jobcenter не получил все документы. Для беседы заполните онлайн-профиль (Arbeitsmarktprofil).", "Онлайн", apply),
      ...(a.al !== "none" ? [step(a.al === "top" ? "Дополните Arbeitslosengeld" : "Подайте заранее, пока Arbeitslosengeld не закончилось", a.al === "top" ? "Если Arbeitslosengeld не хватает на жизнь, Grundsicherungsgeld его дополняет (Aufstockung)." : "После окончания Arbeitslosengeld Grundsicherungsgeld не начинается автоматически: подайте заявление в Jobcenter заранее.", "Онлайн", apply, act("Bundesagentur: переход", s.alToBasic))] : []),
      ...(a.home === "move" ? [step("Согласуйте переезд до подписи договора", `Не подписывайте новый договор, пока Jobcenter не подтвердил письменно, что оплатит аренду (Zusicherung).${youth ? " Для молодых людей младше 25 лет это обязательно." : ""} Для переезда внутри Берлина отвечает нынешнее ведомство. Залог за квартиру (Mietkaution) и расходы на переезд могут оплатить, чаще как заём, если переезд необходим и ведомство согласно.`, "Лично", act("Bundesagentur: жильё и аренда", s.basicHousing), act("Берлин: предельные суммы аренды", s.berlinRent))] : []),
      ...(savings ? [step("Сначала используйте сбережения выше порога", `Имущество выше ${allowance} € для вашего возраста нужно сначала использовать на жизнь; домашняя утварь и разумное накопление на старость остаются защищёнными. Выплата начинается, когда имущество опустится до порога.`, "Выбор", act("BMAS: что изменилось", s.basicChanges), merk)] : []),
      ...(family || lone ? [step("Учтите уход за маленьким ребёнком", "До 14-го месяца жизни ребёнка поиск работы, как правило, не требуется; после этого работа считается разумной, если есть присмотр за ребёнком.", "Выбор", act("BMAS: что изменилось", s.basicChanges))] : []),
      ...(a.income === "work" ? [step("Укажите заработок", "Заработок учитывается с месяца получения; часть заработка не засчитывается. Все доходы и доходы членов семьи указываются в заявлении.", "Онлайн", merk, apply)] : a.income === "other" ? [step("Подайте на приоритетные выплаты", "Kindergeld, Unterhaltsvorschuss и пенсии нужно запросить в первую очередь: Jobcenter их учитывает.", "Онлайн", bedarfe)] : []),
      ...(a.special !== "none" ? [step(a.special === "pregnant" ? "Запросите Mehrbedarf при беременности" : a.special === "single" ? "Запросите Mehrbedarf для одинокого родителя" : "Запросите Mehrbedarf по болезни или диете", "Mehrbedarf (надбавка к Regelbedarf) назначают при беременности, при воспитании ребёнка одному, при определённых хронических болезнях или медицински необходимой диете. Отметьте это в заявлении.", "Онлайн", bedarfe)] : []),
      step("Подайте на Bildungs- und Teilhabepaket", "Для детей и молодёжи до 25 лет есть помощь на школьные поездки, репетитора, кружки и спорт. Подаётся отдельно.", "Онлайн", act("Маршрут: Bildungspaket", "/berlin/bildungspaket"), bedarfe),
    ],
  };
  const paper: Method = {
    id: "post", kind: "mail", title: "По почте или лично на формах Jobcenter", summary: "Заявление можно подать на бумажных формах.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Используйте официальные формы: так не пропустятся нужные данные"],
    documents: ["Подтверждение расходов на жильё (аренда)", "Подтверждение дохода"],
    facts,
    steps: [step("Найдите свой Jobcenter", "Адрес и контакты Jobcenter указаны через поиск на сайте Bundesagentur.", "Онлайн", services, apply), step("Отправьте формы с подтверждениями", "Заполненные формы и копии подтверждений отправьте или передайте в свой Jobcenter.", "Выбор", apply)],
  };
  return {
    fit: savings ? "conditional" : "fits",
    why: [youth ? "Младше 25 лет" : `Возраст: порог имущества ${allowance} €`, savings ? "Сбережения выше порога" : "Сбережения в пределах порога", lone ? "Одинокий родитель с детьми" : family ? `Семья: ${persons >= 5 ? "5 человек и больше" : `${persons} человек`}` : partner ? "Заявление для пары" : "Одинокий заявитель", a.status === "eu" ? "Гражданин ЕС, ЕЭЗ или Швейцарии" : "Гражданин Германии или вид на жительство с правом работать", a.al === "none" ? "Arbeitslosengeld не получаете" : a.al === "top" ? "Arbeitslosengeld не хватает" : "Arbeitslosengeld скоро закончится", a.home === "move" ? "Планируете переезд" : "Остаётесь в квартире", a.income === "none" ? "Других доходов нет" : a.income === "work" ? "Есть заработок" : "Есть другие выплаты", a.special === "none" ? "Особой ситуации нет" : a.special === "pregnant" ? "Беременность" : a.special === "single" ? "Одинокий родитель" : "Болезнь или диета"],
    title: "Подайте заявление на Grundsicherungsgeld в Jobcenter",
    summary: "Grundsicherungsgeld (до июля 2026 года Bürgergeld) складывается из Regelbedarf, расходов на жильё и отопление, возможных Mehrbedarf и единовременных выплат. Решение принимает Jobcenter.",
    methods: [online, paper],
    steps: online.steps,
    next,
    note: `${note} Размеры Regelbedarf с 2024 года не менялись и в 2026 году тоже.`,
  };
}

// ---------------------------------------------------------------------------
// Kfz-Ummeldung
// ---------------------------------------------------------------------------
export const carQuestions = [
  q("from", "Откуда вы переехали?", [["outside", "Из другого города Германии в Берлин"], ["berlin", "Внутри Берлина"]]),
  q("home", "Берлин ваше основное место жительства (Hauptwohnsitz)?", [["main", "Да"], ["second", "Нет, только второе жильё"]]),
  q("plate", "Какой номер вы хотите?", [["keep", "Оставить прежний номер"], ["wish", "Берлинский номер по желанию"]]),
  q("hu", "Нужна ли HU (технический осмотр)?", [["no", "HU ещё действует"], ["yes", "HU уже нужно пройти"]]),
  q("eid", "Есть ли у вас eID (онлайн-функция удостоверения) и карта или PayPal?", [["yes", "Да"], ["no", "Нет"]]),
  q("who", "Кто идёт в ведомство?", [["self", "Я сам"], ["rep", "Представитель по доверенности"]]),
] as const;

export function carVisible(a: Answers): readonly Question[] {
  const [from, home, plate, hu, eid, who] = carQuestions;
  if (a.from === "berlin") return [from, eid, who];
  if (a.home === "second") return [from, home];
  return [from, home, plate, hu, who];
}

export function carPlan(a: Answers): Plan {
  const outside = act("Берлин: Kraftfahrzeug ummelden", s.kfzFromOutside);
  const duty = act("Закон: смена данных владельца без промедления", s.kfzDuty);
  const within = act("Берлин: Adressänderung in der Zulassungsbescheinigung", s.kfzWithin);
  const slot = act("Запись в Kfz-Zulassungsbehörde", s.kfzSlot);
  const plateLink = act("Берлин: Wunschkennzeichen", s.plate);
  const note = "Это общая информация, а не юридическая консультация. Условия взяты со страниц Берлина о Kfz-Zulassungsbehörde (LABO).";
  const next = act("Маршрут: Anmeldung", "/berlin/anmeldung");
  if (a.from === "berlin") {
    const rep = a.who === "rep";
    const online: Method = {
      id: "online", kind: "online", title: "Онлайн с eID", summary: "Новую Zulassungsbescheinigung Teil I пришлют по почте на новый адрес.",
      availability: a.eid === "yes" && !rep ? "available" : "conditional", availabilityLabel: a.eid === "yes" && !rep ? "Доступно" : "Нужны eID и оплата картой или PayPal",
      conditions: ["Онлайн-функция удостоверения (eID)", "Оплата кредитной картой или PayPal", "Адрес уже изменён в Bürgeramt"],
      documents: ["Zulassungsbescheinigung Teil I с открытым защитным кодом", "Подтверждение нового адреса (Meldebescheinigung)"],
      facts: [{ label: "Стоимость онлайн", value: "8,43 €", kind: "official" }, { label: "Мотоцикл", value: "мотоцикл (Kraftrad) по закону тоже Kraftfahrzeug: новый адрес вносится так же", kind: "official" }],
      steps: [step("Сначала смените адрес в Bürgeramt", "Изменение в Bürgeramt должно быть сделано до обращения в Kfz-Zulassungsbehörde.", "Лично", act("Маршрут: Umzug", "/berlin/umzug"), within), step("Подайте онлайн-заявление", "Для онлайн-заявления нужны eID и карта или PayPal; защитный код на документе нужно открыть. Новая ZB I придёт по почте на новый адрес.", "Онлайн", within)],
    };
    const office: Method = {
      id: "office", kind: "in-person", title: "Лично или по доверенности", summary: "В Kfz-Zulassungsbehörde или в Bürgeramt.",
      availability: "available", availabilityLabel: "Доступно",
      conditions: [rep ? "Представитель приходит с доверенностью" : "Вы приходите сами", "Адрес уже изменён в Bürgeramt"],
      documents: ["Zulassungsbescheinigung Teil I", "Personalausweis или паспорт с Meldebescheinigung", ...(rep ? ["Доверенность представителя"] : [])],
      facts: [{ label: "Стоимость", value: "11,40 € в Bürgeramt, 12,60 € в Kfz-Zulassungsbehörde", kind: "official" }],
      steps: [step("Сначала смените адрес в Bürgeramt", "Изменение в Bürgeramt должно быть сделано до Kfz-Zulassungsbehörde.", "Лично", act("Маршрут: Umzug", "/berlin/umzug"), within), step("Внесите адрес в Zulassungsbescheinigung Teil I", "В Bürgeramt или в Kfz-Zulassungsbehörde. Если в документе нет места для ещё одного адреса, нужны новые документы, а выдаёт их только Kfz-Zulassungsbehörde.", "Лично", within)],
    };
    const methods = a.eid === "yes" && !rep ? [online, office] : [office, online];
    return {
      fit: "fits",
      why: ["Переезд внутри Берлина", a.eid === "yes" ? "Есть eID и оплата" : "Нет eID", rep ? "Идёт представитель" : "Идёте сами"],
      title: "Внесите новый адрес в Zulassungsbescheinigung Teil I",
      summary: "При смене основного жилья внутри Берлина новый адрес нужно сообщить Kfz-Zulassungsbehörde без промедления («unverzüglich»); числа дней закон не задаёт. Изменение в Bürgeramt должно быть сделано раньше.",
      methods,
      steps: methods[0].steps,
      next: act("Маршрут: Umzug", "/berlin/umzug"),
      note,
    };
  }
  if (a.home === "second") return {
    fit: "redirect",
    why: ["Берлин не основное место жительства"],
    title: "Зарегистрировать машину в Берлине можно только при основном месте жительства",
    summary: "Для регистрации автомобиля нужно основное место жительства (Hauptwohnsitz) в Берлине; второе жильё не подходит. Сначала зарегистрируйте адрес.",
    steps: [step("Зарегистрируйте адрес", "Маршрут показывает документы и порядок регистрации.", "Онлайн", next, act("Берлин: регистрация адреса", "https://service.berlin.de/dienstleistung/120686/"))],
    next,
    note,
  };
  const keep = a.plate === "keep";
  const method: Method = {
    id: "office", kind: "in-person", title: "Лично в Kfz-Zulassungsbehörde по записи", summary: "Заявление подаётся на месте, запись обязательна.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Основное место жительства в Берлине", "Запись на имя будущего владельца: приходить может и представитель", keep ? "Прежний номер сохраняется, если машина ещё зарегистрирована" : "Берлинский номер по желанию: наличие можно проверить онлайн"],
    documents: ["Заявление на Umschreibung из другого города без смены владельца", "Personalausweis или паспорт с Meldebescheinigung", "Zulassungsbescheinigung Teil I", ...(keep ? [] : ["Zulassungsbescheinigung Teil II (Fahrzeugbrief)", "SEPA-мандат на автоплатёж налога", "Старые номерные знаки"]), ...(a.hu === "yes" ? ["Отчёт о HU (технический осмотр)"] : []), ...(a.who === "rep" ? ["Доверенность представителя"] : [])],
    facts: [{ label: "Мотоцикл", value: "мотоцикл (Kraftrad) по закону тоже Kraftfahrzeug, и при переезде действует тот же порядок; для лёгкого мотоцикла до 125 см³, которому регистрация не обязательна, вместо Zulassungsbescheinigung Teil II подходит Betriebserlaubnis (разрешение на эксплуатацию)", kind: "official" }, { label: "Стоимость", value: "17,50 € основной сбор плюс дополнительные сборы за технические изменения, плашку и номер по желанию; сами таблички ведомство не изготавливает", kind: "official" }, { label: "Срок регистрации", value: "по закону «unverzüglich», то есть без промедления; конкретного числа дней в официальных текстах нет", kind: "official" }],
    steps: [
      step("Проверьте и зарезервируйте номер", keep ? "Прежний номер можно оставить, если машина ещё зарегистрирована; вы получите новую Zulassungsbescheinigung Teil I с новым адресом." : "Наличие желаемого берлинского номера можно проверить онлайн; резервация оформляется отдельной услугой.", "Онлайн", keep ? outside : plateLink, outside),
      step("Запишитесь в Kfz-Zulassungsbehörde", `Обращайтесь без промедления: по закону срок «unverzüglich». Запись обязательна, имя в записи должно быть именем будущего владельца. Новые слоты открывают ежедневно. Адрес: Jüterboger Str. 3, 10965 Berlin, телефон (030) 90269-3300.${a.who === "rep" ? " Прийти может представитель по доверенности." : ""}`, "Онлайн", slot, duty, act("Закон: мотоцикл (Kraftrad) тоже Kraftfahrzeug", s.kfzTypes)),
      step("Подготовьте документы", `${keep ? "ZB II не нужна, если вы оставляете прежний зарегистрированный номер." : "С новым берлинским номером нужны ZB II, SEPA-мандат и старые таблички."}${a.hu === "yes" ? " Возьмите отчёт о HU: она уже нужна." : " Действующую HU подтверждает и ZB I."}`, "Выбор", outside),
    ],
  };
  return {
    fit: "fits",
    why: ["Переезд в Берлин", "Основное место жительства в Берлине", keep ? "Оставляете прежний номер" : "Берлинский номер по желанию", a.hu === "yes" ? "Нужна HU" : "HU действует", a.who === "rep" ? "Идёт представитель" : "Идёте сами"],
    title: "Перерегистрируйте автомобиль в Kfz-Zulassungsbehörde",
    summary: "После переезда в Берлин автомобиль нужно зарегистрировать здесь без промедления («unverzüglich»): числа дней закон не задаёт. Сначала нужно изменить адрес в Bürgeramt. Онлайн-заявление возможно на странице услуги.",
    methods: [method],
    singleMethodNote: "Способ один: приём по записи. Онлайн-заявление доступно на странице услуги с другими условиями.",
    steps: method.steps,
    next,
    note,
  };
}

// ---------------------------------------------------------------------------
// Einbürgerung
// ---------------------------------------------------------------------------
export const citizenshipQuestions = [
  q("years", "Сколько вы законно живёте в Германии?", [["five", "5 лет и больше без перерывов"], ["three", "Три года, и я женат(а) или в партнёрстве с гражданином Германии не меньше 2 лет"], ["less", "Меньше"]]),
  q("title", "Какой у вас статус?", [["eu", "Гражданин ЕС, ЕЭЗ или Швейцарии"], ["perm", "Постоянный или подходящий вид на жительство (Niederlassungserlaubnis, Blue Card и другие)"], ["temp", "Другой временный статус или Duldung"]]),
  q("lang", "Знание немецкого?", [["b1", "B1 или выше с сертификатом"], ["no", "Сертификата нет"], ["exempt", "Освобождение: болезнь с заключением врача, возраст 70 лет и больше, школьный аттестат с нужными оценками"]]),
  q("test", "Тест «Leben in Deutschland» или Einbürgerungstest?", [["have", "Сертификат есть"], ["no", "Нужно сдать"]]),
  q("income", "Как вы обеспечиваете себя?", [["own", "Сам, без Bürgergeld и Sozialhilfe"], ["benefit", "Получаю Bürgergeld или Sozialhilfe"]]),
  q("record", "Есть ли штраф свыше 90 дневных ставок или условный срок свыше 3 месяцев?", [["no", "Нет"], ["yes", "Да"]]),
  q("kids", "Подаёте ли вы вместе с ребёнком младше 16 лет?", [["no", "Нет"], ["yes", "Да"]]),
] as const;

export function citizenshipVisible(a: Answers): readonly Question[] {
  const [years, title, lang, test, income, record, kids] = citizenshipQuestions;
  if (a.years === "less") return [years];
  return [years, title, lang, test, income, record, kids];
}

export function citizenshipPlan(a: Answers): Plan {
  const page = act("Берлин: Einbürgerung beantragen", s.naturalisation);
  const test = act("Берлин: запись на Einbürgerungstest", s.naturalisationTest);
  const multi = act("Bundesregierung: модернизация права на гражданство, Mehrstaatigkeit (двойное гражданство)", s.multiCitizen);
  const help = act("Willkommenszentrum Berlin: Einbürgerung", s.welcomeCentre);
  const note = "Это общая информация, а не юридическая консультация. Условия взяты со страниц Берлина, Willkommenszentrum Berlin и Федерального министерства внутренних дел (правило о нескольких гражданствах действует по всей Германии).";
  const next = act("Маршрут: Aufenthaltstitel", "/berlin/aufenthalt");
  if (a.years === "less") return {
    fit: "redirect",
    why: ["Срок проживания меньше необходимого"],
    title: "Пока рано: нужно 5 лет законного проживания",
    summary: "Для Einbürgerung нужно 5 лет непрерывного законного проживания, или 3 года, если вы не меньше 2 лет состоите в браке или партнёрстве с гражданином Германии. Периоды Duldung не засчитываются.",
    steps: [step("Следите за видом на жительство", "Статус должен быть подходящим к моменту подачи. Маршрут показывает, как продлить вид на жительство.", "Онлайн", next, page)],
    next,
    note,
  };
  const gaps: string[] = [];
  if (a.title === "temp") gaps.push("подходящий статус (Niederlassungserlaubnis, Blue Card и некоторые другие виды)");
  if (a.lang === "no") gaps.push("сертификат на немецкий B1");
  if (a.test === "no") gaps.push("сертификат о тесте");
  if (a.income === "benefit") gaps.push("самостоятельное обеспечение без Bürgergeld и Sozialhilfe, кроме случаев исключений");
  if (a.record === "yes") gaps.push("отсутствие судимостей выше установленных порогов");
  const kids = a.kids === "yes";
  const facts: Fact[] = [
    { label: "Сбор за заявление", value: kids ? "255 € за взрослого и 51 € за ребёнка младше 16 лет, оплата картой или PayPal перед подачей" : "255 € за взрослого, оплата картой или PayPal перед подачей", kind: "official" },
    { label: "Einbürgerungstest", value: "25 € в любой Berlin Volkshochschule; сдавать нужно в назначенный день", kind: "official" },
    { label: "Срок рассмотрения", value: "в среднем год и больше, иногда несколько месяцев; о статусе не нужно писать", kind: "load" },
    { label: "Прежнее гражданство", value: "с 27 июня 2024 года Einbürgerung в Германии происходит с сохранением нескольких гражданств; остаётся ли прежнее гражданство, решает право вашей страны (оно может прекращаться автоматически): подтвердить может консульство", kind: "official" },
    { label: "Освобождение от прежнего гражданства", value: "если страна требует отказа от немецкого гражданства при своём оформлении, Beibehaltungsgenehmigung этого уже не предотвращает", kind: "official" },
  ];
  const online: Method = {
    id: "online", kind: "online", title: "Онлайн-заявление в Landesamt für Einwanderung", summary: "Заявление можно сохранять и продолжать. Подача занимает около двух часов, сканы документов в PDF, JPG, JPEG или PNG.",
    availability: gaps.length ? "conditional" : "available", availabilityLabel: gaps.length ? "Сначала закройте условия" : "Доступно",
    conditions: ["Основное место жительства в Берлине", "Признание Основного закона и исторической ответственности", ...(kids ? ["При совместной опеке согласие второго родителя: форма с подписью загружается"] : [])],
    documents: ["Действительный паспорт или удостоверение страны происхождения", "Meldebestätigung (подтверждение регистрации)", "Доходы: трудовой договор и шесть расчётных листов, для самозанятых налоговые документы", "Подтверждение медицинской страховки и страховки по уходу", "Договор аренды или выписка из земельной книги", "Сертификат немецкого", "Сертификат о знании общества", ...(a.years === "three" ? ["Свидетельство о браке или партнёрстве"] : [])],
    facts,
    steps: [
      step("Пройдите Quick-Check", "Бесплатная проверка перед заявлением показывает шансы и считает доход.", "Онлайн", page),
      ...(a.lang === "no" ? [step("Получите сертификат немецкого", "Нужен уровень B1 по общеевропейской шкале; освобождение возможно при болезни или инвалидности с заключением специалиста и в 70 лет и старше.", "Выбор", page)] : []),
      ...(a.test === "no" ? [step("Запишитесь на тест", "Запись в любой Volkshochschule Берлина стоит 25 €: нужны документ личности и форма, которую заполняют на месте. Даты теста дают при записи.", "Лично", test)] : []),
      step("Подайте заявление онлайн", "Загрузите документы (до 7 МБ каждый, до 100 МБ всего), оплатите сбор и сохраните подтверждение PDF. Вид на жительство при подаче не меняется.", "Онлайн", page),
      step("Узнайте, сохранится ли прежнее гражданство", "С 27 июня 2024 года Германия принимает в гражданство, допуская несколько гражданств. Сохранится ли прежнее, зависит от права вашей страны: оно может прекращаться автоматически.", "Выбор", multi, page),
      step("Дождитесь приглашения на приём", "Если первичная проверка пройдена, придёт приглашение на приём. О статусе писать не нужно.", "Ожидание", page, help),
    ],
  };
  return {
    fit: gaps.length ? "conditional" : "fits",
    why: [a.years === "five" ? "5 лет проживания" : "3 года и брак или партнёрство с гражданином Германии", a.title === "eu" ? "Гражданин ЕС, ЕЭЗ или Швейцарии" : a.title === "perm" ? "Подходящий статус" : "Временный статус", a.lang === "b1" ? "Есть сертификат B1" : a.lang === "exempt" ? "Освобождение от языка" : "Сертификата немецкого нет", a.test === "have" ? "Сертификат о тесте есть" : "Тест ещё нужно сдать", a.income === "own" ? "Обеспечиваете себя сами" : "Получаете пособие", a.record === "no" ? "Порогов судимости нет" : "Есть судимость выше порога", kids ? "С ребёнком младше 16 лет" : "Без детей"],
    title: gaps.length ? "Подайте на Einbürgerung после того, как закроете условия" : "Подайте онлайн-заявление на Einbürgerung",
    summary: gaps.length ? `Чтобы подать, не хватает: ${gaps.join("; ")}. Остальные условия вы показали выполненными.` : "Вы подходите по основным условиям. Заявление подаётся онлайн в Landesamt für Einwanderung, рассматривают его долго.",
    methods: [online],
    singleMethodNote: "Способ один: заявление подают онлайн в Landesamt für Einwanderung Berlin.",
    steps: online.steps,
    next,
    note,
  };
}
