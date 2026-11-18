import type { Action, Answers, Fact, Method, Plan, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

/** Официальные страницы маршрута «GmbH или UG» (сверены 12 ноября 2026 года). */
export const companyOfficial = {
  register: "https://service.berlin.de/dienstleistung/327425/",
  ihk: "https://www.ihk.de/berlin/service-und-beratung/recht-und-steuern/firma-und-rechtsformen/rechtsformen-fuer-unternehmen/gmbh-und-ug-haftungsbeschraenkt-4404470",
  lawForm: "https://www.gesetze-im-internet.de/gmbhg/__2.html",
  lawUg: "https://www.gesetze-im-internet.de/gmbhg/__5a.html",
  lawPayment: "https://www.gesetze-im-internet.de/gmbhg/__7.html",
  trade: "https://service.berlin.de/dienstleistung/121921/",
  taxService: "https://service.berlin.de/dienstleistung/325409/",
  taxForm: "https://www.elster.de/eportal/formulare-leistungen/alleformulare/fsekapg",
  transparency: "https://www.bva.bund.de/DE/Das-BVA/Aufgaben/T/Transparenzregister/_documents/Allgem_transparenz_kachel.html",
  disclosure: "https://www.bundesjustizamt.de/DE/Themen/OrdnungsgeldVollstreckung/Jahresabschluesse/Offenlegung/Pflichten/Pflichten_node.html",
  residence: "https://www.berlin.de/einwanderung/aufenthalt/erwerbstaetigkeit/artikel.874042.php",
};
const c = companyOfficial;

export const companyQuestions = [
  q("stage", "На каком вы этапе?", [["plan", "Только собираюсь учредить компанию"], ["notarized", "Договор уже заверен у нотариуса, компании ещё нет в Handelsregister"], ["registered", "Компания уже внесена в Handelsregister"]]),
  q("form", "Сколько уставного капитала будет у компании?", [["gmbh", "25 000 € или больше: GmbH"], ["ug", "Меньше 25 000 €, от 1 €: UG (haftungsbeschränkt)"], ["unknown", "Пока не решил(а)"]]),
  q("founders", "Сколько будет учредителей и директоров?", [["simple", "До трёх учредителей и один директор"], ["complex", "Больше трёх учредителей или несколько директоров"]]),
  q("residence", "Какое гражданство у вас как у учредителя или директора?", [["eu", "Германия, ЕС, ЕЭЗ или Швейцария"], ["permit", "Другая страна, у меня вид на жительство в Германии"], ["abroad", "Другая страна, я живу за границей"]]),
  q("trade", "Чем будет заниматься компания?", [["trade", "Торговля, услуги, производство или онлайн-магазин"], ["other", "Только управление собственным имуществом или свободная профессия"], ["unknown", "Не знаю, считается ли это Gewerbe"]]),
] as const;

export function companyVisible(a: Answers): readonly Question[] {
  const [stage, form, founders, residence, trade] = companyQuestions;
  const list: Question[] = [stage];
  if (!a.stage) return list;
  if (a.stage === "plan") list.push(form, founders);
  list.push(residence, trade);
  return list;
}

export function companyPlan(a: Answers): Plan {
  const stage = a.stage ?? "plan";
  const ug = a.form === "ug";
  const undecided = stage === "plan" && (a.form ?? "unknown") === "unknown";
  const simple = a.founders !== "complex";
  const noneu = a.residence === "permit" || a.residence === "abroad";
  const abroad = a.residence === "abroad";
  const trade = a.trade ?? "unknown";

  const register = act("Берлин: регистрация GmbH в Handelsregister", c.register);
  const ihk = act("IHK Berlin: GmbH и UG (haftungsbeschränkt)", c.ihk);

  const chooseForm = step(
    undecided ? "Выберите GmbH или UG" : ug ? "Проверьте условия UG (haftungsbeschränkt)" : "Проверьте условия GmbH",
    undecided
      ? "GmbH (общество с ограниченной ответственностью): уставный капитал Stammkapital не меньше 25 000 €. До подачи в реестр вносится не меньше четверти каждой доли и всего не меньше 12 500 €. UG (haftungsbeschränkt): та же форма с капиталом от 1 €: капитал вносится полностью и только деньгами, имуществом его вносить нельзя, а четверть годовой прибыли откладывается в резерв, пока капитал не дойдёт до 25 000 €. В названии UG обязательно «Unternehmergesellschaft (haftungsbeschränkt)» или «UG (haftungsbeschränkt)»."
      : ug
        ? "Капитал UG от 1 € вносится полностью и только деньгами до подачи в реестр. Четверть годовой прибыли (за вычетом убытка прошлого года) откладывается в резерв. В названии обязательно «Unternehmergesellschaft (haftungsbeschränkt)» или «UG (haftungsbeschränkt)». Когда капитал достигнет 25 000 €, эти правила перестают действовать, а название можно оставить."
        : "Stammkapital (уставный капитал) GmbH не меньше 25 000 €, каждая доля от 1 €. До подачи в реестр нужно внести не меньше четверти каждой денежной доли и всего не меньше 12 500 €. Вклад имуществом передаётся компании полностью до подачи.",
    "Выбор",
    act(ug ? "Закон: правила UG (§ 5a GmbHG)" : "Закон: взносы до регистрации (§ 7 GmbHG)", ug ? c.lawUg : c.lawPayment),
    ihk,
    undecided ? act("Закон: правила UG (§ 5a GmbHG)", c.lawUg) : undefined,
  );
  const contract = step(
    simple ? "Подготовьте Musterprotokoll или свой договор" : "Подготовьте свой Gesellschaftsvertrag",
    simple
      ? "При учредителях до трёх и одном директоре (Geschäftsführer) можно взять Musterprotokoll – готовый образец договора из закона. IHK Berlin указывает, что с ним возможно только учреждение с денежным взносом. Если нужны особые правила между учредителями, составьте свой Gesellschaftsvertrag (договор об учреждении). В договоре должны быть название, место нахождения, предмет деятельности, размер капитала и доли каждого учредителя."
      : "Musterprotokoll (готовый образец договора) подходит только при учредителях до трёх и одном директоре, поэтому вам нужен свой Gesellschaftsvertrag (договор об учреждении). В нём должны быть название, место нахождения, предмет деятельности, размер капитала и доли каждого учредителя; подписывают все учредители.",
    "Выбор",
    act("Закон: форма договора и Musterprotokoll (§ 2 GmbHG)", c.lawForm),
    register,
    ihk,
  );
  const notary = step(
    "Заверьте договор у нотариуса",
    "Договор действителен только в нотариальной форме. Можно прийти в нотариат по своему выбору или провести заверение по видеосвязи: закон это допускает. Нотариус также заверяет подписи под заявкой в Handelsregister (торговый реестр) и сам отправляет её в суд. Плата нотариуса установлена законом и одинакова у всех нотариусов: расчёт для GmbH и UG – в маршруте о нотариусе.",
    "Лично",
    act("Берлин: договор, нотариус и документы", c.register),
    act("Закон: заверение по видеосвязи (§ 2 Abs. 3 GmbHG)", c.lawForm),
    act("Маршрут: нотариус и его стоимость", "/berlin/notar"),
  );
  const pay = step(
    ug ? "Внесите весь капитал на счёт компании" : "Внесите капитал на счёт компании",
    ug
      ? "Откройте деловой счёт на «UG (haftungsbeschränkt) i.G.» (в стадии учреждения) и внесите весь капитал. Подтверждение банка передайте нотариусу: без полного взноса заявку UG подавать нельзя."
      : "Откройте деловой счёт на «GmbH i.G.» (в стадии учреждения) и внесите не меньше четверти каждой доли и всего не меньше 12 500 €. Подтверждение банка передайте нотариусу.",
    "Онлайн",
    ihk,
    act(ug ? "Закон: полный взнос для UG (§ 5a GmbHG)" : "Закон: взносы до регистрации (§ 7 GmbHG)", ug ? c.lawUg : c.lawPayment),
  );
  const entry = step(
    "Дождитесь записи в Handelsregister",
    "В Берлине реестр ведёт только Amtsgericht Charlottenburg (участковый суд Шарлоттенбург). Нотариус отправляет туда заявку, договор, решение о назначении директора и список учредителей. Сбор суда: 150 €, при вкладе имуществом 240 €, плюс Bereitstellungsgebühr (плата за предоставление данных) в размере трети этой суммы. Срок рассмотрения на странице услуги не указан.",
    "Ожидание",
    register,
    ihk,
  );
  const tradeStep = step(
    trade === "unknown" ? "Проверьте, нужна ли Gewerbeanmeldung" : "Зарегистрируйте Gewerbe компании",
    `${trade === "unknown" ? "Gewerbeanmeldung (уведомление о предпринимательской деятельности) нужна, если компания торгует, оказывает услуги или производит: исключения перечислены на странице услуги. " : ""}Уведомление подаёт директор одновременно с началом работы. ${stage === "registered" ? "Приложите выписку из Handelsregister." : "Компания в стадии учреждения прикладывает заверенный договор и согласие учредителей."} Онлайн для GmbH и UG через BundID – 15 €, лично в районном Ordnungsamt – 31 € за компанию с одним директором и 13 € за каждого следующего.`,
    "Онлайн",
    act("Берлин: Gewerbeanmeldung для компании", c.trade),
    act("Берлин: документы и сборы Gewerbe", c.trade),
  );
  const tax = step(
    "Отправьте налоговую анкету через Mein ELSTER",
    "О создании компании нужно сообщить в налоговую: отправьте онлайн Fragebogen zur steuerlichen Erfassung (анкету налоговой постановки на учёт) для учреждения Kapitalgesellschaft (компании с уставным капиталом). Для этого нужен бесплатный аккаунт Mein ELSTER. Анкета бесплатна, Finanzamt (налоговая инспекция) рассматривает её около двух недель после получения всех документов и присылает Steuernummer.",
    "Онлайн",
    act("ELSTER: анкета для GmbH и UG", c.taxForm),
    act("Берлин: налоговая постановка на учёт", c.taxService),
  );
  const transparency = step(
    "Сообщите владельцев в Transparenzregister",
    "Каждая GmbH и UG без промедления сообщает в Transparenzregister (реестр конечных владельцев) сведения о людях, которые владеют компанией или контролируют её. Эта обязанность действует для всех компаний с 1 августа 2021 года.",
    "Онлайн",
    act("BVA: Transparenzregister, кто обязан сообщать", c.transparency),
  );
  const yearly = step(
    "Каждый год раскрывайте отчётность",
    `Годовую отчётность GmbH и UG передают в Unternehmensregister (реестр компаний) не позднее чем через год после окончания финансового года, срок не продлевается. Очень маленькие компании (Kleinstgesellschaften) могут не публиковать отчётность, а только сдать на хранение баланс.${ug ? " UG каждый год откладывает четверть прибыли в резерв." : ""}`,
    "Онлайн",
    act("Bundesamt für Justiz: сроки раскрытия отчётности", c.disclosure),
    ug ? act("Закон: резерв UG (§ 5a GmbHG)", c.lawUg) : undefined,
  );
  const permit = step(
    abroad ? "Проверьте право въезда и работы в Германии" : "Проверьте, разрешает ли ВНЖ работу в компании",
    abroad
      ? "Учредить компанию можно и из-за границы, если заверить договор по видеосвязи. Но запись компании не даёт права жить и работать в Германии: чтобы самому работать директором в Берлине, нужен вид на жительство с подходящим разрешением. Откройте маршрут переезда."
      : "Запись компании и Gewerbe не дают разрешения на работу. Посмотрите, что написано в вашем виде на жительство о работе: LEA (берлинское ведомство по делам иностранцев) описывает, когда работа или самостоятельная деятельность уже разрешена и когда нужно заявление.",
    "Онлайн",
    abroad ? act("Маршрут: переезд в Германию", "/berlin/pereezd-v-germaniyu") : act("LEA: разрешение на работу и самостоятельную деятельность", c.residence),
    act("LEA: разрешение на работу и самостоятельную деятельность", c.residence),
  );

  const after = [...(trade === "other" ? [] : [tradeStep]), tax, transparency, yearly];
  const pre = noneu ? [permit] : [];
  const facts: Fact[] = [
    ...(stage === "plan" && !ug ? [{ label: "Капитал GmbH", value: "не меньше 25 000 €; до регистрации внести не меньше 12 500 €", kind: "official" as const }] : []),
    ...(stage === "plan" && (ug || undecided) ? [{ label: "Капитал UG (haftungsbeschränkt)", value: "от 1 €, полностью и только деньгами до регистрации", kind: "official" as const }] : []),
    ...(stage !== "registered" ? [{ label: "Сбор Handelsregister в Берлине", value: "150 €, с вкладом имуществом 240 €, плюс треть этой суммы как Bereitstellungsgebühr", kind: "official" as const }, { label: "Срок записи в реестр", value: "на странице услуги не указан", kind: "none" as const }] : []),
    ...(trade !== "other" ? [{ label: "Gewerbeanmeldung компании", value: "онлайн 15 €; лично 31 € и 13 € за каждого следующего директора", kind: "official" as const }] : []),
    { label: "Налоговая анкета ELSTER", value: "бесплатно, около двух недель после получения всех документов", kind: "authority" },
    { label: "Годовая отчётность", value: "не позднее года после окончания финансового года", kind: "official" },
  ];
  const why = [
    stage === "plan" ? "Вы только собираетесь учредить компанию" : stage === "notarized" ? "Договор уже заверен, записи в реестре ещё нет" : "Компания уже есть в Handelsregister",
    ...(stage === "plan" ? [undecided ? "Форма ещё не выбрана: сначала сравните GmbH и UG" : ug ? "Капитал меньше 25 000 €: UG (haftungsbeschränkt)" : "Капитал от 25 000 €: GmbH", simple ? "До трёх учредителей и один директор: можно Musterprotokoll" : "Больше трёх учредителей или несколько директоров: свой договор"] : []),
    ...(noneu ? [abroad ? "Вы живёте за границей: учреждение по видеосвязи, право на работу отдельно" : "Гражданство вне ЕС: право на работу проверяется в LEA"] : []),
    trade === "other" ? "Gewerbe не нужна: только управление имуществом или свободная профессия" : trade === "unknown" ? "Нужна ли Gewerbe, проверьте по исключениям" : "Компания ведёт Gewerbe",
  ];
  const note = "Это общая информация, а не юридическая или налоговая консультация. Условия взяты с официальных страниц Берлина, IHK Berlin, ELSTER, BVA, Bundesamt für Justiz и закона GmbHG.";
  const next = act("Маршрут: Steuererklärung (налоговая декларация)", "/berlin/steuererklaerung");

  if (stage === "plan") {
    const shared = [chooseForm, contract];
    const methods: Method[] = [
      { id: "notary-office", kind: "in-person", title: "Нотариус в нотариате", summary: "Вы приходите к нотариусу по своему выбору: он заверяет договор и подписи и сам отправляет заявку в реестр.", availability: "available", availabilityLabel: "Доступно", conditions: ["Нотариат выбираете сами", "Договор подписывают все учредители"], documents: ["Удостоверение личности каждого учредителя и директора", simple ? "Musterprotokoll или свой Gesellschaftsvertrag" : "Свой Gesellschaftsvertrag", "Подтверждение банка о внесённом капитале"], facts, steps: [...pre, ...shared, notary, pay, entry, ...after] },
      { id: "notary-video", kind: "online", title: "Нотариус по видеосвязи", summary: "Договор заверяют по видеосвязи: прийти в нотариат не нужно.", availability: "available", availabilityLabel: abroad ? "Подходит, если вы за границей" : "Доступно", conditions: ["Закон допускает заверение договора по видеосвязи", "Порядок онлайн-учреждения описывает IHK Berlin"], documents: ["Удостоверение личности каждого учредителя и директора", simple ? "Musterprotokoll или свой Gesellschaftsvertrag" : "Свой Gesellschaftsvertrag", "Подтверждение банка о внесённом капитале"], facts, steps: [...pre, ...shared, step("Заверьте договор по видеосвязи", "Закон допускает нотариальное заверение договора по видеосвязи. Порядок онлайн-учреждения и что для него нужно описывает IHK Berlin. Нотариус отправляет заявку в Handelsregister (торговый реестр) сам.", "Онлайн", act("Закон: заверение по видеосвязи (§ 2 Abs. 3 GmbHG)", c.lawForm), ihk), pay, entry, ...after] },
    ];
    return {
      fit: noneu ? "conditional" : undecided ? "clarify" : "fits",
      why,
      title: undecided ? "Учреждение компании: сначала выберите GmbH или UG" : ug ? "Учредить UG (haftungsbeschränkt) в Берлине" : "Учредить GmbH в Берлине",
      summary: `Порядок: договор у нотариуса, взнос капитала, запись в Handelsregister в Amtsgericht Charlottenburg, затем ${trade === "other" ? "" : "Gewerbe, "}налоговая анкета, Transparenzregister и ежегодная отчётность.${noneu ? " Право самому работать в компании проверяется отдельно." : ""} Выберите, как заверить договор.`,
      methods,
      steps: methods[abroad ? 1 : 0].steps,
      note,
      next,
    };
  }
  const steps = stage === "notarized" ? [...pre, pay, entry, ...after] : [...pre, ...after];
  return {
    fit: noneu ? "conditional" : "fits",
    why,
    title: stage === "notarized" ? "Договор заверен: регистрация компании и первые обязанности" : "Компания в реестре: регистрации и ежегодные обязанности",
    summary: stage === "notarized"
      ? `Внесите капитал, дождитесь записи в Handelsregister и выполните ${trade === "other" ? "" : "Gewerbe, "}налоговую анкету и Transparenzregister.`
      : `После записи в реестр ${trade === "other" ? "" : "зарегистрируйте Gewerbe, "}отправьте налоговую анкету, сообщите владельцев в Transparenzregister и каждый год раскрывайте отчётность.`,
    steps,
    singleMethodNote: "Эти шаги выполняются онлайн: способ один.",
    note,
    next,
  };
}
