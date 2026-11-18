/**
 * Дата последней сверки каждого маршрута с его официальными страницами (спецификация TIME-07,
 * PROJECT_SPEC.md, «Актуальность информации»). Одно место для всех маршрутов: отсюда дату берут
 * страницы маршрутов, сводка и отчёт об актуальности (scripts/sources-extract.mjs → worker/route-sources.json).
 *
 * Дата меняется только после фактической сверки всего маршрута по официальным источникам
 * (docs/SOURCE_POLICY.md, п. 4). Формат — как на странице: «19 октября 2026».
 */
export const routeCheckedAt = {
  anmeldung: "30 октября 2026",
  "tax-id": "30 октября 2026",
  health: "30 октября 2026",
  doctor: "19 октября 2026",
  urgent: "19 октября 2026",
  business: "19 октября 2026",
  bank: "19 октября 2026",
  telecom: "19 октября 2026",
  dog: "5 ноября 2026",
  wbs: "19 октября 2026",
  lea: "19 октября 2026",
  housing: "19 октября 2026",
  kindergeld: "19 октября 2026",
  jobcenter: "19 октября 2026",
  kita: "19 октября 2026",
  employment: "19 октября 2026",
  elterngeld: "19 октября 2026",
  kinderzuschlag: "19 октября 2026",
  steuererklaerung: "19 октября 2026",
  elternzeit: "19 октября 2026",
  wohngeld: "19 октября 2026",
  mutterschutz: "19 октября 2026",
  bildungspaket: "19 октября 2026",
  pflegegeld: "19 октября 2026",
  schwerbehinderung: "19 октября 2026",
  wohnungsgeber: "19 октября 2026",
  umzug: "19 октября 2026",
  arbeitslosengeld: "19 октября 2026",
  grundsicherungsgeld: "19 октября 2026",
  kfz: "19 октября 2026",
  einbuergerung: "19 октября 2026",
  workpermit: "20 октября 2026",
  recognition: "20 октября 2026",
  language: "20 октября 2026",
  reunion: "21 октября 2026",
  sprachkurs: "29 октября 2026",
  study: "29 октября 2026",
  petmove: "5 ноября 2026",
  petpass: "5 ноября 2026",
  vet: "5 ноября 2026",
  dogtrainer: "5 ноября 2026",
  transport: "12 ноября 2026",
  culture: "30 октября 2026",
  relocation: "31 октября 2026",
  chancenkarte: "31 октября 2026",
  workvisa: "31 октября 2026",
  volunteer: "31 октября 2026",
  studyvisa: "31 октября 2026",
  company: "12 ноября 2026",
  socialnumber: "12 ноября 2026",
  settlement: "12 ноября 2026",
  notary: "12 ноября 2026",
  mental: "18 ноября 2026",
} as const;

export type CheckedRouteId = keyof typeof routeCheckedAt;

/**
 * Через сколько дней маршрут без изменений на официальных страницах всё равно сверяется заново.
 * Цены и условия банков, касс и провайдеров меняются чаще, чем правила ведомств.
 */
export const DEFAULT_REVIEW_DAYS = 60;
export const routeReviewDays: Partial<Record<CheckedRouteId, number>> = { bank: 30, telecom: 30, health: 30, vet: 30, transport: 7, culture: 30, chancenkarte: 30, volunteer: 30, studyvisa: 30 };

const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

/** «19 октября 2026» → «2026-10-19». */
export function isoDate(russian: string): string {
  const match = /^(\d{1,2}) (\S+) (\d{4})$/.exec(russian.trim());
  const month = match ? MONTHS.indexOf(match[2]) : -1;
  if (!match || month < 0) throw new Error(`Неверная дата сверки: ${russian}`);
  return `${match[3]}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

/**
 * Изменения отдельных официальных страниц, которые уже проверены: страница сверена с утверждениями маршрута
 * (и при необходимости маршрут исправлен), но весь маршрут заново не сверялся, поэтому его общая дата не меняется.
 * События мониторинга по этой странице до указанного момента (UTC) отчёт об актуальности больше не показывает.
 * Запись добавляется только после фактического чтения страницы; в комментарии — что проверено.
 */
export const sourceReviewedAt: Record<string, string> = {
  // Basiskonto: 27,83 € в 2023, форма и онлайн-доступ, украинские документы, бесплатная процедура BaFin совпадают (перепроверено 2026-11-16, Stand 11.07.2025).
  "https://www.verbraucherzentrale.de/wissen/geld-versicherungen/sparen-und-anlegen/das-recht-auf-ein-basiskonto-fuer-neu-in-deutschland-angekommene-12224": "2026-11-16T07:50Z",
  // N26: 18 лет, страна проживания, смартфон, документ, 0 €, карта 10 €, «in wenigen Minuten» совпадают; адрес без переадресации (перепроверено 2026-11-12).
  "https://n26.com/de-de/konto-eroeffnen": "2026-11-12T12:14Z",
  // Vivid: 18 лет, без отделения, счёт готов после регистрации — совпадает (перепроверено 2026-11-16).
  "https://support.vivid.money/en/articles/8460178-how-can-i-open-an-account": "2026-11-16T07:50Z",
  // AOK Nordost Berlin: онлайн-сервисы, контактная форма, поиск сервисных центров — совпадает.
  "https://www.aok.de/pk/nordost/region/berlin/": "2026-10-29T16:46Z",
  // BAMF: 2,29 €/час, 1.603 €, возврат половины, повтор 300 часов; допуск по § 44 Abs. 4 добавлен для ЕС и ВНЖ до 2005 года.
  "https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Integrationskurse/TeilnahmeKosten/EU-Buerger/eu-buerger-node.html": "2026-10-29T16:46Z",
  "https://www.bamf.de/DE/Themen/Integration/TraegerLehrFachkraefte/TraegerIntegrationskurse/Organisatorisches/TeilnahmeKosten/Auslaender/auslaender.html?nn=282656": "2026-10-29T16:46Z",
  // Willkommenszentrum: ведомства, консультации на русском и украинском, телефоны и часы — совпадает.
  "https://willkommenszentrum.berlin.de/en/work-education/recognition-international-qualifications": "2026-10-29T16:46Z",
  // Blue Card (та же услуга 324659): пороги 2026, согласие BA, онлайн, файлы, сборы, eAT 4–6 недель — совпадает.
  "https://service.berlin.de/dienstleistung/324659/standort/327805/": "2026-10-29T16:46Z",
  // Commerzbank Basiskonto (открыта в Chrome): 6,90 €/мес., порядок «форма → запись → документы → проверка в отделении → письменное решение» совпадает; сроки онлайн-открытия на странице отсутствуют — факт исправлен.
  "https://www.commerzbank.de/privatkunden/girokonten/basiskonto/": "2026-10-29T17:20Z",
  // Ausbildung: B1 обычно требуется, если учреждение не проверило немецкий и подготовительный курс не предусмотрен (§ 16a Abs. 3: «erworben werden sollen»); суммы 2026 и 20 часов подтверждены.
  "https://www.make-it-in-germany.com/de/visum-anerkennung/visaarten/berufsausbildung": "2026-11-05T11:30Z",
  // Fachkräftevisum: регулируемая профессия требует Berufsausübungserlaubnis к выдаче Aufenthaltserlaubnis (§ 18 Abs. 2 Nr. 3: выдана или zugesagt).
  "https://www.make-it-in-germany.com/en/visa-recognition/visa-types/qualified-professionals": "2026-11-05T11:30Z",
  // Auslandsportal: 28 долгосрочных целей, все визовые отделы подключены, лично всё ещё нужны биометрия и оригиналы.
  "https://www.auswaertiges-amt.de/en/visa-service/consular-services-portal": "2026-11-05T11:30Z",
  // ESC: регистрация с 17, начало с 18, предел 30 лет; 35 лет — только гуманитарное волонтёрство в третьих странах.
  "https://youth.europa.eu/solidarity/young-people/about_en": "2026-11-05T11:30Z",
  // FSJ/FÖJ: Vollzeitschulpflicht должна быть завершена, к окончанию службы нельзя достичь 27 лет; волонтёры из-за рубежа допускаются.
  "https://www.jugendfreiwilligendienste.de/jugendfreiwilligendienste/service/faq": "2026-11-05T11:30Z",
  // BFD: возрастного предела нет, но обязательное школьное обучение должно быть завершено; несовершеннолетние могут участвовать.
  "https://www.bundesfreiwilligendienst.de/bundesfreiwilligendienst/fragen-antworten": "2026-11-05T11:30Z",
  // § 18 Abs. 2 Nr. 3 AufenthG: Berufsausübungserlaubnis «erteilt wurde oder zugesagt ist, soweit diese erforderlich ist».
  "https://www.gesetze-im-internet.de/aufenthg_2004/__18.html": "2026-11-05T17:05Z",
  // ESC Humanitarian Aid Volunteering: 18–35 лет, только в третьих странах с гуманитарными операциями (вне ЕС).
  "https://youth.europa.eu/solidarity/young-people/volunteering-humanitarian-aid_en": "2026-11-05T17:05Z",
  // Auswärtiges Amt in Australien: Australian citizens may apply up to 35 from 01.10.2026; mission route linked for ages 31–35; residents of Australia apply at the Consulate General in Sydney.
  "https://australien.diplo.de/au-en/service/visa/working-holiday-2640582": "2026-11-05T11:43Z",
  // German Missions in Canada: Youth Mobility eligibility is 18–35 inclusive at application; Canadian residents apply at the Consulate General in Toronto.
  "https://canada.diplo.de/ca-en/consular-services/visa/working-holiday-2653142": "2026-11-05T11:43Z",
  // Berlin LEA: in-country method and age bands; Australia still listed as 18–30, so not offered in Berlin for ages 31–35; Japan: online application not yet possible, contact form of Referat F 1 (rechecked 2026-11-05T18:40Z).
  "https://service.berlin.de/dienstleistung/305265/": "2026-11-05T11:43Z",
  // Еженедельная сверка 2026-11-12 (страницы прочитаны, факты маршрутов совпадают):
  // Berliner Sparkasse, Entgeltinformation Giro Digital Basiskonto (Datum 01.11.2026): 4,95 € в месяц — совпадает.
  "https://www.berliner-sparkasse.de/content/dam/myif/berliner-sk/work/dokumente/pdf/preise-leistungen/entgeltinformation-giro-digital-basis.pdf?n=true": "2026-11-12T12:14Z",
  // BaFin: адрес отдаёт страницу формы «Antrag auf Durchführung eines Verwaltungsverfahrens bei Ablehnung … Basiskontovertrags» со ссылкой на PDF — назначение совпадает.
  "https://www.bafin.de/SharedDocs/Downloads/DE/Formular/dl_fo_basiskonto_antrag_verwaltungsverfahren.pdf?__blob=publicationFile&v=1": "2026-11-12T12:14Z",
  // 116117: адрес открывает «Arzt- und Psychotherapeutensuche» (не главную), языки портала совпадают; фильтр строится скриптом и не проверен (перепроверено 2026-11-16: страница открывается, 10 языков интерфейса).
  "https://arztsuche.116117.de/pages/arztsuche.xhtml": "2026-11-16T07:50Z",
  // Anmeldung: 14 дней, онлайн с BundID и eID (с 18 лет, переезд внутри Германии, eAT не подходит), документы, «Gebühren: keine», Meldebestätigung — совпадает.
  "https://service.berlin.de/dienstleistung/120686/": "2026-11-12T12:14Z",
  // EWA: 4 шага, 10 + 5 минут, до 3 рабочих дней, бесплатно (Aktualisierung 01.11.2026) — совпадает.
  "https://serviceportal.gemeinsamonline.de/Onlinedienste/Service/Entry/EWA": "2026-11-12T12:14Z",
  // PIN: шестизначный, бесплатно, можно сменить самому в AusweisApp; активация в любом Bürgeramt без записи — совпадает.
  "https://service.berlin.de/dienstleistung/329833/": "2026-11-12T12:14Z",
  // eID-карта ЕС/ЕЭЗ: 37 €, 3–4 недели, только лично — совпадает.
  "https://service.berlin.de/dienstleistung/330112/": "2026-11-12T12:14Z",
  // BundID: учётная запись для онлайн-услуг, вход через Online-Ausweis и другие способы — совпадает.
  "https://service.berlin.de/nutzerkonten/bundid/": "2026-11-12T12:14Z",
  // Verbraucherzentrale, смена провайдера (Stand 14.11.2024): не дольше рабочего дня, 20 % или 10 €, 10 € в день за номер — совпадает.
  "https://www.verbraucherzentrale.de/wissen/digitale-welt/mobilfunk-und-festnetz/telefon-oder-internetanbieterwechsel-hoechstens-ein-tag-ohne-leitung-11248": "2026-11-12T12:14Z",
  // Verbraucherzentrale, права клиентов (Stand 17.04.2026): 24 месяца, месяц уведомления, 15/5 Мбит/с и 150 мс, компенсации, изменение условий — совпадает.
  "https://www.verbraucherzentrale.de/wissen/digitale-welt/mobilfunk-und-festnetz/wichtige-kundenrechte-fuer-telefon-handy-und-internetvertraege-65879": "2026-11-12T12:14Z",
  // o2 HomeSpot: 24,99/34,99 €, 29,99/39,99 €, подключение 9,99 €, 24 месяца — совпадает (перепроверено 2026-11-16).
  "https://www.o2online.de/internet-festnetz/homespot-tarife/": "2026-11-16T07:50Z",
  // o2 DSL: страница тарифов DSL с проверкой адреса — совпадает.
  "https://www.o2online.de/internet-festnetz/dsl-tarife/": "2026-11-12T12:14Z",
  // Bundesnetzagentur: идёт консультация по новой редакции Verfügung (до 07.12.2026), действует Verfügung 94/2021; факты маршрута опираются на § 172 TKG — без изменений.
  "https://www.bundesnetzagentur.de/DE/Fachthemen/Telekommunikation/OeffentlicheSicherheit/IdentverfahrenPrepaid/artikel.html": "2026-11-12T12:14Z",
  // HWR Berlin: C1 для программ на немецком, DSH-2, TestDaF TDN 4, Feststellungsprüfung, Goethe C2, telc C1 Hochschule; английский или французский — совпадает.
  "https://www.hwr-berlin.de/studium/bewerbung/voraussetzungen-fuer-dein-studium": "2026-11-12T12:14Z",
  // DAAD: база International Programmes (обучение в основном на английском), теперь в My GUIDE — совпадает.
  "https://www.daad.de/en/studying-in-germany/advisory-service/international-programmes/": "2026-11-12T12:14Z",
  // Auswärtiges Amt: для пребывания больше трёх месяцев национальная виза в представительстве до въезда — совпадает.
  "https://www.auswaertiges-amt.de/de/service/visa-und-aufenthalt/nationale-visa": "2026-11-12T12:14Z",
  // Транспорт (сверка 2026-11-12 по текстам официальных страниц): Deutschlandticket 63 € (с 1.1.2027 — 66,80 €), Deutschlandticket Job 59,85 € / 44,10 €, Deutschlandsemesterticket — 60% — совпадает.
  "https://www.vbb.de/abonnements/deutschlandticket/erwerbsmoeglichkeiten-und-nutzung/": "2026-11-12T17:06Z",
  // Berlin-Ticket S: 27,50 € (в 2027 году без изменений), только Berlin AB, не абонемент, список пособий — совпадает.
  "https://www.vbb.de/tickets/monatskarten/berlin-ticket-s/": "2026-11-12T17:06Z",
  // Monatskarte Ausbildung: Berlin AB 74,10 € / 55,40 € по абонементу, с 1.1.2027 — 76,90 € / 57,50 €; 15 Credit Points — совпадает.
  "https://www.vbb.de/tickets/monatskarten/monatskarte-ausbildung/": "2026-11-12T17:06Z",
  // Deutschlandticket Zuschuss Ausbildung: 37,80 €, 22,05 € взноса работодателя, 20 часов и 12 месяцев, Berechtigungsnachweis не старше 30 дней — совпадает.
  "https://www.vbb.de/abonnements/ausbildung/deutschlandticket-zuschuss-ausbildung/": "2026-11-12T17:06Z",
  // Еженедельная сверка 2026-11-16 (страницы прочитаны):
  // BMG, взносы (Stand 03.09.2026): Jahresarbeitsentgeltgrenze 77.400 € в 2026 году, взносы пополам с работодателем — совпадает.
  "https://www.bundesgesundheitsministerium.de/beitraege": "2026-11-16T07:50Z",
  // BMG, выбор и смена кассы (Stand 03.09.2026): допустимые кассы, «schnellstmöglich» сообщить работодателю, 12 месяцев Bindungsfrist, Sonderkündigungsrecht — совпадает.
  "https://www.bundesgesundheitsministerium.de/themen/krankenversicherung/online-ratgeber-krankenversicherung/krankenversicherung/wahl-und-wechsel-der-krankenkasse": "2026-11-16T07:50Z",
  // BMG, GKV ↔ PKV (Stand 03.09.2026): ограничения возврата в GKV после 55 лет — совпадает.
  "https://www.bundesgesundheitsministerium.de/themen/krankenversicherung/online-ratgeber-krankenversicherung/krankenversicherung/wechsel-zwischen-gkv-und-pkv": "2026-11-16T07:50Z",
  // gesund.bund.de: страховка обязательна, возврат в прежнюю систему, взносы за период без страховки — совпадает.
  "https://gesund.bund.de/en/krankenversicherung": "2026-11-16T07:50Z",
  // TK и BARMER: онлайн-заявление; BARMER: форма, чат, поиск отделений — совпадает.
  "https://www.tk.de/techniker/mitglied-werden-2003672": "2026-11-16T07:50Z",
  "https://www.barmer.de/mitglied-werden": "2026-11-16T07:50Z",
  "https://www.barmer.de/persoenliche-beratung": "2026-11-16T07:50Z",
  // DKB Basiskonto: онлайн-форма → печать, подпись, отправка; проверка личности по титульному листу; цены в прейскуранте. Условие исправлено: нет счёта «bei uns oder bei einer anderen Bank».
  "https://www.dkb.de/fragen-antworten/was-muss-ich-zum-basiskonto-wissen": "2026-11-16T07:50Z",
  // Vodafone интернет дома: проверка адреса, 50–1000 Мбит/с, 24 месяца; исправлены цена (от 9,99 € за 50 Мбит/с, от 19,99 € за 100–1000) и роутер (0 € по акции на 24 месяца).
  "https://www.vodafone.de/privat/internet.html": "2026-11-16T07:50Z",
};
