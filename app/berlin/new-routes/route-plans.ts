import { leaGuidedPlan, leaVisible } from "./lea-guided.ts";
import { housingGuidedPlan, housingQuestions } from "./housing-guided.ts";
import { everydayPlan, questionsForEveryday } from "./everyday-plans.ts";
import { reunionPlan, reunionVisible } from "./reunion-plans.ts";
import { sprachkursPlan, sprachkursVisible, studyPlan, studyVisible } from "./study-language-plans.ts";
import { petsPlan, petsVisible } from "./pets-plans.ts";
import { languagePlan, languageVisible, recognitionPlan, recognitionVisible, workPlan, workVisible } from "./work-learning-plans.ts";
import { alPlan, alVisible, basicPlan, basicVisible, carPlan, carVisible, citizenshipPlan, citizenshipVisible } from "./status-money-plans.ts";
import { carePlan, careVisible, disabilityPlan, disabilityVisible, landlordPlan, landlordVisible, movePlan, moveVisible } from "./life-events-plans.ts";
import { butPlan, butVisible, maternityPlan, maternityVisible } from "./family-support-plans.ts";
import { elternzeitPlan, elternzeitVisible, wohngeldPlan, wohngeldVisible } from "./life-benefits-plans.ts";
import { elterngeldPlan, elterngeldVisible, kinderzuschlagPlan, kinderzuschlagVisible, taxPlan, taxVisible } from "./family-money-plans.ts";
import { employmentPlan, employmentVisible, jobcenterPlan, jobcenterVisible, kindergeldPlan, kindergeldVisible, kitaGuidedPlan, kitaVisible } from "./family-work-plans.ts";
import { culturePlan, cultureVisible, transportPlan, transportVisible } from "./mobility-culture-plans.ts";
import { chancePlan, chanceVisible, relocationPlan, relocationVisible, studyVisaPlan, studyVisaVisible, volunteerPlan, volunteerVisible, workVisaPlan, workVisaVisible } from "./relocation-plans.ts";
import { companyPlan, companyVisible } from "./company-plans.ts";
import { socialNumberPlan, socialNumberVisible } from "./socialnumber-plans.ts";
import { settlementPlan, settlementVisible } from "./settlement-plans.ts";
import { notaryPlan, notaryVisible } from "./notary-plans.ts";
import { mentalPlan, mentalVisible } from "./mental-health-plans.ts";
import type { Action, Answers, Fact, Method, Plan, Question, Step } from "./route-model.ts";
export type { Action, Answers, Fact, FactKind, Fit, Method, MethodKind, Plan, Provider, Question, Step } from "./route-model.ts";
export type RouteId = "doctor" | "urgent" | "business" | "bank" | "telecom" | "dog" | "wbs" | "lea" | "housing" | "kindergeld" | "jobcenter" | "kita" | "employment" | "elterngeld" | "kinderzuschlag" | "steuererklaerung" | "elternzeit" | "wohngeld" | "mutterschutz" | "bildungspaket" | "pflegegeld" | "schwerbehinderung" | "wohnungsgeber" | "umzug" | "arbeitslosengeld" | "grundsicherungsgeld" | "kfz" | "einbuergerung" | "workpermit" | "recognition" | "language" | "reunion" | "sprachkurs" | "study" | "petmove" | "petpass" | "vet" | "dogtrainer" | "transport" | "culture" | "relocation" | "chancenkarte" | "workvisa" | "volunteer" | "studyvisa" | "company" | "socialnumber" | "settlement" | "notary" | "mental";

export const official = {
  doctorSearch: "https://gesund.bund.de/suchen/aerztinnen-und-aerzte",
  doctorInfo: "https://gesund.bund.de/arztwahl-und-terminsuche",
  doctorLang: "https://arztsuche.116117.de/pages/arztsuche.xhtml",
  appointment: "https://www.116117-termine.de/",
  appointmentInfo: "https://www.116117.de/de/patientenservice.php",
  psychotherapy: "https://www.116117.de/de/psychotherapie.php",
  urgentInfo: "https://www.116117.de/de/haeufige-fragen.php",
  navigator: "https://www.116117.de/de/patienten-navi.php",
  urgentPractices: "https://bereitschaftspraxen.116117.de/",
  berlinHealth: "https://willkommenszentrum.berlin.de/gesundheit/krankheit-und-unfall",
  clinicSearch: "https://bundes-klinik-atlas.de/",
  businessService: "https://service.berlin.de/dienstleistung/121921/",
  businessOnline: "https://www.ea.berlin.de/intelliform/forms/eu-dlr-ng/gewerbe/Gewerbeanmeldung/index",
  taxService: "https://service.berlin.de/dienstleistung/325409/",
  elster: "https://www.elster.de/elsterweb/infoseite/unternehmensgruendung",
  taxForm: "https://www.elster.de/eportal/formulare-leistungen/alleformulare/fseeun",
  taxForms: "https://www.elster.de/eportal/formulare-leistungen/alleformulare",
  residence: "https://www.berlin.de/einwanderung/aufenthalt/erwerbstaetigkeit/artikel.874042.php",
};

const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
export const doctorQuestions = [
  q("coverage", "Как вы сейчас застрахованы?", [["public", "Государственная страховка (GKV)"], ["private", "Частная страховка (PKV)"], ["none", "Страховка пока не оформлена"], ["unknown", "Не знаю"]]),
  q("kind", "Кого вы ищете?", [["gp", "Терапевта или семейного врача (Hausarzt)"], ["child", "Педиатра (Kinderarzt)"], ["specialist", "Врача узкой специальности (Facharzt)"], ["psych", "Первый приём у психотерапевта"]]),
  q("lang", "На каком языке вам нужен врач?", [["any", "Подойдёт немецкий"], ["ru", "Русский"], ["uk", "Украинский"], ["en", "Английский"], ["tr", "Турецкий"], ["ar", "Арабский"], ["es", "Испанский"], ["it", "Итальянский"], ["fr", "Французский"], ["pl", "Польский"], ["other", "Другой язык"]]),
  q("code", "Есть ли у вас направление с 12-значным кодом для записи?", [["yes", "Да, код есть"], ["no", "Нет"], ["unknown", "Не знаю, где его взять"]]),
] as const;

export const urgentQuestions = [
  q("danger", "Есть ли признаки угрозы жизни: тяжёлая одышка, потеря сознания, сильное кровотечение или похожее состояние?", [["yes", "Да"], ["no", "Нет"], ["unsure", "Не могу оценить"]]),
  q("wait", "Можно ли дождаться обычных часов работы врачебной практики?", [["no", "Нет, помощь нужна раньше"], ["yes", "Да, могу подождать"], ["unsure", "Не знаю"]]),
] as const;

export const businessQuestions = [
  q("city", "Где будет постоянное место вашей деятельности?", [["berlin", "В Берлине"], ["elsewhere", "В другом месте"], ["unknown", "Пока не определено"]]),
  q("status", "Какое у вас гражданство?", [["eu", "ЕС / ЕЭЗ / Швейцария"], ["noneu", "Другое"], ["unknown", "Не уверен(а)"]]),
  q("permission", "Что написано в виде на жительство о работе?", [["allowed", "«Erwerbstätigkeit gestattet/erlaubt» или «Selbständige Tätigkeit gestattet/erlaubt»"], ["restricted", "Такого разрешения нет или указано ограничение"], ["unknown", "Не могу определить"]]),
  q("kind", "Как вы определяете свою деятельность?", [["freelance", "Свободная профессия (Freier Beruf)"], ["trade", "Предпринимательская деятельность (Gewerbe)"], ["unknown", "Не знаю, к какому виду она относится"]]),
  q("structure", "В какой форме вы собираетесь работать?", [["solo", "Самостоятельно как физическое лицо (Einzelunternehmen)"], ["other", "Компания, товарищество или другая форма"]]),
] as const;

export function questionsFor(id: RouteId, a: Answers): readonly Question[] {
  if (id === "company") return companyVisible(a);
  if (id === "socialnumber") return socialNumberVisible(a);
  if (id === "settlement") return settlementVisible(a);
  if (id === "notary") return notaryVisible(a);
  if (id === "mental") return mentalVisible(a);
  if (id === "relocation") return relocationVisible(a);
  if (id === "chancenkarte") return chanceVisible(a);
  if (id === "workvisa") return workVisaVisible(a);
  if (id === "volunteer") return volunteerVisible(a);
  if (id === "studyvisa") return studyVisaVisible(a);
  if (id === "transport") return transportVisible(a);
  if (id === "culture") return cultureVisible(a);
  if (id === "petmove" || id === "petpass" || id === "vet" || id === "dogtrainer") return petsVisible(id, a);
  if (id === "lea") return leaVisible(a);
  if (id === "housing") return housingQuestions;
  if (id === "kindergeld") return kindergeldVisible(a);
  if (id === "jobcenter") return jobcenterVisible(a);
  if (id === "kita") return kitaVisible(a);
  if (id === "mutterschutz") return maternityVisible(a);
  if (id === "bildungspaket") return butVisible(a);
  if (id === "pflegegeld") return careVisible(a);
  if (id === "schwerbehinderung") return disabilityVisible(a);
  if (id === "wohnungsgeber") return landlordVisible(a);
  if (id === "umzug") return moveVisible(a);
  if (id === "arbeitslosengeld") return alVisible(a);
  if (id === "grundsicherungsgeld") return basicVisible(a);
  if (id === "kfz") return carVisible(a);
  if (id === "einbuergerung") return citizenshipVisible(a);
  if (id === "workpermit") return workVisible(a);
  if (id === "recognition") return recognitionVisible(a);
  if (id === "language") return languageVisible(a);
  if (id === "reunion") return reunionVisible(a);
  if (id === "sprachkurs") return sprachkursVisible(a);
  if (id === "study") return studyVisible(a);
  if (id === "elternzeit") return elternzeitVisible(a);
  if (id === "wohngeld") return wohngeldVisible(a);
  if (id === "elterngeld") return elterngeldVisible(a);
  if (id === "kinderzuschlag") return kinderzuschlagVisible(a);
  if (id === "steuererklaerung") return taxVisible(a);
  if (id === "employment") return employmentVisible(a);
  if (id === "bank" || id === "telecom" || id === "dog" || id === "wbs") return questionsForEveryday(id, a);
  if (id === "doctor") {
    if (!a.coverage || a.coverage === "none" || a.coverage === "unknown") return doctorQuestions.slice(0, 1);
    if (a.coverage === "private" || a.kind !== "specialist") return doctorQuestions.slice(0, 3);
    return doctorQuestions.slice(0, 4);
  }
  if (id === "urgent") return a.danger === "no" ? urgentQuestions : urgentQuestions.slice(0, 1);
  const visible: Question[] = [businessQuestions[0]];
  if (a.city !== "berlin") return visible;
  visible.push(businessQuestions[1]);
  if (!a.status || a.status === "unknown") return visible;
  if (a.status === "noneu") {
    visible.push(businessQuestions[2]);
    if (a.permission !== "allowed") return visible;
  }
  visible.push(businessQuestions[3]);
  if (a.kind !== "trade") return visible;
  visible.push(businessQuestions[4]);
  return visible;
}

const act = (label: string, href: string): Action => ({ label, href });
const step = (title: string, detail: string, mode: Step["mode"], action: Action, source = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

function doctorPlan(a: Answers): Plan {
  if (a.coverage === "none" || a.coverage === "unknown") return {
    fit: "redirect",
    why: [a.coverage === "none" ? "Страховка пока не оформлена" : "Вы не знаете, как застрахованы"],
    title: "Сначала оформите страховое покрытие",
    summary: "Для обычной записи в практику понадобится страховая карта (eGK, электронная медицинская карта) или другой документ о покрытии. Срочный случай не откладывайте из-за отсутствия карты.",
    steps: [step("Проверьте путь к страховке", "NOSTRES поможет выбрать официальный способ оформления. При острой необходимости используйте отдельный маршрут срочной помощи.", "Онлайн", act("Открыть маршрут страховки", "/berlin/health-insurance"), act("Берлинский Welcome Center: страховка и лечение", official.berlinHealth), act("Если помощь нужна сейчас", "/berlin/srochnaya-pomoshch"))],
  };
  const forms = a.kind === "gp" ? ["семейный врач", "семейному врачу"] : a.kind === "child" ? ["педиатр", "педиатру"] : a.kind === "psych" ? ["психотерапевт", "психотерапевту"] : ["врач узкой специальности", "врачу узкой специальности"];
  const privateInsurance = a.coverage === "private";
  const langName: Record<string, string> = { ru: "русский", uk: "украинский", en: "английский", tr: "турецкий", ar: "арабский", es: "испанский", it: "итальянский", fr: "французский", pl: "польский" };
  const wantsLang = Boolean(a.lang) && a.lang !== "any";
  const langDetail = !wantsLang ? "На федеральном портале укажите Берлин или индекс и выберите специальность." : a.lang === "other"
    ? "В официальном поиске 116117 укажите Берлин и специальность, затем в фильтре «Fremdsprachen» (иностранные языки) выберите нужный язык из списка. Сам портал на вашем языке недоступен: он работает на немецком, арабском, английском, испанском, французском, итальянском, польском, русском, украинском и турецком."
    : "В официальном поиске 116117 укажите Берлин и специальность, затем в фильтре «Fremdsprachen» (иностранные языки) выберите нужный язык. Интерфейс самого портала тоже переключается на ваш язык. Язык врача указан в карточке практики: смотрите его там, а запись и приём при этом идут по обычным правилам.";
  const search = step(wantsLang ? "Найдите практику, где говорят на вашем языке" : "Найдите подходящую практику", `${langDetail} Наличие в реестре не означает свободную запись: свободные места и приём новых пациентов видны на карточке и сайте практики. ${privateInsurance ? "Частная страховка: на карточке и сайте практики смотрите, принимает ли она частных пациентов." : "Государственная страховка: на карточке и сайте практики смотрите, принимает ли она государственных пациентов."}`, "Онлайн", act(wantsLang ? "Открыть официальный поиск 116117 с фильтром языка" : "Открыть официальный поиск практик", wantsLang ? official.doctorLang : official.doctorSearch), act("Федеральный портал здравоохранения: поиск врачей", official.doctorSearch));
  const contact = step("Свяжитесь с выбранной практикой", "Откройте карточку с адресом и контактами. Проверьте сайт практики: запись онлайн, письменный контакт или указанный способ связи. Назовите тип страховки и цель визита; не отправляйте медицинские документы на случайный адрес. Приём и лечение проходят лично, если практика не предложила иной формат.", "Онлайн", act("Найти контакты и адрес практики", official.doctorSearch), act("Берлинский Welcome Center: порядок визита", official.berlinHealth));
  const booking = step("Выберите свободный приём онлайн", "Сервис 116117 предназначен для людей с государственной страховкой. Введите Берлин, выберите нужную специальность и свободное время. Для обычного специалиста требуется 12-значный код на направлении; для семейного врача, педиатра, гинеколога, офтальмолога и первого приёма психотерапевта — без кода. Сохраните подтверждение; конкретную практику сервис не обещает.", "Онлайн", act("Открыть официальный eTerminservice", official.appointment), act("Федеральный портал: кому нужен код и как записаться", official.doctorInfo), act("Выбрать конкретную практику", official.doctorSearch));
  const visit = step("Придите на приём", "Возьмите eGK (электронную медицинскую карту) или другой страховой документ, направление и прежние результаты обследований, если они относятся к визиту. При частной страховке приём обычно оплачивают сами, а возмещение запрашивают у страховщика. Если прийти не получится, отмените запись способом из подтверждения.", "Лично", act("Что взять на приём", official.berlinHealth), act("Берлинский Welcome Center: визит к врачу", official.berlinHealth));
  const documents = ["eGK (электронная медицинская карта) или другой документ о страховке", ...(a.kind === "specialist" ? ["Направление (Überweisung), если практика или 116117 его требуют"] : []), "Прежние результаты обследований, если они относятся к визиту"];
  const waitFacts: Fact[] = [
    { label: "Срок ожидания по закону", value: "служба записи должна предложить приём у специалиста в течение недели в разумной удалённости, ожидание не должно превышать четырёх недель; для первой консультации у психотерапевта тоже не больше четырёх недель, для неотложной терапии не больше двух", kind: "official" },
    { label: "Стоимость записи", value: "официальные страницы Минздрава и KBV стоимость записи для пациента не называют; приём оплачивает страховая касса по обычным правилам, доплата у каждой кассы своя", kind: "none" },
  ];
  const practice: Method = {
    id: "practice", kind: "phone", title: "Напрямую в практику",
    summary: "Найдите практику в реестре и свяжитесь с ней тем способом, который она указала: сайт, телефон или письменный контакт.",
    availability: "available", availabilityLabel: privateInsurance ? "Единственный способ при частной страховке" : "Доступно при любой страховке",
    conditions: ["Практика принимает ваш тип страховки и новых пациентов", "Свободная запись не гарантируется: наличие в реестре её не означает"],
    documents,
    facts: [{ label: "Срок ожидания", value: "практика сама решает, когда принять; право на приём в течение четырёх недель действует только через службу записи 116117 по государственной страховке", kind: "official" }, waitFacts[1]],
    steps: [search, contact, visit],
  };
  const online: Method = {
    id: "online", kind: "online", title: "Онлайн-запись через 116117",
    summary: "Свободные приёмы по государственной страховке. Конкретную практику сервис не обещает.",
    availability: "available", availabilityLabel: "Для государственной страховки",
    conditions: ["Государственная страховка (GKV)", a.kind === "specialist" ? "Для обычного специалиста нужен 12-значный код на направлении" : "Для семейного врача, педиатра, гинеколога, офтальмолога и первого приёма психотерапевта код не нужен"],
    documents,
    facts: waitFacts,
    steps: [booking, search, contact, visit],
  };
  if (a.kind === "specialist" && a.code !== "yes" && !privateInsurance) return {
    fit: "conditional",
    why: ["Государственная страховка", "Нужен узкий специалист", "Направления с кодом для 116117 нет или вы не знаете, где его взять"],
    title: "Найдите специалиста напрямую или получите код для 116117",
    summary: "Для записи к большинству узких специалистов через 116117 нужна Überweisung (направление) с 12-значным Vermittlungscode (кодом для записи). Напрямую в практику можно обратиться без этого кода; некоторые услуги требуют направление по собственным правилам.",
    singleMethodNote: "Онлайн-запись через 116117 без кода недоступна, поэтому сейчас остаётся прямой контакт с практикой. Когда получите код, вернитесь и выберите онлайн-запись.",
    methods: [practice],
    steps: [search, contact, step("Если нужен быстрый приём через 116117", "Обратитесь к лечащему врачу и обсудите необходимость направления с кодом. После получения кода вернитесь к этому маршруту, измените ответ и откройте онлайн-запись.", "Лично", act("Условия записи с кодом", official.doctorInfo), act("Федеральный портал: правила направления", official.doctorInfo))],
  };
  const methods = privateInsurance ? [practice] : [online, practice];
  return {
    fit: "fits",
    why: [privateInsurance ? "Частная страховка: онлайн-запись 116117 предназначена для государственной" : "Государственная страховка: доступны и онлайн-запись, и прямой контакт", `Нужен ${forms[0]}`, ...(wantsLang ? [`Врач на языке: ${a.lang === "other" ? "другом" : langName[a.lang]}`] : [])],
    title: `Запись к ${forms[1]}`,
    summary: privateInsurance ? "Найдите практику и свяжитесь с ней напрямую. Онлайн-сервис записи 116117 предназначен для государственной страховки." : "Выберите способ ниже: онлайн-поиск свободных приёмов или прямой контакт с практикой.",
    singleMethodNote: privateInsurance ? "Онлайн-запись через 116117 рассчитана на государственную страховку, поэтому для вас остаётся прямой контакт с практикой." : undefined,
    methods,
    steps: methods[0].steps,
    note: a.kind === "psych" ? "Для первой психотерапевтической беседы направление и код не нужны. Дальнейшее лечение может потребовать форму PTV 11 (заключение после первой беседы) и код; первая беседа не означает автоматическое место на терапию." : undefined,
  };
}

function urgentPlan(a: Answers): Plan {
  if (a.danger === "yes") return { title: "При угрозе жизни звоните 112", summary: "Не ищите запись онлайн и не ждите ответа NOSTRES. Сообщите оператору адрес и что произошло.", steps: [step("Позвоните 112 сейчас", "112 — служба спасения. При тяжёлой одышке, потере сознания, сильном кровотечении и других признаках угрозы жизни нужна срочная оценка специалистов. Вызов происходит по телефону, не через форму на сайте.", "Звонок", act("Позвонить 112", "tel:112"), act("Берлинский Welcome Center: номера помощи", official.berlinHealth))] };
  if (a.danger === "unsure" || a.wait === "unsure") return { title: "Получите профессиональную оценку срочности", summary: "NOSTRES не оценивает симптомы. Если состояние может угрожать жизни, звоните 112; при сомнении о другой срочной помощи используйте 116117 или официальный онлайн-опрос без диагноза.", steps: [step("Откройте официальный навигатор 116117", "Внесите жалобы на сайте 116117 и укажите Берлин или индекс. Сервис покажет рекомендуемый уровень помощи; это не диагноз. При ухудшении и признаках угрозы жизни сразу звоните 112.", "Онлайн", act("Начать оценку на Patienten-Navi", official.navigator), act("116117: назначение онлайн-навигатора", official.navigator)), step("Если онлайн-ответ неясен", "Позвоните 116117. Служба работает круглосуточно и направит к подходящей помощи. Для угрозы жизни — 112.", "Звонок", act("Позвонить 116117", "tel:116117"), act("Официальные ответы 116117", official.urgentInfo))] };
  if (a.wait === "yes") return { title: "Запишитесь на обычный приём", summary: "Если помощь может подождать до часов работы практики, начните с семейного врача или нужного специалиста.", steps: [step("Откройте маршрут записи к врачу", "Выберите страховку и специальность, затем используйте поиск практик и доступную запись. При ухудшении состояния вернитесь к срочной помощи.", "Онлайн", act("Найти врача и записаться", "/berlin/vrach"), act("Федеральный портал: обычная и срочная помощь", official.doctorInfo))] };
  return { title: "Нужна помощь до следующего рабочего приёма", summary: "116117 — для срочной, но не угрожающей жизни проблемы. Адрес и часы дежурной практики зависят от дня и района; проверьте их перед поездкой.", steps: [step("Найдите открытую дежурную практику", "В официальном поиске введите Берлин или индекс. Проверьте сегодня адрес, часы, специализацию и условия посещения. Не используйте устаревшие списки адресов.", "Онлайн", act("Найти открытую Bereitschaftspraxis (дежурную практику)", official.urgentPractices), act("Сервис 116117: поиск дежурной практики", official.appointmentInfo)), step("Если нужна помощь с выбором", "Позвоните 116117 без кода города, круглосуточно. Опишите состояние и адрес; служба подскажет, ехать ли в дежурную практику или нужен другой способ помощи.", "Звонок", act("Позвонить 116117", "tel:116117"), act("Официальный FAQ 116117", official.urgentInfo)), step("Возьмите страховой документ и отправляйтесь по указанному адресу", "Если практика подтверждена, возьмите eGK (электронную медицинскую карту) или другой документ о страховке. Если ситуация стала угрожать жизни, звоните 112. Стоимость для частной страховки зависит от договора и выставленного счёта.", "Лично", act("Перепроверить адрес и время работы", official.urgentPractices), act("Федеральный сервис 116117", official.urgentInfo))] };
}

function businessPlan(a: Answers): Plan {
  if (a.city !== "berlin") return { fit: "redirect", why: ["Постоянное место деятельности не в Берлине или не определено"], title: "Сначала определите место деятельности", summary: "Берлинское уведомление Gewerbe адресовано бизнесу с постоянным местом деятельности в Берлине. Для другого места ищите услугу ответственной земли или города.", steps: [step("Проверьте местную компетенцию", "Не подавайте берлинскую форму, пока не определено, где находится постоянное место деятельности.", "Выбор", act("Когда действует берлинская услуга", official.businessService), act("ServicePortal Berlin: условия Gewerbeanmeldung", official.businessService))] };
  if (a.status === "unknown") return { fit: "insufficient", why: ["Гражданство или статус неизвестны"], title: "Определите право на самостоятельную работу", summary: "Правила для граждан ЕС и обладателей других видов на жительство отличаются. Без этого нельзя выбрать безопасный порядок регистрации.", steps: [step("Проверьте документ и разрешение", "Найдите в документе гражданство и формулировку о работе. LEA объясняет, когда разрешение на самостоятельную деятельность уже есть и когда нужно заявление.", "Онлайн", act("Открыть правила LEA", official.residence), act("LEA: самостоятельная деятельность", official.residence))] };
  if (a.status === "noneu" && a.permission !== "allowed") return { fit: "redirect", why: ["Гражданство вне ЕС/ЕЭЗ", "В документе нет подтверждённого разрешения на самостоятельную работу"], title: "Сначала проверьте право на самостоятельную деятельность", summary: "Регистрация в налоговой или Gewerbeamt сама по себе не даёт миграционного разрешения на работу. LEA указывает формулировки, при которых отдельное заявление не нужно.", steps: [step("Найдите в ВНЖ условия о самостоятельной работе", "Если на документе нет «Erwerbstätigkeit gestattet/erlaubt» или «Selbständige Tätigkeit gestattet/erlaubt», проверьте в LEA подходящую услугу и онлайн-заявление до начала деятельности. Не считайте регистрацию бизнеса разрешением на работу.", "Онлайн", act("Право на самостоятельную работу: LEA", official.residence), act("LEA: условия и онлайн-заявление", official.residence))] };
  if (a.kind === "unknown") return { fit: "insufficient", why: ["Вид деятельности пока не определён"], title: "Определите вид деятельности до регистрации", summary: "Freier Beruf (свободная профессия) и Gewerbe (предпринимательская деятельность) оформляются по-разному. Пример профессии не определяет автоматически ваш статус.", steps: [step("Сопоставьте свою работу с официальными условиями", "Берлинский ServicePortal перечисляет свободные профессии, которые не подают Gewerbeanmeldung. Если деятельность смешанная или спорная, классификацию определяет Finanzamt (налоговая инспекция) при рассмотрении анкеты ELSTER: выберите форму по описанию деятельности.", "Онлайн", act("Открыть различия на ServicePortal", official.businessService), act("Берлин: когда нужна регистрация Gewerbe", official.businessService)), step("Подготовьте налоговую регистрацию", "Обе формы самостоятельной работы требуют анкеты Fragebogen zur steuerlichen Erfassung (анкета налоговой постановки на учёт) через ELSTER; после определения вида деятельности вернитесь к маршруту.", "Онлайн", act("Условия налоговой регистрации", official.taxService), act("ServicePortal Berlin: налоговая регистрация", official.taxService))] };
  const tax = step("Отправьте налоговую анкету через Mein ELSTER", "Создайте бесплатный аккаунт ELSTER, если его нет. Выберите Fragebogen zur steuerlichen Erfassung (анкета налоговой постановки на учёт) для своей формы деятельности; после проверки Finanzamt (налоговая инспекция) пришлёт Steuernummer (номер налогового дела) по почте. Услуга бесплатна; среднее рассмотрение около двух недель после получения всех документов.", "Онлайн", act(a.kind === "trade" && a.structure !== "solo" ? "Выбрать анкету по форме компании в ELSTER" : "Открыть анкету для физического лица в ELSTER", a.kind === "trade" && a.structure !== "solo" ? official.taxForms : official.taxForm), act("ServicePortal Berlin: сроки и условия", official.taxService), act("Как зарегистрировать ELSTER", official.elster));
  if (a.kind === "freelance") return { fit: "fits", why: ["Свободная профессия (Freier Beruf): Gewerbeanmeldung не нужна"], title: "Свободная профессия: налоговая регистрация через ELSTER", summary: "Если деятельность действительно относится к Freier Beruf, отдельная Gewerbeanmeldung (уведомление о Gewerbe) не требуется. Налоговый статус и дополнительные требования по профессии проверяйте в Finanzamt.", steps: [step("Проверьте, что деятельность относится к свободной профессии", "Официальная страница Gewerbeanmeldung исключает свободные профессии из этой обязанности. Для регулируемой профессии могут быть отдельные разрешения или членство в палате.", "Онлайн", act("Проверить исключения и требования", official.businessService), act("ServicePortal Berlin: Gewerbe", official.businessService)), tax] };
  if (a.structure !== "solo") return { fit: "clarify", next: act("Маршрут: GmbH или UG", "/berlin/gmbh-ug"), why: ["Деятельность через компанию или с партнёрами"], title: "Для компании или товарищества нужен отдельный выбор формы", summary: "Условия онлайн-регистрации различаются по организационно-правовой форме. Не используйте путь для физического лица, если работаете через компанию или с партнёрами.", steps: [step("Выберите форму на официальной странице услуги", "ServicePortal перечисляет поддерживаемые формы, документы и доступную онлайн-форму для каждой группы. Там же указаны районные Ordnungsamt (ведомства по вопросам порядка) для личного обращения.", "Онлайн", act("Открыть формы и документы Gewerbe", official.businessService), act("ServicePortal Berlin: Gewerbe", official.businessService)), tax] };
  const prepare = step("Проверьте деятельность и подготовьте документы", "Сначала сопоставьте работу со списком свободных профессий и видов деятельности, требующих отдельного разрешения, на странице услуги. Для личной подачи подготовьте удостоверение личности; гражданам вне ЕС потребуется документ о праве пребывания. Точный состав смотрите на странице услуги.", "Онлайн", act("Проверить документы и исключения", official.businessService), act("ServicePortal Berlin: требования", official.businessService));
  const filingOnline = step("Подайте Gewerbeanmeldung онлайн", "Для Einzelunternehmen (единоличной деятельности) используйте форму Berlin. Нужна BundID (государственная учётная запись); достаточно входа с именем и паролем, eID (электронная функция удостоверения) не указана как обязательная. Оплата картой: €15. Подтверждение поступит в BundID.", "Онлайн", act("Перейти к онлайн-заявлению Gewerbe", official.businessOnline), act("ServicePortal Berlin: онлайн-подача и сбор", official.businessService));
  const filingPersonal = step("Подайте Gewerbeanmeldung лично", "На странице услуги найдите Ordnungsamt района, где находится место деятельности. Скачайте форму; способ приёма и адрес отделения указаны на странице услуги. Сбор для одного физического лица: €26; подтверждение выдаётся при личной подаче.", "Лично", act("Найти районное ведомство и форму", official.businessService), act("ServicePortal Berlin: личная подача и сбор", official.businessService), act("Если предпочтёте подать онлайн", official.businessOnline));
  const taxFact = { label: "Налоговая анкета ELSTER: среднее рассмотрение", value: "около двух недель после получения всех документов", kind: "authority" as const };
  const methods: Method[] = [
    { id: "online", kind: "online", title: "Онлайн через BundID", summary: "Подача уведомления через форму Берлина. Подтверждение приходит в BundID.", availability: "available", availabilityLabel: "Для Einzelunternehmen в Берлине", conditions: ["BundID (государственная учётная запись): достаточно входа с именем и паролем", "Оплата картой при подаче"], documents: ["Данные о деятельности и месте деятельности", "Документ о праве пребывания для граждан вне ЕС"], facts: [{ label: "Сбор", value: "€15", kind: "official" }, taxFact], steps: [prepare, filingOnline, tax] },
    { id: "personal", kind: "in-person", title: "Лично в районном Ordnungsamt", summary: "Подача в ведомстве района, где находится место деятельности. Подтверждение выдают при подаче.", availability: "available", availabilityLabel: "Для Einzelunternehmen в Берлине", conditions: ["Приём по правилам районного отделения: запись и адрес указаны на странице услуги"], documents: ["Удостоверение личности", "Документ о праве пребывания для граждан вне ЕС", "Заполненная форма уведомления"], facts: [{ label: "Сбор", value: "€26", kind: "official" }, taxFact], steps: [prepare, filingPersonal, tax] },
  ];
  return { fit: "fits", why: ["Постоянное место деятельности в Берлине", "Предпринимательская деятельность (Gewerbe) без компании или товарищества"], title: "Зарегистрировать Gewerbe", summary: "Для постоянного Gewerbe в Берлине уведомление подают одновременно с началом деятельности. Затем заполняют налоговую анкету ELSTER; одно действие не заменяет другое. Выберите способ подачи ниже.", methods, steps: methods[0].steps, note: "Берлинская страница не указывает единый срок ожидания подтверждения для всех способов. Налоговый номер присылает Finanzamt после рассмотрения анкеты." };
}

function basePlanFor(id: RouteId, answers: Answers): Plan { if (id === "mental") return mentalPlan(answers); if (id === "notary") return notaryPlan(answers); if (id === "settlement") return settlementPlan(answers); if (id === "socialnumber") return socialNumberPlan(answers); if (id === "company") return companyPlan(answers); if (id === "relocation") return relocationPlan(answers); if (id === "chancenkarte") return chancePlan(answers); if (id === "workvisa") return workVisaPlan(answers); if (id === "volunteer") return volunteerPlan(answers); if (id === "studyvisa") return studyVisaPlan(answers); if (id === "transport") return transportPlan(answers); if (id === "culture") return culturePlan(answers); if (id === "petmove" || id === "petpass" || id === "vet" || id === "dogtrainer") return petsPlan(id, answers); if (id === "sprachkurs") return sprachkursPlan(answers); if (id === "study") return studyPlan(answers); if (id === "lea") return leaGuidedPlan(answers); if (id === "housing") return housingGuidedPlan(answers); if (id === "kindergeld") return kindergeldPlan(answers); if (id === "jobcenter") return jobcenterPlan(answers); if (id === "kita") return kitaGuidedPlan(answers); if (id === "mutterschutz") return maternityPlan(answers); if (id === "bildungspaket") return butPlan(answers); if (id === "pflegegeld") return carePlan(answers); if (id === "schwerbehinderung") return disabilityPlan(answers); if (id === "wohnungsgeber") return landlordPlan(answers); if (id === "umzug") return movePlan(answers); if (id === "arbeitslosengeld") return alPlan(answers); if (id === "grundsicherungsgeld") return basicPlan(answers); if (id === "kfz") return carPlan(answers); if (id === "einbuergerung") return citizenshipPlan(answers); if (id === "workpermit") return workPlan(answers); if (id === "recognition") return recognitionPlan(answers); if (id === "language") return languagePlan(answers); if (id === "reunion") return reunionPlan(answers); if (id === "elternzeit") return elternzeitPlan(answers); if (id === "wohngeld") return wohngeldPlan(answers); if (id === "elterngeld") return elterngeldPlan(answers); if (id === "kinderzuschlag") return kinderzuschlagPlan(answers); if (id === "steuererklaerung") return taxPlan(answers); if (id === "employment") return employmentPlan(answers); if (id === "bank" || id === "telecom" || id === "dog" || id === "wbs") return everydayPlan(id, answers); return id === "doctor" ? doctorPlan(answers) : id === "urgent" ? urgentPlan(answers) : businessPlan(answers); }

/** Следующий маршрут по умолчанию (спецификация RES-03): у результата не должно быть тупика. */
const defaultNext: Partial<Record<RouteId, Action>> = {
  doctor: { label: "Маршрут: срочная медицинская помощь", href: "/berlin/srochnaya-pomoshch" },
  business: { label: "Маршрут: налоговая декларация", href: "/berlin/steuererklaerung" },
  bank: { label: "Маршрут: мобильная связь и интернет", href: "/berlin/svyaz" },
  telecom: { label: "Маршрут: банковский счёт", href: "/berlin/bank" },
  dog: { label: "Маршрут: ветеринар в Берлине", href: "/berlin/veterinar" },
  petmove: { label: "Маршрут: ветеринар в Берлине", href: "/berlin/veterinar" },
  vet: { label: "Маршрут: EU-Heimtierausweis (паспорт животного)", href: "/berlin/heimtierausweis" },
  wbs: { label: "Маршрут: Wohngeld", href: "/berlin/wohngeld" },
  kindergeld: { label: "Маршрут: Kinderzuschlag", href: "/berlin/kinderzuschlag" },
  jobcenter: { label: "Маршрут: Arbeitslosengeld", href: "/berlin/arbeitslosengeld" },
  employment: { label: "Маршрут: Agentur für Arbeit и Jobcenter", href: "/berlin/jobcenter" },
  elterngeld: { label: "Маршрут: Elternzeit", href: "/berlin/elternzeit" },
  wohngeld: { label: "Маршрут: разрешение на социальное жильё (WBS)", href: "/berlin/wbs" },
};
const redirectNext: Partial<Record<RouteId, Action>> = {
  doctor: { label: "Маршрут: медицинская страховка", href: "/berlin/health-insurance" },
  business: { label: "Маршрут: вид на жительство", href: "/berlin/aufenthalt" },
};
const defaultNote = "Это общая информация, а не юридическая консультация. Условия взяты с официальных страниц, указанных в шагах; окончательное решение принимает ведомство.";

export function planFor(id: RouteId, answers: Answers): Plan {
  const plan = basePlanFor(id, answers);
  if (id === "urgent") return plan;
  const next = plan.next ?? (plan.fit === "redirect" ? redirectNext[id] : undefined) ?? defaultNext[id];
  return { ...plan, ...(next ? { next } : {}), note: plan.note ?? defaultNote };
}
