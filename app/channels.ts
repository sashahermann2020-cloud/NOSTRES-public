export type ChannelKind = "online" | "in-person" | "post" | "email" | "phone" | "representative";
export type ChannelStatus = "available" | "conditional" | "not-listed" | "not-possible";
export type Channel = { kind: ChannelKind; status: ChannelStatus; note: string };
export type ChannelMatrix = {
  title: string;
  organization: string;
  sourceLabel: string;
  sourceUrl: string;
  checkedAt: string;
  moreSources?: { label: string; url: string }[];
  channels: Channel[];
};

export const channelKindLabels: Record<ChannelKind, string> = {
  online: "Онлайн",
  "in-person": "Лично",
  post: "По почте",
  email: "По e-mail",
  phone: "По телефону",
  representative: "Через представителя",
};

export const channelStatusLabels: Record<ChannelStatus, string> = {
  available: "Есть",
  conditional: "Есть, с условиями",
  "not-listed": "На странице услуги не указан",
  "not-possible": "Официально не предусмотрен",
};

// Каждая запись сверена с первичной страницей ведомства. «Не указан» не означает «запрещён»:
// это значит, что подтвердить способ по официальной странице не удалось.
export const channelMatrices: Record<string, ChannelMatrix> = {
  anmeldung: {
    title: "Регистрация по месту жительства (Anmeldung)",
    organization: "ServicePortal Berlin",
    sourceLabel: "Anmeldung: условия, документы и порядок",
    sourceUrl: "https://service.berlin.de/dienstleistung/120686/",
    checkedAt: "19 октября 2026",
    channels: [
      { kind: "online", status: "conditional", note: "Нужны BundID, немецкое удостоверение или eID-карта гражданина ЕС с включённой онлайн-функцией и PIN, AusweisApp и считыватель или смартфон. Подходит взрослым гражданам Германии и ЕС, которые переехали внутри Германии. Электронный вид на жительство (eAT) не принимается. Запись на приём не нужна." },
      { kind: "in-person", status: "available", note: "В любом Bürgeramt Берлина по записи. Подтверждение выдают сразу, адрес в документе обновляют на месте." },
      { kind: "post", status: "not-listed", note: "Как способ подачи Anmeldung на странице услуги не указана." },
      { kind: "email", status: "not-listed", note: "Как способ подачи Anmeldung на странице услуги не указан." },
      { kind: "phone", status: "not-listed", note: "Подать Anmeldung по телефону нельзя: на странице указаны только общие контакты Bürgeramt." },
      { kind: "representative", status: "conditional", note: "Только лично: нужна письменная доверенность и заполненная форма, подписанная самим регистрирующимся. Онлайн можно зарегистрировать только членов семьи." },
    ],
  },
  "tax-id": {
    title: "Повторное получение налогового номера (Steuer-ID)",
    organization: "Bundeszentralamt für Steuern (BZSt), Bundesportal",
    sourceLabel: "BZSt: Steuerliche Identifikationsnummer",
    sourceUrl: "https://www.bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/steuerlicheidentifikationsnummer_node.html",
    checkedAt: "19 октября 2026",
    channels: [
      { kind: "online", status: "available", note: "Форма BZSt (в том числе через чат-бот ViOlA) или услуга в BZSt Online-Portal. Письмо с номером приходит только на адрес регистрации; в среднем около 4 недель. Бесплатно." },
      { kind: "post", status: "available", note: "Письменный запрос в BZSt. Рекомендован, если письмо не пришло примерно через 3 месяца после первой регистрации. Номер высылают только на адрес регистрации." },
      { kind: "phone", status: "not-possible", note: "Номер по телефону не сообщают по закону. Для вопросов есть линия BZSt +49 228 406-1240, пн–пт 9:00–14:00, возможны долгие ожидания." },
      { kind: "email", status: "not-possible", note: "Номер по e-mail не сообщают из соображений защиты данных." },
      { kind: "in-person", status: "not-listed", note: "Личный приём на странице BZSt не указан. Номер можно найти в налоговом уведомлении или справке работодателя (Lohnsteuerbescheinigung)." },
      { kind: "representative", status: "conditional", note: "Отправка на другой адрес возможна только по письменной доверенности, отправленной письмом с копией документа." },
    ],
  },
  lea: {
    title: "Вид на жительство в Берлине (LEA)",
    organization: "Landesamt für Einwanderung Berlin",
    sourceLabel: "LEA: перечень услуг и контакты",
    sourceUrl: "https://www.berlin.de/einwanderung/termine/unsere-dienstleistungen/artikel.873508.php",
    checkedAt: "19 октября 2026",
    channels: [
      { kind: "online", status: "conditional", note: "Для большинства услуг есть онлайн-заявление (в перечне около 39 услуг: продление для работы, учёбы, семьи, Blaue Karte, Niederlassungserlaubnis и др.). Если онлайн-заявление есть, LEA просит использовать только его." },
      { kind: "in-person", status: "conditional", note: "Только по приглашению или записи. Для услуг без онлайн-заявления (около 17, например выдача карты, Duldung, Schengen-Visum) запись делают через контактную форму ответственного подразделения." },
      { kind: "email", status: "not-listed", note: "На проверенных страницах LEA адрес e-mail для обращений не указан. Используйте форму своего подразделения." },
      { kind: "phone", status: "not-listed", note: "Номер телефона LEA на проверенных страницах не указан. Общая линия 115 не относится только к LEA." },
      { kind: "post", status: "not-listed", note: "Почтовая подача на проверенных страницах как способ не указана." },
      { kind: "representative", status: "not-listed", note: "Условия подачи через представителя на проверенных страницах не описаны. Используйте онлайн-форму или личный способ из списка." },
    ],
  },
  health: {
    title: "Вступление в государственную Krankenkasse",
    organization: "gesund.bund.de, AOK Nordost, Techniker Krankenkasse",
    sourceLabel: "AOK Nordost: онлайн-заявление",
    sourceUrl: "https://www.aok.de/mw/nordost/mitgliedsantrag/",
    checkedAt: "19 октября 2026",
    moreSources: [
      { label: "Techniker Krankenkasse: вступление", url: "https://www.tk.de/techniker/mitglied-werden-2003672" },
      { label: "gesund.bund.de: Krankenversicherung", url: "https://gesund.bund.de/krankenversicherung" },
    ],
    channels: [
      { kind: "online", status: "available", note: "AOK Nordost и TK принимают онлайн-заявление; визит в отделение на их страницах не требуется. AOK сама уведомляет прежнюю кассу, TK берёт на себя расторжение старого договора. Карту eGK выпускает касса: TK обещает её к началу членства, AOK срок и способ доставки не указывает. Единого порядка для всех касс нет: условия смотрите у выбранной кассы." },
      { kind: "in-person", status: "conditional", note: "Отделения для личной консультации есть (у AOK — поиск «AOK vor Ort»), но как обязательный шаг вступления визит не указан." },
      { kind: "phone", status: "conditional", note: "У AOK Nordost круглосуточная сервисная линия 0800 2 650800 для консультации. Подача заявления по телефону на проверенных страницах не описана." },
      { kind: "post", status: "not-listed", note: "На проверенных страницах AOK и TK почтовая подача не указана. Используйте онлайн-форму кассы или личный способ из списка." },
      { kind: "email", status: "not-listed", note: "Подача заявления по e-mail на проверенных страницах не указана." },
      { kind: "representative", status: "not-listed", note: "Федеральный портал не описывает порядок вступления и представительства: за деталями он отсылает к выбранной кассе." },
    ],
  },
  business: {
    title: "Регистрация самостоятельной деятельности в Берлине: Gewerbeanmeldung",
    organization: "ServicePortal Berlin",
    sourceLabel: "Gewerbeanmeldung: способы подачи и сборы",
    sourceUrl: "https://service.berlin.de/dienstleistung/121921/",
    checkedAt: "19 октября 2026",
    moreSources: [{ label: "Налоговая регистрация: Fragebogen zur steuerlichen Erfassung", url: "https://service.berlin.de/dienstleistung/325409/" }],
    channels: [
      { kind: "online", status: "conditional", note: "Для Einzelunternehmen и ряда форм нужна BundID (достаточно имени и пароля, eID не требуется); подтверждение приходит в BundID. Для других форм онлайн-подача без регистрации, подтверждение приходит по почте. Оплата онлайн только картой, €15. Налоговая анкета подаётся через ELSTER (аккаунт «Mein ELSTER» бесплатный)." },
      { kind: "in-person", status: "available", note: "В Ordnungsamt района, где находится деятельность, по PDF-форме; сбор €26 за одно дело. Обязательность записи на странице не указана, но для каждого отделения есть онлайн-запись. Для налоговой регистрации личный приём в Finanzamt на странице услуги не описан." },
      { kind: "post", status: "not-listed", note: "Для Gewerbeanmeldung почта как способ подачи не указана. Для налоговой регистрации почтовая подача описана только для объединений (Verein)." },
      { kind: "email", status: "not-listed", note: "Адреса e-mail Ordnungsamt на странице есть, но подача заявления по e-mail не указана." },
      { kind: "phone", status: "not-listed", note: "Телефоны отделений указаны для справок, но подачи по телефону нет." },
      { kind: "representative", status: "not-listed", note: "Для физического лица на странице не описано. Упоминание есть только для юридических лиц с несколькими представителями." },
    ],
  },
  "housing-wbs": {
    title: "Разрешение на аренду социального жилья (WBS)",
    organization: "ServicePortal Berlin",
    sourceLabel: "Wohnberechtigungsschein: условия и способы подачи",
    sourceUrl: "https://service.berlin.de/dienstleistung/120671/",
    checkedAt: "19 октября 2026",
    channels: [
      { kind: "online", status: "available", note: "Заявление в онлайн-сервисе Берлина, вложения PDF или JPG (до 30 МБ всего, до 5 МБ каждый). Весной 2026 был сбой онлайн-подачи: тем, кто подавал заявление 11–12 и 14–16 марта и не получил решения, страница просит подать заново." },
      { kind: "post", status: "available", note: "Скачайте формы, подпишите (все взрослые заявители) и отправьте в Bürger- или Wohnungsamt района, где вы зарегистрированы. Если вы ещё не в Берлине, можно выбрать любой район." },
      { kind: "in-person", status: "available", note: "В районном Bürger- или Wohnungsamt. Обязательность записи на странице не указана." },
      { kind: "phone", status: "not-listed", note: "Подача по телефону не указана. Есть общая линия 115 и номера отделений (у Steglitz-Zehlendorf отдельная линия WBS)." },
      { kind: "email", status: "not-listed", note: "Адреса отделений указаны, но подача заявления по e-mail не подтверждена." },
      { kind: "representative", status: "not-listed", note: "На странице услуги не упомянут." },
    ],
  },
  bank: {
    title: "Базовый счёт (Basiskonto)",
    organization: "BaFin, Verbraucherzentrale",
    sourceLabel: "BaFin: Basiskonto",
    sourceUrl: "https://www.bafin.de/DE/verbraucherinnen-verbraucher/themen-finanzprodukte/konten-zahlungen/konten/basiskonto/basiskonto_node.html",
    checkedAt: "19 октября 2026",
    moreSources: [{ label: "Verbraucherzentrale: право на Basiskonto", url: "https://www.verbraucherzentrale.de/wissen/geld-versicherungen/sparen-und-anlegen/das-recht-auf-ein-basiskonto-fuer-neu-in-deutschland-angekommene-12224" }],
    channels: [
      { kind: "online", status: "conditional", note: "Если банк даёт онлайн-управление счётом другим клиентам, он обязан дать его и по Basiskonto. Форму заявления банки должны предоставлять и онлайн. Некоторые онлайн-банки проверяют личность через PostIdent или VideoIdent, это бывает сложно." },
      { kind: "in-person", status: "available", note: "В отделении банка или сберкассы: подайте полностью заполненную форму и попросите подтвердить дату получения на копии. Банк отвечает в течение 10 рабочих дней." },
      { kind: "post", status: "not-listed", note: "Почтовая подача заявления на проверенных страницах не описана. Заявление на BaFin при отказе подаётся по почте на форме или через онлайн-форму жалобы." },
      { kind: "email", status: "not-listed", note: "Подача заявления на Basiskonto по e-mail на проверенных страницах не указана." },
      { kind: "phone", status: "not-listed", note: "Подача по телефону на проверенных страницах не указана." },
      { kind: "representative", status: "not-listed", note: "Порядок подачи через представителя на проверенных страницах не описан." },
    ],
  },
  dog: {
    title: "Регистрация собаки в Берлине (Hunderegister)",
    organization: "ServicePortal Berlin",
    sourceLabel: "Hunderegister: регистрация собаки",
    sourceUrl: "https://service.berlin.de/dienstleistung/330785/",
    checkedAt: "19 октября 2026",
    moreSources: [{ label: "Налог на собаку", url: "https://service.berlin.de/dienstleistung/121494/" }],
    channels: [
      { kind: "online", status: "available", note: "Кабинет владельца на портале реестра: €17,50 за собаку. Изменения и снятие с учёта бесплатны." },
      { kind: "post", status: "available", note: "Форма по почте в GovConnect GmbH (Ольденбург): €26,50 за собаку." },
      { kind: "email", status: "available", note: "Та же письменная регистрация по e-mail в GovConnect GmbH: €26,50." },
      { kind: "phone", status: "available", note: "Звонок в GovConnect GmbH: пн–чт 9:00–16:00, пт 9:00–13:00; регистрация по телефону €26,50." },
      { kind: "in-person", status: "not-listed", note: "Личный визит на странице услуги не упомянут. Регистрация в реестре одновременно считается налоговой, отдельный визит в Finanzamt не нужен." },
      { kind: "representative", status: "not-listed", note: "Порядок через представителя на странице не описан." },
    ],
  },
  "dog-listed": {
    title: "Сообщение об опасной собаке (Listenhund)",
    organization: "ServicePortal Berlin, Ordnungsamt района",
    sourceLabel: "Gefährlichen Hund melden",
    sourceUrl: "https://service.berlin.de/dienstleistung/326263/",
    checkedAt: "19 октября 2026",
    channels: [
      { kind: "in-person", status: "available", note: "В Ordnungsamt района, где собака будет жить (ветеринарный отдел). Форма выдаётся в отделении; нужны удостоверение личности и сама собака. Сбор €30. Обязательность записи на странице не указана." },
      { kind: "online", status: "not-listed", note: "Онлайн-подача на странице услуги не указана. Часть документов (Sachkunde, Wesenstest, Führungszeugnis) можно донести позже." },
      { kind: "post", status: "not-listed", note: "Почтовая подача на странице не указана." },
      { kind: "email", status: "not-listed", note: "Подача по e-mail на странице не указана." },
      { kind: "phone", status: "not-listed", note: "Телефоны отделений указаны для справок, подачи по телефону нет." },
      { kind: "representative", status: "not-listed", note: "Порядок через представителя на странице не описан; собаку нужно показать при регистрации." },
    ],
  },
};
