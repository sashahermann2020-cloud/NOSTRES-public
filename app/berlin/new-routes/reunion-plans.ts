import type { Action, Answers, Fact, Method, Plan, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

export const reunionOfficial = {
  spouseForeign: "https://service.berlin.de/dienstleistung/305289/standort/121885/en/",
  spouseGerman: "https://service.berlin.de/dienstleistung/354910/en/",
  childForeign: "https://service.berlin.de/dienstleistung/354970/en/",
  childGerman: "https://service.berlin.de/dienstleistung/354913/en/",
  makeSpouse: "https://www.make-it-in-germany.com/de/visum-anerkennung/familiennachzug/ehegattennachzug-nicht-eu-buerger",
  makeChild: "https://www.make-it-in-germany.com/de/visum-anerkennung/familiennachzug/kindernachzug",
  bamf: "https://www.bamf.de/DE/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Familie/NachzugZuDrittstaatlern/nachzug-zu-drittstaatlern-node.html",
};
const r = reunionOfficial;

export const reunionQuestions = [
  q("sponsor", "Кто уже живёт в Германии?", [["foreign", "Родственник из страны вне ЕС с видом на жительство"], ["german", "Гражданин Германии"]]),
  q("who", "Кого нужно привезти или оформить?", [["spouse", "Супруга или супруга (в том числе зарегистрированное партнёрство)"], ["child", "Ребёнка до 18 лет"]]),
  q("place", "Где человек находится сейчас?", [["abroad", "За пределами Германии"], ["inde", "Уже в Германии с видом на жительство или другим законным статусом"]]),
  q("visafree", "Гражданин страны, граждане которой въезжают без визы (США, Канада, Великобритания, Япония, Южная Корея, Австралия, Новая Зеландия, Израиль и ряд других)?", [["yes", "Да"], ["no", "Нет"]]),
  q("skilled", "Родственник в Германии работает по Blue Card, как специалист или исследователь?", [["yes", "Да"], ["no", "Нет, другой вид на жительство"]]),
  q("lang", "Есть ли у супруга или супруги немецкий уровня A1?", [["have", "Да, есть сертификат"], ["no", "Пока нет"]]),
  q("income", "Семья сама обеспечивает жизнь без Bürgergeld и Sozialhilfe?", [["own", "Да"], ["benefit", "Нет, получаем эти пособия"]]),
  q("age", "Сколько лет ребёнку?", [["u16", "Младше 16"], ["a16", "16–17, приезжает вместе с родителем или вскоре после него"], ["late", "16–17, приезжает позже"]]),
  q("custody", "Кто имеет право опеки?", [["sole", "Один родитель"], ["joint", "Оба родителя"]]),
  q("parents", "Нужно ли также привезти родителей?", [["yes", "Да"], ["no", "Нет"]]),
] as const;

export function reunionVisible(a: Answers): readonly Question[] {
  const [sponsor, who, place, visafree, skilled, lang, income, age, custody, parents] = reunionQuestions;
  const list: Question[] = [sponsor, who, place];
  if (a.place === "abroad") list.push(visafree);
  const foreign = a.sponsor === "foreign";
  if (foreign) list.push(skilled);
  if (a.who === "spouse" && !(foreign && a.skilled === "yes")) list.push(lang);
  if (foreign) list.push(income);
  if (a.who === "child" && foreign) list.push(age);
  if (a.who === "child") list.push(custody);
  if (foreign && a.skilled === "yes") list.push(parents);
  return list;
}

export function reunionPlan(a: Answers): Plan {
  const foreign = a.sponsor === "foreign";
  const spouse = a.who === "spouse";
  const abroad = a.place === "abroad";
  const visaFree = abroad && a.visafree === "yes";
  const needVisa = abroad && !visaFree;
  const skilled = foreign && a.skilled === "yes";
  const berlinHref = spouse ? (foreign ? r.spouseForeign : r.spouseGerman) : (foreign ? r.childForeign : r.childGerman);
  const berlin = act(spouse ? "Берлин: вид на жительство для супруга" : "Берлин: вид на жительство для ребёнка", berlinHref);
  const make = act(spouse ? "Make it in Germany: воссоединение с супругом" : "Make it in Germany: воссоединение с ребёнком", spouse ? r.makeSpouse : r.makeChild);
  const bamf = act("BAMF: воссоединение с гражданами из стран вне ЕС", r.bamf);
  const noteText = "Это общая информация, а не юридическая консультация. Условия взяты с официальных страниц Берлина (LEA), Make it in Germany и BAMF.";
  const next = spouse ? act("Маршрут: Anmeldung", "/berlin/anmeldung") : act("Маршрут: Kita, Schule и рождение ребёнка", "/berlin/kita-schule");
  const lang = a.lang === "no";
  const benefit = foreign && a.income === "benefit";
  const lateChild = !spouse && foreign && a.age === "late" && !skilled;
  const joint = a.custody === "joint";
  const course = act("Маршрут: Integrationskurs", "/berlin/integrationskurs");

  const facts: Fact[] = [
    { label: "Сбор при первом выпуске", value: spouse ? "56 € за наклейку или 100 € за eAT; для граждан Турции 27,60 € до 24 лет и 46 € с 24 лет; фото на месте 6 €" : "28 € за наклейку или 50 € за eAT; для граждан Турции 27,60 €; фото на месте 6 €", kind: "official" },
    { label: "Освобождение от сбора", value: "если без пособий SGB II, SGB XII или AsylbLG вам не прожить, нужен действующий документ из Jobcenter или Sozialamt", kind: "official" },
    { label: "Срок", value: "ответ LEA приходит «как можно скорее», после приглашения eAT выдают не раньше чем через 4 недели", kind: "official" },
    ...(spouse ? [{ label: "Возраст", value: "обоим супругам, как правило, не меньше 18 лет", kind: "official" as const }] : [{ label: "Возраст ребёнка", value: "до 18 лет, ребёнок не должен состоять в браке", kind: "official" as const }]),
    ...(spouse && !skilled ? [{ label: "Немецкий уровня A1", value: lang ? "как правило, нужен: принимают сертификат A1, Deutschtest für Zuwanderer или итоговый тест интеграционного курса" : "подтверждён сертификатом; принимают A1, Deutschtest für Zuwanderer или итоговый тест интеграционного курса", kind: "official" as const }] : []),
    ...(spouse && skilled ? [{ label: "Немецкий и жильё", value: "при воссоединении со специалистом с видом на жительство A1 до въезда не требуется, подтверждение жилья не нужно; семья должна иметь возможность объясняться по-немецки в повседневной жизни", kind: "official" as const }] : []),
    ...(foreign && !benefit ? [{ label: "Доход", value: "жизнь семьи, как правило, должна обеспечиваться собственным доходом без Bürgergeld и Sozialhilfe; доход могут подтверждать оба супруга", kind: "official" as const }] : []),
    ...(benefit ? [{ label: "Доход", value: "получение Bürgergeld или Sozialhilfe, как правило, мешает: исключения есть, например при гуманитарном виде на жительство родственника", kind: "official" as const }] : []),
    ...(foreign ? [{ label: "Страховка", value: "нужна немецкая государственная или аналогичная частная страховка; иностранная не подходит", kind: "official" as const }] : []),
    ...(spouse && skilled ? [{ label: "Работа супруга", value: "после выдачи вида на жительство работать можно сразу и без ограничений", kind: "official" as const }] : []),
    ...(spouse && foreign && !skilled ? [{ label: "Работа супруга", value: "по виду на жительство для супруга работа разрешена", kind: "official" as const }] : []),
    ...(!spouse && foreign ? [{ label: a.age === "u16" ? "Дети до 16" : a.age === "a16" ? "16–17 лет вместе с родителем" : "16–17 лет позже", value: a.age === "u16" ? "до 16 лет неженатый ребёнок приезжает к родителям без дополнительных условий по языку" : a.age === "a16" ? "если ребёнок приезжает в течение примерно шести месяцев после родителей, дополнительных условий нет" : skilled ? "ребёнок специалиста или высококвалифицированного работника приезжает без дополнительных условий, даже позже" : "нужен немецкий уровня C1 либо положительный прогноз интеграции: школа на немецком за границей, выросший в ЕС или привилегированной стране, немецкоязычная семья", kind: "official" as const }] : []),
    ...(!spouse && foreign ? [{ label: "После 18 лет", value: "по достижении 18 лет ребёнку, как правило, нужно подать на собственный вид на жительство", kind: "official" as const }] : []),
    ...(!spouse && !foreign ? [{ label: "Условия", value: "хотя бы один родитель гражданин Германии и живёт с ребёнком в одной семье; ребёнок неженатый и несовершеннолетний", kind: "official" as const }] : []),
    ...(!spouse && !foreign ? [{ label: "Через 3 года", value: "после трёх лет такого вида на жительство можно подать на постоянный (Niederlassungserlaubnis)", kind: "official" as const }] : []),
    ...(skilled && a.parents === "yes" ? [{ label: "Родители специалиста", value: "возможны, если вид на жительство специалиста впервые выдан с 01.03.2024; родители сами обеспечивают жизнь, включая страховку по болезни и уходу; подробности в посольстве или Ausländerbehörde", kind: "official" as const }] : []),
  ];

  const idDocs = ["Онлайн-заявление «Aufenthaltserlaubnis aus familiären Gründen» (только онлайн)", "Цветные копии страниц паспорта; при первом заявлении после въезда ещё штамп въезда и виза", "Копия действующего вида на жительства, если есть"];
  const docs: string[] = [...idDocs,
    ...(spouse ? [foreign ? "Копия паспорта или удостоверения супруга в Германии" : "Копия удостоверения личности или паспорта супруга-гражданина Германии", "Свидетельство о браке или партнёрстве; иностранные документы с заверенным переводом и при необходимости апостилем"] : ["Свидетельство о рождении ребёнка", "Справка из школы, если ребёнок школьного возраста", joint ? "Согласие второго родителя с подписью и копия его паспорта" : "Копия паспорта или удостоверения родителя с единоличной опекой", ...(foreign ? ["Подтверждение права опеки, особенно если один родитель живёт за границей"] : [])]),
    ...(spouse && !skilled ? ["Подтверждение немецкого уровня A1: сертификат A1, Deutschtest für Zuwanderer или итоговый тест интеграционного курса"] : []),
    ...(foreign ? ["Подтверждение дохода: договор, чистая зарплата за 6 месяцев и справка работодателя не старше 14 дней; для самозанятых последнее налоговое решение и Prüfungsbericht", "Договор аренды и подтверждение текущей аренды с отоплением", "Подтверждение немецкой медицинской страховки (карта с двух сторон или справка кассы)"] : []),
    ...(benefit ? ["Решение о пособии из Jobcenter или Sozialamt"] : []),
  ];

  const visaFee: Fact = { label: "Сбор за национальную визу", value: spouse && !foreign ? "супруги граждан Германии освобождены от сбора за национальную визу; остальные случаи решает представительство" : "75 € взрослым и 37,50 € детям до 18 лет по данным посольства Германии; сумму и способ оплаты назначает представительство", kind: "official" };
  const visaTime: Fact = { label: "Срок рассмотрения визы", value: "может занять до трёх месяцев, иногда дольше: нужно согласие ведомства по делам иностранцев", kind: "official" };
  const lea: Step[] = [
    step("Соберите документы", `Файлы в формате PDF, JPG, JPEG или PNG: до 7 МБ каждый и до 100 МБ вместе.${lang && spouse && !skilled ? " Сертификат A1 получите заранее, без него заявление, как правило, не примут." : ""}`, "Выбор", berlin, make),
    ...(lang && spouse && !skilled ? [step("Подготовьте немецкий A1", "Подтверждением служат сертификат A1, Deutschtest für Zuwanderer или итоговый тест интеграционного курса.", "Онлайн", course, berlin)] : []),
    step("Подайте онлайн-заявление и оплатите сбор", "Сбор оплачивается до отправки картой Visa, Mastercard или через PayPal. Сохраните PDF-подтверждение: оно продлевает действие нынешнего документа, если он ещё не истёк и это не виза Schengen C. Нужен действующий адрес электронной почты: LEA пишет только на него.", "Онлайн", berlin),
    step("Дождитесь проверки и приглашения", "LEA проверяет заявление и при необходимости запрашивает документы.", "Ожидание", berlin),
    step(spouse ? "Приходите на приём вдвоём с оригиналами" : "Приходите на приём с ребёнком и оригиналами", spouse ? "Приглашение приходит на обоих супругов: документы перечислены в письме. eAT готов не раньше чем через 4 недели." : "Приглашение приходит на родителя и ребёнка: документы перечислены в письме. eAT готов не раньше чем через 4 недели.", "Лично", berlin),
  ];
  const visaSteps: Step[] = [
    step("Подайте заявление на визу", spouse ? "Визу можно подать онлайн через портал Auslandsportal Министерства иностранных дел (раздел воссоединения с супругом) или в немецком представительстве. Обычно нужны паспорт и подтверждение брака; точный список назовёт представительство. Подавайте заранее: процедура занимает время." : "Визу можно подать онлайн через портал Auslandsportal Министерства иностранных дел (раздел воссоединения с ребёнком) или в немецком представительстве. Если родитель один, нужно согласие второго родителя с правом опеки.", "Онлайн", make, bamf),
    step("Зарегистрируйте адрес после приезда", "Регистрацию в Einwohnermeldeamt (бюро регистрации жителей) делают после заселения.", "Лично", act("Маршрут: Anmeldung", "/berlin/anmeldung")),
  ];
  const visaFreeSteps: Step[] = [step("Въезжайте без визы", "Граждане этих стран въезжают без визы и подают на вид на жительство уже в Берлине, в Ausländerbehörde (ведомство по делам иностранцев).", "Выбор", make, bamf), step("Зарегистрируйте адрес", "Регистрацию в Einwohnermeldeamt делают после заселения: она нужна для заявления.", "Лично", act("Маршрут: Anmeldung", "/berlin/anmeldung"))];
  const steps = needVisa ? [...visaSteps, ...lea] : visaFree ? [...visaFreeSteps, ...lea] : lea;
  const extra: Step[] = skilled && a.parents === "yes" ? [step("Подайте на воссоединение с родителями", "Родители специалиста могут приехать, если вид на жительство специалиста впервые выдан с 01.03.2024 и они сами обеспечивают жизнь, включая страховку по болезни и уходу.", "Выбор", make, bamf)] : [];
  const method: Method = {
    id: "reunion", kind: needVisa ? "combined" : "online",
    title: needVisa ? "Виза для воссоединения, затем заявление в LEA" : "Онлайн-заявление в LEA",
    summary: needVisa ? "Сначала национальная виза, затем вид на жительство в Берлине." : "Заявление в Landesamt für Einwanderung подают только онлайн.",
    availability: "available", availabilityLabel: "Доступно",
    conditions: [spouse ? "Брак или партнёрство юридически действительны" : "Ребёнок несовершеннолетний и не состоит в браке", "Основное место жительства в Берлине, второго жилья недостаточно", "Адрес электронной почты и оплата картой или PayPal"],
    documents: docs, facts: needVisa ? [visaFee, visaTime, ...facts] : facts, steps: [...steps, ...extra],
  };
  const conditional = benefit || lang || lateChild;
  return {
    fit: conditional ? "conditional" : "fits",
    why: [foreign ? "Родственник из страны вне ЕС" : "Родственник гражданин Германии", spouse ? "Супруг или супруга" : "Ребёнок", abroad ? (visaFree ? "Въезд без визы" : "Нужна виза") : "Уже в Германии", ...(foreign ? [skilled ? "Специалист: смягчённые условия" : "Обычные условия", benefit ? "Получают пособия" : "Своё обеспечение"] : []), ...(spouse && !skilled ? [lang ? "A1 пока нет" : "A1 есть"] : []), ...(!spouse ? [joint ? "Опека у обоих" : "Опека у одного"] : [])],
    title: spouse ? "Подайте на вид на жительство для супруга или супруги" : "Подайте на вид на жительство для ребёнка",
    summary: benefit ? "Получение Bürgergeld или Sozialhilfe, как правило, препятствует воссоединению: нужно, чтобы семья обеспечивала себя сама, если не подходит исключение." : lateChild ? "Для ребёнка 16–17 лет, приезжающего позже, нужен немецкий C1 или положительный прогноз интеграции." : lang ? "Для супруга нужен немецкий A1: сначала сертификат, затем заявление." : spouse ? "Условия вашей ситуации выполнены: можно подавать." : "Условия вашей ситуации выполнены: можно подавать.",
    methods: [method],
    singleMethodNote: "Способ один: вид на жительство оформляют через LEA, при необходимости после визы.",
    steps: method.steps,
    next, note: noteText,
  };
}
