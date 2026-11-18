import { currentLocale, translated } from "./i18n/store.ts";
/** Короткие пояснения к немецким терминам. Используется всеми маршрутами. */
export const termExplanations: Array<[RegExp, string]> = [
  [/Online-Ausweisfunktion(?! \()/g, "Online-Ausweisfunktion (онлайн-функция удостоверения личности)"],
  [/Wohnungsgeberbestätigung(?! \()/g, "Wohnungsgeberbestätigung (подтверждение от владельца жилья)"],
  [/Betriebsstätten-Finanzamt(?! \()/g, "Betriebsstätten-Finanzamt (налоговая служба по месту деятельности работодателя)"],
  [/steuerliche Identifikationsnummer(?! \()/g, "steuerliche Identifikationsnummer (личный налоговый идентификатор)"],
  [/Einkommensteuerbescheid(?! \()/g, "Einkommensteuerbescheid (решение по подоходному налогу)"],
  [/Lohnsteuerbescheinigung(?! \()/g, "Lohnsteuerbescheinigung (справка работодателя об удержанном налоге)"],
  [/USt-IdNr\.(?! \()/g, "USt-IdNr. (идентификатор плательщика НДС)"],
  [/W-IdNr\.(?! \()/g, "W-IdNr. (экономический идентификационный номер)"],
  [/Steuernummer(?! \()/g, "Steuernummer (номер дела в налоговой службе)"],
  [/Zulassungsbescheid(?! \()/g, "Zulassungsbescheid (письмо о зачислении)"],
  [/Sonderkündigungsrecht(?! \()/g, "Sonderkündigungsrecht (право на внеочередное расторжение договора)"],
  [/gewöhnlicher Aufenthalt(?! \()/g, "gewöhnlicher Aufenthalt (обычное место пребывания)"],
  [/Versicherungsstatus(?! \()/g, "Versicherungsstatus (страховой статус)"],
  [/Mitgliedsbescheinigung(?! \()/g, "Mitgliedsbescheinigung (подтверждение членства)"],
  [/Mitgliedsantrag(?! \()/g, "Mitgliedsantrag (заявление о вступлении)"],
  [/Mitgliedschaft(?! \()/g, "Mitgliedschaft (членство в больничной кассе)"],
  [/Mitglied werden(?! \()/g, "Mitglied werden (вступить в кассу)"],
  [/Bindungsfrist(?! \()/g, "Bindungsfrist (минимальный срок членства)"],
  [/Immatrikulation(?! \()/g, "Immatrikulation (зачисление в вуз)"],
  [/Zulassung(?![A-Za-zäöüÄÖÜß])(?! \()/g, "Zulassung (допуск к обучению)"],
  [/Geschäftsstellen(?! \()/g, "Geschäftsstellen (отделения)"],
  [/Kontakt(?! \()/g, "Kontakt (контакты)"],
  [/Einkommensteuererklärung(?! \()/g, "Einkommensteuererklärung (декларация о подоходном налоге)"],
  [/Einkommensteuer(?![A-Za-zäöüÄÖÜß])(?! \()/g, "Einkommensteuer (подоходный налог)"],
  [/Wohnsitz(?! \()/g, "Wohnsitz (место жительства)"],
  [/Bescheid(?! \()/g, "Bescheid (официальное решение ведомства)"],
  [/Nachweis(?! \()/g, "Nachweis (подтверждение)"],
  [/Jahresarbeitsentgeltgrenze(?! \()/g, "Jahresarbeitsentgeltgrenze (годовой порог дохода)"],
  [/Versicherungsnachweis(?! \()/g, "Versicherungsnachweis (подтверждение страхования)"],
  [/Prüfung der Versicherungspflicht(?! \()/g, "Prüfung der Versicherungspflicht (проверка обязанности страхования)"],
  [/Versicherungspflicht(?! \()/g, "Versicherungspflicht (обязанность страхования)"],
  [/studentische Pflichtversicherung(?! \()/g, "studentische Pflichtversicherung (обязательное страхование студентов)"],
  [/Familienversicherung(?! \()/g, "Familienversicherung (семейное страхование)"],
  [/Meldebestätigung(?! \()/g, "Meldebestätigung (подтверждение регистрации)"],
  [/Hauptwohnung(?! \()/g, "Hauptwohnung (основное жильё)"],
  [/Nebenwohnung(?! \()/g, "Nebenwohnung (дополнительное жильё)"],
  [/Hauptwohnsitz(?! \()/g, "Hauptwohnsitz (основное место жительства)"],
  [/Meldeadresse(?! \()/g, "Meldeadresse (официальный адрес регистрации)"],
  [/Meldepflicht(?! \()/g, "Meldepflicht (обязанность зарегистрировать адрес)"],
  [/Krankenkasse(?!n)(?! \()/g, "Krankenkasse (больничная касса)"],
  [/Krankenkassen(?! \()/g, "Krankenkassen (больничные кассы)"],
  [/Zusatzbeiträge(?! \()/g, "Zusatzbeiträge (дополнительные страховые взносы)"],
  [/Zusatzbeitrag(?! \()/g, "Zusatzbeitrag (дополнительный страховой взнос)"],
  [/Bundesland(?! \()/g, "Bundesland (федеральная земля)"],
  [/Grundsicherungsgeld(?! \()/g, "Grundsicherungsgeld (основное пособие для нуждающихся, прежнее Bürgergeld)"],
  [/Grundsicherung(?!sgeld)(?! \()/g, "Grundsicherung (базовое социальное обеспечение)"],
  [/Jobcenter(?! \()/g, "Jobcenter (центр занятости и социальных выплат)"],
  [/Bürgeramt(?! \()/g, "Bürgeramt (районное ведомство)"],
  [/Finanzamt(?! \()/g, "Finanzamt (налоговая служба)"],
  [/Reisepass(?! \()/g, "Reisepass (загранпаспорт)"],
  [/Personalausweis(?! \()/g, "Personalausweis (немецкое удостоверение личности)"],
  [/Aufenthaltstitel(?! \()/g, "Aufenthaltstitel (вид на жительство)"],
  [/AusweisApp(?! \()/g, "AusweisApp (официальное приложение для eID)"],
  [/BundID(?! \()/g, "BundID (федеральная учётная запись)"],
  [/Anmeldung(?! \()/g, "Anmeldung (регистрация места жительства)"],
  [/Steuer-ID(?! \()/g, "Steuer-ID (личный налоговый идентификатор)"],
  [/(?<![-A-Za-z])IdNr\.(?! \()/g, "IdNr. (личный налоговый идентификатор)"],
  [/Minijob(?! \()/g, "Minijob (мини-работа)"],
  [/eAT(?! \()/g, "eAT (электронный вид на жительство)"],
  [/eID-карта(?! \()/g, "eID-карта (карта электронной идентификации)"],
  [/eID-карты(?! \()/g, "eID-карты (карты электронной идентификации)"],
  [/eID-карте(?! \()/g, "eID-карте (карте электронной идентификации)"],
  [/eID-карту(?! \()/g, "eID-карту (карту электронной идентификации)"],
  [/eID(?!-карт)(?! \()/g, "eID (электронная идентификация)"],
  [/eGK(?! \()/g, "eGK (электронная медицинская карта)"],
  [/GKV(?! \()/g, "GKV (государственное медицинское страхование)"],
  [/PKV(?! \()/g, "PKV (частное медицинское страхование)"],
  [/PIN(?! \()/g, "PIN (личный код)"],
  [/NFC(?! \()/g, "NFC (бесконтактная связь смартфона)"],
  [/ELStAM(?! \()/g, "ELStAM (электронные данные для удержания подоходного налога из зарплаты)"],
  [/BZSt(?! \()/g, "BZSt (Федеральное центральное налоговое ведомство)"],
  [/EHIC(?! \()/g, "EHIC (европейская карта медицинского страхования)"],
  // Бытовые маршруты (банк, связь, собака, врач, Gewerbe): без флага g объясняется только первое упоминание в тексте.
  [/Basiskonto(?![A-Za-zäöüÄÖÜß])(?! \()/, "Basiskonto (базовый счёт)"],
  [/Girokonto(?![A-Za-zäöüÄÖÜß])(?! \()/, "Girokonto (обычный текущий счёт)"],
  [/BaFin(?![A-Za-zäöüÄÖÜß:])(?! \()/, "BaFin (федеральная служба финансового надзора)"],
  [/Verbraucherzentrale(?![A-Za-zäöüÄÖÜß:])(?! \()/, "Verbraucherzentrale (центр защиты прав потребителей)"],
  [/Bundesnetzagentur(?![A-Za-zäöüÄÖÜß:])(?! \()/, "Bundesnetzagentur (Федеральное сетевое агентство)"],
  [/Videoident(?![A-Za-zäöüÄÖÜß])(?! \()/, "Videoident (проверка личности по видеосвязи)"],
  [/Post[Ii]dent(?![A-Za-zäöüÄÖÜß])(?! \()/, "Postident (проверка личности по документу на почте или в отделении)"],
  [/Fiktionsbescheinigung(?! \()/g, "Fiktionsbescheinigung (временная справка о продолжении законного пребывания)"],
  [/Aufenthaltsgestattung(?! \()/g, "Aufenthaltsgestattung (разрешение на пребывание для просителей убежища)"],
  [/Duldungsbescheinigung(?! \()/g, "Duldungsbescheinigung (справка об отсрочке выдворения)"],
  [/Duldung(?![A-Za-zäöüÄÖÜß])(?! \()/g, "Duldung (отсрочка выдворения)"],
  [/Ankunftsnachweis(?! \()/g, "Ankunftsnachweis (справка о прибытии просителя убежища)"],
  [/Anlaufbescheinigung(?! \()/g, "Anlaufbescheinigung (справка о первом обращении в ведомство)"],
  [/Meldebescheinigung(?! \()/g, "Meldebescheinigung (справка о регистрации по месту жительства)"],
  [/Kostenbescheid(?! \()/g, "Kostenbescheid (письменное уведомление о сумме сбора)"],
  [/Hunderegister(?![A-Za-zäöüÄÖÜß])(?! \()/, "Hunderegister (городской реестр собак)"],
  [/Listenhunde(?![A-Za-zäöüÄÖÜß])(?! \()/, "Listenhunde (собаки из списка опасных пород)"],
  [/Listenhund(?![A-Za-zäöüÄÖÜß])(?! \()/, "Listenhund (собака из списка опасных пород)"],
  [/Hundegesetz(?! \()/, "Hundegesetz (закон о содержании собак)"],
  [/Ordnungsamt(?![A-Za-zäöüÄÖÜß])(?! \()/, "Ordnungsamt (районное ведомство по вопросам порядка)"],
  [/Führungszeugnis(?! \()/, "Führungszeugnis (справка о несудимости)"],
  [/Sachkundebescheinigung(?! \()/, "Sachkundebescheinigung (подтверждение знаний владельца собаки)"],
  [/Sachkunde(?![A-Za-zäöüÄÖÜß])(?! \()/, "Sachkunde (знания владельца собаки)"],
  [/Wesenstest(?! \()/, "Wesenstest (проверка характера собаки)"],
  [/Schlichtungsstelle(?! \()/, "Schlichtungsstelle (внесудебное посредничество)"],
  [/ELSTER(?![A-Za-zäöüÄÖÜß])(?! \()/, "ELSTER (электронный налоговый кабинет)"],
  [/ServicePortal(?![A-Za-zäöüÄÖÜß:])(?! \()/, "ServicePortal (официальный портал услуг Берлина)"],
  [/SEPA-списание(?! \()/, "SEPA-списание (автоматическое списание со счёта)"],
  // Транспорт, культурные льготы и пособия (30.10.2026): поясняется первое вхождение в тексте.
  [/(?<![A-Za-zÄÖÜäöüß-])Wertmarke(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Wertmarke (жетон к удостоверению инвалидности для бесплатного проезда)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Merkzeichen B(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Merkzeichen B (отметка в удостоверении о праве на сопровождающего)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Schwerbehindertenausweis(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Schwerbehindertenausweis (удостоверение тяжёлой инвалидности)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Leistungsbescheid(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Leistungsbescheid (решение о назначении пособия)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Leistungsnachweis(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Leistungsnachweis (справка о получении пособия)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Schülerausweis I(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Schülerausweis I (школьное удостоверение для проездного)"],
  [/(?<![A-Za-zÄÖÜäöüß-])VBB-fahrCard(?![A-Za-zÄÖÜäöüß-])(?! \()/, "VBB-fahrCard (электронная проездная карта VBB)"],
  [/(?<![A-Za-zÄÖÜäöüß-])VBB-Kundenkarte(?![A-Za-zÄÖÜäöüß-])(?! \()/, "VBB-Kundenkarte (именная карта клиента VBB)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Credit Points(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Credit Points (учебные баллы)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Berechtigungsnachweis(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Berechtigungsnachweis (подтверждение права на льготу)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Bedarfsgemeinschaft(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Bedarfsgemeinschaft (люди, которые получают пособие вместе как одно домохозяйство)"],
  [/(?<![A-Za-zÄÖÜäöüß-])AsylbLG(?![A-Za-zÄÖÜäöüß-])(?! \()/, "AsylbLG (пособие для просителей убежища)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Bürgergeld(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Bürgergeld (прежнее основное пособие, теперь Grundsicherungsgeld)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Sozialhilfe(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Sozialhilfe (социальная помощь)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Wohngeld(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Wohngeld (жилищная доплата)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Deutschlandticket Job(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Deutschlandticket Job (Deutschlandticket со взносом работодателя)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Jobticket(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Jobticket (проездной со скидкой через работодателя)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Bürgerämter(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Bürgerämter (районные ведомства по регистрации и документам)"],
  [/(?<![A-Za-zÄÖÜäöüß-])GdB(?![A-Za-zÄÖÜäöüß-])(?! \()/, "GdB (степень инвалидности)"],
  [/(?<![A-Za-zÄÖÜäöüß-])ALG I(?![A-Za-zÄÖÜäöüß-])(?! \()/, "ALG I (пособие по безработице)"],
  [/(?<![A-Za-zÄÖÜäöüß-])FSJ(?![A-Za-zÄÖÜäöüß-])(?! \()/, "FSJ (добровольный социальный год)"],
  [/(?<![A-Za-zÄÖÜäöüß-])FÖJ(?![A-Za-zÄÖÜäöüß-])(?! \()/, "FÖJ (добровольный экологический год)"],
  [/(?<![A-Za-zÄÖÜäöüß-])BFD(?![A-Za-zÄÖÜäöüß-])(?! \()/, "BFD (федеральная добровольная служба)"],
  // Переезд и визы из страны исхода (31.10.2026): поясняется первое вхождение в тексте.
  [/(?<![A-Za-zÄÖÜäöüß-])Sperrkonto(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Sperrkonto (заблокированный счёт для подтверждения средств)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Verpflichtungserklärung(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Verpflichtungserklärung (обязательство другого человека покрыть ваши расходы)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Vorabzustimmung(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Vorabzustimmung (предварительное согласие Bundesagentur für Arbeit)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Auslandsportal(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Auslandsportal (портал Auswärtiges Amt для онлайн-заявлений на визу)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Einsatzstelle(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Einsatzstelle (место прохождения службы)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Anerkennungspartnerschaft(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Anerkennungspartnerschaft (признание диплома в ходе работы у работодателя)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Anerkennungsbescheid(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Anerkennungsbescheid (решение о признании диплома)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Erklärung zum Beschäftigungsverhältnis(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Erklärung zum Beschäftigungsverhältnis (анкета работодателя о должности и условиях)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Arbeitszeugnisse(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Arbeitszeugnisse (письменные отзывы работодателей)"],
  [/(?<![A-Za-zÄÖÜäöüß-])Westbalkanregelung(?![A-Za-zÄÖÜäöüß-])(?! \()/, "Westbalkanregelung (квота на работу для граждан стран Западных Балкан)"],
];

/** Поясняет термин только вне скобок: так в тексте не появляются вложенные скобки. Негловальные шаблоны поясняют только первое вхождение. */
function applyGlossary(text: string, replacementFor: (replacement: string) => string | null) {
  return termExplanations.reduce((result, [pattern, replacement]) => {
    const isGlobal = pattern.flags.includes("g");
    let done = false;
    return result.replace(new RegExp(pattern.source, isGlobal ? pattern.flags : `${pattern.flags}g`), (match: string, ...args: unknown[]) => {
      const offset = args[args.length - 2] as number;
      const source = args[args.length - 1] as string;
      const before = source.slice(0, offset);
      const depth = (before.match(/\(/g)?.length ?? 0) - (before.match(/\)/g)?.length ?? 0);
      if (depth > 0 || (!isGlobal && done)) return match;
      const localized = replacementFor(replacement);
      if (localized === null) return match;
      done = true;
      return localized;
    });
  }, text);
}

/**
 * Пояснения к немецким терминам. На русском берутся пояснения из списка выше.
 * На другом языке сначала переводится сам текст, а пояснение подставляется переведённое;
 * если перевода пояснения нет, термин остаётся без него, а не с русским текстом.
 */
export function explainTerms(text: string) {
  if (currentLocale() === "ru") return applyGlossary(text, (replacement) => replacement);
  // Текст мог быть переведён заранее (данные маршрута) или переводится здесь.
  return applyGlossary(translated(text) ?? text, (replacement) => translated(replacement));
}
