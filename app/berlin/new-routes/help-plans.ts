import type { Action, Answers, Plan, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

/**
 * Официальные страницы маршрутов «Дискриминация», «Без жилья», «Трудная ситуация» и «Домашнее насилие»
 * (сверены 19 ноября 2026 года). Организации помощи даны через официальные списки Берлина и сайты
 * крупных организаций (Красный Крест, Caritas, Berliner Stadtmission, Berliner Tafel), а не через адреса
 * отдельных пунктов: адреса и часы меняются чаще, чем списки.
 */
export const helpOfficial = {
  ladsSearch: "https://www.berlin.de/sen/lads/beratung/suche/index.php/index.html?reset=1",
  ladsHousing: "https://www.berlin.de/sen/lads/beratung/diskriminierung/wohnungsmarkt/",
  ladsReport: "https://www.berlin.de/sen/lads/beratung/meldestellen-fuer-diskriminierung-1498255.php",
  ladgOmbuds: "https://www.berlin.de/sen/lads/recht/ladg/ombudsstelle/artikel.1525630.php",
  fairMieten: "https://fairmieten-fairwohnen.de/beratung/",
  adnb: "https://www.adnb.de/de/Beratung/Beratungsangebot/",
  ads: "https://www.antidiskriminierungsstelle.de/EN/we-offer-advice-to-you/we-offer-advice-to-you.html",
  adsContact: "https://antidiskriminierungsstelle.de/EN/about-us/contact/contact-node.html",
  agg15: "https://www.gesetze-im-internet.de/agg/__15.html",
  agg21: "https://www.gesetze-im-internet.de/agg/__21.html",
  ombudsPolice: "https://www.berlin.de/buerger-polizeibeauftragter/ombudsstelle/worueber-koennen-sie-sich-beschweren-1391945.php",
  ombudsForm: "https://www.berlin.de/buerger-polizeibeauftragter/kontakt/formular.1253876.php",
  victimHelp: "https://www.berlin.de/ba-lichtenberg/politik-und-verwaltung/beauftragte/gleichstellung/artikel.1180363.php",
  violenceDoc: "https://gewaltschutzambulanz.charite.de/",

  wohnhilfe: "https://service.berlin.de/dienstleistung/324485/",
  wohnhilfeHeime: "https://www.berlin.de/ba-neukoelln/politik-und-verwaltung/aemter/amt-fuer-soziales/hilfe-zum-lebensunterhalt-und-grundsicherung/artikel.286707.php",
  wohnhilfeNoAddress: "https://berlin.de/ba-steglitz-zehlendorf/politik-und-verwaltung/aemter/amt-fuer-soziales/soziale-wohnhilfe/hilfe-bei-bestehender-wohnungslosigkeit.pdf",
  kaeltehilfe: "https://www.kaeltehilfe-berlin.de/",
  kaeltehilfeOffers: "https://www.kaeltehilfe-berlin.de/angebote-start",
  kaeltehilfeSenat: "https://www.berlin.de/sen/asgiva/presse/pressemitteilungen/2026/pressemitteilung.1631968.php",
  stadtmission: "https://www.berliner-stadtmission.de/angebote/armut-und-wohnungslosigkeit",
  stadtmissionAdvice: "https://www.berliner-stadtmission.de/angebote/beratung-in-ausnahmesituationen",
  lfu: "https://www.berlin.de/lfu/",
  rentDebts: "https://www.caritas.de/hilfeundberatung/ratgeber/wohnungslosigkeit/lebenaufderstrasse/was-tun-bei-mietschulden",
  bgb569: "https://www.gesetze-im-internet.de/bgb/__569.html",
  sgb2rent: "https://www.gesetze-im-internet.de/sgb_2/__22.html",

  debtAdvice: "https://www.berlin.de/sen/soziales/besondere-lebenssituationen/schuldner/anerkannte-beratungsstellen/",
  debtOnline: "https://www.caritas.de/hilfeundberatung/onlineberatung/schuldnerberatung/",
  caritasOnline: "https://www.caritas.de/hilfeundberatung/onlineberatung",
  food: "https://www.berliner-tafel.de/laib-und-seele/",
  foodPlaces: "https://www.berliner-tafel.de/laib-und-seele/die-praxis/kunden/ausgabestellen",
  redCross: "https://www.drk-berlin.de/informieren/leistungen-von-a-z.html",
  mbeon: "https://www.mbeon.de/",
  bamfNavi: "https://bamf-navi.bamf.de/de/",
  migrationAdvice: "https://www.berlin.de/ba-marzahn-hellersdorf/politik-und-verwaltung/beauftragte/integration/beratung/artikel.829420.php",

  big: "https://www.big-hotline.de/",
  violenceBerlin: "https://www.berlin.de/sen/frauen/keine-gewalt/unterstuetzungs-angebote-fuer-betroffene-von-gewalt/",
  violencePolice: "https://www.berlin.de/polizei/aufgaben/praevention/gewalt/artikel.125028.php",
  hilfetelefon: "https://www.hilfetelefon.de/",
  menHelp: "https://www.maennerhilfetelefon.de/",
  nora: "https://www.nora-notruf.de/de-as/was-ist-nora",
};
const o = helpOfficial;

/* ───────────── Дискриминация ───────────── */

export const discriminationQuestions = [
  q("where", "Где с вами обошлись несправедливо?", [
    ["housing", "Жильё: поиск квартиры, аренда, соседи"],
    ["work", "Работа или поиск работы"],
    ["services", "Магазин, ресторан, банк, транспорт, клуб и другие услуги"],
    ["authority", "Ведомство, школа или другое учреждение Берлина"],
    ["police", "Полиция Берлина"],
    ["attack", "На меня напали или мне угрожают"],
  ]),
  q("goal", "Что вы хотите сделать?", [["advice", "Сначала получить бесплатную консультацию"], ["claim", "Подать жалобу или требовать возмещения"]]),
] as const;

export function discriminationVisible(a: Answers): readonly Question[] {
  const [where, goal] = discriminationQuestions;
  return a.where === "attack" ? [where] : [where, goal];
}

const discriminationNote = "Это общая информация, а не юридическая консультация. Консультации в Берлине бесплатны, по желанию анонимны. Данные взяты с официальных страниц Landesstelle für Gleichbehandlung – gegen Diskriminierung (LADS), Antidiskriminierungsstelle des Bundes, Bürger- und Polizeibeauftragter Berlin и закона AGG.";

const recordStep = step(
  "Запишите, что произошло",
  "Запишите дату, место, имена или должности, точные слова и свидетелей. Сохраните письма, объявления, переписку, отказ и скриншоты. Эти записи нужны консультации и для любой жалобы.",
  "Выбор",
  act("LADS: поиск бесплатной консультации", o.ladsSearch),
);
const ladsStep = (detail: string): Step => step(
  "Найдите консультацию по вашему случаю",
  detail,
  "Онлайн",
  act("LADS: поиск консультации по теме и языку", o.ladsSearch),
  act("LADS: поиск консультации по теме и языку", o.ladsSearch),
  act("Antidiskriminierungsstelle des Bundes: консультация", o.ads),
);
const adsStep = step(
  "Бесплатная консультация федеральной службы",
  "Antidiskriminierungsstelle des Bundes (федеральная служба по борьбе с дискриминацией) консультирует бесплатно и конфиденциально: письмо на beratung@ads.bund.de или звонок 0800 546 546 5 с понедельника по четверг с 9 до 15 часов.",
  "Онлайн",
  act("Antidiskriminierungsstelle des Bundes: консультация", o.ads),
  act("Antidiskriminierungsstelle des Bundes: контакты", o.adsContact),
);
const deadlineStep = (law: "work" | "civil"): Step => step(
  "Успейте письменно заявить требование за 2 месяца",
  law === "work"
    ? "Требование о возмещении по закону AGG нужно предъявить работодателю письменно в течение 2 месяцев. Срок начинается, когда вы узнали об отказе или несправедливом обращении. Законопроект о сроке 4 месяца ещё не вступил в силу, поэтому ориентируйтесь на 2 месяца. Консультация поможет составить письмо."
    : "Требование по закону AGG к арендодателю, магазину или другой фирме нужно предъявить в течение 2 месяцев. Законопроект о сроке 4 месяца ещё не вступил в силу, поэтому ориентируйтесь на 2 месяца. Отправьте требование письменно и сохраните подтверждение отправки; консультация поможет составить письмо.",
  "Почта",
  act(law === "work" ? "AGG § 15: срок 2 месяца" : "AGG § 21: срок 2 месяца", law === "work" ? o.agg15 : o.agg21),
  act(law === "work" ? "AGG § 15: срок 2 месяца" : "AGG § 21: срок 2 месяца", law === "work" ? o.agg15 : o.agg21),
  act("LADS: поиск консультации с юридической помощью", o.ladsSearch),
);
const ombudsLadg = (claim: boolean): Step => step(
  claim ? "Подайте жалобу в LADG-Ombudsstelle" : "Получите оценку случая в LADG-Ombudsstelle",
  `LADG-Ombudsstelle разбирает дискриминацию со стороны учреждений Берлина: бесплатно, конфиденциально и независимо. ${claim ? "Если вы хотите, она проводит примирение с учреждением." : "Сначала она оценивает, была ли дискриминация, и объясняет, что можно сделать."} E-mail: beschwerde@ladg-os.berlin.de. Телефон 030 9013 3456: запись во вторник с 9 до 13 и в четверг с 12 до 16 часов, открытая консультация в среду с 13 до 17 часов. Адрес: Alt-Moabit 59–61.`,
  "Онлайн",
  act("LADG-Ombudsstelle: что делает и как связаться", o.ladgOmbuds),
);

function discriminationPlan(a: Answers): Plan {
  const claim = a.goal === "claim";
  const why = (place: string) => [place, claim ? "Вы хотите подать жалобу или требовать возмещения" : "Сначала нужна консультация"];
  if (a.where === "attack") return {
    fit: "fits",
    why: ["На вас напали или вам угрожают"],
    title: "Если на вас напали или угрожают",
    summary: "При опасности сейчас звоните 110. Травмы можно бесплатно задокументировать без заявления в полицию, а консультация для пострадавших поможет решить, что делать дальше.",
    steps: [
      step("При опасности: 110", "Если опасность продолжается, звоните в полицию: 110. Написать в экстренные службы без разговора можно в официальном приложении nora, если вы зарегистрировались в нём заранее.", "Звонок", act("Позвонить 110", "tel:110"), act("nora: экстренный вызов без звонка", o.nora)),
      step("Задокументируйте травмы бесплатно", "Gewaltschutzambulanz der Charité (амбулатория защиты от насилия) бесплатно документирует травмы так, чтобы документ годился для суда. Заявление в полицию для этого не нужно: решить можно позже. Телефон 030 450 570 270, вход: Birkenstraße 62.", "Лично", act("Gewaltschutzambulanz der Charité", o.violenceDoc)),
      step("Получите консультацию для пострадавших", "В поиске LADS выберите «после насилия» (nach Gewaltvorfällen): там консультации для пострадавших от расистского, антисемитского, антиквирного и другого насилия. Opferhilfe Berlin консультирует пострадавших от любых преступлений бесплатно и конфиденциально: 030 395 28 67.", "Онлайн", act("LADS: консультации после насилия", o.ladsSearch), act("Берлин: службы помощи пострадавшим", o.victimHelp)),
      recordStep,
    ],
    singleMethodNote: "Шаги расположены от срочного к следующим действиям.",
    note: discriminationNote,
  };
  if (a.where === "housing") return {
    fit: "fits",
    why: why("Жильё: поиск или аренда"),
    title: claim ? "Дискриминация при поиске или аренде жилья: как требовать возмещения" : "Дискриминация при поиске или аренде жилья: где получить консультацию",
    summary: claim ? "Закон AGG защищает и при поиске жилья, и при аренде. Требование нужно предъявить в течение 2 месяцев; профильная консультация поможет составить его." : "В Берлине есть отдельная консультация по дискриминации на рынке жилья: Fair mieten – Fair wohnen.",
    steps: [
      step("Обратитесь в Fair mieten – Fair wohnen", "Берлинская служба против дискриминации на рынке жилья консультирует людей, которых не взяли в квартиру, обидели при аренде или в доме. Сайт есть на английском, турецком, арабском, персидском, русском и украинском.", "Онлайн", act("Fair mieten – Fair wohnen: консультация", o.fairMieten), act("LADS: дискриминация на рынке жилья", o.ladsHousing), act("ADNB: консультация", o.adnb)),
      recordStep,
      ...(claim ? [deadlineStep("civil")] : [ladsStep("В поиске LADS выберите тему «Жильё и поиск жилья» (Wohnen und Wohnungssuche) и свой язык: там около 30 бесплатных консультаций.")]),
    ],
    singleMethodNote: "Порядок один: консультация, записи, затем решение.",
    note: discriminationNote,
    next: act("Маршрут: поиск квартиры или комнаты", "/berlin/wohnungssuche"),
  };
  if (a.where === "work") return {
    fit: "fits",
    why: why("Работа или поиск работы"),
    title: claim ? "Дискриминация на работе: как требовать возмещения" : "Дискриминация на работе: где получить консультацию",
    summary: claim ? "На работе и при приёме на работу действует закон AGG. Требование к работодателю нужно отправить письменно в течение 2 месяцев." : "Бесплатно консультируют берлинские службы из поиска LADS и федеральная Antidiskriminierungsstelle des Bundes.",
    steps: [
      ...(claim ? [deadlineStep("work")] : []),
      ladsStep("В поиске LADS выберите причину дискриминации и язык. ADNB des TBB (антидискриминационная сеть Берлина) консультирует по закону AGG, особенно при расизме."),
      adsStep,
      recordStep,
    ],
    singleMethodNote: claim ? "Сначала срок, потому что он короткий." : "Начните с консультации, затем решайте о требовании.",
    note: discriminationNote,
  };
  if (a.where === "services") return {
    fit: "fits",
    why: why("Магазин, ресторан, банк, транспорт или другие услуги"),
    title: claim ? "Отказ в услуге или несправедливое обращение: как требовать возмещения" : "Отказ в услуге или несправедливое обращение: где получить консультацию",
    summary: claim ? "Закон AGG запрещает отказывать в обычных услугах из-за происхождения, пола, религии, инвалидности, возраста или сексуальной ориентации. Требование нужно предъявить в течение 2 месяцев." : "Бесплатно консультируют берлинские службы из поиска LADS и федеральная Antidiskriminierungsstelle des Bundes.",
    steps: [
      recordStep,
      ...(claim ? [deadlineStep("civil")] : []),
      ladsStep("В поиске LADS выберите причину дискриминации и свой язык. Консультации бесплатны; часть из них помогает и юридически."),
      adsStep,
    ],
    singleMethodNote: "Порядок один: записи, консультация, требование.",
    note: discriminationNote,
  };
  if (a.where === "police") return {
    fit: "fits",
    why: why("Полиция Берлина"),
    title: claim ? "Дискриминация со стороны полиции Берлина: как подать жалобу" : "Дискриминация со стороны полиции Берлина: где получить консультацию",
    summary: claim ? "Жалобу на полицию принимает независимый Bürger- und Polizeibeauftragter: в течение 6 месяцев после действий полиции." : "Полиция Берлина: учреждение Берлина, поэтому консультирует LADG-Ombudsstelle; жалобу можно подать независимому Polizeibeauftragter.",
    steps: [
      ...(claim
        ? [step("Подайте жалобу Polizeibeauftragter в течение 6 месяцев", "Bürger- und Polizeibeauftragter (уполномоченный по жалобам на ведомства и полицию) не входит в полицию. Жалобу на проверку, задержание, отказ принять заявление или дискриминацию нужно подать в течение 6 месяцев после окончания действий полиции: через форму на сайте или на post@bebuepol-berlin.de.", "Онлайн", act("Polizeibeauftragter: форма жалобы", o.ombudsForm), act("Polizeibeauftragter: на что можно пожаловаться", o.ombudsPolice))]
        : []),
      ombudsLadg(claim),
      recordStep,
    ],
    singleMethodNote: claim ? "Сначала жалоба: у неё есть срок." : "Начните с консультации, жалобу можно подать позже, но в течение 6 месяцев.",
    note: discriminationNote,
  };
  return {
    fit: "fits",
    why: why("Ведомство, школа или другое учреждение Берлина"),
    title: claim ? "Дискриминация в учреждении Берлина: как подать жалобу" : "Дискриминация в учреждении Берлина: где получить консультацию",
    summary: "Для учреждений Берлина действует берлинский закон LADG. Бесплатно и независимо разбирает такие случаи LADG-Ombudsstelle.",
    steps: [
      ombudsLadg(claim),
      ...(claim ? [step("Если учреждение не отвечает или медлит", "Bürger- und Polizeibeauftragter принимает жалобы на ведомства Берлина, которые действуют несправедливо, дискриминируют, не отвечают или долго не решают заявление, в том числе по Grundsicherungsgeld и Wohngeld. Форма жалобы есть на сайте.", "Онлайн", act("Bürgerbeauftragter: форма жалобы", o.ombudsForm), act("Bürgerbeauftragter: на что можно пожаловаться", o.ombudsPolice))] : [ladsStep("В поиске LADS выберите тему «Ведомства» (Behörden) или «Школа или Kita» и свой язык.")]),
      recordStep,
    ],
    singleMethodNote: "Порядок один: Ombudsstelle, затем другие пути.",
    note: discriminationNote,
  };
}

/* ───────────── Без жилья ───────────── */

export const homelessQuestions = [
  q("situation", "Что с жильём сейчас?", [
    ["tonight", "Мне негде ночевать сегодня"],
    ["lost", "Жилья нет: живу у знакомых, в машине или на улице"],
    ["threat", "Могу потерять жильё: долги за аренду или расторжение договора"],
  ]),
  q("status", "Какой у вас статус пребывания?", [["resident", "Гражданство Германии или ЕС, вид на жительство"], ["asylum", "Идёт процедура убежища или нет вида на жительство"]]),
  q("stage", "Что уже произошло?", [["debts", "Есть долг за аренду, договор ещё не расторгнут"], ["notice", "Арендодатель расторг договор (Kündigung)"], ["court", "Пришло письмо из суда о выселении (Räumungsklage)"]]),
] as const;

export function homelessVisible(a: Answers): readonly Question[] {
  const [situation, status, stage] = homelessQuestions;
  if (a.situation === "lost") return [situation, status];
  if (a.situation === "threat") return [situation, stage];
  return [situation];
}

const homelessNote = "NOSTRES не предоставляет жильё и не принимает экстренные обращения. Данные взяты с официальных страниц Берлина (service.berlin.de, районные Ämter für Soziales), Berliner Kältehilfe, Berliner Stadtmission, Caritas и закона.";

const nightStep = step(
  "Найдите ночлег на сегодня",
  "Berliner Kältehilfe (зимняя помощь бездомным) работает с 1 октября: ночлежки (Notübernachtung) и ночные кафе принимают без записи и без направления ведомства. Свободные места показывают сайт и приложение «Berliner Kältehilfe». Телефон Kältehilfe: 030 343 971 40, ежедневно с 19 до 23 часов.",
  "Онлайн",
  act("Kältehilfe: ночлежки и места", o.kaeltehilfeOffers),
  act("Berliner Kältehilfe", o.kaeltehilfe),
  act("Позвонить в Kältehilfe", "tel:+493034397140"),
);
const busStep = step(
  "Если вы на улице и не можете дойти",
  "С ноября по март по Берлину ездят Kältebus Berliner Stadtmission (030 690 333 690, с 20 до 2 часов) и Wärmebus Красного Креста (030 600 300 10 10, с 18 до 24 часов). Они привозят в ночлежку, дают тёплые вещи и еду. При угрозе жизни звоните 112.",
  "Звонок",
  act("Kältehilfe: номера автобусов", o.kaeltehilfe),
  act("Берлин: Kältehilfe 2026/2027", o.kaeltehilfeSenat),
  act("Позвонить 112", "tel:112"),
);
const wohnhilfeStep = (detail: string): Step => step(
  "Обратитесь в Soziale Wohnhilfe своего района",
  detail,
  "Лично",
  act("service.berlin.de: помощь при угрозе или потере жилья", o.wohnhilfe),
  act("service.berlin.de: помощь при угрозе или потере жилья", o.wohnhilfe),
  act("Если нет адреса в Берлине: какой район отвечает", o.wohnhilfeNoAddress),
);
const debtStep = (court: boolean): Step => step(
  "Подайте заявление о погашении долга за аренду",
  `${court ? "Действуйте сразу. " : ""}Долг за аренду может погасить Jobcenter, если вы получаете Grundsicherungsgeld, или Amt für Soziales, если не получаете, обычно в виде беспроцентного займа. Условие: иначе вы потеряете жильё. Подайте заявление о социальной помощи с приложением 6 (Mietschulden), договор аренды, письма арендодателя и выписки. Помощь бесплатна.`,
  "Лично",
  act("service.berlin.de: заявление и приложения", o.wohnhilfe),
  act("SGB II § 22: погашение долга за жильё", o.sgb2rent),
);
const counselStep = step(
  "Получите бесплатную консультацию",
  "Berliner Stadtmission и Caritas консультируют при долгах, угрозе выселения и без медицинской страховки. Государственно признанные службы по долгам (Schuldner- und Insolvenzberatung) есть в каждом районе, консультация бесплатна.",
  "Онлайн",
  act("Berliner Stadtmission: помощь при бедности и потере жилья", o.stadtmission),
  act("Caritas: что делать при долге за аренду", o.rentDebts),
  act("Берлин: службы по долгам по районам", o.debtAdvice),
);

function homelessPlan(a: Answers): Plan {
  if (a.situation === "lost") {
    const asylum = a.status === "asylum";
    return {
      fit: "fits",
      why: ["Жилья нет", asylum ? "Идёт процедура убежища или нет вида на жительство" : "Гражданство Германии или ЕС, вид на жительство"],
      title: "Жилья нет: место в общежитии и ночлег",
      summary: asylum ? "Если идёт процедура убежища или нет вида на жительство, размещением занимается Landesamt für Flüchtlingsangelegenheiten und Unterbringung (LFU). Ночлежки Kältehilfe принимают без направления." : "Soziale Wohnhilfe района помогает с размещением: обычно это место в общежитии (Wohnheim). Ночлежки Kältehilfe принимают без направления, пока место не найдено.",
      steps: [
        asylum
          ? step("Обратитесь в Landesamt für Flüchtlingsangelegenheiten und Unterbringung", "Людям в процедуре убежища и без вида на жительство размещение предоставляет Landesamt für Flüchtlingsangelegenheiten und Unterbringung (LFU), а не районный Amt für Soziales.", "Лично", act("LFU Berlin", o.lfu), act("service.berlin.de: кто отвечает за размещение", o.wohnhilfe))
          : wohnhilfeStep("Soziale Wohnhilfe (жилищная помощь районного Amt für Soziales) не подбирает обычную квартиру, а прекращает бездомность: направляет в общежитие (Wohnheim), обычно в комнату на несколько человек. Если у вас есть доход, вы доплачиваете часть стоимости. Возьмите паспорт или ВНЖ, последний документ о регистрации и письма Jobcenter или других ведомств. Приёмные часы у районов разные. Если вы не зарегистрированы в Берлине, район определяется по особым правилам: часто по месяцу рождения."),
        nightStep,
        step("Получите помощь днём", "Berliner Stadtmission и другие организации помогают едой, душем, одеждой и консультацией. Дневные места (Tagesstätten) показывает приложение и сайт Kältehilfe.", "Онлайн", act("Berliner Stadtmission: помощь при потере жилья", o.stadtmission), act("Kältehilfe: адреса помощи", o.kaeltehilfeOffers)),
        ...(asylum ? [] : [step("Знайте, как устроено размещение", "Место в общежитии выделяет только Soziale Wohnhilfe; права на конкретное общежитие нет, но пожелания учитывают.", "Выбор", act("Bezirksamt Neukölln: как работает Soziale Wohnhilfe", o.wohnhilfeHeime))]),
      ],
      singleMethodNote: "Сначала место в общежитии, параллельно ночлег на сегодня.",
      note: homelessNote,
      next: act("Маршрут: трудная ситуация и нет денег", "/berlin/trudnaya-situaciya"),
    };
  }
  if (a.situation === "threat") {
    const stage = a.stage ?? "debts";
    return {
      fit: "fits",
      why: ["Могу потерять жильё", stage === "court" ? "Пришло письмо из суда о выселении" : stage === "notice" ? "Арендодатель расторг договор" : "Есть долг за аренду"],
      title: stage === "court" ? "Письмо из суда о выселении: действуйте сразу" : stage === "notice" ? "Договор расторгнут из-за долга: как сохранить жильё" : "Долг за аренду: как не потерять жильё",
      summary: stage === "court"
        ? "Если договор расторгнут без предупреждения из-за долга, расторжение теряет силу, когда долг погашен или ведомство письменно обязалось его погасить в течение 2 месяцев после получения письма из суда. Это возможно один раз за 2 года."
        : stage === "notice"
          ? "Расторжение договора из-за долга ещё можно отменить, если погасить долг. Обратитесь в Soziale Wohnhilfe сразу, не дожидаясь письма из суда."
          : "Чем раньше вы обратитесь, тем проще сохранить жильё: Soziale Wohnhilfe и Jobcenter помогают и до расторжения договора.",
      steps: [
        ...(stage === "court" ? [step("Запишите дату получения письма из суда", "Срок 2 месяца начинается с даты, когда суд вручил вам иск о выселении (Räumungsklage). За это время долг должен быть погашен или Jobcenter либо Amt für Soziales должны письменно обязаться его погасить. Тогда расторжение без предупреждения (fristlose Kündigung) теряет силу. Если так уже было за последние 2 года, это правило не действует.", "Ожидание", act("BGB § 569: срок 2 месяца", o.bgb569), act("Caritas: что делать при долге за аренду", o.rentDebts))] : []),
        debtStep(stage === "court"),
        wohnhilfeStep("Soziale Wohnhilfe районного Amt für Soziales помогает при угрозе потери жилья: разбирается с долгом, договаривается с арендодателем, помогает с залогом за новое жильё беспроцентным займом. Возьмите паспорт или ВНЖ, договор аренды, письма арендодателя, выписки и письма Jobcenter."),
        counselStep,
      ],
      singleMethodNote: stage === "court" ? "Сначала срок, потому что он короткий." : "Порядок один: заявление о долге, Soziale Wohnhilfe, консультация.",
      note: homelessNote,
      next: act("Маршрут: Wohngeld", "/berlin/wohngeld"),
    };
  }
  return {
    fit: "fits",
    why: ["Негде ночевать сегодня"],
    title: "Ночлег на сегодня",
    summary: "Ночлежки Berliner Kältehilfe принимают без записи. Если вы не можете дойти, с ноября по март приедет Kältebus или Wärmebus. При угрозе жизни: 112.",
    steps: [
      nightStep,
      busStep,
      wohnhilfeStep("Утром обратитесь в Soziale Wohnhilfe района, где вы зарегистрированы: она направляет в общежитие на длительный срок. Если вы не зарегистрированы в Берлине, район определяется по особым правилам: часто по месяцу рождения."),
    ],
    singleMethodNote: "Шаги расположены от сегодняшней ночи к следующим дням.",
    note: homelessNote,
    next: act("Маршрут: трудная ситуация и нет денег", "/berlin/trudnaya-situaciya"),
  };
}

/* ───────────── Трудная ситуация, нет денег ───────────── */

export const hardshipQuestions = [
  q("need", "Что нужно в первую очередь?", [
    ["food", "Еда: денег нет прямо сейчас"],
    ["money", "Денег не хватает на жизнь"],
    ["debts", "Долги"],
    ["advice", "Консультация на моём языке: письма, документы, права"],
  ]),
  q("age", "Сколько вам лет?", [["young", "Меньше 27"], ["adult", "27 и больше"]]),
] as const;

export function hardshipVisible(a: Answers): readonly Question[] {
  const [need, age] = hardshipQuestions;
  return a.need === "advice" ? [need, age] : [need];
}

const hardshipNote = "Данные взяты с официальных страниц Берлина, BAMF, mbeon, Berliner Tafel, Красного Креста Берлина (DRK), Caritas и Berliner Stadtmission. Помощь в списках бесплатна или стоит символические деньги, как указано в шагах.";

const benefitsStep = step(
  "Подайте заявление на пособие",
  "Если денег не хватает на жизнь, подайте заявление на Grundsicherungsgeld (основное пособие). Маршрут поможет понять, подходит ли оно, и подать заявление. Если вы работаете или получаете пенсию, проверьте Wohngeld и Kinderzuschlag.",
  "Онлайн",
  act("Маршрут: Grundsicherungsgeld", "/berlin/grundsicherungsgeld"),
  act("Маршрут: Grundsicherungsgeld", "/berlin/grundsicherungsgeld"),
  act("Маршрут: Wohngeld", "/berlin/wohngeld"),
);
const redCrossStep = step(
  "Помощь Красного Креста Берлина",
  "Красный Крест Берлина (DRK Berliner Rotes Kreuz) ведёт миграционную консультацию (MBE) и зимний Wärmebus для бездомных. Все его услуги собраны в списке от А до Я.",
  "Онлайн",
  act("DRK Berlin: услуги от А до Я", o.redCross),
);
const migrationStep = (young: boolean): Step => step(
  young ? "Обратитесь в Jugendmigrationsdienst" : "Обратитесь в Migrationsberatung für Erwachsene",
  young
    ? "Jugendmigrationsdienst (JMD, миграционная служба для молодёжи от 12 до 27 лет) бесплатно и конфиденциально помогает с письмами, документами, учёбой, работой и жильём. Ближайшую службу показывает BAMF-NAvI."
    : "Migrationsberatung für erwachsene Zuwanderer (MBE, миграционная консультация для взрослых с 27 лет) бесплатно и конфиденциально помогает с письмами, документами, работой, жильём и пособиями, часто на нескольких языках. Ближайшую службу показывает BAMF-NAvI.",
  "Лично",
  act("BAMF-NAvI: службы рядом", o.bamfNavi),
  act("Берлин: MBE и JMD", o.migrationAdvice),
);

function hardshipPlan(a: Answers): Plan {
  if (a.need === "food") return {
    fit: "fits",
    why: ["Нет денег на еду"],
    title: "Еда сегодня и на неделю",
    summary: "LAIB und SEELE Berliner Tafel раз в неделю выдаёт продукты за символическую плату. Бесплатную еду дают места из списка Kältehilfe. Параллельно подайте заявление на пособие.",
    steps: [
      step("Найдите пункт LAIB und SEELE рядом", "Пункты LAIB und SEELE (программа Berliner Tafel и церковных общин) раз в неделю выдают продукты людям с маленьким доходом за символическую плату от 1 €. В Берлине около 55 пунктов; адреса и дни выдачи есть в списке. Вопросы: 030 787 163 52, с понедельника по пятницу с 10 до 14 часов.", "Лично", act("Berliner Tafel: пункты LAIB und SEELE", o.foodPlaces), act("Berliner Tafel: как работает LAIB und SEELE", o.food)),
      step("Бесплатная еда сегодня", "Суповые кухни и дневные места для людей в нужде показывают сайт и приложение Berliner Kältehilfe.", "Онлайн", act("Kältehilfe: адреса помощи", o.kaeltehilfeOffers), act("Berliner Kältehilfe", o.kaeltehilfe)),
      benefitsStep,
      redCrossStep,
    ],
    singleMethodNote: "Сначала еда, параллельно пособие.",
    note: hardshipNote,
  };
  if (a.need === "money") return {
    fit: "fits",
    why: ["Денег не хватает на жизнь"],
    title: "Денег не хватает на жизнь: на какую помощь у вас есть право",
    summary: "Начните с пособий: Grundsicherungsgeld, Wohngeld или Kinderzuschlag. Бесплатная консультация поможет с заявлением.",
    steps: [
      benefitsStep,
      step("Получите помощь с заявлением", "Caritas консультирует онлайн бесплатно и анонимно, в том числе в разделе «Общая социальная консультация». Berliner Stadtmission помогает в особых ситуациях, например без медицинской страховки.", "Онлайн", act("Caritas: онлайн-консультация", o.caritasOnline), act("Berliner Stadtmission: консультация", o.stadtmissionAdvice)),
      redCrossStep,
    ],
    singleMethodNote: "Порядок один: пособие, затем помощь с заявлением.",
    note: hardshipNote,
    next: act("Маршрут: Kinderzuschlag", "/berlin/kinderzuschlag"),
  };
  if (a.need === "debts") return {
    fit: "fits",
    why: ["Долги"],
    title: "Долги: бесплатная консультация",
    summary: "В каждом районе Берлина есть государственно признанная служба по долгам (Schuldner- und Insolvenzberatung), консультация бесплатна. Долг за аренду решайте сразу: от него зависит жильё.",
    steps: [
      step("Обратитесь в службу по долгам своего района", "Консультация бесплатна и конфиденциальна. Служба составляет план выплат, ведёт переговоры с кредиторами и готовит личное банкротство (Privatinsolvenz). Обращайтесь в службу района, где живёте.", "Лично", act("Берлин: службы по долгам по районам", o.debtAdvice)),
      step("Начните онлайн, если до службы долго ждать", "Caritas консультирует по долгам онлайн, бесплатно и анонимно.", "Онлайн", act("Caritas: онлайн-консультация по долгам", o.debtOnline)),
      step("Долг за аренду: отдельный маршрут", "Если есть долг за аренду или договор уже расторгнут, есть сроки, после которых жильё не сохранить. Маршрут покажет, что делать.", "Выбор", act("Маршрут: без жилья или угроза выселения", "/berlin/bez-zhilya")),
    ],
    singleMethodNote: "Сначала служба района, онлайн, если ждать долго.",
    note: hardshipNote,
  };
  const young = a.age === "young";
  return {
    fit: "fits",
    why: ["Нужна консультация на вашем языке", young ? "Вам меньше 27 лет" : "Вам 27 лет и больше"],
    title: "Бесплатная консультация на вашем языке",
    summary: young ? "Для молодёжи до 27 лет есть Jugendmigrationsdienst: бесплатная консультация рядом с вами. Онлайн поможет Caritas." : "Migrationsberatung für Erwachsene помогает лично и онлайн через mbeon: ответ в течение 48 часов.",
    steps: [
      migrationStep(young),
      ...(young ? [] : [step("Напишите онлайн в mbeon", "mbeon (онлайн-миграционная консультация) бесплатно и конфиденциально отвечает в чате обычно в течение 48 часов. Консультация на нескольких языках, для взрослых с 28 лет.", "Онлайн", act("mbeon: онлайн-консультация", o.mbeon))]),
      step("Общая социальная консультация онлайн", "Caritas консультирует онлайн бесплатно и анонимно по письмам ведомств, деньгам, семье и жилью.", "Онлайн", act("Caritas: онлайн-консультация", o.caritasOnline)),
      redCrossStep,
    ],
    singleMethodNote: "Служба рядом и онлайн-консультация дополняют друг друга.",
    note: hardshipNote,
  };
}

/* ───────────── Домашнее насилие ───────────── */

export const violenceQuestions = [
  q("who", "Что происходит?", [
    ["danger", "Мне угрожает опасность прямо сейчас"],
    ["woman", "Я женщина, меня бьёт или запугивает партнёр или кто-то из семьи"],
    ["man", "Я мужчина и пострадал от насилия"],
    ["child", "Ребёнок или подросток в опасности"],
    ["relative", "Хочу помочь другому человеку"],
  ]),
  q("need", "Что вам нужно?", [["shelter", "Безопасное место для меня и детей"], ["advice", "Консультация, документы о травмах, защита по закону"]]),
] as const;

export function violenceVisible(a: Answers): readonly Question[] {
  const [who, need] = violenceQuestions;
  return a.who === "woman" ? [who, need] : [who];
}

const violenceNote = "NOSTRES не принимает экстренные обращения. Помощь бесплатна, по желанию анонимна, заявление в полицию для неё не нужно. Данные взяты с официальных страниц Берлина, полиции Берлина, BIG Hotline, Hilfetelefon Gewalt gegen Frauen, Hilfetelefon Gewalt an Männern и Gewaltschutzambulanz der Charité.";

const call110 = step(
  "При опасности: 110",
  "Если вам или детям угрожают сейчас, звоните в полицию: 110. Написать в экстренные службы без разговора можно в официальном приложении nora, если вы зарегистрировались в нём заранее. Полиция при каждом вызове по домашнему насилию сообщает о BIG Hotline.",
  "Звонок",
  act("Позвонить 110", "tel:110"),
  act("Полиция Берлина: домашнее насилие", o.violencePolice),
  act("nora: экстренный вызов без звонка", o.nora),
);
const bigStep = (detail: string): Step => step(
  "BIG Hotline: помощь при домашнем насилии",
  detail,
  "Звонок",
  act("BIG Hotline: телефон, чат, e-mail", o.big),
  act("Берлин: помощь пострадавшим от насилия", o.violenceBerlin),
  act("Позвонить в BIG Hotline", "tel:+49306110300"),
);
const writeStep = step(
  "Напишите, если говорить небезопасно",
  "Hilfetelefon Gewalt gegen Frauen (федеральная линия помощи) отвечает круглосуточно, бесплатно и анонимно: телефон 116 016 на 18 языках и онлайн-консультация на сайте. BIG Hotline отвечает на beratung@big-hotline.de и в чате по средам с 15:30 до 17:30 и по пятницам с 13:30 до 15:30.",
  "Онлайн",
  act("Hilfetelefon: онлайн-консультация", o.hilfetelefon),
  act("Hilfetelefon Gewalt gegen Frauen", o.hilfetelefon),
  act("BIG Hotline: чат и e-mail", o.big),
);
const docStep = step(
  "Задокументируйте травмы бесплатно",
  "Gewaltschutzambulanz der Charité бесплатно документирует травмы так, чтобы документ годился для суда, без заявления в полицию: решить можно позже. Телефон 030 450 570 270, вход: Birkenstraße 62.",
  "Лично",
  act("Gewaltschutzambulanz der Charité", o.violenceDoc),
);

function violencePlan(a: Answers): Plan {
  if (a.who === "woman") {
    const shelter = a.need === "shelter";
    return {
      fit: "fits",
      why: ["Насилие со стороны партнёра или семьи", shelter ? "Нужно безопасное место" : "Нужна консультация и документы"],
      title: shelter ? "Безопасное место: Frauenhaus и защищённые квартиры" : "Консультация, документы о травмах и защита по закону",
      summary: shelter ? "Место в Frauenhaus (убежище для женщин и детей) или в защищённой квартире находит BIG Hotline: круглосуточно, каждый день." : "BIG Hotline и Hilfetelefon консультируют круглосуточно и анонимно. Травмы можно бесплатно задокументировать без заявления в полицию.",
      steps: shelter
        ? [
          bigStep("Позвоните в BIG Hotline: 030 611 03 00, круглосуточно, в выходные и праздники. Через неё работает BIG Clearingstelle, которая принимает женщин с детьми круглосуточно и находит место в Frauenhaus или защищённой квартире (Zufluchtswohnung). Можно попросить переводчика."),
          writeStep,
          call110,
          step("Список Frauenhäuser и защищённых квартир", "Берлин публикует телефоны Frauenhäuser и защищённых квартир. Звоните им напрямую, если BIG Hotline занята.", "Звонок", act("Берлин: Frauenhäuser и Zufluchtswohnungen", o.violenceBerlin)),
        ]
        : [
          writeStep,
          bigStep("BIG Hotline консультирует по телефону 030 611 03 00 круглосуточно, по желанию анонимно и с переводчиком. Мобильная команда BIG может приехать к вам, если вы не можете прийти сами."),
          docStep,
          call110,
        ],
      singleMethodNote: shelter ? "Сначала место, затем консультация." : "Письменный канал первым: так безопаснее, если рядом обидчик.",
      note: violenceNote,
    };
  }
  if (a.who === "man") return {
    fit: "fits",
    why: ["Вы мужчина и пострадали от насилия"],
    title: "Помощь мужчинам, пострадавшим от насилия",
    summary: "Hilfetelefon Gewalt an Männern консультирует бесплатно и анонимно по телефону и в чате. В Берлине BIG Hotline направляет мужчин в Opferhilfe Berlin.",
    steps: [
      step("Напишите или позвоните в Hilfetelefon Gewalt an Männern", "Чат без регистрации: с понедельника по четверг с 12 до 15 и с 17 до 19 часов. Телефон 0800 123 99 00: с понедельника по четверг с 8 до 20, в пятницу с 8 до 15 часов. Бесплатно и анонимно.", "Онлайн", act("Hilfetelefon Gewalt an Männern", o.menHelp)),
      step("Консультация в Берлине: Opferhilfe Berlin", "Opferhilfe Berlin консультирует пострадавших от любых преступлений бесплатно и конфиденциально: 030 395 28 67. BIG Hotline направляет туда мужчин, пострадавших от домашнего насилия.", "Звонок", act("Берлин: службы помощи пострадавшим", o.victimHelp), act("Полиция Берлина: домашнее насилие", o.violencePolice)),
      docStep,
      call110,
    ],
    singleMethodNote: "Письменный канал первым, звонок как запасной.",
    note: violenceNote,
  };
  if (a.who === "child") return {
    fit: "fits",
    why: ["Ребёнок или подросток в опасности"],
    title: "Ребёнок или подросток в опасности",
    summary: "Berliner Notdienst Kinderschutz (служба защиты детей) помогает, если ребёнок в опасности. При опасности сейчас: 110.",
    steps: [
      step("Позвоните в Berliner Notdienst Kinderschutz", "Служба защиты детей: 030 61 00 66. Для девушек, в том числе при угрозе принудительного брака: Mädchennotdienst, 030 610 063.", "Звонок", act("Берлин: экстренные номера", o.violenceBerlin), act("Берлин: экстренные номера", o.violenceBerlin), act("Позвонить в Kinderschutz", "tel:+4930610066")),
      call110,
      docStep,
    ],
    singleMethodNote: "Сначала служба защиты детей, при опасности сразу 110.",
    note: violenceNote,
  };
  if (a.who === "relative") return {
    fit: "fits",
    why: ["Вы хотите помочь другому человеку"],
    title: "Как помочь человеку, который пострадал от насилия",
    summary: "BIG Hotline и Hilfetelefon консультируют и родственников, друзей, коллег. Решения принимает сам пострадавший человек; при опасности звоните 110.",
    steps: [
      step("Получите консультацию для себя", "Hilfetelefon Gewalt gegen Frauen (116 016, онлайн) и BIG Hotline (030 611 03 00) консультируют и родственников, друзей и коллег, бесплатно и анонимно. Для помощи мужчине: Hilfetelefon Gewalt an Männern.", "Онлайн", act("Hilfetelefon: онлайн-консультация", o.hilfetelefon), act("BIG Hotline", o.big), act("Hilfetelefon Gewalt an Männern", o.menHelp)),
      call110,
      docStep,
    ],
    singleMethodNote: "Консультация для вас, при опасности 110.",
    note: violenceNote,
  };
  return {
    fit: "fits",
    why: ["Вам угрожает опасность прямо сейчас"],
    title: "Опасность прямо сейчас",
    summary: "Звоните 110. Если говорить нельзя, используйте приложение nora. После этого BIG Hotline найдёт безопасное место круглосуточно.",
    steps: [call110, bigStep("BIG Hotline: 030 611 03 00, круглосуточно. Находит место в Frauenhaus для женщин с детьми в любое время и может прислать мобильную команду."), writeStep],
    singleMethodNote: "Шаги расположены от срочного к следующим.",
    note: violenceNote,
  };
}

export { discriminationPlan, hardshipPlan, homelessPlan, violencePlan };
