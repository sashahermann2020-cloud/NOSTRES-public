import type { Action, Answers, Method, Plan, Question, Step } from "./route-model.ts";

export const accessSources = {
  fares: { label: "Билеты и тарифы VBB", href: "https://www.vbb.de/tickets/" },
  sales: { label: "Карта точек продаж и автоматов VBB", href: "https://www.vbb.de/tickets/tarifinformationen-services/tarifbroschueren/faq-vertriebskarte/" },
  deutschlandticket: { label: "Deutschlandticket: покупка и правила VBB", href: "https://www.vbb.de/abonnements/deutschlandticket/erwerbsmoeglichkeiten-und-nutzung/" },
  berlinTicketS: { label: "Berlin-Ticket S: условия и покупка VBB", href: "https://www.vbb.de/tickets/monatskarten/berlin-ticket-s/" },
  school: { label: "Бесплатный Schülerticket Berlin AB VBB", href: "https://www.vbb.de/abonnements/schueler/schuelerticket-berlin/" },
  schoolOrder: { label: "Онлайн-заказ бесплатного школьного билета VBB", href: "https://www.vbb.de/abonnements/schueler/schuelerticket-berlin/" },
  semester: { label: "Deutschlandsemesterticket VBB", href: "https://www.vbb.de/tickets/sondertickets/semesterticket-zusatzticket/" },
  semesterPrice: { label: "Bundesregierung: цена Deutschlandsemesterticket – 60% Deutschlandticket", href: "https://www.bundesregierung.de/breg-de/service/newsletter-und-abos/newsletter-verbraucherschutz/deutschlandticket-2134074" },
  trainingFare: { label: "Monatskarte Ausbildung: условия и тарифы VBB", href: "https://www.vbb.de/tickets/monatskarten/monatskarte-ausbildung/" },
  trainingFarePurchase: { label: "Покупка Monatskarte Ausbildung и документы BVG", href: "https://www.bvg.de/de/abos-und-tickets/alle-tickets/zeitkarten/monatskarte-ausbildung" },
  trainingFareSubscription: { label: "Заказ Monatskarte Ausbildung по абонементу BVG", href: "https://www.bvg.de/de/abos-und-tickets/alle-abos/monatskarte-azubi" },
  training: { label: "Субсидия на Deutschlandticket для обучения VBB", href: "https://www.vbb.de/abonnements/ausbildung/deutschlandticket-zuschuss-ausbildung/" },
  disability: { label: "Проезд с инвалидностью и сопровождение VBB", href: "https://www.vbb.de/barrierefrei-unterwegs/" },
  cultureDiscounts: { label: "Льготы в культурных учреждениях Берлина", href: "https://www.berlin.de/sen/kultur/kulturpolitik/kulturelle-teilhabe/ermaessigungen/" },
  berlinBenefits: { label: "Право на льготные предложения Берлина", href: "https://www.berlin.de/sen/soziales/soziale-sicherung/bn-berlin-ticket-s/angebote-faq-1524266.php" },
  museumDiscounts: { label: "Льготы и бесплатный вход в Государственные музеи Берлина", href: "https://www.smb.museum/besuch-planen/ermaessigungen-freier-eintritt/" },
  museumPortal: { label: "Бесплатный вход в музеях Берлина и условия для отдельных групп", href: "https://www.museumsportal-berlin.de/de/planen-organisieren/tipps-zum-eintritt/eintritt-frei/" },
  cultureRegistration: { label: "Пункты регистрации KulturLeben Berlin", href: "https://kulturleben-berlin.de/ueber-uns/anmeldestellen/" },
  fairgnuegen: { label: "Бесплатные и льготные предложения Fairgnügen", href: "https://fairgnuegen.berlin.de/" },
  familyPass: { label: "Berliner FamilienPass 2026", href: "https://familienportal.berlin.de/news/der-berliner-familienpass-2026-ist-da" },
  childrenMuseums: { label: "Бесплатные музеи для детей и подростков", href: "https://www.berlin.de/museum/eintritt-frei/kinder-und-jugendliche/" },
  freeMuseums: { label: "Музеи Берлина с бесплатным входом", href: "https://www.berlin.de/museum/eintritt-frei/" },
  cultureLiving: { label: "Регистрация гостя KulturLeben Berlin", href: "https://kulturleben-berlin.de/gast/" },
  berlinFree: { label: "Бесплатные события в Берлине", href: "https://www.berlin.de/kultur-und-tickets/gratis/" },
  educationPackage: { label: "Bildungs- und Teilhabepaket Берлина", href: "https://www.berlin.de/sen/bjf/hilfe-und-unterstuetzung/bildungspaket/" },
};

const transportProfileQuestion: Question = {
  id: "profile",
  prompt: "Кто будет пользоваться билетом?",
  options: [
    ["under6", "Ребёнок младше 6 лет"],
    ["school", "Школьник, которому подходит бесплатный Schülerticket Berlin AB"],
    ["student", "Студент участвующего вуза Берлина или Бранденбурга с Deutschlandsemesterticket"],
    ["student_other", "Студент вуза без договора на Deutschlandsemesterticket"],
    ["training", "Учащийся на Ausbildung или участник FSJ, FÖJ либо BFD"],
    ["social", "Житель Берлина с Bürgergeld, Sozialhilfe, Grundsicherung, AsylbLG, Wohngeld или другой выплатой из списка VBB"],
    ["social_elsewhere", "Получаю пособие, но мой основной адрес не в Берлине"],
    ["disability", "Есть Schwerbehindertenausweis с действующей Wertmarke"],
    ["regular", "Взрослый пассажир без специального основания"],
    ["multiple", "В поездке несколько людей с разными основаниями для скидки"],
  ],
};
const transportZoneQuestion: Question = {
  id: "zone",
  prompt: "Где вы будете ездить?",
  options: [
    ["ab", "По Берлину и пригородам: тарифные зоны AB или ABC"],
    ["de", "По Германии на местном и региональном транспорте"],
  ],
};
const transportFrequencyQuestion: Question = {
  id: "frequency",
  prompt: "Как часто вы будете ездить?",
  options: [
    ["occasional", "Разовые поездки или несколько поездок в месяц"],
    ["frequent", "Регулярные поездки почти каждый день"],
  ],
};
const transportChannelQuestion: Question = {
  id: "channel",
  prompt: "Как вам удобнее купить билет?",
  options: [
    ["online", "Онлайн: сайт или приложение"],
    ["in_person", "Лично: автомат, центр обслуживания или точка продаж"],
    ["both", "Покажите варианты онлайн и лично"],
  ],
};
export const transportQuestions = [transportProfileQuestion, transportZoneQuestion, transportFrequencyQuestion, transportChannelQuestion] as const;
export function transportVisible(answers: Answers): readonly Question[] {
  if (!answers.profile) return [transportProfileQuestion];
  if (answers.profile === "under6") return [transportProfileQuestion];
  // Для поездок по Германии всегда нужен Deutschlandticket, частота поездок результат не меняет.
  if (answers.zone === "de") return [transportProfileQuestion, transportZoneQuestion, transportChannelQuestion];
  return transportQuestions;
}

const cultureProfileQuestion: Question = {
  id: "profile",
  prompt: "Кому нужна льгота?",
  options: [
    ["child", "Ребёнку или подростку младше 18 лет"],
    ["family", "Семье из Берлина с ребёнком до 18 лет"],
    ["social", "Жителю Берлина с Bürgergeld, Sozialhilfe, Grundsicherung, AsylbLG, Wohngeld или другой выплатой из списка"],
    ["lowincome", "Человеку с низким доходом, который может подтвердить доход"],
    ["student", "Студенту или учащемуся"],
    ["disability", "Человеку с инвалидностью; в Ausweis может быть Merkzeichen B"],
    ["refugee", "Беженцу или мигранту без пособий из списка (AsylbLG: в категории пособий)"],
    ["multiple", "Нескольким людям с разными основаниями для льготы"],
    ["other", "Другому посетителю или человеку без специального основания"],
  ],
};
const cultureActivityQuestion: Question = {
  id: "activity",
  prompt: "Что вы хотите посетить?",
  options: [
    ["museum", "Музей или выставку"],
    ["stage", "Театр, концерт или другое событие"],
    ["leisure", "Спорт, бассейн, зоопарк или досуг"],
    ["all", "Любое мероприятие"],
  ],
};
const cultureProofQuestion: Question = {
  id: "proof",
  prompt: "У вас есть действующее подтверждение пособия или дохода?",
  options: [
    ["yes", "Да, могу показать подходящий документ"],
    ["no", "Пока нет подходящего документа"],
  ],
};
export const cultureQuestions = [cultureProfileQuestion, cultureActivityQuestion, cultureProofQuestion] as const;
export function cultureVisible(answers: Answers): readonly Question[] {
  if (!answers.profile) return [cultureProfileQuestion];
  const visible: Question[] = [cultureProfileQuestion, cultureActivityQuestion];
  if (["social", "lowincome", "multiple"].includes(answers.profile)) visible.push(cultureProofQuestion);
  return visible;
}

function makeStep(title: string, detail: string, action: Action, source: Action, mode: Step["mode"] = "Онлайн", alternative?: Action): Step {
  return { title, detail, mode, action, source, ...(alternative ? { alternative } : {}) };
}
function makeMethod(
  id: string,
  kind: Method["kind"],
  title: string,
  summary: string,
  conditions: string[],
  documents: string[],
  steps: Step[],
  availability: Method["availability"] = "conditional",
  availabilityLabel = "Условия зависят от вашей категории",
): Method {
  return { id, kind, title, summary, availability, availabilityLabel, conditions, documents, steps };
}
function optionLabel(question: Question, value: string | undefined): string {
  return question.options.find(([key]) => key === value)?.[1] ?? "";
}
function transportWhy(answers: Answers): string[] {
  const why = [optionLabel(transportProfileQuestion, answers.profile)];
  if (answers.profile !== "under6") {
    why.push(optionLabel(transportZoneQuestion, answers.zone), answers.zone === "de" ? "" : optionLabel(transportFrequencyQuestion, answers.frequency), optionLabel(transportChannelQuestion, answers.channel));
  }
  return why.filter(Boolean);
}
function channelModes(answer: string | undefined): Array<"online" | "in-person"> {
  if (answer === "online") return ["online"];
  if (answer === "in_person") return ["in-person"];
  return ["online", "in-person"];
}

function localFareMethods(channel: string | undefined): Method[] {
  return channelModes(channel).map((kind) => kind === "online"
    ? makeMethod(
      "vbb-local-online",
      "online",
      "Обычный билет VBB онлайн",
      "В приложениях VBB Bus&Bahn, BVG, DB Navigator и S-Bahn Berlin можно выбрать разовый, многопоездочный, дневной, недельный или месячный билет.",
      ["Сопоставьте зону и срок действия с маршрутом поездки.", "Билет AB действует в Берлине; для пригородной зоны C нужен тариф ABC или отдельный подходящий билет."],
      ["Смартфон с установленным приложением и доступным способом оплаты."],
      [
        makeStep("Выберите билет и зоны", "Откройте каталог VBB, сравните варианты и оформите билет в приложении перевозчика.", { label: "Открыть билеты и тарифы VBB", href: accessSources.fares.href }, accessSources.fares),
        makeStep("Проверьте срок действия", "Перед поездкой проверьте, что выбранные зоны и время действия покрывают весь маршрут.", { label: "Открыть правила продажи VBB", href: accessSources.sales.href }, accessSources.sales),
      ],
      "available",
      "Обычный тариф; льготные продукты идут отдельно",
    )
    : makeMethod(
      "vbb-local-sales",
      "in-person",
      "Обычный билет VBB лично",
      "Разовые билеты и проездные продаются в автоматах, центрах обслуживания и точках продаж перевозчиков; карта VBB показывает места продажи.",
      ["Билет должен соответствовать тарифной зоне и поездке."],
      ["Способ оплаты, который принимает выбранная точка продаж."],
      [
        makeStep("Найдите место продажи", "Откройте карту VBB и выберите автомат, центр обслуживания или торговую точку рядом с вами.", { label: "Открыть карту точек продаж VBB", href: accessSources.sales.href }, accessSources.sales, "Выбор"),
        makeStep("Выберите подходящий тариф", "Выберите в автомате или в точке продаж билет нужной зоны и срока действия и возьмите его до начала поездки.", { label: "Открыть каталог билетов VBB", href: accessSources.fares.href }, accessSources.fares, "Лично"),
      ],
      "available",
      "Обычный тариф; билеты доступны в точках продаж",
    ));
}

function deutschlandticketMethods(channel: string | undefined): Method[] {
  return channelModes(channel).map((kind) => kind === "online"
    ? makeMethod(
      "deutschlandticket-online",
      "online",
      "Deutschlandticket онлайн",
      "Это личный абонемент за 63 € в месяц на местный и региональный транспорт по Германии; с 1 января 2027 года цена вырастет до 66,80 €. Он не действует в поездах дальнего следования ICE, IC и EC.",
      ["Заказ оформляется как абонемент у перевозчика; в VBB он выдаётся на телефон или VBB-fahrCard.", "Общей скидки по социальному статусу нет. При взносе работодателя от 25% (15,75 €) Deutschlandticket Job стоит 59,85 €, а доля работника – не более 44,10 €; для студентов и учащихся есть отдельные условия."],
      ["Данные для оформления абонемента и способ безналичной оплаты.", "Для контроля нужен документ с фотографией."],
      [
        makeStep("Выберите перевозчика и способ выдачи", "Оформите абонемент на сайте или в приложении перевозчика. В регионе VBB доступны приложения BVG, DB, S-Bahn Berlin и VBB.", { label: "Открыть условия покупки Deutschlandticket", href: accessSources.deutschlandticket.href }, accessSources.deutschlandticket),
        makeStep("Учтите правила абонемента", "Билет действует с первого до последнего дня календарного месяца; его нужно отменить по правилам перевозчика. Для поездки предъявляйте билет и документ с фотографией.", { label: "Открыть правила Deutschlandticket", href: accessSources.deutschlandticket.href }, accessSources.deutschlandticket),
      ],
      "available",
      "Онлайн у перевозчика или в приложении",
    )
    : makeMethod(
      "deutschlandticket-in-person",
      "in-person",
      "Deutschlandticket в центре обслуживания",
      "Некоторые перевозчики принимают заявления в центрах с обслуживанием и выдают VBB-fahrCard. В автомате, у водителя и контролёра этот абонемент не продаётся.",
      ["Услуга в центре доступна не у каждого перевозчика."],
      ["Данные для оформления абонемента и способ безналичной оплаты.", "Для контроля нужен документ с фотографией."],
      [
        makeStep("Выберите перевозчика с центром обслуживания", "Список каналов покупки и выдачи VBB-fahrCard указан на странице VBB.", { label: "Открыть варианты покупки Deutschlandticket", href: accessSources.deutschlandticket.href }, accessSources.deutschlandticket, "Выбор"),
        makeStep("Оформите абонемент у перевозчика", "Обратитесь в центр обслуживания оператора, который принимает очные заявления. Не ищите этот абонемент в билетном автомате.", { label: "Открыть условия покупки Deutschlandticket", href: accessSources.deutschlandticket.href }, accessSources.deutschlandticket, "Лично"),
      ],
      "available",
      "Лично только у перевозчиков с обслуживаемыми центрами",
    ));
}

function berlinTicketSMethod(): Method {
  return makeMethod(
    "berlin-ticket-s",
    "combined",
    "Berlin-Ticket S для льготного проезда",
    "Личный непередаваемый месячный билет действует только в Berlin AB и не оформляется как абонемент. По странице VBB на 12 ноября 2026 года цена составляет 27,50 €, и в 2027 году она не меняется.",
    ["Основной адрес: в Берлине, а пособие входит в официальный список права на Berlin-Ticket S.", "Нужны действующее подтверждение пособия и документ с фотографией; для проверки предъявляйте билет и подтверждение."],
    ["Актуальный Leistungsbescheid или Leistungsnachweis.", "Документ с фотографией; имя в билете должно совпадать с подтверждением."],
    [
      makeStep("Подготовьте подтверждение права", "Проверьте название пособия и период действия в решении. На подтверждении можно закрыть личные данные, кроме названия документа, имени, срока и ведомства.", { label: "Открыть условия Berlin-Ticket S", href: accessSources.berlinTicketS.href }, accessSources.berlinTicketS),
      makeStep("Купите месячный билет", "VBB указывает продажу в автоматах, приложениях BVG, DB Navigator, частных торговых точках и центрах обслуживания. Впишите имя и фамилию в поле месячного билета; для зоны C нужен другой или дополнительный тариф.", { label: "Открыть способы покупки Berlin-Ticket S", href: accessSources.berlinTicketS.href }, accessSources.berlinTicketS, "Выбор"),
    ],
    "conditional",
    "Льгота действует только при выполнении условий VBB",
  );
}

function schoolTicketMethod(): Method {
  return makeMethod(
    "school-ticket",
    "online",
    "Бесплатный Schülerticket Berlin AB",
    "Бесплатный Schülerticket Berlin AB выдают учащимся берлинских школ с действующим Schülerausweis I. Билет персональный, не передаётся другому человеку; велосипед включён, зона C не входит.",
    ["Для заказа нужен действующий Schülerausweis I; продление после 16 лет подтверждают ежегодно.", "Заявление подают у BVG, S-Bahn Berlin или DB Regio; для получения к началу учебного года VBB рекомендует подать его до 10 июля."],
    ["Действующий Schülerausweis I.", "Фотография для персональной VBB-fahrCard; для учащихся в Бранденбурге при проживании в Берлине также нужна Meldebescheinigung."],
    [
      makeStep("Подготовьте подтверждение школьного статуса", "Подайте действующий Schülerausweis I и фотографию. Билет продлевается автоматически до 16 лет, затем школьный статус подтверждают ежегодно.", { label: "Открыть правила Schülerticket Berlin", href: accessSources.school.href }, accessSources.school),
      makeStep("Закажите карту онлайн", "Заявление можно подать онлайн у BVG, S-Bahn Berlin или DB Regio. На срок выдачи обратите внимание заранее: для школьного старта VBB указывает 10 июля.", { label: "Открыть способы заказа Schülerticket", href: accessSources.schoolOrder.href }, accessSources.schoolOrder),
    ],
    "conditional",
    "Бесплатно после подтверждения права; заказ только онлайн",
  );
}

function semesterTicketMethod(): Method {
  return makeMethod(
    "semester-ticket",
    "online",
    "Deutschlandsemesterticket для студентов",
    "Тикет доступен только в вузах, которые заключили договор с VBB. В 2026 году цена составляет 60% обычного Deutschlandticket: 37,80 € в месяц; вуз сообщает порядок выдачи.",
    ["Наличие договора у вашего вуза: обязательное условие.", "Билет действует в местном и региональном транспорте по Германии; дальние поезда ICE, IC и EC исключены."],
    ["Подтверждение действующего статуса студента и данные учётной записи вуза.", "Документ с фотографией для контроля."],
    [
      makeStep("Проверьте список участвующих вузов", "Откройте список VBB. Вуз выдаёт сведения о доступе к билету через свою студенческую систему.", { label: "Открыть список Semesterticket VBB", href: accessSources.semester.href }, accessSources.semester),
      makeStep("Получите билет через вуз", "Deutschlandsemesterticket выпускается в цифровом виде или на карте VBB-fahrCard; при поездке возьмите документ с фотографией.", { label: "Открыть сведения о выдаче студенческого билета", href: accessSources.semester.href }, accessSources.semester, "Онлайн", accessSources.semesterPrice),
    ],
    "conditional",
    "В 2026 году: 37,80 € в месяц в участвующих вузах",
  );
}

function studentTrainingFareMethod(): Method {
  return makeMethod(
    "student-training-fare",
    "combined",
    "Monatskarte Ausbildung для студентов без семестрового договора",
    "Если вуз не участвует в Deutschlandsemesterticket, студент может получить Monatskarte Ausbildung при обучении в Берлине или Бранденбурге объёмом не менее 15 Credit Points за семестр. В 2026 году Berlin AB стоит 74,10 € за обычный месячный билет или 55,40 € в месяц по 12-месячному абонементу; Berlin ABC: 95,70 € или 77,50 € соответственно. Эти тарифы действуют до конца 2026 года; с 1 января 2027 года Berlin AB стоит 76,90 € за обычный месячный билет и 57,50 € в месяц по абонементу.",
    ["Нужен вуз в Берлине или Бранденбурге и учебная нагрузка не менее 15 Credit Points за семестр.", "Билет персональный и действует в выбранных зонах VBB; общенационального действия Deutschlandsemesterticket у него нет.", "Условие об учебной нагрузке и право на выдачу подтверждает учебное заведение; для карты нужен документ с фотографией."],
    ["Действующий студенческий билет либо удостоверение личности и справка вуза не старше 30 дней.", "Фотография для VBB-Kundenkarte; при контроле возьмите персональный билет и карту."],
    [
      makeStep("Подтвердите право на тариф Ausbildung", "Получите в вузе подтверждение учебной нагрузки не менее 15 Credit Points и оформите VBB-Kundenkarte в центре обслуживания с документами и фотографией.", { label: "Открыть условия Monatskarte Ausbildung", href: accessSources.trainingFare.href }, accessSources.trainingFare),
      makeStep("Выберите зоны и способ покупки", "Разовый месячный билет продаётся в автоматах и точках продаж BVG, а также в приложениях BVG. Абонемент на 12 месяцев можно заказать онлайн или в центре обслуживания; цена зависит от зон.", { label: "Открыть покупку Monatskarte Ausbildung", href: accessSources.trainingFarePurchase.href }, accessSources.trainingFarePurchase, "Выбор", { label: "Открыть условия абонемента BVG", href: accessSources.trainingFareSubscription.href }),
    ],
    "conditional",
    "Для подходящих студентов без семестрового договора; тарифы 2026 года",
  );
}

function trainingTicketMethod(): Method {
  return makeMethod(
    "training-ticket",
    "combined",
    "Deutschlandticket с субсидией для обучения",
    "С 1 июля 2026 года подходящим учащимся доступен Deutschlandticket Zuschuss Ausbildung за 37,80 € в месяц. Для дуальной Ausbildung действует отдельное условие через работодателя.",
    ["Право есть у отдельных групп: очная школьная Ausbildung и признанные медицинские школы, FSJ/FÖJ/BFD, а в Берлине – некоторые кандидаты на госслужбу без компенсации проезда. Обучение/служба: не менее 12 месяцев по 20 часов в неделю, организация должна быть в списке VBB.", "При дуальной Ausbildung нужен договор Deutschlandticket Job у работодателя и повышенный взнос. В 2026 году работодатель должен внести не менее 22,05 €; после скидки перевозчика билет стоит 59,85 €, а доля подходящего учащегося – не более 37,80 € в месяц.", "Эта специальная субсидия не распространяется автоматически на всех учащихся."],
    ["Для очной Ausbildung/службы: Berechtigungsnachweis от учреждения, поданный перевозчику не старше 30 дней.", "Для дуальной Ausbildung: подтверждение договора Deutschlandticket Job и повышенного взноса работодателя (не менее 22,05 € в 2026 году)."],
    [
      makeStep("Сопоставьте обучение с категорией VBB", "На странице VBB перечислены категории субсидии и нужные подтверждения.", { label: "Открыть условия субсидии для обучения", href: accessSources.training.href }, accessSources.training),
      makeStep("Оформите билет у перевозчика или через работодателя", "Очная Ausbildung и служба оформляются как месячный абонемент у перевозчика; его можно отменить до 10-го числа для окончания в конце месяца. При дуальной Ausbildung проверьте договор Jobticket и размер взноса работодателя: в 2026 году ваша доля не должна превышать 37,80 € в месяц.", { label: "Открыть способы оформления субсидии", href: accessSources.training.href }, accessSources.training),
    ],
    "conditional",
    "Размер субсидии зависит от вида обучения и перевозчика",
  );
}

function disabilityTicketMethod(): Method {
  return makeMethod(
    "disability-ticket",
    "combined",
    "Бесплатный проезд с Wertmarke",
    "Действующая Wertmarke в Schwerbehindertenausweis даёт право на бесплатный проезд в общественном транспорте VBB. При Merkzeichen B можно бесплатно взять сопровождающего.",
    ["Проверьте, что Wertmarke действует на дату поездки.", "Правило описывает транспорт VBB; вне сети VBB применяются правила соответствующего перевозчика."],
    ["Schwerbehindertenausweis и действующая Wertmarke.", "Для бесплатного сопровождающего: отметка Merkzeichen B."],
    [
      makeStep("Возьмите документы в поездку", "Предъявите Schwerbehindertenausweis с действующей Wertmarke при контроле.", { label: "Открыть правила доступности VBB", href: accessSources.disability.href }, accessSources.disability),
      makeStep("Используйте право на сопровождение", "Если в Ausweis стоит Merkzeichen B, сопровождающий едет бесплатно в условиях, указанных VBB.", { label: "Открыть правила для сопровождающего", href: accessSources.disability.href }, accessSources.disability),
    ],
    "conditional",
    "Бесплатно при действующей Wertmarke; сопровождение: при Merkzeichen B",
  );
}

const transportTitles: Record<string, string> = {
  school: "Бесплатный Schülerticket Berlin AB",
  student: "Deutschlandsemesterticket и тарифы для студентов",
  student_other: "Тариф Ausbildung для студентов без семестрового билета",
  training: "Субсидия на Deutschlandticket для обучения",
  social: "Berlin-Ticket S и другие варианты проезда",
  social_elsewhere: "Обычные билеты VBB и варианты для получателей пособий",
  disability: "Бесплатный проезд по Wertmarke",
  multiple: "Билеты и льготы для нескольких пассажиров",
  regular: "Билеты по тарифам VBB и Deutschlandticket",
};
const transportSummaries: Record<string, string> = {
  school: "Подходящие школьники могут оформить бесплатный Schülerticket Berlin AB только онлайн. Для зоны C нужен дополнительный подходящий билет.",
  student: "Deutschlandsemesterticket получают только студенты вузов с договором VBB; студентам без договора стоит проверить отдельный тариф Ausbildung.",
  student_other: "Студенты без договора Deutschlandsemesterticket могут проверить право на Monatskarte Ausbildung: нужен вуз в Берлине или Бранденбурге и не менее 15 Credit Points за семестр.",
  training: "Субсидия на Deutschlandticket зависит от вида обучения и договора работодателя; общего сниженного билета для всех учащихся нет.",
  social: "Berlin-Ticket S доступен при основном адресе в Берлине и пособии из официального списка. Это месячный билет только для Berlin AB; общей скидки на Deutschlandticket нет.",
  social_elsewhere: "Berlin-Ticket S: только для жителей Берлина с подходящим пособием. Маршрут показывает обычные тарифы VBB и Deutschlandticket.",
  disability: "Действующая Wertmarke даёт бесплатный проезд в сети VBB; Merkzeichen B даёт право на бесплатное сопровождение.",
  multiple: "Сопоставьте условия каждого пассажира: школьный билет, Berlin-Ticket S, семестровый билет, субсидию обучения или Wertmarke. Общей скидки на Deutschlandticket по социальному статусу нет.",
  regular: "Для редких поездок сравните разовые, многопоездочные и дневные билеты. Для частых поездок рассмотрите Deutschlandticket на местный и региональный транспорт по Германии.",
};
function childUnderSixMethod(): Method {
  return makeMethod(
    "under-six-free",
    "combined",
    "Ребёнок младше 6 лет едет бесплатно",
    "В местном общественном транспорте VBB ребёнку младше 6 лет отдельный билет не нужен.",
    ["Для сопровождающего пассажира нужен собственный билет или льгота."],
    ["Документ с датой рождения ребёнка на случай проверки возраста."],
    [
      makeStep("Проверьте правило для детского проезда", "VBB указывает бесплатный проезд детей до шести лет; условия для сопровождающего и поездок с другими перевозчиками приведены в тарифе.", { label: "Открыть тарифы VBB", href: accessSources.fares.href }, accessSources.fares),
      makeStep("Подберите билет взрослому пассажиру", "Для взрослого выберите подходящий разовый, дневной или месячный билет по маршруту.", { label: "Открыть каталог билетов VBB", href: accessSources.fares.href }, accessSources.fares),
    ],
    "available",
    "Билет ребёнку не требуется",
  );
}

export function transportPlan(answers: Answers): Plan {
  const profile = answers.profile ?? "regular";
  const zone = answers.zone ?? "ab";
  const frequent = answers.frequency === "frequent";
  const channel = answers.channel;
  if (profile === "under6") {
    return {
      title: "Ребёнок младше 6 лет едет бесплатно",
      summary: "В местном общественном транспорте VBB ребёнку младше 6 лет отдельный билет не нужен.",
      fit: "fits",
      why: transportWhy(answers),
      steps: [],
      methods: [childUnderSixMethod()],
    };
  }
  const methods: Method[] = [];
  if (profile === "school" || profile === "multiple") methods.push(schoolTicketMethod());
  if (profile === "student" || profile === "multiple") methods.push(semesterTicketMethod());
  if (profile === "student_other" || profile === "multiple") methods.push(studentTrainingFareMethod());
  if (profile === "training" || profile === "multiple") methods.push(trainingTicketMethod());
  if (profile === "social" || profile === "multiple") methods.push(berlinTicketSMethod());
  if (profile === "disability" || profile === "multiple") methods.push(disabilityTicketMethod());
  const deutschlandTicket = zone === "de" || frequent ? deutschlandticketMethods(channel) : [];
  if (zone === "de" || frequent) methods.push(...deutschlandTicket, ...localFareMethods(channel));
  else methods.push(...localFareMethods(channel));
  return {
    title: transportTitles[profile] ?? transportTitles.regular,
    summary: transportSummaries[profile] ?? transportSummaries.regular,
    fit: ["social", "school", "student", "student_other", "training", "disability", "multiple"].includes(profile) ? "conditional" : "fits",
    why: transportWhy(answers),
    steps: [],
    methods,
    ...(["social", "multiple"].includes(profile) ? { next: { label: "Маршрут: льготы на культуру и досуг", href: "/berlin/culture-discounts" } } : {}),
  };
}

const activitySummaries: Record<string, string> = {
  museum: "Для музеев и выставок откройте перечень бесплатного входа для детей и общий каталог музеев с бесплатными постоянными экспозициями.",
  stage: "Для театра и концертов проверьте билеты за 3 € и другие предложения публично финансируемых учреждений; правила зависят от площадки.",
  leisure: "Для спорта и досуга начните с каталога Fairgnügen и предложений Berliner FamilienPass, если вы подходите по условиям.",
  all: "Для разных мероприятий сравните официальный каталог бесплатных событий, перечень музеев и льготы культурных учреждений.",
};
function freeOffersMethod(activity: string | undefined): Method {
  const detail = activitySummaries[activity ?? "all"] ?? activitySummaries.all;
  return makeMethod(
    "free-offers",
    "online",
    "Официальные бесплатные события и вход",
    detail,
    ["Вход и бронирование зависят от учреждения, даты и конкретного события."],
    ["Дата и название события; для возрастной льготы: документ, подтверждающий возраст."],
    [
      makeStep("Откройте официальный календарь", detail, { label: "Найти бесплатные события Берлина", href: accessSources.berlinFree.href }, accessSources.berlinFree),
      makeStep("Сравните музеи с бесплатным входом", "В каталоге указаны музеи и условия входа; отдельные выставки могут иметь другие правила.", { label: "Открыть бесплатные музеи Берлина", href: accessSources.freeMuseums.href }, accessSources.freeMuseums),
    ],
    "available",
    "Доступ зависит от правил конкретного события",
  );
}
function childrenCultureMethod(): Method {
  return makeMethod(
    "children-museums",
    "online",
    "Бесплатный вход для детей и подростков",
    "В Staatliche Museen zu Berlin детям и подросткам до 18 лет вход бесплатный. В других музеях Берлина возрастной предел и условия отличаются; у выставок может быть отдельный билет.",
    ["Бесплатный вход до 18 лет подтверждён для Staatliche Museen zu Berlin; в других учреждениях проверьте возрастной предел.", "Для специальных выставок и мероприятий может действовать отдельный билет."],
    ["Документ, подтверждающий возраст ребёнка."],
    [
      makeStep("Выберите музей по возрастному условию", "Откройте официальный список музеев с бесплатным входом для детей и посмотрите возраст для выбранного учреждения.", { label: "Открыть список для детей и подростков", href: accessSources.childrenMuseums.href }, accessSources.childrenMuseums, "Онлайн", accessSources.museumDiscounts),
      makeStep("Посмотрите правила выбранной выставки", "На странице учреждения проверьте, включён ли свободный вход для нужной выставки и требуется ли бесплатный билет.", { label: "Открыть общий список бесплатных музеев", href: accessSources.freeMuseums.href }, accessSources.freeMuseums),
    ],
    "conditional",
    "Бесплатно в учреждениях, где возраст входит в условия",
  );
}
function familyPassMethod(): Method {
  return makeMethod(
    "family-pass",
    "combined",
    "Berliner FamilienPass для семей",
    "Издание 2026 года стоит 6 €, содержит более 300 льготных предложений и действует до 31 декабря 2026 года. Доход семьи не влияет на право покупки.",
    ["Семья должна жить в Берлине и воспитывать ребёнка до 18 лет.", "Предложение и срок действия зависят от издания FamilienPass."],
    ["Berliner FamilienPass 2026.", "Для некоторых предложений нужно прийти вместе со взрослым и ребёнком."],
    [
      makeStep("Выберите предложения для семьи", "Посмотрите действующий список скидок, бесплатных входов и условий для взрослых и детей.", { label: "Открыть FamilienPass 2026", href: accessSources.familyPass.href }, accessSources.familyPass),
      makeStep("Купите pass удобным способом", "Издание продаётся онлайн и в перечисленных на странице берлинских библиотеках, Bürgerämter, dm и JugendKulturService.", { label: "Посмотреть покупку и точки выдачи", href: accessSources.familyPass.href }, accessSources.familyPass, "Выбор"),
    ],
    "conditional",
    "Для семей с берлинским адресом и ребёнком до 18 лет",
  );
}
function socialCultureMethod(proof: string | undefined): Method {
  const proofConditions = proof === "yes"
    ? ["Для Fairgnügen покажите действующее подтверждение из списка Берлина; членам семьи или домохозяйства может понадобиться приложение с расчётом пособия."]
    : ["Для Fairgnügen подготовьте подтверждение из списка Берлина; членам семьи или домохозяйства может понадобиться приложение с расчётом пособия. Для билетов за 3 € на участвующих площадках подтверждение не требуется."];
  return makeMethod(
    "social-culture",
    "combined",
    "Льготы при получении пособия",
    "Fairgnügen даёт доступ к предложениям для жителей Берлина с выплатами из официального списка. Отдельно некоторые театры и концертные залы продают билеты за 3 € получателям Bürgergeld, Sozialhilfe, Grundsicherung или AsylbLG, если остались места.",
    ["Для Fairgnügen нужны основной адрес в Берлине и выплата из списка: Bürgergeld, Sozialhilfe, Grundsicherung по старости или инвалидности, AsylbLG, Wohngeld или указанная компенсация. Право может распространяться на семью: Bedarfsgemeinschaft для первых четырёх выплат и домочадцев из расчёта Wohngeld.", "Получателям Bürgergeld, Wohngeld, Grundsicherung и AsylbLG вход в Staatliche Museen zu Berlin бесплатный с подтверждением. Билеты за 3 € предлагают только некоторые публично финансируемые театры и концертные залы, если есть места; их продают у кассы перед началом. С 1 января 2025 года подтверждение для покупки такого билета не требуется."],
    proof === "yes" ? ["Действующий Leistungsbescheid или Leistungsnachweis для предложений Fairgnügen; членам домохозяйства при необходимости понадобится расчёт пособия.", "Для билета за 3 € отдельное подтверждение не требуется, но правила площадки сохраняются."] : ["Подготовьте действующий Leistungsbescheid, Leistungsnachweis или другой документ из списка Берлина для Fairgnügen; членам домохозяйства при необходимости понадобится расчёт пособия.", "Для билета за 3 € на участвующих площадках подтверждение не нужно."],
    [
      makeStep("Выберите предложение Fairgnügen", "Откройте каталог культурных, спортивных и досуговых предложений для жителей Берлина с социальными выплатами.", { label: "Открыть каталог Fairgnügen", href: accessSources.fairgnuegen.href }, accessSources.fairgnuegen),
      makeStep("Найдите билет за 3 €", "На участвующих площадках билет продаётся у вечерней кассы перед началом при наличии свободных мест; дни и спектакли зависят от учреждения.", { label: "Открыть условия билетов за 3 €", href: accessSources.cultureDiscounts.href }, accessSources.cultureDiscounts, "Выбор"),
      makeStep("Проверьте бесплатный вход в Государственных музеях", "Для получателей Bürgergeld, Wohngeld, Grundsicherung и AsylbLG вход бесплатный при предъявлении подтверждения.", { label: "Открыть правила Государственных музеев", href: accessSources.museumDiscounts.href }, accessSources.museumDiscounts),
      makeStep("Проверьте основание и подтверждение Fairgnügen", proofConditions[0], { label: "Открыть список оснований и документов", href: accessSources.berlinBenefits.href }, accessSources.berlinBenefits, "Лично"),
    ],
    "conditional",
    proof === "yes" ? "Подтверждение есть; условия определяет площадка" : "Для части предложений сначала подготовьте подтверждение",
  );
}
function lowIncomeCultureMethod(proof: string | undefined): Method {
  return makeMethod(
    "low-income-culture",
    "mail",
    "Бесплатные билеты KulturLeben Berlin",
    "KulturLeben Berlin распределяет бесплатно свободные билеты среди зарегистрированных гостей. Для регистрации подписанную форму и копию подтверждения дохода отправляют письмом или через социальную партнёрскую организацию; это не онлайн-заявление.",
    ["Критерии дохода: до 1 200 € нетто для одного человека, 1 700 € для двух человек и ещё 350 € на каждого ребёнка в общем домохозяйстве.", "Даже при регистрации бесплатные билеты зависят от свободных мест и не гарантированы."],
    proof === "yes" ? ["Подтверждение дохода или пособия из списка KulturLeben; студент может приложить выписки по счёту за три месяца."] : ["Подготовьте подтверждение дохода или пособия; студент может приложить выписки по счёту за три месяца."],
    [
      makeStep("Проверьте доход и подтверждение", "Для человека, живущего одного, предел: 1 200 € нетто в месяц; для двух человек: 1 700 €, плюс 350 € на каждого ребёнка.", { label: "Открыть условия регистрации KulturLeben", href: accessSources.cultureLiving.href }, accessSources.cultureLiving),
      makeStep("Подайте письменную форму", "Скачайте, заполните и подпишите форму, приложите копию актуального подтверждения дохода и отправьте по адресу на странице пунктов регистрации либо через социального партнёра.", { label: "Найти пункты регистрации KulturLeben", href: accessSources.cultureRegistration.href }, accessSources.cultureRegistration, "Почта"),
    ],
    "conditional",
    proof === "yes" ? "Можно перейти к регистрации с документом" : "Сначала подготовьте подтверждение дохода",
  );
}
function studentCultureMethod(): Method {
  return makeMethod(
    "student-culture",
    "combined",
    "Скидки для студентов и учащихся",
    "Общей скидки на все музеи и события нет. В Staatliche Museen zu Berlin школьникам, учащимся Ausbildung, студентам и участникам добровольной службы полагается скидка 50% при предъявлении подтверждения; условия других площадок отличаются.",
    ["В Staatliche Museen zu Berlin 50% скидки также предусмотрено для получателей ALG I и людей с GdB от 50; подтверждение показывают при входе.", "Перед оплатой проверьте тариф и документ на странице конкретного музея или события."],
    ["Студенческий билет или подтверждение учёбы."],
    [
      makeStep("Откройте правила Staatliche Museen zu Berlin", "Для школьников, учащихся Ausbildung, студентов и участников добровольной службы указана общая скидка 50%; документ нужно показать при входе.", { label: "Открыть льготы в Государственных музеях", href: accessSources.museumDiscounts.href }, accessSources.museumDiscounts),
      makeStep("Проверьте тариф другой площадки", "Для театра, концерта и остальных музеев условия не едины: выберите тариф только по странице конкретного учреждения.", { label: "Найти бесплатные и сниженные предложения", href: accessSources.berlinFree.href }, accessSources.berlinFree),
    ],
    "conditional",
    "Скидка зависит от музея; бесплатные билеты: от наличия мест и права на них",
  );
}
function disabilityCultureMethod(): Method {
  return makeMethod(
    "disability-culture",
    "combined",
    "Льготы для людей с инвалидностью и сопровождающих",
    "Льготы зависят от учреждения. В Staatliche Museen zu Berlin посетителю с GdB от 50 предоставляют скидку 50%, а необходимый сопровождающий входит бесплатно, если это отмечено в удостоверении.",
    ["В Staatliche Museen для скидки 50% нужен документ о GdB от 50; бесплатный сопровождающий должен быть отмечен в Schwerbehindertenausweis.", "В других музеях и на специальных выставках действуют собственные условия."],
    ["Schwerbehindertenausweis; при необходимости: отметка о сопровождающем."],
    [
      makeStep("Проверьте скидку в Государственных музеях", "В Staatliche Museen zu Berlin подтверждённый GdB от 50 даёт 50% скидки; отметка о необходимом сопровождающем даёт ему бесплатный вход.", { label: "Открыть льготы в Государственных музеях", href: accessSources.museumDiscounts.href }, accessSources.museumDiscounts),
      makeStep("Проверьте другие площадки", "Бесплатный вход или скидка для посетителя с инвалидностью зависит от конкретного музея, мероприятия и удостоверения.", { label: "Открыть список бесплатных музеев", href: accessSources.freeMuseums.href }, accessSources.freeMuseums),
    ],
    "conditional",
    "Льгота и условия входа зависят от учреждения",
  );
}
function generalCultureMethod(): Method {
  return makeMethod(
    "general-culture",
    "online",
    "Бесплатные события и тарифы площадок",
    "Единой скидки для всех посетителей нет. Бесплатный вход и льготная цена зависят от конкретного события и учреждения.",
    ["Проверьте правила выбранного события.", "Статус беженца или мигранта сам по себе не даёт единую скидку; получатели AsylbLG могут использовать маршрут для социальных пособий."],
    ["Для отдельных предложений: подтверждение пособия, дохода или возраста."],
    [
      makeStep("Найдите бесплатное событие", "В календаре Берлина собраны текущие события со свободным входом.", { label: "Открыть бесплатные события", href: accessSources.berlinFree.href }, accessSources.berlinFree),
      makeStep("Откройте предложения площадки", "Список культурных льгот содержит актуальные ссылки на предложения учреждений и на регистрацию KulturLeben.", { label: "Открыть обзор культурных льгот", href: accessSources.cultureDiscounts.href }, accessSources.cultureDiscounts),
    ],
    "available",
    "Бесплатные события доступны по условиям площадки",
  );
}
function refugeeCultureMethod(): Method {
  return makeMethod(
    "refugee-culture",
    "online",
    "Музеи с бесплатным входом для отдельных групп беженцев",
    "Перечень Museumsportal Berlin показывает музеи, где для отдельных групп беженцев вход бесплатный, и документы, которые там нужно показать. Это условие отдельных музеев, а не общая скидка по статусу.",
    ["Участвуют не все музеи: в перечне указано, какие и при каких документах."],
    ["Документ о пребывании/разрешение на работу и подтверждение, указанное для конкретного музея."],
    [
      makeStep("Найдите участвующий музей", "Откройте актуальный перечень Museumsportal Berlin и найдите учреждение с подходящим условием бесплатного входа.", { label: "Открыть список бесплатного входа", href: accessSources.museumPortal.href }, accessSources.museumPortal),
      makeStep("Проверьте документы на странице музея", "У разных площадок разные основания и требования к подтверждению; возьмите указанные документы при посещении.", { label: "Перейти к списку музеев и условий", href: accessSources.museumPortal.href }, accessSources.museumPortal),
    ],
    "conditional",
    "Только в перечисленных музеях и при наличии указанных документов",
  );
}
function educationCultureMethod(): Method {
  return makeMethod(
    "education-culture",
    "online",
    "Помощь на культурные и досуговые занятия детей",
    "Для детей в семье, имеющей право на Bildungs- und Teilhabepaket, предусмотрена отдельная поддержка участия в культурных, спортивных и досуговых занятиях.",
    ["Право зависит от пособия семьи и возраста ребёнка.", "Это поддержка занятий и участия, а не универсальная скидка на вход в любое событие."],
    ["Документы, подтверждающие право семьи на Bildungs- und Teilhabepaket.", "Документ ребёнка и данные выбранного занятия."],
    [
      makeStep("Откройте маршрут по Bildungspaket", "Там указаны действующие условия для детей, школьных расходов, занятий и досуга.", { label: "Начать маршрут Bildungspaket", href: "/berlin/bildungspaket" }, accessSources.educationPackage),
      makeStep("Сопоставьте занятие с правилами программы", "Страница Берлина описывает услуги и порядок оформления помощи на участие.", { label: "Открыть правила Bildungspaket", href: accessSources.educationPackage.href }, accessSources.educationPackage),
    ],
    "conditional",
    "Доступно только при праве на Bildungs- und Teilhabepaket",
  );
}
const cultureActivityTitles: Record<string, string> = {
  museum: "Музеи и выставки",
  stage: "Театр, концерты и события",
  leisure: "Спорт, бассейн, зоопарк и досуг",
  all: "Музеи, события и досуг",
};
function cultureWhy(answers: Answers): string[] {
  const why = [optionLabel(cultureProfileQuestion, answers.profile), optionLabel(cultureActivityQuestion, answers.activity)];
  if (["social", "lowincome", "multiple"].includes(answers.profile ?? "")) why.push(optionLabel(cultureProofQuestion, answers.proof));
  return why.filter(Boolean);
}
export function culturePlan(answers: Answers): Plan {
  const profile = answers.profile ?? "other";
  const activity = answers.activity ?? "all";
  const methods: Method[] = [freeOffersMethod(activity)];
  if (profile === "child" || profile === "family" || profile === "multiple") methods.push(childrenCultureMethod());
  if (profile === "family" || profile === "multiple") methods.push(familyPassMethod());
  if (profile === "social" || profile === "multiple") methods.push(socialCultureMethod(answers.proof));
  if (profile === "social" || profile === "lowincome" || profile === "multiple") methods.push(lowIncomeCultureMethod(answers.proof));
  if (profile === "student" || profile === "multiple") methods.push(studentCultureMethod());
  if (profile === "disability" || profile === "multiple") methods.push(disabilityCultureMethod());
  if (profile === "refugee" || profile === "social" || profile === "multiple") methods.push(refugeeCultureMethod());
  if (profile === "refugee" || profile === "other" || profile === "multiple") methods.push(generalCultureMethod());
  if (["child", "family", "multiple"].includes(profile)) methods.push(educationCultureMethod());
  if (activity === "museum") methods.sort((a, b) => Number(b.id === "children-museums") - Number(a.id === "children-museums"));
  if (activity === "stage") methods.sort((a, b) => Number(b.id === "social-culture") - Number(a.id === "social-culture"));
  if (activity === "leisure") methods.sort((a, b) => Number(b.id === "family-pass" || b.id === "social-culture") - Number(a.id === "family-pass" || a.id === "social-culture"));
  const title = cultureActivityTitles[activity] ?? cultureActivityTitles.all;
  const summaryByProfile: Record<string, string> = {
    child: "Для детей и подростков есть музеи со свободным входом, но возрастные пределы устанавливает каждое учреждение.",
    family: "Berliner FamilienPass подходит берлинским семьям с ребёнком до 18 лет независимо от дохода; для детей действуют также музейные предложения по возрасту.",
    social: "Получатели подходящих социальных выплат могут использовать Fairgnügen и льготы отдельных учреждений; список пособий и документов опубликован Берлином.",
    lowincome: "KulturLeben Berlin распределяет бесплатные билеты при соблюдении опубликованных критериев и наличии мест.",
    student: "Для студентов и учащихся нет единой скидки на все учреждения; используйте тариф конкретного музея или события.",
    disability: "Льготы для посетителей с инвалидностью и сопровождающих зависят от музея или площадки и отмечаются в их правилах.",
    refugee: "Статус беженца или мигранта сам по себе не даёт единую скидку; при получении AsylbLG используйте предложения для получателей пособий.",
    multiple: "Сравните условия каждого человека: возраст, семейный pass, пособие, доход, учёбу или отметку в удостоверении.",
    other: "Для каждого события доступны отдельные тарифы, а официальный календарь Берлина показывает мероприятия со свободным входом.",
  };
  return {
    title,
    summary: summaryByProfile[profile] ?? summaryByProfile.other,
    fit: ["social", "lowincome", "student", "disability", "multiple"].includes(profile) ? "conditional" : "fits",
    why: cultureWhy(answers),
    steps: [],
    methods,
    ...(["child", "family"].includes(profile) ? { next: { label: "Маршрут: помощь детям и семьям на учёбу и досуг", href: "/berlin/bildungspaket" } } : {}),
  };
}
