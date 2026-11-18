import type { Action, Answers, Plan, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

/**
 * Официальные страницы маршрута «Психическое здоровье» (сверены 18 ноября 2026 года).
 * Каналы без звонка идут первыми: человеку в кризисе звонок часто даётся труднее всего.
 */
export const mentalOfficial = {
  krisendienstWays: "https://www.berliner-krisendienst.de/wege-aus-der-krise/wie-sie-uns-erreichen/",
  krisendienstSites: "https://www.berliner-krisendienst.de/ich-brauche-hilfe/",
  krisendienstNews: "https://www.berliner-krisendienst.de/informationen/aktuelles/",
  crisisFederal: "https://gesund.bund.de/en/mit-psychischen-krisen-umgehen",
  crisisNumbers: "https://www.berlin.de/lb/psychiatrie/hilfe-in-krisen/weitere-krisen-und-notrufnummern-fuer-erwachsene/",
  nora: "https://www.nora-notruf.de/de-as/was-ist-nora",
  noraFaq: "https://www.nora-notruf.de/de-as/fragen/faq",
  seelsorgeChat: "https://www.telefonseelsorge.de/chat/",
  seelsorgeMail: "https://online.telefonseelsorge.de/mailseelsorge",
  welcomeCounselling: "https://willkommenszentrum.berlin.de/en/health/psychosocial-counseling",
  spdi: "https://service.berlin.de/dienstleistung/327847/",
  spdiFederal: "https://gesund.bund.de/en/sozialpsychiatrischer-dienst",
  psychiatryBerlin: "https://www.berlin.de/lb/psychiatrie/_assets/veroeffentlichungen/publikationen/psychberlin_2021_v8_de.pdf",
  practiceSearch: "https://arztsuche.116117.de/pages/arztsuche.xhtml",
  booking: "https://www.116117-termine.de/",
  bookingFlyer: "https://www.kbv.de/documents/infothek/publikationen/patienteninfo/116117/116117-terminservice-flyer.pdf",
  psychotherapy: "https://www.116117.de/de/psychotherapie.php",
  sprechstunde: "https://www.bundesgesundheitsministerium.de/service/begriffe-von-a-z/p/psychotherapeutische-sprechstunde",
  therapyCare: "https://gesund.bund.de/wege-im-gesundheitswesen/erwachsenenleben/psychische-gesundheit/psychotherapeutische-versorgung",
  therapyFaq: "https://www.kbv.de/praxis/patientenversorgung/psychotherapie/faq-psychotherapie",
  jobcenterDuties: "https://www.arbeitsagentur.de/grundsicherung/pflichten-verstehen-und-beachten/rechte-pflichten-minderungen",
  jobcenterRules: "https://www.arbeitsagentur.de/datei/fw-32-sgb-ii-ab-juli-2026_ba057692.pdf",
};
const o = mentalOfficial;

export const mentalQuestions = [
  q("need", "Что вам нужно?", [
    ["crisis", "Мне плохо прямо сейчас"],
    ["psychiatry", "Психиатр: диагноз и лечение лекарствами"],
    ["therapy", "Психотерапия: лечение разговором"],
    ["relative", "Помочь близкому человеку"],
    ["jobcenter", "Не могу прийти на встречу в Jobcenter из-за состояния"],
  ]),
  q("insurance", "Какая у вас медицинская страховка?", [["gkv", "Государственная (gesetzliche Krankenversicherung)"], ["pkv", "Частная (private Krankenversicherung)"], ["none", "Страховки нет или не знаю"]]),
  q("contact", "Как вам удобнее связаться?", [["written", "Письменно или онлайн, без звонков"], ["inperson", "Прийти лично"], ["phone", "По телефону"]]),
] as const;

export function mentalVisible(a: Answers): readonly Question[] {
  const [need, insurance, contact] = mentalQuestions;
  if (a.need === "psychiatry" || a.need === "therapy") return [need, insurance, contact];
  if (a.need === "relative") return [need, contact];
  return [need];
}

const note = "Это общая информация, а не медицинская консультация. NOSTRES не ставит диагноз и не принимает экстренные обращения. Данные взяты с официальных страниц 116117, Минздрава Германии (BMG), gesund.bund.de, Берлина, Berliner Krisendienst и Bundesagentur für Arbeit.";

const danger = step(
  "Если есть опасность для жизни: 112 или приёмное отделение",
  "Если вы можете навредить себе или другим, нужна экстренная помощь. Можно прийти без записи в приёмное отделение (Notaufnahme) клиники с психиатрическим отделением. Позвонить можно по номеру 112. Написать диспетчеру 112 без разговора можно в официальном приложении nora, если вы зарегистрировались в нём заранее.",
  "Лично",
  act("gesund.bund.de: что делать в психическом кризисе", o.crisisFederal),
  act("gesund.bund.de: что делать в психическом кризисе", o.crisisFederal),
  act("Позвонить 112", "tel:112"),
);
const walkIn = step(
  "Придите в Berliner Krisendienst без записи",
  "Berliner Krisendienst (кризисная служба Берлина) помогает бесплатно, по желанию анонимно. В 9 отделениях по районам можно прийти без записи каждый день с 16 до 24 часов. С 0 до 8 часов, а в выходные и праздники ещё и с 8 до 16 часов работает общее отделение: Große Hamburger Straße 5, 10115 Berlin. По будням с 8 до 16 часов служба отвечает только по телефону. Временные закрытия отделений служба публикует в новостях на своём сайте.",
  "Лично",
  act("Krisendienst: адреса отделений по районам", o.krisendienstSites),
  act("Krisendienst: как к нам попасть", o.krisendienstWays),
  act("Krisendienst: новости и закрытия отделений", o.krisendienstNews),
);
const writeNow = step(
  "Напишите, если говорить трудно",
  "TelefonSeelsorge (служба психологической поддержки) отвечает в чате и по e-mail бесплатно и анонимно: нужны только адрес e-mail и псевдоним. Чат идёт на немецком, по записи, иногда без записи, один раз в день. Ответ на письмо обычно приходит в течение 72 часов, поэтому письмо не подходит при опасности для жизни.",
  "Онлайн",
  act("TelefonSeelsorge: чат", o.seelsorgeChat),
  act("TelefonSeelsorge: чат", o.seelsorgeChat),
  act("TelefonSeelsorge: письмо", o.seelsorgeMail),
);
const phoneFallback = step(
  "Если можете позвонить",
  "Berliner Krisendienst отвечает круглосуточно по номеру своего района: 030 39063-10 … -90, номера указаны на странице отделений. TelefonSeelsorge — круглосуточно и бесплатно: 0800 111 0 111 и 0800 111 0 222. По-русски отвечает линия 030 440 308 454.",
  "Звонок",
  act("Krisendienst: номера отделений", o.krisendienstSites),
  act("Берлин: номера кризисной помощи", o.crisisNumbers),
  act("Willkommenszentrum: номера и языки", o.welcomeCounselling),
);
const prepare = step(
  "Подготовьтесь заранее",
  "Запишите адрес отделения Krisendienst своего района. В приложении nora (официальное приложение экстренных служб федеральных земель) можно вызвать полицию, пожарных и скорую через чат, не говоря. Регистрация требует проверки личности: через POSTIDENT, видеосвязь или в почтовом отделении, поэтому пройдите её заранее. Приложение работает на немецком и английском.",
  "Выбор",
  act("nora: что умеет приложение", o.nora),
  act("nora: регистрация и условия", o.noraFaq),
);

function crisisPlan(): Plan {
  return {
    fit: "fits",
    why: ["Вам плохо прямо сейчас"],
    title: "Помощь прямо сейчас: сначала то, что не требует звонка",
    summary: "При опасности для жизни — приёмное отделение клиники или 112. Без опасности для жизни можно прийти в Berliner Krisendienst без записи или написать в чат. Телефон — запасной вариант.",
    steps: [danger, walkIn, writeNow, phoneFallback, prepare],
    singleMethodNote: "Шаги расположены от срочного к подготовке на будущее.",
    note,
  };
}

const spdi = (detail: string): Step => step(
  "Обратитесь в социально-психиатрическую службу района",
  detail,
  "Онлайн",
  act("Берлин: социально-психиатрические службы по районам", o.spdi),
  act("gesund.bund.de: что делает Sozialpsychiatrischer Dienst", o.spdiFederal),
);
const counselling = step(
  "Получите бесплатную консультацию на своём языке",
  "Психосоциальная консультация в Берлине бесплатна и конфиденциальна, доступна и без медицинской страховки, в том числе при Duldung. Часто есть консультации на арабском, фарси, украинском, английском, французском и других языках. Связаться можно по e-mail или прийти и договориться о встрече.",
  "Онлайн",
  act("Willkommenszentrum: психосоциальная консультация", o.welcomeCounselling),
);
const insuranceRoute = act("Маршрут: медицинская страховка", "/berlin/health-insurance");

function bookingStep(contact: string, kind: "psychiatry" | "therapy"): Step {
  if (kind === "therapy") {
    if (contact === "written") return step("Запишитесь на первую беседу онлайн", "Запишитесь на сайте 116117-termine.de или в приложении 116117: для первой беседы код не нужен. Можно также записаться через сайт практики, если она принимает запись онлайн.", "Онлайн", act("116117: запись онлайн", o.booking), act("116117: психотерапия", o.psychotherapy), act("Поиск психотерапевтов 116117", o.practiceSearch));
    if (contact === "inperson") return step("Выберите практику рядом и договоритесь о встрече", "В поиске 116117 найдите практику рядом и способ связи с ней. В фильтре «Fremdsprachen» (иностранные языки) можно выбрать язык. Первую беседу проводят лично.", "Лично", act("Поиск психотерапевтов 116117", o.practiceSearch), act("116117: психотерапия", o.psychotherapy));
    return step("Позвоните в 116117 или в практику", "Служба 116117 записывает на первую беседу: она обязана предложить встречу не позднее чем через 4 недели. Можно позвонить и напрямую в практику.", "Звонок", act("116117: психотерапия", o.psychotherapy), act("BMG: сроки службы записи", o.sprechstunde), act("Позвонить 116117", "tel:116117"));
  }
  if (contact === "written") return step("Найдите психиатра и запишитесь онлайн", "В поиске 116117 найдите практику психиатра (Facharzt für Psychiatrie und Psychotherapie). Многие практики принимают запись на своём сайте. В сервисе 116117-termine.de без кода направления можно записаться только к семейному врачу, гинекологу, офтальмологу и педиатру; к психиатру через этот сервис нужен код направления (Vermittlungscode), его даёт семейный врач.", "Онлайн", act("Поиск практик 116117", o.practiceSearch), act("116117: правила записи", o.bookingFlyer), act("116117: запись онлайн", o.booking));
  if (contact === "inperson") return step("Начните с семейного врача или практики психиатра", "Семейный врач (Hausarzt) принимает без направления, может начать лечение и выдать направление с кодом к психиатру. В поиске 116117 можно найти практику психиатра рядом и узнать её часы. Для тех, кто не может регулярно ходить к врачу в практику, при каждой психиатрической клинике Берлина есть амбулатория (Psychiatrische Institutsambulanz, PIA).", "Лично", act("Поиск практик 116117", o.practiceSearch), act("Берлин: психиатрическая помощь", o.psychiatryBerlin));
  return step("Позвоните в практику или в 116117", "Практике сообщите, что нужен приём психиатра. Служба 116117 подбирает приём у психиатра, если у вас есть направление с кодом (Vermittlungscode) от семейного врача.", "Звонок", act("116117: правила записи", o.bookingFlyer), act("116117: правила записи", o.bookingFlyer), act("Позвонить 116117", "tel:116117"));
}

function psychiatryPlan(a: Answers): Plan {
  const contact = a.contact ?? "written";
  if (a.insurance === "none") return {
    fit: "insufficient",
    why: ["Страховки нет или вы не знаете, как застрахованы", "Психиатр: диагноз и лекарства"],
    title: "Помощь без страховки и оформление страховки",
    summary: "Социально-психиатрическая служба района и психосоциальные консультации помогают бесплатно и без страховки. Для лечения у психиатра в практике нужна страховка.",
    steps: [
      spdi(contact === "written" ? "Напишите на e-mail службы своего района: адреса указаны на странице. Служба бесплатна, диагноз и страховка не нужны. Её врачи и психологи консультируют, помогают в кризисе, находят лечение и при необходимости приходят на дом." : "Служба бесплатна, диагноз и страховка не нужны. Её врачи и психологи консультируют, помогают в кризисе, находят лечение и при необходимости приходят на дом. Часы приёма каждого района указаны на странице."),
      counselling,
      step("Оформите медицинскую страховку", "В Германии страховка обязательна для всех жителей. Маршрут поможет выбрать путь к государственной или частной страховке.", "Онлайн", insuranceRoute, act("gesund.bund.de: что делать в психическом кризисе", o.crisisFederal)),
    ],
    singleMethodNote: "Сначала помощь без страховки, параллельно оформление страховки.",
    note,
  };
  const privateIns = a.insurance === "pkv";
  return {
    fit: "fits",
    why: [privateIns ? "Частная страховка" : "Государственная страховка", contact === "written" ? "Письменно или онлайн" : contact === "inperson" ? "Лично" : "По телефону"],
    title: "Психиатр в Берлине: как попасть на приём",
    summary: privateIns ? "Психиатр ставит диагноз и назначает лекарства. Найдите практику через поиск 116117; какие расходы оплатит частная страховка, решает она сама." : "Психиатр ставит диагноз и назначает лекарства. Семейный врач может начать лечение и дать направление; при тяжёлом состоянии помогает амбулатория при клинике.",
    steps: [
      privateIns
        ? step("Найдите практику психиатра", contact === "written" ? "В поиске 116117 найдите практику психиатра (Facharzt für Psychiatrie und Psychotherapie) и запишитесь на её сайте или по e-mail. Сервис записи 116117 предназначен для государственно застрахованных." : contact === "inperson" ? "В поиске 116117 найдите практику психиатра рядом и узнайте её часы. Сервис записи 116117 предназначен для государственно застрахованных." : "В поиске 116117 найдите практику психиатра и позвоните в неё. Сервис записи 116117 предназначен для государственно застрахованных.", contact === "phone" ? "Звонок" : contact === "inperson" ? "Лично" : "Онлайн", act("Поиск практик 116117", o.practiceSearch), act("116117: правила записи", o.bookingFlyer))
        : bookingStep(contact, "psychiatry"),
      step("Если ходить в практику не получается", "При каждой психиатрической клинике Берлина есть амбулатория (Psychiatrische Institutsambulanz, PIA) для тех, кто не может регулярно ходить к врачу в практику, и дневной стационар (Tagesklinik). Лечение может идти и дома вместо стационара.", "Выбор", act("Берлин: психиатрическая помощь", o.psychiatryBerlin)),
      spdi("Служба района бесплатно консультирует, помогает найти лечение и при необходимости приходит на дом. Диагноз и страховка не нужны; связаться можно по e-mail, адреса указаны на странице."),
      ...(privateIns ? [step("Прочитайте, что оплатит страховка", "Частные страховщики сами решают, какие расходы на лечение они берут на себя: эти условия указаны в вашем договоре.", "Выбор", act("gesund.bund.de: психотерапевтическая помощь", o.therapyCare))] : []),
    ],
    singleMethodNote: "Способ связи вы выбрали в ответах.",
    note,
    next: act("Маршрут: поиск врача и запись", "/berlin/vrach"),
  };
}

function therapyPlan(a: Answers): Plan {
  const contact = a.contact ?? "written";
  if (a.insurance === "none") return {
    fit: "insufficient",
    why: ["Страховки нет или вы не знаете, как застрахованы", "Психотерапия"],
    title: "Поддержка без страховки и оформление страховки",
    summary: "Бесплатные психосоциальные консультации доступны без страховки. Психотерапию оплачивает больничная касса, поэтому параллельно оформите страховку.",
    steps: [
      counselling,
      spdi(contact === "written" ? "Напишите на e-mail службы своего района. Она бесплатна, страховка не нужна; терапию сама не проводит, но помогает найти место." : "Служба бесплатна, страховка не нужна; терапию сама не проводит, но помогает найти место. Часы приёма каждого района указаны на странице."),
      step("Оформите медицинскую страховку", "В Германии страховка обязательна для всех жителей. Маршрут поможет выбрать путь к государственной или частной страховке.", "Онлайн", insuranceRoute, act("gesund.bund.de: психотерапевтическая помощь", o.therapyCare)),
    ],
    singleMethodNote: "Сначала поддержка без страховки, параллельно оформление страховки.",
    note,
  };
  if (a.insurance === "pkv") return {
    fit: "conditional",
    why: ["Частная страховка", "Психотерапия"],
    title: "Психотерапия с частной страховкой",
    summary: "Какие расходы на психотерапию оплатит частная страховка, она решает сама. Прочитайте условия договора до начала лечения.",
    steps: [
      step("Прочитайте условия своей страховки", "Какие расходы на психотерапию оплачивает частная страховка, определяет она сама: условия указаны в вашем договоре. Вопрос страховой можно задать письменно.", "Выбор", act("gesund.bund.de: психотерапевтическая помощь", o.therapyCare)),
      step("Найдите психотерапевта", contact === "written" ? "В поиске 116117 найдите практику и напишите ей через сайт или по e-mail. В фильтре «Fremdsprachen» (иностранные языки) можно выбрать язык." : contact === "inperson" ? "В поиске 116117 найдите практику рядом. В фильтре «Fremdsprachen» (иностранные языки) можно выбрать язык." : "В поиске 116117 найдите практику и позвоните в неё. В фильтре «Fremdsprachen» (иностранные языки) можно выбрать язык.", contact === "phone" ? "Звонок" : contact === "inperson" ? "Лично" : "Онлайн", act("Поиск психотерапевтов 116117", o.practiceSearch)),
      counselling,
    ],
    singleMethodNote: "Порядок один: условия страховки, затем выбор практики.",
    note,
  };
  return {
    fit: "fits",
    why: ["Государственная страховка", contact === "written" ? "Письменно или онлайн" : contact === "inperson" ? "Лично" : "По телефону"],
    title: "Психотерапия с государственной страховкой: по шагам",
    summary: "Начните с первой беседы: направление и код не нужны. Если помощь нужна быстро, терапевт может сразу начать срочное лечение без заявления в кассу.",
    steps: [
      bookingStep(contact, "therapy"),
      step("Пройдите первую беседу", "Первая беседа (psychotherapeutische Sprechstunde) — до 6 встреч по 25 минут, всего до 150 минут. Направление не нужно. Терапевт с допуском больничной кассы обязан проводить такие беседы. Если подходящего места нет, служба 116117 обязана найти первую беседу в течение 4 недель.", "Лично", act("BMG: первая беседа и сроки", o.sprechstunde), act("116117: психотерапия", o.psychotherapy)),
      step("Если помощь нужна быстро: срочное лечение", "Если после беседы терапевт отмечает в форме PTV 11, что лечение нужно скоро, возможно срочное лечение (Akutbehandlung) — до 600 минут. Разрешение кассы не нужно, терапевт только уведомляет её формой PTV 12. Служба 116117 обязана найти срочное лечение в течение 2 недель.", "Ожидание", act("116117: срочное лечение", o.psychotherapy), act("KBV: вопросы о психотерапии", o.therapyFaq)),
      step("Для длительной терапии подайте заявление вместе с терапевтом", "Сначала несколько пробных встреч и осмотр у семейного или другого врача, чтобы исключить физические причины. Затем вы вместе с терапевтом подаёте заявление в больничную кассу. Краткая терапия — 12–24 часа, длительная — около 30–60 часов в зависимости от метода.", "Ожидание", act("gesund.bund.de: психотерапевтическая помощь", o.therapyCare), act("116117: психотерапия", o.psychotherapy)),
    ],
    singleMethodNote: "Способ записи вы выбрали в ответах; дальше порядок один.",
    note,
    next: act("Маршрут: поиск врача и запись", "/berlin/vrach"),
  };
}

function relativePlan(a: Answers): Plan {
  const contact = a.contact ?? "written";
  const krisendienst = contact === "phone"
    ? step("Позвоните в Berliner Krisendienst", "Кризисная служба помогает и родственникам, друзьям и коллегам человека в кризисе. Она отвечает круглосуточно по номеру своего района: 030 39063-10 … -90. В срочных случаях сотрудники приезжают на место, есть дежурный врач.", "Звонок", act("Krisendienst: номера отделений", o.krisendienstSites), act("Krisendienst: как к нам попасть", o.krisendienstWays))
    : contact === "inperson"
      ? step("Придите в Berliner Krisendienst без записи", "Кризисная служба помогает и родственникам, друзьям и коллегам. В отделение своего района можно прийти без записи каждый день с 16 до 24 часов; ночью, в выходные и праздники работает общее отделение: Große Hamburger Straße 5. В срочных случаях сотрудники приезжают на место.", "Лично", act("Krisendienst: адреса отделений", o.krisendienstSites), act("Krisendienst: как к нам попасть", o.krisendienstWays))
      : step("Договоритесь о видеоконсультации Berliner Krisendienst", "Кризисная служба помогает и родственникам. По предварительной записи она консультирует по видео; при острой ситуации видео не подходит: тогда нужен визит или звонок.", "Онлайн", act("Krisendienst: как к нам попасть", o.krisendienstWays), act("Krisendienst: адреса отделений", o.krisendienstSites));
  return {
    fit: "fits",
    why: ["Вы помогаете близкому человеку", contact === "written" ? "Письменно или онлайн" : contact === "inperson" ? "Лично" : "По телефону"],
    title: "Как помочь близкому человеку",
    summary: "Социально-психиатрическая служба района и Berliner Krisendienst помогают и родственникам. При опасности для жизни нужна экстренная помощь.",
    steps: [
      danger,
      spdi(contact === "written" ? "Служба консультирует родственников, соседей и друзей бесплатно, диагноз и страховка не нужны. Напишите на e-mail службы района, где живёт ваш близкий: адреса указаны на странице. Сотрудники могут прийти на дом, но не входят в жильё против воли человека." : "Служба консультирует родственников, соседей и друзей бесплатно, диагноз и страховка не нужны. Обращайтесь в службу района, где живёт ваш близкий. Сотрудники могут прийти на дом, но не входят в жильё против воли человека."),
      krisendienst,
    ],
    singleMethodNote: "Способ связи вы выбрали в ответах.",
    note,
  };
}

function jobcenterPlan(): Plan {
  return {
    fit: "fits",
    why: ["Вам трудно прийти на встречу в Jobcenter из-за состояния"],
    title: "Не могу прийти в Jobcenter: как сохранить выплаты",
    summary: "Болезнь — уважительная причина, если её подтверждает документ. С 1 июля 2026 года второй пропуск без уважительной причины уменьшает выплату, а три пропуска подряд прекращают её до личной явки.",
    steps: [
      step("Подтвердите причину документом", "Больничный лист (Arbeitsunfähigkeitsbescheinigung) Jobcenter, как правило, признаёт уважительной причиной. Отправьте его в Jobcenter и сохраните подтверждение отправки. Jobcenter может отдельно попросить справку врача о том, что вы не могли прийти именно на встречу, и оплатить её — до 5,36 €.", "Почта", act("Bundesagentur für Arbeit: правила о пропусках встреч", o.jobcenterRules), act("Jobcenter: права, обязанности и снижения", o.jobcenterDuties)),
      step("Ответьте на запрос объяснения (Anhörung)", "Перед снижением выплаты Jobcenter обязан дать вам объяснить причину. Если ему известно о психическом заболевании, объяснение проходит устно: по телефону, по видео или с визитом на дом. Напишите в ответе, какой способ для вас возможен.", "Почта", act("Bundesagentur für Arbeit: правила о пропусках встреч", o.jobcenterRules), act("Jobcenter: права, обязанности и снижения", o.jobcenterDuties)),
      step("Знайте последствия пропусков", "Первый пропуск не уменьшает выплату. Со второго пропуска без уважительной причины основная выплата (Regelbedarf) уменьшается на 30% на месяц, если нет особой тяжести положения (Härte). Три пропуска подряд без причины прекращают выплату до личной явки; плату за жильё ещё месяц продолжают.", "Выбор", act("Jobcenter: права, обязанности и снижения", o.jobcenterDuties)),
      spdi("Служба района бесплатно консультирует, организует помощь и при необходимости приходит на дом. Связаться можно по e-mail, адреса указаны на странице."),
    ],
    singleMethodNote: "Порядок один: документ, объяснение, поддержка.",
    note,
    next: act("Маршрут: Grundsicherungsgeld", "/berlin/grundsicherungsgeld"),
  };
}

export function mentalPlan(a: Answers): Plan {
  if (a.need === "psychiatry") return psychiatryPlan(a);
  if (a.need === "therapy") return therapyPlan(a);
  if (a.need === "relative") return relativePlan(a);
  if (a.need === "jobcenter") return jobcenterPlan();
  return crisisPlan();
}
