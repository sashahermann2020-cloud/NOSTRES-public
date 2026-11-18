export type Answers = Record<string, string>;
export type Action = { label: string; href: string };
export type Step = { title: string; detail: string; mode: "Онлайн" | "Лично" | "Ожидание"; action?: Action; source: Action };
export type Plan = { title: string; summary: string; supported: boolean; steps: Step[]; note?: string };

export const official = {
  directory: "https://www.berlin.de/einwanderung/termine/unsere-dienstleistungen/artikel.873508.php",
  contact: "https://www.berlin.de/einwanderung/ueber-uns/kontakt/artikel.1394180.php",
  appointments: "https://www.berlin.de/einwanderung/termine/termin-vereinbaren/",
  offices: "https://www.berlin.de/einwanderung/ueber-uns/unsere-standorte/",
  fiction: "https://service.berlin.de/dienstleistung/326233/",
  eu: "https://www.berlin.de/einwanderung/aufenthalt/freizuegigkeit-eu-ewr-schweiz/",
  schengen: "https://service.berlin.de/dienstleistung/324785/",
  work: "https://service.berlin.de/dienstleistung/329328/",
  workForm: "https://liste-antraege-bc01.bda.service.berlin.de/intelliform/forms/default/bda/LEA/Befristeter_Aufenthaltstitel_zur_Beschaeftigung/index?parameter=329328",
  study: "https://service.berlin.de/dienstleistung/305244/",
  studyForm: "https://liste-antraege-bc01.bda.service.berlin.de/intelliform/forms/default/bda/LEA/Aufenthaltserlaubnis_Studium/index",
  spouse: "https://service.berlin.de/dienstleistung/305289/",
  spouseForm: "https://liste-antraege-bc01.bda.service.berlin.de/intelliform/forms/default/bda/LEA/Aufenthaltserlaubnis_aus_familiaeren_Gruenden/index",
  humanitarian: "https://service.berlin.de/dienstleistung/324859/",
  humanitarianForm: "https://liste-antraege-bc01.bda.service.berlin.de/intelliform/forms/default/bda/LEA/Aufenthaltserlaubnis_aus_humanitaeren_Gruenden_Verlaengerung/index",
  ukraine: "https://service.berlin.de/dienstleistung/330875/",
  employerChange: "https://service.berlin.de/dienstleistung/326856/",
};

export const questions = [
  { id: "city", prompt: "Где находится ваш основной зарегистрированный адрес?", options: [["berlin", "В Берлине"], ["elsewhere", "Не в Берлине"], ["uncertain", "Пока не знаю"]] },
  { id: "document", prompt: "Какой документ у вас сейчас?", options: [["valid", "Действующий вид на жительство"], ["dvisa", "Действующая национальная виза D"], ["expired", "Срок вида на жительство уже истёк"], ["schengen", "Шенгенская виза C"], ["eu", "Гражданство ЕС / ЕЭЗ / Швейцарии"], ["other", "Другой документ или пока не знаю"]] },
  { id: "goal", prompt: "Что нужно сделать?", options: [["extend", "Продлить проживание на прежнем основании"], ["first", "Получить первый вид на жительство"], ["change", "Поменять основание или работодателя"], ["uncertain", "Пока не знаю"]] },
  { id: "basis", prompt: "Что указано как основание нынешнего вида на жительство?", options: [["work", "Квалифицированная работа с высшим образованием (§ 18b)"], ["study", "Учёба в вузе (§ 16b)"], ["spouse", "Супруг или супруга иностранца с ВНЖ (§ 30)"], ["humanitarian", "Гуманитарное основание (§§ 22, 23, 23a, 25, 25a, 25b)"], ["ukraine", "Временная защита (§ 24)"], ["other", "Другое основание или не знаю параграф"]] },
] as const;

export function visibleQuestions(answers: Answers) {
  if (answers.city !== "berlin") return questions.slice(0, 1);
  if (answers.document !== "valid") return questions.slice(0, 2);
  if (answers.goal !== "extend") return questions.slice(0, 3);
  return questions;
}

type Supported = { title: string; service: string; form: string; timing: string; preparation: string; presence: string; production: string };
const supported: Record<string, Supported> = {
  work: { title: "Продление ВНЖ для квалифицированной работы с высшим образованием", service: official.work, form: official.workForm, timing: "Онлайн-заявление можно подать не раньше чем за четыре месяца до окончания действующего документа. Отправьте его до истечения срока.", preparation: "Проверьте в перечне услуги требования к паспорту, трудовому договору, подтверждению занятости, жилью и медицинской страховке. Файлы PDF, JPG, JPEG или PNG: до 7 МБ каждый и до 100 МБ вместе. Перед отправкой предусмотрена оплата картой или PayPal, если нет освобождения от сбора.", presence: "После проверки LEA пришлёт приглашение. Возьмите оригиналы документов, перечисленных в приглашении; адрес и время будут в нём. Самостоятельно выбирать слот в прежнем календаре LEA не нужно.", production: "Изготовление электронного вида на жительство (eAT) после приёма обычно занимает 4–6 недель; время до приглашения отдельно не указано." },
  study: { title: "Продление ВНЖ для учёбы в вузе", service: official.study, form: official.studyForm, timing: "Онлайн-заявление можно подать не раньше чем за четыре месяца до окончания действующего документа. Отправьте его до истечения срока.", preparation: "Проверьте список услуги: паспорт, подтверждение учёбы, средства на жизнь и медицинскую страховку по вашему случаю. Файлы PDF, JPG, JPEG или PNG: до 7 МБ каждый и до 100 МБ вместе. Оплата перед отправкой картой или PayPal, если нет освобождения от сбора.", presence: "После проверки LEA пришлёт приглашение с местом, временем и списком оригиналов. Личный приём следует после онлайн-заявления.", production: "Изготовление электронного вида на жительство (eAT) после приёма обычно занимает 4–6 недель; ожидание приглашения не входит в этот срок." },
  spouse: { title: "Продление ВНЖ супругу или супруге иностранца с ВНЖ", service: official.spouse, form: official.spouseForm, timing: "Подайте заявление, пока ваш нынешний вид на жительство действителен. Страница услуги не указывает единого раннего срока для этого случая.", preparation: "Полный перечень: паспорта обоих супругов, свидетельство о браке, подтверждения дохода, жилья и страховки; переводы или апостиль могут потребоваться по документу. Файлы PDF, JPG, JPEG или PNG: до 7 МБ каждый и до 100 МБ вместе. Форму можно сохранить и продолжить позже; оплата перед отправкой, если нет освобождения.", presence: "После проверки LEA пригласит на совместный личный приём обоих супругов. Возьмите оригиналы из приглашения; адрес и время сообщит ведомство.", production: "После личного приёма изготовление электронного вида на жительство занимает не менее четырёх недель; срок ожидания приглашения не указан." },
  humanitarian: { title: "Продление ВНЖ по перечисленным гуманитарным основаниям", service: official.humanitarian, form: official.humanitarianForm, timing: "Для этой услуги заявление допускается не раньше чем за восемь недель до истечения срока. § 24 (временная защита) здесь не рассматривается.", preparation: "На странице услуги указаны применимость именно вашего параграфа и перечень документов. Файлы PDF, JPG, JPEG или PNG: до 7 МБ каждый и до 100 МБ вместе. Для каждого члена семьи нужно отдельное заявление. Возможный сбор LEA определит после проверки.", presence: "После рассмотрения LEA при необходимости пригласит лично с оригиналами документов; адрес и время будут в приглашении.", production: "Если выдаётся электронный вид на жительство, изготовление после приёма обычно занимает 4–6 недель; рассмотрение до приглашения в этот срок не входит." },
};

function referral(title: string, summary: string, action: Action, note?: string): Plan {
  return { title, summary, supported: false, note, steps: [{ title: "Откройте подходящую официальную услугу", detail: "Найдите на сайте Берлина услугу с названием и условиями вашего случая. Затем перейдите к действию, указанному на странице именно вашего случая. Не отправляйте заявление по похожему, но другому основанию.", mode: "Онлайн", action, source: action }] };
}

export function planFor(answers: Answers): Plan {
  if (answers.city !== "berlin") return referral("Сначала определите ответственное ведомство", "LEA ведёт дела, относящиеся к Берлину. Для другого основного адреса понадобится ведомство по месту жительства; если адрес ещё не определён, сначала определите его.", { label: "Правила LEA и список услуг Берлина", href: official.directory });
  if (answers.document === "eu") return referral("Для граждан ЕС действует другой порядок", "Гражданам ЕС, ЕЭЗ и Швейцарии обычно не требуется продлевать немецкий вид на жительство по этому маршруту. Правила для членов семьи с другим гражданством отличаются.", { label: "Открыть правила свободного передвижения", href: official.eu });
  if (answers.document === "schengen") return referral("Шенгенская виза C: отдельная процедура", "Обычная заявка на ВНЖ не продлевает срок пребывания по шенгенской визе. Продление самой визы допускается только в исключительных случаях.", { label: "Открыть официальную услугу для визы C", href: official.schengen }, "Не рассчитывайте, что онлайн-заявка на ВНЖ создаст право оставаться после окончания визы C.");
  if (answers.document === "expired") return referral("Срок документа уже истёк: нужен отдельный разбор LEA", "Подтверждение обычной онлайн-заявки не восстанавливает автоматически истёкший документ. Обратитесь в ответственное подразделение LEA, указав фактический статус и дату окончания.", { label: "Найти контактное подразделение LEA", href: official.contact }, "Не обещаем Fiktionsbescheinigung (справку о временном сохранении статуса) при заявлении после истечения срока.");
  if (answers.document === "dvisa") return referral("С действующей национальной визой D выберите услугу по цели пребывания", "Если планируете оставаться дольше срока визы, LEA советует подать заявление во время её действия, обычно за шесть–восемь недель до конца 12-месячной визы. Первый ВНЖ по визе D: не продление уже выданного ВНЖ; выберите услугу по цели пребывания.", { label: "Найти услугу для своего основания", href: official.directory });
  if (answers.document !== "valid") return referral("Определите тип документа перед заявлением", "Выпишите название и параграф с документа. У разных виз, карт и временных справок различаются правила продления.", { label: "Найти услугу в каталоге LEA", href: official.directory });
  if (answers.goal === "change") return referral("Смена основания или работодателя: другая услуга", "При смене работодателя может подходить отдельная процедура; при смене основания выберите соответствующую услугу в каталоге. Не подавайте продление старого основания автоматически.", { label: "Проверить смену работодателя", href: official.employerChange }, "Если меняется само основание проживания, используйте каталог услуг LEA.");
  if (answers.goal !== "extend") return referral("Выберите услугу по цели обращения", "Первое получение и продление по прежнему основанию могут вести к разным требованиям. Выберите свою услугу по названию и проверьте раздел «Онлайн-оформление».", { label: "Открыть каталог услуг LEA", href: official.directory });
  if (answers.basis === "ukraine") return referral("Временная защита (§ 24): отдельная услуга", "Общие правила гуманитарного продления не относятся к § 24. Проверьте действующие условия и порядок на отдельной официальной странице.", { label: "Открыть официальную услугу § 24", href: official.ukraine });
  const config = supported[answers.basis];
  if (!config) return referral("Найдите услугу для вашего параграфа", "Параграф текущего документа определяет применимую форму. Не выбирайте похожую форму наугад.", { label: "Открыть полный список услуг LEA", href: official.directory });
  const source = { label: "ServicePortal Berlin: условия, документы и срок", href: config.service };
  return {
    title: config.title,
    summary: "Сначала проверьте требования, затем отправьте заявление онлайн. После проверки ведомство само пригласит на личный приём, если он требуется. Вся процедура не завершается одним онлайн-экраном.",
    supported: true,
    note: "PDF-подтверждение сохраните. Для действующего ВНЖ при своевременной подаче оно подтверждает продолжение статуса в Германии по условиям LEA; международные поездки проверяйте отдельно. При шенгенской визе C или уже истёкшем документе это правило не действует.",
    steps: [
      { title: "Проверьте срок и список документов", detail: `${config.timing} ${config.preparation}`, mode: "Онлайн", action: { label: "Проверить условия этой услуги", href: config.service }, source },
      { title: "Отправьте официальное заявление", detail: "Откройте форму LEA, заполните поля и загрузите документы. Если для вашей услуги предусмотрена оплата, завершите её перед отправкой. Сохраните итоговое PDF-подтверждение; это ваш след подачи, а не готовый новый ВНЖ.", mode: "Онлайн", action: { label: "Перейти прямо к онлайн-форме", href: config.form }, source },
      { title: "Дождитесь проверки и ответа LEA", detail: "Проверяйте почту и папку спама. LEA может запросить дополнительные документы или прислать приглашение. Фиксированного срока ожидания приглашения на странице услуги нет. Старый календарь самостоятельной записи LEA закрыт.", mode: "Ожидание", action: { label: "Как LEA назначает приём", href: official.appointments }, source: { label: "LEA: актуальный порядок записи", href: official.appointments } },
      { title: "Придите на назначенный приём", detail: `${config.presence} Не приезжайте без приглашения. Посмотрите адрес из письма и проверяйте его по официальному перечню отделений.`, mode: "Лично", action: { label: "Проверить адреса отделений LEA", href: official.offices }, source },
      { title: "Получите итоговый документ", detail: `${config.production} Следуйте инструкции LEA из письма о получении. Если решение отрицательное или не хватает документа, ориентируйтесь на конкретное письмо ведомства и срок, указанный в нём.`, mode: "Лично", source },
    ],
  };
}
