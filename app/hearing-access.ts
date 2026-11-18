/**
 * Блок «Люди с нарушением слуха» (решение владельца 18.11.2026, PROJECT_SPEC.md «Состояния интерфейса и доступность»).
 * Показывается в маршрутах, где нужен визит или звонок; в каждом маршруте – только нужные части.
 * Все факты с официальных страниц, сверенных 18 ноября 2026 года.
 */
export type HearingLink = { label: string; href: string };
export type HearingItem = { id: string; title: string; text: string; links: HearingLink[] };

export const hearingSources = {
  lgbg: "https://sozialrecht.berlin.de/kategorie/rechtsvorschriften/rv-lgbg-573403.html",
  lgbgBerlin: "https://www.berlin.de/sen/soziales/besondere-lebenssituationen/menschen-mit-behinderung/behindertenpolitik/landesgleichberechtigungsgesetz/",
  khv: "https://www.gesetze-im-internet.de/khv/BJNR265000002.html",
  sgb1: "https://www.gesetze-im-internet.de/sgb_1/__17.html",
  relay: "https://www.bundesnetzagentur.de/DE/Fachthemen/Telekommunikation/Unternehmenspflichten/VermittlungsdienstfuerGehoerlose/start.html",
  relayNews: "https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20250228_hoergeloseM.html",
  chat116117: "https://www.116117.de/de/gehoerlosenchat.php",
  sign116117: "https://www.116117.de/de/gebaerdensprache.php",
  fire: "https://www.berliner-feuerwehr.de/ihre-sicherheit/im-notfall/fuer-hoer-und-sprachbehinderte/",
  fax: "https://www.berlin.de/polizei/_assets/service/notruffax.pdf",
  nora: "https://www.nora-notruf.de/de-as/was-ist-nora",
  bmgVideo: "https://www.bundesgesundheitsministerium.de/service/begriffe-von-a-z/g/gebaerdentelefon",
};
const s = hearingSources;

export const hearingItems: Record<string, HearingItem> = {
  interpreterBerlin: {
    id: "interpreterBerlin",
    title: "Переводчик в берлинском ведомстве: бесплатно",
    text: "С берлинскими ведомствами, например Bürgeramt и LEA, можно общаться на немецком жестовом языке или через другие средства общения, например письменного переводчика. Расходы несёт ведомство: так установлено берлинским законом о равноправии (LGBG, § 13). Заранее сообщите ведомству, что нужен переводчик и какой: жестового языка или письменный. Ведомство обязано рассказать вам об этом праве.",
    links: [{ label: "Закон Берлина LGBG, § 13", href: s.lgbg }, { label: "Берлин: права по закону LGBG", href: s.lgbgBerlin }],
  },
  interpreterSocial: {
    id: "interpreterSocial",
    title: "Переводчик для пособий и у врача: бесплатно",
    text: "Когда вы получаете социальные выплаты или услуги, например в Jobcenter, Agentur für Arbeit или больничной кассе, можно общаться на немецком жестовом языке или через другие средства общения. Это касается и обследований и лечения у врача. Расходы на переводчика несёт ведомство или касса, которая отвечает за эту выплату или лечение (§ 17 Abs. 2 SGB I). Заранее сообщите, что нужен переводчик и какой: жестового языка или письменный.",
    links: [{ label: "Закон: § 17 SGB I", href: s.sgb1 }, { label: "Постановление KHV о средствах общения", href: s.khv }],
  },
  relay: {
    id: "relay",
    title: "Позвонить без голоса",
    text: "Служба Tess соединяет вас с переводчиком по видео на жестовом языке или в текстовом чате: переводчик звонит собеседнику и переводит. Работу службы поручило Федеральное агентство по сетям (Bundesnetzagentur) до марта 2029 года. В 2026 году для личных звонков бесплатны 40 минут в месяц; экстренные вызовы возможны круглосуточно.",
    links: [{ label: "Bundesnetzagentur: служба для людей с нарушением слуха", href: s.relay }, { label: "Bundesnetzagentur: бесплатные минуты по годам", href: s.relayNews }],
  },
  doctor116117: {
    id: "doctor116117",
    title: "116117 без звонка",
    text: "У 116117 есть чат для людей с нарушением слуха или речи – когда медицинская помощь нужна, но жизни ничего не угрожает. В чате выберите регион Берлин. В поиске практик 116117 есть фильтр «жестовый язык».",
    links: [{ label: "116117: чат для людей с нарушением слуха", href: s.chat116117 }, { label: "116117 на жестовом языке", href: s.sign116117 }],
  },
  emergency: {
    id: "emergency",
    title: "Экстренная помощь без звонка",
    text: "В приложении nora можно вызвать полицию, пожарных и скорую через чат, не говоря; регистрацию с проверкой личности нужно пройти заранее. В Берлине можно отправить экстренный факс на номер 112 по готовому бланку: диспетчер присылает факс с подтверждением.",
    links: [{ label: "Berliner Feuerwehr: экстренная помощь без звонка", href: s.fire }, { label: "Бланк Notruf-Fax", href: s.fax }, { label: "nora: что умеет приложение", href: s.nora }],
  },
  bmgVideo: {
    id: "bmgVideo",
    title: "Вопросы о страховке и уходе на жестовом языке",
    text: "Министерство здравоохранения Германии (BMG) отвечает на вопросы о медицинской страховке, уходе и профилактике по видеосвязи на жестовом языке; сотрудники сами глухие. Связь идёт в браузере, отдельная программа не нужна. Часы работы указаны на странице.",
    links: [{ label: "BMG: видеосвязь на жестовом языке", href: s.bmgVideo }],
  },
};

/** Какие части блока показывает маршрут. */
export const hearingForRoute: Record<string, string[]> = {
  anmeldung: ["interpreterBerlin", "relay"],
  lea: ["interpreterBerlin", "relay"],
  health: ["interpreterSocial", "bmgVideo", "relay"],
  jobcenter: ["interpreterSocial", "relay"],
  grundsicherungsgeld: ["interpreterSocial", "relay"],
  arbeitslosengeld: ["interpreterSocial", "relay"],
  doctor: ["interpreterSocial", "doctor116117", "relay"],
  urgent: ["emergency", "doctor116117"],
  mental: ["emergency", "doctor116117", "interpreterSocial", "relay"],
};

export function hearingBlockFor(routeId: string): HearingItem[] {
  return (hearingForRoute[routeId] ?? []).map((key) => hearingItems[key]);
}
