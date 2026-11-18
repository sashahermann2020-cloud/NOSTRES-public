import type { Action, Answers, Fact, Method, Plan, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

export const lifeOfficial = {
  elternzeit: "https://www.bmbfsfj.bund.de/bmbfsfj/themen/familie/familienleistungen/elternzeit",
  elternzeitApply: "https://familienportal.de/familienportal/familienleistungen/elternzeit/faq/wann-und-wie-muss-ich-elternzeit-beantragen--124810",
  elternzeitWork: "https://familienportal.de/familienportal/familienleistungen/elternzeit/arbeit-versicherung",
  beeg16: "https://www.gesetze-im-internet.de/beeg/__16.html",
  wohngeld: "https://service.berlin.de/dienstleistung/120656/",
  wohngeldOwner: "https://service.berlin.de/dienstleistung/120665/standort/327066/",
  wohngeldPlus: "https://www.bmwsb.bund.de/DE/wohnen/wohngeld/wohngeld-plus/wohngeld-plus_node.html",
  woggLaw: "https://www.gesetze-im-internet.de/wogg/__3.html",
};
const l = lifeOfficial;

// ---------------------------------------------------------------------------
// Elternzeit
// ---------------------------------------------------------------------------
export const elternzeitQuestions = [
  q("work", "Работаете ли вы по найму?", [["employee", "Да, у меня трудовой договор"], ["other", "Нет: самозанятость, безработица или другое"]]),
  q("stage", "Когда нужен Elternzeit?", [["pregnant", "Ребёнок ещё не родился"], ["small", "Ребёнку нет трёх лет"], ["older", "Ребёнку от 3 до 8 лет"]]),
  q("parent", "Кто берёт Elternzeit?", [["mother", "Мать сразу после Mutterschutz (защита материнства)"], ["other", "Отец или другой родитель"]]),
  q("parttime", "Хотите работать неполный день во время Elternzeit?", [["no", "Нет, полностью дома с ребёнком"], ["yes", "Да, неполный день"]]),
  q("insurance", "Какая у вас медицинская страховка?", [["gkv", "Государственная (GKV)"], ["pkv", "Частная (PKV)"]]),
] as const;

export function elternzeitVisible(a: Answers): readonly Question[] {
  const [work, stage, parent, parttime, insurance] = elternzeitQuestions;
  if (a.work === "other") return [work];
  return [work, stage, ...(a.stage === "pregnant" ? [parent] : []), parttime, insurance];
}

export function elternzeitPlan(a: Answers): Plan {
  const main = act("BMBFSFJ: Elternzeit", l.elternzeit);
  const applyLink = act("Familienportal: как оформить Elternzeit", l.elternzeitApply);
  const workLink = act("Familienportal: работа и страховка в Elternzeit", l.elternzeitWork);
  const law = act("Закон BEEG, § 16", l.beeg16);
  if (a.work === "other") return {
    fit: "redirect",
    why: ["Трудового договора нет"],
    title: "Elternzeit положен работающим по найму",
    summary: "Право на Elternzeit (родительский отпуск) есть у Arbeitnehmer: оно направлено против работодателя. Для самозанятых и неработающих отпуска нет, но можно получить Elterngeld. Для самозанятых маршрут Elterngeld считает доход и работу во время выплаты.",
    steps: [step("Откройте маршрут Elterngeld", "Elterngeld (пособие родителям) не требует трудового договора: условия по доходу и статусу показывает маршрут.", "Онлайн", act("Маршрут: Elterngeld", "/berlin/elterngeld"), main)],
    next: act("Маршрут: Elterngeld", "/berlin/elterngeld"),
  };
  const older = a.stage === "older";
  const pregnant = a.stage === "pregnant";
  const notice = older ? "не позднее чем за 13 недель до начала" : pregnant ? (a.parent === "mother" ? "не позднее чем за 7 недель до конца Mutterschutz" : "не позднее чем за 7 недель до ожидаемой даты родов") : "не позднее чем за 7 недель до начала";
  const facts: Fact[] = [
    { label: "Срок уведомления работодателя", value: notice, kind: "official" },
    { label: "Длительность", value: older ? "до 24 месяцев между третьим и восьмым днём рождения, согласия работодателя не нужно" : "до трёх лет на каждого родителя на ребёнка; до 24 месяцев можно взять между третьим и восьмым днём рождения", kind: "official" },
    { label: "Защита от увольнения", value: older ? "с момента уведомления, но не раньше чем за 14 недель до начала; заканчивается вместе с Elternzeit" : "с момента уведомления, но не раньше чем за 8 недель до начала; заканчивается вместе с Elternzeit; действует и на испытательном сроке", kind: "official" },
    { label: "Разделение", value: "до трёх частей; третью часть работодатель может отклонить по неотложным производственным причинам, если она целиком приходится на период между третьим и восьмым днём рождения; ещё больше частей только с его согласия", kind: "official" },
  ];
  const insuranceStep = a.insurance === "pkv"
    ? step("Проверьте взносы в частной страховке", "При частной страховке вы сами платите взносы, включая долю, которую раньше платил работодатель. Elterngeld считают от более высокого дохода, чтобы отчасти это компенсировать. Проверьте взносы у страховщика до подачи Elternzeit.", "Звонок", workLink)
    : step("Сохраните государственную страховку", "С Elterngeld взносы не платят. При работе неполный день вы и работодатель платите взносы с заработка. Страховка остаётся государственной.", "Выбор", workLink);
  const partStep = a.parttime === "yes"
    ? step("Договоритесь о неполном дне", "Работать можно до 32 часов в неделю в среднем за месяц (для рождённых до 1 сентября 2021 года до 30 часов). Право требовать неполный день есть, если вы работаете у него больше 6 месяцев подряд, в компании обычно больше 15 человек, вы работаете минимум два месяца от 15 до 32 часов и нет неотложных производственных причин. Иначе нужно согласие работодателя. При отказе можно обратиться в суд по трудовым спорам или встать на учёт в Agentur für Arbeit с письменным отказом.", "Выбор", workLink, law)
    : step("Если передумаете, работайте до 32 часов", "Неполный день разрешён до 32 часов в неделю в среднем за месяц, об этом нужно договариваться с работодателем.", "Выбор", workLink, law);
  return {
    fit: "fits",
    why: ["Трудовой договор есть", older ? "Ребёнку от 3 до 8 лет" : pregnant ? (a.parent === "mother" ? "Ребёнок ещё не родился, берёт мать" : "Ребёнок ещё не родился, берёт отец или другой родитель") : "Ребёнку нет трёх лет", a.parttime === "yes" ? "Нужен неполный день" : "Полностью дома", a.insurance === "pkv" ? "Частная страховка" : "Государственная страховка"],
    title: "Уведомите работодателя об Elternzeit в письменной форме",
    summary: `Отдельного заявления нет: вы уведомляете работодателя в Textform (текст письма или электронная почта, подпись не нужна) ${notice}. Работодатель обязан письменно подтвердить период и дату уведомления.`,
    steps: [
      step("Напишите работодателю в Textform", `Укажите начало и конец, лучше точными датами. Для начала с рождения напишите «ab Geburt» и ожидаемую дату. Elternzeit начинается только с фактических родов. Срок: ${notice}.`, "Онлайн", applyLink, law),
      ...(older ? [] : [step("Назовите период на два года вперёд", "Для Elternzeit до третьего дня рождения в уведомлении нужно указать, какие периоды вы берёте в ближайшие два года. Это Bindungszeitraum: он обязывает вас.", "Выбор", applyLink, law)]),
      step("Попросите письменное подтверждение", "Работодатель обязан письменно подтвердить период и дату вашего уведомления. Храните его: при смене работы новый работодатель может запросить подтверждение уже взятого отпуска.", "Выбор", applyLink, law),
      step("Помните о защите от увольнения и частях отпуска", `${facts[2].value[0].toUpperCase()}${facts[2].value.slice(1)}. ${facts[3].value[0].toUpperCase()}${facts[3].value.slice(1)}. ${facts[1].value[0].toUpperCase()}${facts[1].value.slice(1)}.`, "Выбор", main, law),
      partStep,
      insuranceStep,
    ],
    note: "Это общая информация, а не юридическая консультация. Условия взяты с официальных страниц BMBFSFJ, Familienportal и закона BEEG. После Elternzeit трудовой договор снова действует полностью, заявление о возвращении не нужно.",
    next: act("Маршрут: Elterngeld", "/berlin/elterngeld"),
  };
}

// ---------------------------------------------------------------------------
// Wohngeld
// ---------------------------------------------------------------------------
export const wohngeldQuestions = [
  q("home", "Вы снимаете жильё или владеете им?", [["rent", "Снимаю и живу в нём сам(а)"], ["own", "Владею жильём и живу в нём"]]),
  q("benefit", "Получаете ли вы сейчас другие пособия?", [["none", "Нет"], ["basic", "Bürgergeld, Grundsicherungsgeld, Grundsicherung в старости или другое пособие, которое включает расходы на жильё"], ["bafoeg", "Все члены домохозяйства имеют право на BAföG или аналогичную помощь на учёбу"]]),
  q("recent", "Недавно ли вам отказали или закончилась такая выплата?", [["no", "Нет"], ["yes", "Да, недавно"]]),
  q("citizen", "Какое у вас гражданство?", [["eu", "Страна ЕС, ЕЭЗ или Швейцария"], ["noneu", "Другая страна"]]),
  q("permit", "Какой у вас документ на пребывание?", [["title", "Aufenthaltserlaubnis, Duldung или Aufenthaltsgestattung"], ["excluded", "Aufenthaltstitel для поиска работы или места обучения, Chancenkarte, студенческой практики или европейской волонтёрской службы"], ["none", "Документа нет"]]),
] as const;

export function wohngeldVisible(a: Answers): readonly Question[] {
  const [home, benefit, recent, citizen, permit] = wohngeldQuestions;
  if (a.benefit === "basic" || a.benefit === "bafoeg") return [home, benefit];
  return [home, benefit, ...(a.benefit === "none" ? [recent] : []), citizen, ...(a.citizen === "noneu" ? [permit] : [])];
}

export function wohngeldPlan(a: Answers): Plan {
  const own = a.home === "own";
  const main = act(own ? "Берлин: Wohngeld, Lastenzuschuss" : "Берлин: Wohngeld, Mietzuschuss", own ? l.wohngeldOwner : l.wohngeld);
  const law = act("Закон WoGG, § 3", l.woggLaw);
  const plus = act("BMWSB: Wohngeld Plus", l.wohngeldPlus);
  if (a.benefit === "basic") return {
    fit: "redirect",
    why: ["Вы получаете пособие, которое уже включает расходы на жильё"],
    title: "Wohngeld вместе с этим пособием не платят",
    summary: "Если вы получаете Bürgergeld (с 1 июля 2026 года Grundsicherungsgeld), Grundsicherung в старости или другое пособие, которое включает расходы на жильё, Wohngeld не назначают. Расходы на жильё уже учтены в пособии.",
    steps: [step("Проверьте расходы на жильё в своём пособии", "Если пособие не покрывает расходы на жильё полностью, ведомство, которое его выплачивает, решает вопрос в рамках пособия. Для Jobcenter маршрут показывает, как подать заявление.", "Онлайн", act("Маршрут: Jobcenter и Agentur für Arbeit", "/berlin/jobcenter"), main)],
    next: act("Маршрут: Jobcenter и Agentur für Arbeit", "/berlin/jobcenter"),
  };
  if (a.benefit === "bafoeg") return {
    fit: "redirect",
    why: ["Все члены домохозяйства имеют право на BAföG или аналогичную помощь"],
    title: "Wohngeld при BAföG доступен только в исключениях",
    summary: "Домохозяйства, где все члены имеют право на BAföG, Berufsausbildungsbeihilfe или MobiPro-EU, не получают Wohngeld. Если эта помощь выплачивается как заём, исключения нет: тогда Wohngeld можно подать. Студенты получают Wohngeld, если не все в домохозяйстве имеют право на BAföG.",
    steps: [step("Проверьте, как выплачивается помощь", "Если помощь на учёбу идёт как заём, вы не исключены. Если хоть один член домохозяйства не имеет права на BAföG, Wohngeld тоже возможен.", "Выбор", main, plus)],
  };
  const noneu = a.citizen === "noneu";
  if (noneu && a.permit !== "title") return {
    fit: "redirect",
    why: ["Гражданство не ЕС", a.permit === "excluded" ? "Документ для поиска работы, места обучения, Chancenkarte, практики или волонтёрской службы" : "Документа на пребывание нет"],
    title: "Wohngeld по этому документу, как правило, не назначают",
    summary: a.permit === "excluded"
      ? "Закон WoGG называет такие документы среди тех, при которых право на Wohngeld, как правило, не возникает. Если ваш статус изменится, подавайте заявление: выплата начинается с месяца, когда заявление дошло до ведомства."
      : "Иностранцам Wohngeld назначают, если они фактически находятся в Германии и имеют право на пребывание: Aufenthaltstitel, Duldung, Gestattung или право по закону о свободном передвижении. Сначала нужен документ.",
    steps: [step("Решите вопрос с документом на пребывание", "Статус меняют через ведомство по делам иностранцев (LEA). Маршрут показывает, как продлить или оформить документ.", "Онлайн", act("Маршрут: вид на жительство", "/berlin/aufenthalt"), law)],
    next: act("Маршрут: вид на жительство", "/berlin/aufenthalt"),
  };
  const retro = a.recent === "yes";
  const docs = [
    "Документы личности всех, кто живёт в доме" + (noneu ? "; подтверждение права на пребывание" : "; для граждан ЕС обычно достаточно копии удостоверения"),
    ...(own ? ["Подтверждение права собственности: договор купли-продажи или выписка из земельной книги", "Последний расчёт коммунальных расходов (Betriebskostenabrechnung), если есть", "Подтверждение платежей по расходам на жильё за последние три месяца", "Подтверждение обязательств по финансированию: кредитный договор или решение о Grundsteuer"] : ["Договор аренды и все изменения к нему", "Подтверждение арендных платежей за последние три месяца"]),
    "Подтверждение пособий всех членов домохозяйства, если они есть",
    "Подтверждение дохода всех членов домохозяйства",
    "Подтверждения вычетов, инвалидности, степени ухода (Pflegegrad) или периодов Grundrente, если они относятся к вам",
    ...(retro ? ["Решение об отказе или окончании прежнего пособия"] : []),
  ];
  const facts: Fact[] = [
    { label: "Условие по месту жительства", value: "основное место жительства (Hauptwohnsitz) в Берлине", kind: "official" },
    { label: "Выплачивается автоматически", value: "нет: право есть, но нужно подать заявление", kind: "official" },
    { label: "С какого месяца", value: retro ? "с месяца подачи заявления на прежнее пособие, если вы подали заявление на Wohngeld примерно в течение 4 недель после отказа или окончания; иначе с месяца, когда заявление дошло до ведомства" : "с месяца, когда заявление дошло до ведомства, если условия выполнены", kind: "official" },
    { label: "Срок", value: "обычно 12 месяцев; для продолжения подают новое заявление (Weiterleistungsantrag) с подтверждением дохода и изменений в аренде", kind: "official" },
    { label: "Стоимость", value: "бесплатно", kind: "official" },
    { label: "Размер", value: "зависит от числа членов домохозяйства, суммарного дохода и учитываемой арендной платы без отопления; Wohngeld Plus включает пауш. за отопление и климатическую надбавку 0,40 € за м²", kind: "official" },
    { label: "Техническая неисправность в Берлине", value: "на странице Wohngeldberatung Mitte Берлин сообщает, что из-за неисправности в администрации Сената обработка дел Wohngeld временно невозможна, дата возобновления неизвестна; заявление всё равно подают, так как выплата идёт с месяца подачи", kind: "authority" },
  ];
  const fileRules = "Онлайн-файлы только PDF или JPG, не больше 30 МБ всего и 5 МБ на файл; называйте файл «Имя_Фамилия_Описание.pdf».";
  const online: Method = {
    id: "online", kind: "online", title: "Онлайн в Берлине", summary: "Вы заполняете заявление в сервисе «Jetzt online erledigen» и загружаете копии документов.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Вы живёте в Берлине: основное место жительства (Hauptwohnsitz)", own ? "Вы владеете жильём и живёте в нём, платите финансирование и расходы" : "Вы снимаете жильё и живёте в нём сами, как основной или суб-арендатор", "Загрузка файлов: PDF или JPG"], documents: docs, facts,
    steps: [
      ...(retro ? [step("Подайте заявление срочно", "Чтобы выплата началась с месяца заявления на прежнее пособие, нужно подать заявление в течение примерно 4 недель после отказа или окончания. Приложите решение об отказе или окончании.", "Онлайн", main)] : []),
      step("Оцените право в калькуляторе", "Официальный Wohngeldrechner на странице услуги даёт предварительную оценку.", "Онлайн", main, plus),
      step("Соберите копии документов", fileRules, "Выбор", main),
      step("Подайте заявление онлайн", "Откройте «Jetzt online erledigen» на странице услуги Берлина, заполните форму и загрузите копии.", "Онлайн", main),
      step("Подайте новое заявление до конца срока", "Wohngeld обычно назначают на 12 месяцев: новое заявление подают с подтверждением дохода и изменений в аренде.", "Выбор", main),
    ],
  };
  const paper: Method = {
    id: "paper", kind: "mail", title: "Бумажная форма по почте или лично", summary: "Вы заполняете форму, подписываете её от руки и отправляете в Wohnungsamt или Bürgeramt района.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: ["Заявление подписывают от руки", "Bürgeramt принимает заявление, но не консультирует и не проверяет документы"], documents: docs, facts,
    steps: [
      ...(retro ? [step("Подайте заявление срочно", "Подача в течение примерно 4 недель после отказа или окончания прежнего пособия переносит начало выплаты. Приложите решение.", "Выбор", main)] : []),
      step("Скачайте и заполните форму", "Форма размещена на странице услуги Берлина. Подпишите её от руки.", "Онлайн", main),
      step("Отправьте или принесите в Wohnungsamt или Bürgeramt района", "Приложите копии документов. Адреса всех районов указаны на странице услуги.", "Лично", main),
    ],
  };
  const methods = [online, paper];
  return {
    fit: "fits",
    why: [own ? "Вы владелец и живёте в жилье" : "Вы снимаете и живёте в жилье", a.benefit === "none" ? "Другие пособия на жильё не получаете" : "", noneu ? "Документ на пребывание подходит" : "Гражданство ЕС, ЕЭЗ или Швейцарии"].filter(Boolean),
    title: own ? "Подайте заявление на Wohngeld как владелец (Lastenzuschuss)" : "Подайте заявление на Wohngeld (Mietzuschuss)",
    summary: own
      ? "Владельцы собственного жилья, где они живут, получают Lastenzuschuss. Он идёт на расходы по финансированию и содержанию жилья. Выплата идёт с месяца, когда заявление дошло до ведомства."
      : "Арендаторы с небольшим доходом получают Mietzuschuss, если не получают пособий, покрывающих расходы на жильё. Выплата идёт с месяца, когда заявление дошло до ведомства: заявление лучше подать сразу.",
    methods,
    steps: methods[0].steps,
    note: "Это общая информация, а не юридическая консультация. Окончательное решение принимает Wohnungsamt района. Условия взяты со страниц Берлина, закона WoGG и BMWSB.",
    next: act("Маршрут: Anmeldung", "/berlin/anmeldung"),
  };
}
