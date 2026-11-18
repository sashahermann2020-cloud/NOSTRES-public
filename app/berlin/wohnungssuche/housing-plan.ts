export type Answers = Record<string, string>;
type Step = { title: string; detail: string; link?: { label: string; href: string }; alternative?: { label: string; href: string }; source: { label: string; href: string } };

export const official = {
  housing: "https://willkommenszentrum.berlin.de/ru/zhilyo/poisk-zhilya",
  municipal: "https://www.inberlinwohnen.de/",
  privacy: "https://www.datenschutz-berlin.de/themen/wohnen/selbstauskunft/",
  wbs: "https://service.berlin.de/dienstleistung/120671/",
  wbsOnline: "https://liste-antraege.bda.service.berlin.de/intelliform/forms/default/bda/SenSBW/wbs/index?vt=wbs",
  wbsStatus: "https://www.berlin.de/sen/wohnen/service/wohnberechtigungsschein/",
  registration: "https://service.berlin.de/dienstleistung/120686/",
  secondaryAddress: "https://service.berlin.de/dienstleistung/351783/",
};

export const questions = [
  { id: "housing", prompt: "Что вы ищете?", options: [["apartment", "Отдельную квартиру"], ["room", "Комнату в квартире совместного проживания (WG)"], ["temporary", "Временное жильё или субаренду"], ["unknown", "Пока не знаю"]] },
  { id: "income", prompt: "Чем сейчас можете подтвердить доход или оплату аренды?", options: [["german", "Есть немецкие зарплатные документы"], ["other", "Есть другое подтверждение дохода"], ["benefits", "Есть решение о социальных выплатах"], ["none", "Пока нет подтверждения"]] },
  { id: "schufa", prompt: "Есть ли у вас документ SCHUFA (сведения о кредитной истории в Германии)?", options: [["yes", "Да"], ["no", "Нет"], ["unknown", "Не знаю, что это"]] },
  { id: "registration", prompt: "Есть ли у вас уже зарегистрированный адрес в Германии, который вы сохраните после переезда?", options: [["yes", "Да, сохраню"], ["no", "Нет"], ["unknown", "Пока не знаю"]] },
  { id: "wbs", prompt: "Хотите проверить возможность социального жилья с WBS (разрешением на его аренду)?", options: [["yes", "Да"], ["no", "Нет"], ["unknown", "Не знаю, подходит ли мне"]] },
] as const;

export function stepsFor(answers: Answers): Step[] {
  const steps: Step[] = [];
  if (answers.wbs !== "no") steps.push({
    title: "Решите, подавать ли заявление на социальное жильё",
    detail: "WBS (разрешение на аренду социального жилья) зависит от дохода и статуса пребывания; решение принимает районное жилищное ведомство. Онлайн подготовьте документы PDF/JPG (всего до 30 МБ, каждый до 5 МБ). По почте отправьте подписанные формы в ведомство вашего района; если ещё не живёте в Берлине, можно выбрать любой район. Подача бесплатна. Срок рассмотрения на странице услуги не указан; WBS не гарантирует получение квартиры." + (answers.housing === "room" ? " Для квартиры совместного проживания отдельные жильцы не могут подать одно общее заявление на WBS." : ""),
    link: { label: "Маршрут: получить WBS", href: "/berlin/wbs" },
    alternative: { label: "Подать заявление онлайн", href: official.wbsOnline },
    source: { label: "ServicePortal Berlin: условия и способы подачи", href: official.wbs },
  });
  steps.push({
    title: "Соберите то, чем уже можете подтвердить свою ситуацию",
    detail: answers.income === "none"
      ? "Не указывайте несуществующий доход. Для первой заявки хватит короткого представления о себе; полный пакет документов Берлинский уполномоченный по защите данных относит к этапу перед договором. Арендодатель сам решает, какие подтверждения принять для квартиры."
      : answers.income === "other"
        ? "Подготовьте имеющееся подтверждение дохода и приложите его к заявке на конкретную квартиру, когда его запросят после просмотра: арендодатель сам решает, какие подтверждения принять."
        : answers.income === "benefits"
          ? "Подготовьте действующее решение ведомства о выплатах и приложите его к заявке, когда его запросят после просмотра."
          : "Подготовьте сведения о работе и доходе для заявки на конкретную квартиру.",
    source: { label: "Официальный список документов и советов", href: official.housing },
  });
  if (answers.schufa !== "yes") steps.push({
    title: "Подготовьтесь к запросу SCHUFA",
    detail: "Если у вас нет немецкой кредитной истории, не подменяйте её другим документом. Арендодатель сам решает, какие подтверждения принять; приложите то, что у вас есть. Это не гарантирует принятие заявки.",
    link: { label: "Что такое SCHUFA и где её получить", href: official.housing },
    source: { label: "Берлинский Welcome Center", href: official.housing },
  });
  steps.push({
    title: answers.housing === "apartment" ? "Откройте предложения городских жилищных компаний" : "Выберите подходящий способ поиска жилья",
    detail: answers.housing === "apartment"
      ? "На портале городских жилищных компаний (сейчас их семь) можно искать обычные и социальные квартиры. Используйте фильтры, затем подавайте заявку по условиям конкретного объявления."
      : answers.housing === "room" || answers.housing === "temporary"
        ? "Берлинский Welcome Center объясняет, где искать комнаты и временную аренду. У NOSTRES нет собственного списка свободных комнат; проверяйте условия каждого предложения и разрешение на субаренду."
        : "Официальный обзор различает комнаты, временное жильё, квартиры городских компаний и социальное жильё. Сначала выберите формат, затем перейдите к объявлениям.",
    link: answers.housing === "apartment"
      ? { label: "Искать квартиры городских компаний", href: official.municipal }
      : { label: "Открыть способы поиска жилья", href: official.housing },
    source: { label: "Официальный берлинский обзор поиска жилья", href: official.housing },
  });
  steps.push({
    title: "Отправляйте документы по мере необходимости",
    detail: "Для первой договорённости о просмотре не передавайте полный пакет финансовых документов. Берлинский уполномоченный по защите данных различает запись на просмотр, заявку после просмотра и проверку документов непосредственно перед договором.",
    link: { label: "Посмотреть правила защиты данных", href: official.privacy },
    source: { label: "Уполномоченный по защите данных Берлина", href: official.privacy },
  });
  steps.push({
    title: "Проверьте возможность регистрации после въезда",
    detail: answers.registration === "yes"
      ? "Старый адрес сохраняется, но новый не становится автоматически дополнительным: основной адрес зависит от того, где вы преимущественно живёте. Для регистрации основного или дополнительного жилья обычно даётся 14 дней после въезда. Для регистрации нужна Wohnungsgeberbestätigung (подтверждение от предоставляющего жильё): при субаренде запросите её у того, кто сдаёт жильё, до въезда. Условия обеих официальных услуг указаны по ссылкам ниже."
      : "Если это будет ваше единственное или основное жильё в Берлине, регистрацию обычно нужно оформить в течение 14 дней после въезда. Для регистрации нужна Wohnungsgeberbestätigung (подтверждение от предоставляющего жильё): при комнате или субаренде запросите её у того, кто сдаёт жильё, до въезда. Исключения и условия указаны на официальной странице услуги.",
    link: { label: "После въезда: маршрут регистрации адреса", href: "/berlin/anmeldung" },
    alternative: answers.registration !== "no" ? { label: "Если сохраняете другой адрес: официальные правила", href: official.secondaryAddress } : undefined,
    source: { label: "ServicePortal Berlin: условия регистрации", href: official.registration },
  });
  return steps;
}

type Link = { label: string; href: string };
export type SearchOption = { id: string; label: string; name: string; summary: string; facts: string[]; links: Link[]; forAnswers?: string[] };

/** Where to search. Facts come only from the official Berlin pages named in the links; NOSTRES recommends no commercial portals. */
export const searchOptions: SearchOption[] = [
  { id: "municipal", label: "Городские компании", name: "Квартиры городских компаний", forAnswers: ["apartment", "unknown"],
    summary: "Портал inberlinwohnen.de собирает предложения Berlinovo, degewo, GESOBAU, Gewobag, HOWOGE, STADT UND LAND и WBM. Фильтры по району, цене и площади; по описанию Welcome Center можно искать и социальное жильё.",
    facts: ["Заявку подают через сайт компании: порядок на портале не описан, смотрите условия объявления.", "Если для квартиры нужен WBS, заявку на неё подают только с ним: компания указывает это в объявлении. Искать можно и без WBS."],
    links: [{ label: "Открыть inberlinwohnen.de", href: official.municipal }, { label: "Обзор Welcome Center", href: official.housing }] },
  { id: "coop", label: "Кооперативы", name: "Жилищные кооперативы (Genossenschaften)", forAnswers: ["apartment", "unknown"],
    summary: "В кооперативе вы становитесь членом и вносите пай (Genossenschaftsanteil): вы совладелец кооператива и обычно получаете стабильную доступную аренду и право проживания без ограничения срока. Объявления кооперативов можно смотреть на их сайтах; по обзору Welcome Center можно также прийти лично и оставить документы.",
    facts: ["Размер и число паёв задаёт устав каждого кооператива: единой суммы нет.", "Пай можно продать; у кооператива есть общее собрание, где у каждого члена один голос."],
    links: [{ label: "Что такое Genossenschaft (berlin.de)", href: "https://www.berlin.de/lokalbau-fk/glossar/genossenschaft-1012731.php" }, { label: "Обзор Welcome Center", href: official.housing }] },
  { id: "private", label: "Частные арендодатели", name: "Частные объявления и комнаты WG", forAnswers: ["apartment", "room", "temporary", "unknown"],
    summary: "Частные арендодатели и сдающие комнаты размещают объявления на разных сайтах, в соцсетях, на досках объявлений и у управляющих компаний (Hausverwaltung). Welcome Center отмечает, что на части сайтов есть платные аккаунты.",
    facts: ["NOSTRES не рекомендует конкретные коммерческие сайты и не сравнивает их.", "Для первого просмотра не передавайте полный пакет документов: Берлинский уполномоченный по защите данных разделяет запись на просмотр, заявку и проверку перед договором.", "При субаренде и Zwischenmiete (временной аренде) убедитесь, что владелец разрешил её: иначе вы можете не получить регистрацию адреса и защиту арендатора."],
    links: [{ label: "Правила защиты данных арендатора", href: official.privacy }, { label: "Обзор Welcome Center", href: official.housing }] },
  { id: "swap", label: "Обмен и помощь", name: "Обмен квартирами и социальные проекты", forAnswers: ["apartment", "room", "temporary", "unknown"],
    summary: "Если вы уже арендуете, можно спросить управляющую компанию об обмене (нужно согласие обоих арендодателей). Жильцы городских компаний выставляют обмен на inberlinwohnen.de. Некоторые организации помогают с поиском жилья.",
    facts: ["Консультационные центры перечислены в разделе «Консультации» на странице Welcome Center."],
    links: [{ label: "Обзор Welcome Center", href: official.housing }] },
];
