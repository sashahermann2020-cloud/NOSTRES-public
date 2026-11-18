import { tr } from "./i18n/store.ts";
export type OfficialSource = {
  id?: string;
  label: string;
  organization: string;
  url: string;
  checkedAt?: string;
  scope?: string;
  evidence?: string;
};

export type RouteOption = {
  value: string;
  label: string;
};

export type RouteQuestion = {
  id: string;
  prompt: string;
  hint?: string;
  guide?: {
    title: string;
    intro: string;
    items: string[];
    links: { label: string; url: string }[];
  };
  options: RouteOption[];
};

export type ActionLink = {
  label: string;
  url: string;
  kind: "primary" | "secondary";
};

export type ActionMethod = {
  id: string;
  type: "online" | "in-person" | "hybrid";
  title: string;
  badge: string;
  summary: string;
  deadline: string;
  preparationTime: string;
  appointmentTime: string;
  processingTime: string;
  fee: string;
  prerequisites: string[];
  documents: string[];
  steps: string[];
  expectedResult: string[];
  fallback: string[];
  links: ActionLink[];
  sourceIds?: string[];
  stepSourceIds?: string[][];
  factSourceIds?: Partial<Record<"deadline" | "preparationTime" | "appointmentTime" | "processingTime" | "fee", string[]>>;
};

export type RouteProblem = {
  id: string;
  label: string;
  title: string;
  description: string;
  methodTypes: Array<"online" | "in-person" | "hybrid">;
  sourceIds: string[];
  actions: ActionLink[];
  switchToMethodId?: string;
};

export type AvailableActionMethod = ActionMethod & {
  availability: "ready" | "needs-setup";
  availabilityLabel: string;
};

export type Journey = {
  id: string;
  category: string;
  scope: "Берлин" | "Германия";
  title: string;
  summary: string;
  applies: string;
  questions: RouteQuestion[];
  steps: string[];
  documents: string[];
  fallback: string;
  sources: OfficialSource[];
  keywords: string;
  audience: string[];
  life: string[];
  accent: string;
  time: string;
  actionMethods?: ActionMethod[];
};

export type PersonalizedResult = {
  title: string;
  text: string;
  actionLabel: string;
  actionUrl: string;
  warning?: string;
};

export const checkedAt = "30 октября 2026";

const yesNo: RouteOption[] = [
  { value: "yes", label: "Да" },
  { value: "no", label: "Нет" },
];

export const journeys: Journey[] = [
  {
    id: "anmeldung",
    category: "Первые шаги",
    scope: "Берлин",
    title: "Anmeldung (регистрация адреса)",
    summary: "Понять, можно ли зарегистрироваться онлайн или нужен Bürgeramt, и собрать правильные документы.",
    applies: "Вы въехали в квартиру или комнату в Берлине и это ваш основной или единственный адрес в Германии.",
    questions: [
      { id: "from", prompt: "Есть ли у вас сейчас регистрация по другому адресу в Германии?", hint: "Это определяет, считается ли Anmeldung переездом внутри Германии. Для первой регистрации после приезда из другой страны онлайн-подача сейчас не предусмотрена.", options: [{ value: "germany", label: "Да, сейчас зарегистрирован(а) в Германии" }, { value: "abroad", label: "Нет, действующей регистрации в Германии нет" }] },
      { id: "residenceType", prompt: "Останется ли у вас после переезда ещё одна квартира в Германии?", hint: "Если вы сохраняете другую квартиру, нужно определить Hauptwohnung и Nebenwohnung. Такой случай оформляется лично.", options: [{ value: "main", label: "Нет, берлинский адрес будет единственным" }, { value: "multiple", label: "Да, я сохраняю другую квартиру в Германии" }] },
      { id: "age", prompt: "Возраст человека, которого регистрируют", options: [{ value: "adult", label: "18 лет или старше" }, { value: "sixteen", label: "16–17 лет" }, { value: "child", label: "Младше 16 лет" }] },
      { id: "citizenship", prompt: "Какое гражданство?", options: [{ value: "eu", label: "Германия или страна ЕС" }, { value: "eea", label: "Исландия, Лихтенштейн или Норвегия" }, { value: "nonEU", label: "Другая страна / есть только eAT" }] },
      { id: "household", prompt: "Кого нужно зарегистрировать?", options: [{ value: "single", label: "Одного взрослого" }, { value: "familyTogether", label: "Семью, уже зарегистрированную вместе" }, { value: "childSpecial", label: "Ребёнка при раздельном проживании родителей" }, { value: "other", label: "Другая ситуация" }] },
      { id: "housing", prompt: "Жильё принадлежит вам?", options: [{ value: "rent", label: "Нет, снимаю или проживаю у другого человека" }, { value: "owner", label: "Да, это моя собственность" }] },
      {
        id: "onlineId",
        prompt: "Можете ли вы сейчас подтвердить личность через Online-Ausweisfunktion (eID)?",
        hint: "Нужен немецкий Personalausweis или немецкая eID-карта для граждан ЕС с активным чипом, шестизначным PIN, а также AusweisApp на смартфоне с NFC или кардридер для компьютера. Обычного паспорта или eAT для онлайн-Anmeldung недостаточно.",
        guide: {
          title: "Что такое eID и как подготовить её",
          intro: "Online-Ausweisfunktion (eID): это функция чипа, которая подтверждает вашу личность в государственном онлайн-сервисе. Это не отдельный аккаунт: eID подтверждает личность, а BundID используется как учётная запись.",
          items: [
            "Если подходящая карта и шестизначный PIN уже есть: установите AusweisApp и запустите «Gerät und Ausweis prüfen» – приложение проверит NFC-смартфон и активность eID.",
            "Если карта есть и вы получили пятизначный Transport-PIN: замените его в AusweisApp на собственный шестизначный PIN. Посещать ведомство для этого не нужно.",
            "Если чип не активирован или PIN забыт: для Personalausweis или eID-карты обратитесь в любое Bürgeramt. Активация или новый PIN бесплатны, выполняются сразу; активация возможна без предварительной записи.",
            "Если подходящей карты нет: гражданин ЕС/ЕЭЗ может заказать немецкую eID-карту лично в Bürgeramt. Она стоит 37 € и обычно изготавливается 3–4 недели. Для текущей Anmeldung в 14-дневный срок быстрее выбрать личную регистрацию; наличие eID-карты само по себе не отменяет остальные условия онлайн-сервиса.",
          ],
          links: [
            { label: "Скачать и проверить AusweisApp", url: "https://www.ausweisapp.bund.de/download" },
            { label: "Активировать eID", url: "https://service.berlin.de/dienstleistung/329830/" },
            { label: "Установить или восстановить PIN", url: "https://service.berlin.de/dienstleistung/329833/" },
            { label: "Заказать eID-карту для граждан ЕС/ЕЭЗ", url: "https://service.berlin.de/dienstleistung/330112/" },
          ],
        },
        options: [{ value: "ready", label: "Да: карта, eID, PIN и NFC-смартфон готовы" }, { value: "setup", label: "Карта есть, но eID или PIN нужно проверить и настроить" }, { value: "none", label: "Подходящей карты нет / есть только паспорт или eAT" }],
      },
    ],
    steps: [
      "Получите Wohnungsgeberbestätigung от владельца или арендодателя: договор аренды её не заменяет.",
      "Выберите онлайн-подачу, если результат NOSTRES подтверждает доступность, или запишитесь в любой Berliner Bürgeramt.",
      "Подайте сведения в течение 14 дней после въезда и сохраните Meldebestätigung.",
      "Проверьте имя, дату рождения и адрес в выданном подтверждении.",
    ],
    documents: ["Паспорт или признанный документ личности", "Wohnungsgeberbestätigung", "Форма Anmeldung: при визите", "Документы о семейном положении: при первой регистрации, если применимо"],
    fallback: "Если нет свободного времени, проверяйте официальный сервис повторно: Берлин сообщает, что дополнительные термины добавляются ежедневно. Можно записаться через 115. Подтверждение записи считается доказательством соблюдения срока Anmeldung. Термины бесплатны; купленные у посредников не признаются.",
    sources: [
      { id: "anmeldung-main", label: "Anmeldung: условия, документы и порядок", organization: "ServicePortal Berlin", url: "https://service.berlin.de/dienstleistung/120686/", checkedAt: "30 октября 2026", scope: "Берлин", evidence: "14-дневный срок, условия онлайн- и личной подачи, документы, стоимость и результат." },
      { id: "anmeldung-online", label: "Подать Anmeldung онлайн", organization: "Serviceportal Gemeinsam-Online", url: "https://serviceportal.gemeinsamonline.de/Onlinedienste/Service/Entry/EWA", checkedAt: "30 октября 2026", scope: "Германия · доступно в Берлине", evidence: "Технические требования, четыре этапа, около 10 + 5 минут ваших действий и до 3 рабочих дней проверки." },
      { id: "anmeldung-appointment", label: "Запись на Anmeldung во всех Bürgeramt", organization: "ServicePortal Berlin", url: "https://service.berlin.de/terminvereinbarung/termin/all/120686/", checkedAt: "24 сентября 2026", scope: "Берлин", evidence: "Прямая система записи уже с выбранной услугой Anmeldung." },
      { id: "appointment-rules", label: "Правила записи и действия при отсутствии термина", organization: "ServicePortal Berlin", url: "https://service.berlin.de/terminvereinbarung/", checkedAt: "30 октября 2026", scope: "Берлин", evidence: "Берлинская запись, номер 115, ежедневные дополнительные термины, срочный визит и подтверждение срока." },
      { id: "buergeraemter", label: "Официальный список Bürgeramt и адресов", organization: "ServicePortal Berlin", url: "https://service.berlin.de/standorte/buergeraemter/", checkedAt: "24 сентября 2026", scope: "Берлин", evidence: "Адреса и страницы всех берлинских Bürgeramt по районам." },
      { id: "bundid", label: "BundID: регистрация и способы входа", organization: "ServicePortal Berlin", url: "https://service.berlin.de/nutzerkonten/bundid/", checkedAt: "24 сентября 2026", scope: "Германия", evidence: "Учётная запись, необходимая для электронной Wohnsitzanmeldung." },
      { id: "eid-activate", label: "eID: активировать онлайн-функцию", organization: "ServicePortal Berlin", url: "https://service.berlin.de/dienstleistung/329830/", checkedAt: "30 октября 2026", scope: "Берлин", evidence: "Официальный путь активации Online-Ausweisfunktion." },
      { id: "eid-pin", label: "eID: установить или восстановить PIN", organization: "ServicePortal Berlin", url: "https://service.berlin.de/dienstleistung/329833/", checkedAt: "30 октября 2026", scope: "Берлин", evidence: "Официальный путь установки и восстановления шестизначного PIN." },
      { id: "eid-card", label: "eID-карта для граждан ЕС/ЕЭЗ", organization: "ServicePortal Berlin", url: "https://service.berlin.de/dienstleistung/330112/", checkedAt: "30 октября 2026", scope: "Берлин", evidence: "Получение немецкой eID-карты гражданами ЕС/ЕЭЗ." },
      { id: "ausweisapp", label: "Официальная AusweisApp", organization: "Bundesministerium des Innern", url: "https://www.ausweisapp.bund.de/download", checkedAt: "24 сентября 2026", scope: "Германия", evidence: "Официальное приложение для чтения eID через NFC или картридер." },
    ],
    keywords: "anmeldung прописка адрес регистрация wohnungsgeberbestätigung meldebestätigung bürgeramt",
    audience: ["all", "eu", "nonEU", "ukraine", "protection"],
    life: ["all", "work", "family", "study", "business"],
    accent: "coral",
    time: "онлайн до 3 рабочих дней · лично сразу на приёме",
    actionMethods: [
      {
        id: "anmeldung-online",
        type: "online",
        title: "Сделать полностью онлайн",
        badge: "Без визита",
        summary: "Подать данные, получить цифровую Meldebestätigung и обновить адрес на чипе документа через официальный онлайн-сервис.",
        deadline: "Подать в течение 14 дней после въезда.",
        preparationTime: "Официальная оценка: около 10 минут на ввод данных и ещё около 5 минут на получение подтверждения и обновление адреса.",
        appointmentTime: "Запись не требуется.",
        processingTime: "Официально: до 3 рабочих дней на проверку данных ведомством.",
        fee: "Бесплатно.",
        prerequisites: [
          "Возраст 18 лет или старше.",
          "Гражданство Германии или страны ЕС: так условие сформулировано в ServicePortal Berlin.",
          "Переезд внутри Германии в единственную или основную квартиру.",
          "BundID с входом через онлайн-идентификацию.",
          "Немецкий Personalausweis или немецкая eID-карта для граждан ЕС с активной Online-Ausweisfunktion и шестизначным PIN. Электронный Aufenthaltstitel eAT для этой услуги не подходит.",
          "NFC-смартфон или компьютер с картридером и AusweisApp версии не ниже указанной официальным сервисом.",
          "Для семьи: её участники уже были зарегистрированы вместе по прежнему адресу.",
        ],
        documents: [
          "Немецкий Personalausweis или немецкая eID-карта для граждан ЕС с активной eID и шестизначным PIN.",
          "Wohnungsgeberbestätigung, если жильё вам не принадлежит.",
          "Email, привязанный к BundID, для уведомления о результате.",
        ],
        steps: [
          "Проверьте данные в Wohnungsgeberbestätigung: адрес, дату въезда и всех регистрируемых лиц. Договор аренды её не заменяет.",
          "Войдите или зарегистрируйтесь в BundID через подходящий документ с онлайн-функцией.",
          "Подготовьте NFC-смартфон или картридер и AusweisApp.",
          "Откройте официальный онлайн-сервис, внесите новый адрес и загрузите Wohnungsgeberbestätigung, если жильё арендованное.",
          "После проверки дождитесь email, снова войдите в сервис и скачайте защищённую цифровую Meldebestätigung.",
          "Через AusweisApp обновите адрес на чипе Personalausweis или eID-карты.",
          "Дождитесь адресной наклейки по почте и наклейте её на Personalausweis; для eID-карты наклейка не предусмотрена.",
        ],
        expectedResult: [
          "Цифровая Meldebestätigung доступна для скачивания.",
          "Адрес обновлён на чипе документа.",
          "Адресная наклейка отправлена по почте, если она предусмотрена для вашего документа.",
        ],
        fallback: [
          "Если нет BundID, создайте аккаунт по официальной ссылке и вернитесь к подаче.",
          "Если карта есть, сначала проверьте её в AusweisApp. Transport-PIN можно заменить на шестизначный PIN самостоятельно; забытый PIN восстанавливают в Bürgeramt.",
          "Если подходящей карты нет, не откладывайте Anmeldung ради её оформления: eID-карта изготавливается около 3–4 недель, а Anmeldung требуется в течение 14 дней. Выберите личный путь.",
          "Если онлайн-сервис не принимает вашу ситуацию, выберите личное посещение – не используйте неофициальные обходные способы.",
        ],
        links: [
          { label: "Начать онлайн-Anmeldung", url: "https://serviceportal.gemeinsamonline.de/Onlinedienste/Service/Entry/EWA", kind: "primary" },
          { label: "Создать или открыть BundID", url: "https://service.berlin.de/nutzerkonten/bundid/", kind: "secondary" },
          { label: "Скачать и проверить AusweisApp", url: "https://www.ausweisapp.bund.de/download", kind: "secondary" },
          { label: "Активировать eID", url: "https://service.berlin.de/dienstleistung/329830/", kind: "secondary" },
          { label: "Установить или восстановить PIN", url: "https://service.berlin.de/dienstleistung/329833/", kind: "secondary" },
          { label: "Все официальные условия", url: "https://service.berlin.de/dienstleistung/120686/", kind: "secondary" },
        ],
        sourceIds: ["anmeldung-main", "anmeldung-online", "bundid", "ausweisapp"],
        factSourceIds: {
          deadline: ["anmeldung-main", "anmeldung-online"],
          preparationTime: ["anmeldung-online"],
          appointmentTime: ["anmeldung-online"],
          processingTime: ["anmeldung-online"],
          fee: ["anmeldung-main", "anmeldung-online"],
        },
        stepSourceIds: [
          ["anmeldung-main"],
          ["anmeldung-main", "bundid"],
          ["anmeldung-main", "anmeldung-online", "ausweisapp"],
          ["anmeldung-main", "anmeldung-online"],
          ["anmeldung-main", "anmeldung-online"],
          ["anmeldung-main", "anmeldung-online", "ausweisapp"],
          ["anmeldung-main", "anmeldung-online"],
        ],
      },
      {
        id: "anmeldung-personal",
        type: "in-person",
        title: "Прийти в Bürgeramt",
        badge: "Лично или по доверенности",
        summary: "Записаться в любое берлинское Bürgeramt, принести оригиналы и получить Meldebestätigung во время приёма.",
        deadline: "Зарегистрироваться нужно в течение 14 дней после въезда. Если приём назначен позднее, официальное подтверждение записи служит доказательством соблюдения срока.",
        preparationTime: "Зависит от комплекта документов и доступности записи.",
        appointmentTime: "Официальный фиксированный срок ожидания записи не опубликован. Свободные места для записи добавляются ежедневно.",
        processingTime: "Официально: сразу после проверки документов на приёме.",
        fee: "Бесплатно.",
        prerequisites: [
          "Предварительная запись в Bürgeramt.",
          "С 16 лет можно обратиться самостоятельно; ребёнка младше 16 лет регистрирует взрослый, к которому он переезжает.",
          "Можно выбрать любое Bürgeramt Берлина, если для специальной ситуации не указано отдельное ведомство.",
          "Представитель допустим с письменной доверенностью и формой Anmeldung, подписанной заявителем.",
        ],
        documents: [
          "Заполненная и подписанная форма Anmeldung.",
          "Оригиналы документов личности всех переезжающих: паспорт, признанный заменяющий документ и eAT, если применимо.",
          "Wohnungsgeberbestätigung. Договор аренды её не заменяет.",
          "Документы гражданского состояния при первой регистрации в Берлине, если применимо.",
          "Для нескольких квартир: Beiblatt zur Anmeldung / Hauptwohnungserklärung.",
          "Для ребёнка при особой ситуации с опекой: согласие и документы второго законного представителя.",
          "Для представителя: письменная доверенность и подписанная заявителем форма.",
        ],
        steps: [
          "Получите Wohnungsgeberbestätigung и проверьте дату въезда, адрес и имена всех регистрируемых лиц.",
          "Скачайте и заполните форму Anmeldung; добавьте специальные приложения для нескольких квартир или ребёнка, если они относятся к вашей ситуации.",
          "Откройте официальную запись, выберите услугу Anmeldung и включите поиск по всем берлинским Bürgeramt.",
          "Сохраните подтверждение записи: оно подтверждает соблюдение срока, даже если приём состоится позже 14 дней после въезда.",
          "Придите на приём с оригиналами или передайте представителю доверенность и собственноручно подписанную форму.",
          "Получите Meldebestätigung сразу и проверьте имя, дату рождения и адрес до ухода.",
          "Проверьте, что адресные данные на Personalausweis, eID-карте или eAT обновлены, если это относится к вашему документу.",
        ],
        expectedResult: [
          "Бумажная Meldebestätigung выдана во время приёма.",
          "Адресные данные на применимом электронном документе обновлены на месте.",
        ],
        fallback: [
          "Если свободных терминов нет, проверяйте календарь повторно: Берлин сообщает о ежедневном добавлении дополнительных записей.",
          "Позвоните 115 для официальной записи, если онлайн-календарь не подходит.",
          "При доказуемо срочной ситуации можно обратиться без записи к информационной стойке Bürgeramt; решение о срочности принимает ведомство на месте.",
          "Не покупайте запись: официальные термины бесплатны, а купленные у посредников не признаются.",
        ],
        links: [
          { label: "Перейти сразу к записи на Anmeldung", url: "https://service.berlin.de/terminvereinbarung/termin/all/120686/", kind: "primary" },
          { label: "Открыть форму и список документов", url: "https://service.berlin.de/dienstleistung/120686/", kind: "secondary" },
          { label: "Найти Bürgeramt и адрес", url: "https://service.berlin.de/standorte/buergeraemter/", kind: "secondary" },
          { label: "Правила записи и действия без термина", url: "https://service.berlin.de/terminvereinbarung/", kind: "secondary" },
        ],
        sourceIds: ["anmeldung-main", "anmeldung-appointment", "appointment-rules", "buergeraemter"],
        factSourceIds: {
          deadline: ["anmeldung-main", "appointment-rules"],
          preparationTime: ["anmeldung-main"],
          appointmentTime: ["appointment-rules"],
          processingTime: ["anmeldung-main"],
          fee: ["anmeldung-main", "appointment-rules"],
        },
        stepSourceIds: [
          ["anmeldung-main"],
          ["anmeldung-main"],
          ["anmeldung-appointment", "buergeraemter"],
          ["appointment-rules"],
          ["anmeldung-main"],
          ["anmeldung-main"],
          ["anmeldung-main"],
        ],
      },
    ],
  },
  {
    id: "residence",
    category: "Пребывание",
    scope: "Берлин",
    title: "Aufenthaltstitel (подача или продление вида на жительство)",
    summary: "Определить правильный канал LEA по статусу и цели пребывания – без покупки термина у посредника.",
    applies: "Вы живёте в Берлине и хотите оформить, продлить или изменить право на пребывание.",
    questions: [
      { id: "status", prompt: "Ваш статус сейчас", options: [{ value: "eu", label: "Гражданин ЕС / ЕЭЗ" }, { value: "nonEU", label: "Виза или ВНЖ, страна вне ЕС" }, { value: "ukraine", label: "Временная защита §24" }, { value: "protection", label: "Убежище / Duldung / иная защита" }] },
      { id: "purpose", prompt: "Главная цель пребывания", options: [{ value: "work", label: "Работа" }, { value: "study", label: "Учёба" }, { value: "family", label: "Семья" }, { value: "business", label: "Самозанятость" }, { value: "other", label: "Другое" }] },
      { id: "expiry", prompt: "Когда заканчивается текущий документ?", options: [{ value: "more8", label: "Больше чем через 8 недель" }, { value: "less8", label: "В течение 8 недель" }, { value: "expired", label: "Уже закончился" }] },
    ],
    steps: [
      "Выберите точный тип Aufenthaltstitel на официальном сайте LEA.",
      "Используйте специальную онлайн-заявку, если она есть; контактная форма не заменяет её.",
      "Сохраните PDF-подтверждение отправки и все загруженные документы.",
      "После проверки дождитесь запроса дополнительных документов или приглашения на личный приём.",
    ],
    documents: ["Паспорт", "Текущая виза / Aufenthaltstitel", "Anmeldung или доказательство адреса", "Документы по цели пребывания", "Медицинская страховка и подтверждение средств: если требует процедура"],
    fallback: "Для подтверждённой срочности используйте контактную форму компетентного отдела LEA и приложите доказательство. Просроченный документ или сложный спор требуют индивидуальной проверки.",
    sources: [
      { label: "Все онлайн-заявки и контактные формы", organization: "Landesamt für Einwanderung Berlin", url: "https://www.berlin.de/einwanderung/termine/unsere-dienstleistungen/artikel.873508.php" },
      { label: "Правила терминов и подтверждённой срочности", organization: "Landesamt für Einwanderung Berlin", url: "https://www.berlin.de/einwanderung/termine/termin-vereinbaren/" },
      { label: "Граждане ЕС, ЕЭЗ и их семьи", organization: "Landesamt für Einwanderung Berlin", url: "https://www.berlin.de/einwanderung/aufenthalt/freizuegigkeit-eu-ewr-schweiz/" },
      { label: "Временные Aufenthaltstitel и Blaue Karte EU", organization: "Landesamt für Einwanderung Berlin", url: "https://www.berlin.de/einwanderung/aufenthalt/befristet/" },
    ],
    keywords: "внж виза lea ausländerbehörde aufenthaltstitel продление голубая карта термин §24",
    audience: ["all", "eu", "nonEU", "ukraine", "protection"],
    life: ["all", "work", "family", "study", "business"],
    accent: "lilac",
    time: "15–20 минут на маршрут",
  },
  {
    id: "tax-id",
    category: "Налоги",
    scope: "Германия",
    title: "Steuer-ID (налоговый номер)",
    summary: "Понять, присвоена ли вам личная Steuer-ID, и выбрать автоматический, онлайн, срочный или специальный путь.",
    applies: "Вам нужна личная 11-значная steuerliche Identifikationsnummer (IdNr.) для работы, налогов, банка или другого официального действия.",
    questions: [
      {
        id: "idStatus",
        prompt: "Что сейчас известно о вашей Steuer-ID?",
        hint: "Это личный 11-значный номер. Он не меняется при переезде или браке и не совпадает со Steuernummer бизнеса или Umsatzsteuer-ID.",
        options: [
          { value: "have", label: "Номер у меня есть" },
          { value: "lost", label: "Номер выдавался, но я его не нахожу" },
          { value: "notReceived", label: "После первой Anmeldung письмо не пришло" },
          { value: "unsure", label: "Не знаю, присваивался ли номер" },
        ],
      },
      {
        id: "registrationHistory",
        prompt: "Есть ли у вас регистрация места жительства в Германии?",
        hint: "После первой регистрации Meldebehörde передаёт данные в BZSt. Если IdNr. уже выдавалась раньше, новую не присваивают.",
        options: [
          { value: "current", label: "Да, сейчас зарегистрирован(а)" },
          { value: "previous", label: "Раньше был(а) зарегистрирован(а), сейчас: нет" },
          { value: "never", label: "Никогда не был(а) зарегистрирован(а)" },
        ],
      },
      {
        id: "firstRegistrationAge",
        prompt: "Сколько времени прошло после первой Anmeldung в Германии?",
        hint: "Официальный ориентир автоматической отправки: 4–8 недель. Если письма нет и через 3 месяца, BZSt рекомендует запросить номер повторно.",
        options: [
          { value: "under3", label: "Меньше 3 месяцев" },
          { value: "over3", label: "3 месяца или больше" },
          { value: "notFirst", label: "Это не первая Anmeldung / я жил(а) в Германии раньше" },
        ],
      },
      {
        id: "registrationDuty",
        prompt: "Почему у вас нет Anmeldung в Германии?",
        hint: "Отдельная выдача через Finanzamt предназначена не просто для людей без регистрации, а для тех, кто не обязан регистрировать адрес, но имеет налоговую связь с Германией.",
        options: [
          { value: "mustRegister", label: "Я живу в Германии и должен(на) зарегистрировать адрес" },
          { value: "employee", label: "Живу за рубежом, но работаю по найму в Германии" },
          { value: "tax", label: "Живу за рубежом, но плачу налог в Германии / получаю немецкий доход" },
          { value: "none", label: "Налоговой связи с Германией сейчас нет" },
        ],
      },
      {
        id: "urgency",
        prompt: "Насколько срочно нужен номер?",
        options: [
          { value: "normal", label: "Могу дождаться письма" },
          { value: "urgent", label: "Нужен срочно для работы или ведомства" },
        ],
      },
    ],
    steps: [
      "Не подавайте на новый номер, если IdNr уже выдавалась: она действует постоянно.",
      "После Anmeldung проверьте почту по зарегистрированному адресу.",
      "Если номер потерян, запросите повторное сообщение через официальный онлайн-формуляр.",
      "Не отправляйте IdNr в открытый чат и не публикуйте её в сообществе.",
    ],
    documents: ["Имя, дата и место рождения", "Текущий Hauptwohnsitz", "Удостоверение личности: для личного обращения", "Форма 010250 и копия документа: только для лиц без Meldepflicht"],
    fallback: "Если обычный путь не подходит, NOSTRES отделит ситуацию с обязательной Anmeldung от специальной выдачи через Finanzamt для лиц без Meldepflicht.",
    sources: [
      { id: "taxid-berlin-main", label: "Steuer-ID: присвоение и повторное получение", organization: "ServicePortal Berlin", url: "https://service.berlin.de/dienstleistung/329123/", checkedAt: "30 октября 2026", scope: "Берлин · Германия", evidence: "Пожизненный номер, автоматическая передача после Anmeldung, повторный онлайн-запрос и срочное личное обращение." },
      { id: "taxid-online-form", label: "Повторно сообщить Steuer-ID", organization: "BZSt / ELSTER BOP", url: "https://www.elster.de/bportal/formulare-leistungen/alleformulare/idnr", checkedAt: "30 октября 2026", scope: "Германия", evidence: "Прямая официальная онлайн-форма BZSt; номер не сообщают по телефону или email." },
      { id: "taxid-bund-portal", label: "Порядок, сроки и стоимость", organization: "Bundesportal", url: "https://verwaltung.bund.de/leistungsverzeichnis/DE/leistung/99102044101000/herausgeber/LeiKa-102730390/region/00", checkedAt: "30 октября 2026", scope: "Германия", evidence: "Без документов и платы; средняя обработка онлайн-запроса 4 недели, автоматическая отправка после первой Anmeldung – 4–8 недель." },
      { id: "taxid-bzst", label: "Официальный раздел о Steuer-ID", organization: "Bundeszentralamt für Steuern", url: "https://www.bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/StID/stid.html", checkedAt: "24 сентября 2026", scope: "Германия", evidence: "Федеральное описание IdNr., повторной выдачи и вопросов граждан." },
      { id: "taxid-no-registration", label: "IdNr. для лиц без обязанности Anmeldung", organization: "ServicePortal Berlin", url: "https://service.berlin.de/dienstleistung/329216/", checkedAt: "30 октября 2026", scope: "Берлин · Германия", evidence: "Кому доступна отдельная выдача через Finanzamt, документы, компетенция и отсутствие платы." },
      { id: "taxid-form-010250", label: "Форма 010250 для лиц без Meldepflicht", organization: "Senatsverwaltung für Finanzen Berlin", url: "https://www.berlin.de/sen/finanzen/steuern/downloads/einkommen-und-lohnsteuerformulare/010250-antrag-vergabe-idnr.pdf", checkedAt: "24 сентября 2026", scope: "Германия", evidence: "Официальное заявление на выдачу IdNr. через Finanzamt для лиц без обязанности регистрации." },
      { id: "taxid-finanzamt-finder", label: "Найти своё Finanzamt по адресу", organization: "Senatsverwaltung für Finanzen Berlin", url: "https://www.berlin.de/sen/finanzen/steuern/finanzaemter/zustaendigkeit-finden/artikel.1065064.php", checkedAt: "24 сентября 2026", scope: "Берлин", evidence: "Поиск компетентного Finanzamt по индексу, улице и номеру дома; переход к адресу и часам работы." },
      { id: "taxid-berlin-faq", label: "FAQ Steuer-ID", organization: "Senatsverwaltung für Finanzen Berlin", url: "https://www.berlin.de/sen/finanzen/steuern/informationen-fuer-steuerzahler-/faq-steuern/artikel.863160.php", checkedAt: "30 октября 2026", scope: "Берлин · Германия", evidence: "Где найти номер в документах и как действует специальный путь для людей без Anmeldung." },
      { id: "taxid-anmeldung", label: "Официальная Anmeldung в Берлине", organization: "ServicePortal Berlin", url: "https://service.berlin.de/dienstleistung/120686/", checkedAt: "30 октября 2026", scope: "Берлин", evidence: "Регистрация адреса, после которой данные передаются для автоматического присвоения IdNr." },
    ],
    keywords: "steuer id steueridentifikationsnummer idnr налоговый номер identifikationsnummer восстановить",
    audience: ["all", "eu", "nonEU", "ukraine", "protection"],
    life: ["all", "work", "family", "study", "business"],
    accent: "sand",
    time: "онлайн в среднем 4 недели · автоматически 4–8 недель",
    actionMethods: [
      {
        id: "taxid-find",
        type: "hybrid",
        title: "Найти уже выданную Steuer-ID",
        badge: "Без заявления",
        summary: "Сначала проверить официальные письма и налоговые документы: номер мог быть выдан давно и остаётся тем же.",
        deadline: "Срока нет: IdNr. действует всю жизнь.",
        preparationTime: "Обычно 5–10 минут на проверку документов.",
        appointmentTime: "Запись не требуется.",
        processingTime: "Сразу, если номер есть в одном из документов.",
        fee: "Бесплатно.",
        prerequisites: ["Steuer-ID уже была присвоена хотя бы один раз.", "У вас есть доступ к своим налоговым или зарплатным документам."],
        documents: ["Письмо BZSt о присвоении IdNr.", "Последний Einkommensteuerbescheid", "Lohnsteuerbescheinigung или расчётный лист работодателя"],
        steps: [
          "Проверьте письмо BZSt о присвоении steuerliche Identifikationsnummer: это 11 цифр.",
          "Проверьте последний Einkommensteuerbescheid и Lohnsteuerbescheinigung работодателя.",
          "Убедитесь, что нашли именно личную IdNr., а не Steuernummer, USt-IdNr. или W-IdNr.",
          "Если номер не найден, перейдите к официальной повторной онлайн-выдаче; при срочной необходимости: в Finanzamt с удостоверением личности.",
        ],
        expectedResult: ["Найдена ваша прежняя 11-значная IdNr.", "Новый номер не создавался: используется уже присвоенный."],
        fallback: ["Если документы недоступны, запросите повторное сообщение через BZSt.", "Если номер нужен срочно, ServicePortal Berlin разрешает лично запросить его в Finanzamt после проверки личности."],
        links: [
          { label: "Проверить, где искать IdNr.", url: "https://www.berlin.de/sen/finanzen/steuern/informationen-fuer-steuerzahler-/faq-steuern/artikel.863160.php", kind: "primary" },
          { label: "Перейти к повторному онлайн-запросу", url: "https://www.elster.de/bportal/formulare-leistungen/alleformulare/idnr", kind: "secondary" },
        ],
        sourceIds: ["taxid-berlin-main", "taxid-berlin-faq", "taxid-online-form"],
        stepSourceIds: [["taxid-berlin-main"], ["taxid-berlin-faq"], ["taxid-berlin-main"], ["taxid-berlin-main", "taxid-online-form"]],
        factSourceIds: { deadline: ["taxid-berlin-main"], preparationTime: ["taxid-berlin-faq"], appointmentTime: ["taxid-berlin-faq"], processingTime: ["taxid-berlin-faq"], fee: ["taxid-bund-portal"] },
      },
      {
        id: "taxid-wait",
        type: "hybrid",
        title: "Дождаться автоматического письма после Anmeldung",
        badge: "Автоматически",
        summary: "После первой Anmeldung Meldebehörde передаёт данные в BZSt, а IdNr. приходит бумажным письмом на Meldeadresse.",
        deadline: "Отдельное заявление не нужно; если письма нет 3 месяца, подайте повторный запрос.",
        preparationTime: "Дополнительная подготовка не требуется.",
        appointmentTime: "Запись не требуется.",
        processingTime: "Официальный ориентир после первой Anmeldung: 4–8 недель.",
        fee: "Бесплатно.",
        prerequisites: ["Первая Anmeldung в Германии успешно завершена.", "Имя и адрес в Melderegister указаны верно.", "Есть доступ к почтовому ящику по Meldeadresse."],
        documents: ["Meldebestätigung для проверки имени и адреса", "Почтовое письмо BZSt после его получения"],
        steps: [
          "Проверьте Meldebestätigung: имя, дата рождения и адрес должны быть указаны без ошибки.",
          "Следите за бумажной почтой по зарегистрированному адресу: BZSt отправляет IdNr. на Meldeadresse.",
          "Проверьте Lohnsteuerbescheinigung или налоговые документы, если они появились раньше письма.",
          "Если после первой Anmeldung прошло 3 месяца, а письма нет, заполните официальную форму повторного сообщения IdNr.",
        ],
        expectedResult: ["Получено письмо BZSt с 11-значной IdNr.", "Номер можно безопасно сохранить для будущих обращений."],
        fallback: ["После 3 месяцев без письма используйте повторный онлайн-запрос BZSt.", "Если номер требуется срочно, обратитесь лично в компетентный Finanzamt с удостоверением личности."],
        links: [
          { label: "Проверить официальный порядок", url: "https://verwaltung.bund.de/leistungsverzeichnis/DE/leistung/99102044101000/herausgeber/LeiKa-102730390/region/00", kind: "primary" },
          { label: "Повторно запросить после 3 месяцев", url: "https://www.elster.de/bportal/formulare-leistungen/alleformulare/idnr", kind: "secondary" },
        ],
        sourceIds: ["taxid-berlin-main", "taxid-bund-portal", "taxid-online-form"],
        stepSourceIds: [["taxid-berlin-main"], ["taxid-berlin-main", "taxid-bund-portal"], ["taxid-berlin-faq"], ["taxid-bund-portal", "taxid-online-form"]],
        factSourceIds: { deadline: ["taxid-bund-portal"], preparationTime: ["taxid-bund-portal"], appointmentTime: ["taxid-bund-portal"], processingTime: ["taxid-bund-portal"], fee: ["taxid-bund-portal"] },
      },
      {
        id: "taxid-online",
        type: "online",
        title: "Запросить повторное сообщение IdNr. онлайн",
        badge: "Без eID и визита",
        summary: "Передать BZSt необходимые данные через официальную форму и получить ту же IdNr. бумажным письмом.",
        deadline: "Общего срока нет; после первой Anmeldung используйте этот путь, если письмо не пришло за 3 месяца.",
        preparationTime: "Около 5–10 минут на заполнение формы.",
        appointmentTime: "Запись, BundID и личный визит не требуются.",
        processingTime: "В среднем 4 недели при использовании онлайн-формы.",
        fee: "Бесплатно.",
        prerequisites: ["IdNr. уже была присвоена или после первой Anmeldung прошло не менее 3 месяцев.", "Известен текущий Hauptwohnsitz.", "Есть доступ к бумажной почте по указанному адресу."],
        documents: ["Имя и фамилия", "Дата и место рождения", "Текущий Hauptwohnsitz", "Документы загружать не требуется"],
        steps: [
          "Откройте прямую форму BZSt и выберите сообщение IdNr. самой налогоплательщице или самому налогоплательщику.",
          "Введите личные данные точно так, как они указаны в Melderegister и документе личности.",
          "Укажите Hauptwohnsitz: не Ferienwohnung и не краткосрочный адрес.",
          "Отправьте форму. BZSt не сообщает IdNr. по email или телефону.",
          "Дождитесь бумажного письма и проверьте 11-значный номер.",
        ],
        expectedResult: ["Получено бумажное письмо с уже присвоенной IdNr.", "Номер совпадает с прежней IdNr. и остаётся действительным пожизненно."],
        fallback: ["Если данные не принимаются, проверьте Hauptwohnsitz и написание имени по Meldebestätigung.", "При срочной необходимости используйте личное обращение в Finanzamt.", "Не передавайте IdNr. через неофициальные формы и посредников."],
        links: [
          { label: "Открыть форму повторного сообщения", url: "https://www.elster.de/bportal/formulare-leistungen/alleformulare/idnr", kind: "primary" },
          { label: "Проверить официальный порядок и сроки", url: "https://verwaltung.bund.de/leistungsverzeichnis/DE/leistung/99102044101000/herausgeber/LeiKa-102730390/region/00", kind: "secondary" },
        ],
        sourceIds: ["taxid-online-form", "taxid-bund-portal", "taxid-berlin-main"],
        stepSourceIds: [["taxid-online-form"], ["taxid-online-form"], ["taxid-online-form"], ["taxid-online-form", "taxid-bund-portal"], ["taxid-bund-portal"]],
        factSourceIds: { deadline: ["taxid-bund-portal"], preparationTime: ["taxid-online-form"], appointmentTime: ["taxid-online-form"], processingTime: ["taxid-bund-portal"], fee: ["taxid-bund-portal"] },
      },
      {
        id: "taxid-urgent",
        type: "in-person",
        title: "Срочно запросить IdNr. лично в Finanzamt",
        badge: "С проверкой личности",
        summary: "Найти компетентный Finanzamt и лично запросить уже присвоенную IdNr. с подходящим удостоверением личности.",
        deadline: "Только при срочной необходимости; общего срока нет.",
        preparationTime: "Найдите Finanzamt по адресу и проверьте часы его Infozentrale.",
        appointmentTime: "Единой онлайн-записи для этой услуги не указано; проверьте страницу и часы конкретного Finanzamt перед визитом.",
        processingTime: "Официальная страница не публикует срок; выдача зависит от проверки личности и данных.",
        fee: "Бесплатно.",
        prerequisites: ["IdNr. уже присвоена или вы зарегистрированы в Германии.", "Есть подтверждённая срочная необходимость.", "Можно лично подтвердить свою личность."],
        documents: ["Действующий паспорт или другое подходящее удостоверение личности", "Meldebestätigung: полезно взять для проверки адреса"],
        steps: [
          "Откройте официальный Finanzamt-Finder и найдите Finanzamt по своему берлинскому адресу.",
          "Откройте страницу найденного Finanzamt и проверьте адрес и актуальные часы Infozentrale.",
          "Возьмите оригинал подходящего удостоверения личности и, по возможности, Meldebestätigung.",
          "Лично попросите сообщить уже присвоенную steuerliche Identifikationsnummer и сохраните результат безопасно.",
        ],
        expectedResult: ["Личность проверена Finanzamt.", "IdNr. сообщена либо дан официальный дальнейший порядок."],
        fallback: ["Если личное сообщение невозможно, отправьте повторный онлайн-запрос в BZSt.", "Если проблема связана с ошибкой адреса, сначала исправьте Melderegister через Bürgeramt."],
        links: [
          { label: "Найти своё Finanzamt", url: "https://www.berlin.de/sen/finanzen/steuern/finanzaemter/zustaendigkeit-finden/artikel.1065064.php", kind: "primary" },
          { label: "Проверить основание срочного обращения", url: "https://service.berlin.de/dienstleistung/329123/", kind: "secondary" },
        ],
        sourceIds: ["taxid-berlin-main", "taxid-finanzamt-finder"],
        stepSourceIds: [["taxid-finanzamt-finder"], ["taxid-finanzamt-finder"], ["taxid-berlin-main"], ["taxid-berlin-main"]],
        factSourceIds: { deadline: ["taxid-berlin-main"], preparationTime: ["taxid-finanzamt-finder"], appointmentTime: ["taxid-finanzamt-finder"], processingTime: ["taxid-berlin-main"], fee: ["taxid-berlin-main"] },
      },
      {
        id: "taxid-anmeldung-first",
        type: "hybrid",
        title: "Сначала Anmeldung (регистрация адреса)",
        badge: "Предварительный шаг",
        summary: "Если вы живёте в Германии и обязаны зарегистрировать адрес, отдельная форма 010250 не заменяет Anmeldung.",
        deadline: "Anmeldung: в течение 14 дней после въезда; IdNr. после неё присваивается автоматически.",
        preparationTime: "Зависит от выбранного способа Anmeldung.",
        appointmentTime: "Онлайн при соблюдении условий или лично по записи в Bürgeramt.",
        processingTime: "После первой Anmeldung письмо с IdNr. обычно приходит за 4–8 недель.",
        fee: "Anmeldung и присвоение IdNr. бесплатны.",
        prerequisites: ["Вы живёте в Германии и подпадаете под Meldepflicht.", "Есть адрес, который можно зарегистрировать."],
        documents: ["Документы для Anmeldung зависят от ситуации", "Обычно: удостоверение личности и Wohnungsgeberbestätigung"],
        steps: [
          "Откройте маршрут Anmeldung и определите, доступна ли вам онлайн-регистрация или нужен Bürgeramt.",
          "Завершите Anmeldung и получите Meldebestätigung.",
          "Проверьте имя и адрес в Meldebestätigung и следите за бумажной почтой.",
          "Если спустя 3 месяца письма BZSt нет, подайте повторный онлайн-запрос IdNr.",
        ],
        expectedResult: ["Anmeldung завершена.", "IdNr. присвоена и направлена по зарегистрированному адресу."],
        fallback: ["Если Anmeldung уже завершена, вернитесь к автоматическому ожиданию или повторному запросу.", "Если адрес зарегистрировать невозможно, проверьте на официальной странице Anmeldung, действует ли обязанность регистрации; не используйте форму 010250 как обход регистрации."],
        links: [
          { label: "Открыть маршрут NOSTRES по Anmeldung", url: "/berlin/anmeldung", kind: "primary" },
          { label: "Открыть официальную Anmeldung", url: "https://service.berlin.de/dienstleistung/120686/", kind: "secondary" },
        ],
        sourceIds: ["taxid-anmeldung", "taxid-berlin-main", "taxid-bund-portal"],
        stepSourceIds: [["taxid-anmeldung"], ["taxid-anmeldung"], ["taxid-berlin-main"], ["taxid-bund-portal", "taxid-online-form"]],
        factSourceIds: { deadline: ["taxid-anmeldung"], preparationTime: ["taxid-anmeldung"], appointmentTime: ["taxid-anmeldung"], processingTime: ["taxid-bund-portal"], fee: ["taxid-anmeldung", "taxid-berlin-main"] },
      },
      {
        id: "taxid-nonresident-employee",
        type: "hybrid",
        title: "Подать форму 010250 через Finanzamt работодателя",
        badge: "Без Meldepflicht",
        summary: "Для человека, который живёт за рубежом, не обязан делать Anmeldung, но начинает работу по найму в Германии.",
        deadline: "Подайте до того, как работодателю понадобится IdNr. для ELStAM; отдельный общий срок не опубликован.",
        preparationTime: "Заполнить форму 010250 и подготовить копию удостоверения личности.",
        appointmentTime: "Личный визит не обязателен: заявление подаётся в компетентный Finanzamt; способ отправки указан на официальной странице этого Finanzamt.",
        processingTime: "Официальный срок обработки не опубликован.",
        fee: "Бесплатно.",
        prerequisites: ["У вас действительно нет Meldepflicht в Германии.", "Вы начинаете работу по найму в Германии.", "IdNr. ранее не присваивалась."],
        documents: ["Заполненная форма 010250", "Копия паспорта или Personalausweis", "Данные немецкого работодателя и его Betriebsstätten-Finanzamt"],
        steps: [
          "Скачайте официальную форму 010250 и заполните белые поля.",
          "Приложите копию подходящего удостоверения личности.",
          "Возьмите из данных работодателя, которые нужны для формы, название его Betriebsstätten-Finanzamt (налоговой инспекции по месту предприятия): именно она компетентна для IdNr. в целях ELStAM.",
          "Передайте заявление в этот Finanzamt и сохраните подтверждение отправки.",
          "Дождитесь письменного сообщения на иностранный адрес или укажите в форме уполномоченного получателя, если это применимо.",
        ],
        expectedResult: ["Finanzamt запросил присвоение IdNr.", "IdNr. направлена письменно на указанный адрес."],
        fallback: ["Если работодателю нужен документ по удержанию налога, проверьте, не требуется ли отдельная Bescheinigung für den Lohnsteuerabzug.", "Не выбирайте этот путь только из-за отсутствия термина на Anmeldung: он предназначен для лиц без Meldepflicht."],
        links: [
          { label: "Скачать форму 010250", url: "https://www.berlin.de/sen/finanzen/steuern/downloads/einkommen-und-lohnsteuerformulare/010250-antrag-vergabe-idnr.pdf", kind: "primary" },
          { label: "Проверить условия для лиц без Anmeldung", url: "https://service.berlin.de/dienstleistung/329216/", kind: "secondary" },
        ],
        sourceIds: ["taxid-no-registration", "taxid-form-010250", "taxid-berlin-faq"],
        stepSourceIds: [["taxid-form-010250"], ["taxid-no-registration"], ["taxid-no-registration", "taxid-berlin-faq"], ["taxid-no-registration"], ["taxid-berlin-faq"]],
        factSourceIds: { deadline: ["taxid-no-registration"], preparationTime: ["taxid-no-registration"], appointmentTime: ["taxid-no-registration"], processingTime: ["taxid-no-registration"], fee: ["taxid-no-registration"] },
      },
      {
        id: "taxid-nonresident-tax",
        type: "hybrid",
        title: "Подать форму 010250 в компетентный Finanzamt",
        badge: "Без Meldepflicht",
        summary: "Для человека без немецкой Anmeldung, который подлежит налогообложению в Германии как самозанятый, арендодатель или по другой причине.",
        deadline: "Отдельный срок для IdNr. не опубликован; при подаче Einkommensteuererklärung отдельное заявление обычно не нужно.",
        preparationTime: "Заполнить форму 010250 и подготовить копию удостоверения личности.",
        appointmentTime: "Личный визит не обязателен; заявление направляется в Finanzamt, компетентный по Einkommensteuer.",
        processingTime: "Официальный срок обработки не опубликован.",
        fee: "Бесплатно.",
        prerequisites: ["У вас действительно нет Meldepflicht в Германии.", "Есть налоговая обязанность или доход в Германии.", "IdNr. ранее не присваивалась."],
        documents: ["Заполненная форма 010250", "Копия паспорта или Personalausweis", "Данные, позволяющие определить компетентный Finanzamt"],
        steps: [
          "Проверьте, не присваивалась ли IdNr. раньше: повторно новый номер не создают.",
          "Скачайте и заполните официальную форму 010250.",
          "Приложите копию подходящего удостоверения личности.",
          "Определите Finanzamt, компетентный по вашей Einkommensteuer, и передайте заявление.",
          "Дождитесь письменного сообщения IdNr. на указанный адрес.",
        ],
        expectedResult: ["Finanzamt запросил присвоение IdNr.", "IdNr. направлена письменно на указанный адрес."],
        fallback: ["Если вы подаёте Einkommensteuererklärung, отдельная форма на IdNr. может не требоваться: проверьте это у компетентного Finanzamt.", "Если вы фактически живёте в Германии и обязаны регистрироваться, сначала выполните Anmeldung."],
        links: [
          { label: "Скачать форму 010250", url: "https://www.berlin.de/sen/finanzen/steuern/downloads/einkommen-und-lohnsteuerformulare/010250-antrag-vergabe-idnr.pdf", kind: "primary" },
          { label: "Проверить компетенцию Finanzamt", url: "https://service.berlin.de/dienstleistung/329216/", kind: "secondary" },
        ],
        sourceIds: ["taxid-no-registration", "taxid-form-010250"],
        stepSourceIds: [["taxid-berlin-main"], ["taxid-form-010250"], ["taxid-no-registration"], ["taxid-no-registration"], ["taxid-no-registration"]],
        factSourceIds: { deadline: ["taxid-no-registration"], preparationTime: ["taxid-no-registration"], appointmentTime: ["taxid-no-registration"], processingTime: ["taxid-no-registration"], fee: ["taxid-no-registration"] },
      },
    ],
  },
  {
    id: "health",
    category: "Здоровье",
    scope: "Германия",
    title: "Krankenversicherung (медицинская страховка)",
    summary: "Определить подходящий путь, выбрать официальную Krankenkasse и получить подтверждение страхования и eGK.",
    applies: "Вы живёте, работаете, учитесь или получаете Grundsicherung в Германии и хотите оформить или проверить медицинское страхование.",
    questions: [
      { id: "goal", prompt: "Какой результат вам нужен?", hint: "Поиск врача и срочная помощь будут отдельными маршрутами. Здесь цель: подтвердить само страхование.", options: [{ value: "join", label: "Оформить страхование впервые или после переезда" }, { value: "switch", label: "Сменить Krankenkasse" }, { value: "card", label: "Получить eGK или временное подтверждение" }] },
      { id: "insured", prompt: "Какая страховка действует сейчас?", hint: "Не отменяйте действующий полис, пока новая Krankenkasse письменно не подтвердила начало покрытия.", options: [{ value: "gkv", label: "Немецкая государственная GKV" }, { value: "private", label: "Немецкая частная PKV" }, { value: "foreign", label: "Только иностранная страховка / EHIC" }, { value: "none", label: "Нет или не знаю" }] },
      { id: "situation", prompt: "На каком основании вы хотите быть застрахованы?", options: [{ value: "employee", label: "Работаю или начинаю работу по найму" }, { value: "student", label: "Поступаю или учусь" }, { value: "family", label: "Через супруга, партнёра или родителя в GKV" }, { value: "benefit", label: "Получаю или подаю на Grundsicherung" }, { value: "self", label: "Самозанятость / другой случай" }] },
      { id: "employeeBand", prompt: "Какой у вас вид занятости и доход в 2026 году?", hint: "Обычный работник выше Minijob-границы и не выше Jahresarbeitsentgeltgrenze обычно подлежит GKV. В 2026 году верхняя граница составляет 77 400 € в год; Minijob сам по себе не создаёт медицинское страхование через работу.", options: [{ value: "compulsory", label: "Обычная работа: выше Minijob и не более 77 400 € в год" }, { value: "above", label: "Более 77 400 € в год" }, { value: "mini", label: "Только Minijob" }, { value: "unknown", label: "Не знаю / особый трудовой статус" }] },
      { id: "studentAge", prompt: "Какой вариант описывает вас?", hint: "Студенты могут быть семейно застрахованы, состоять в studentische Pflichtversicherung или после 30 лет – при условиях – продолжить GKV добровольно.", options: [{ value: "familyPossible", label: "До 25 лет, возможно страхование через семью" }, { value: "studentGkv", label: "25–29 лет или семейное страхование не подходит" }, { value: "thirtyPlus", label: "30 лет или старше" }, { value: "unknown", label: "Не уверен(а) / особая программа" }] },
      { id: "familyCheck", prompt: "Выполняются базовые условия Familienversicherung?", hint: "Нужны родство или партнёрство с членом GKV, проживание в Германии и отсутствие другой обязательной страховки; доход проверяет Krankenkasse. Общая граница дохода в 2026 году – 565 € в месяц, при Minijob – 603 €.", options: [{ value: "likely", label: "Да, условия похожи на мои" }, { value: "incomeHigh", label: "Доход выше 565 € в месяц (при Minijob: выше 603 €)" }, { value: "unknown", label: "Не знаю: нужна официальная проверка" }] },
    ],
    steps: [
      "Определите основание страхования: работа, учёба, семья, Grundsicherung или индивидуальная проверка.",
      "Если подтверждена GKV, выберите Krankenkasse из официального списка с допуском в Берлине.",
      "Подайте заявление выбранной кассе онлайн либо свяжитесь с её офисом и получите письменное подтверждение начала членства.",
      "Передайте сведения о выбранной кассе работодателю, вузу или Jobcenter, если это относится к вашей ситуации.",
      "Получите eGK; если карта ещё не пришла, запросите у кассы временный Versicherungsnachweis.",
    ],
    documents: ["Документ личности", "Адрес и контактные данные", "Данные работодателя, вуза, члена семьи или Jobcenter: по выбранному основанию", "Сведения о текущем или предыдущем страховании", "Фото для eGK: после запроса Krankenkasse"],
    fallback: "Если касса не подтверждает право на выбранный режим, запросите письменное решение и не отменяйте действующую страховку. Сложные переходы GKV ↔ PKV сначала проверяются самой Krankenkasse.",
    sources: [
      { id: "health-overview", label: "Как устроено медицинское страхование", organization: "gesund.bund.de", url: "https://gesund.bund.de/krankenversicherung", checkedAt: "30 октября 2026", scope: "Германия", evidence: "Обязанность страхования, GKV/PKV, Minijob, свободный выбор кассы и семейное страхование." },
      { id: "health-newcomers", label: "Страхование после перерыва или переезда", organization: "gesund.bund.de: федеральный портал здоровья", url: "https://gesund.bund.de/en/krankenversicherung", checkedAt: "23 октября 2026", scope: "Германия", evidence: "Страхование обязательно для всех жителей; возврат в прежний режим GKV или PKV после перерыва; взносы за период без страховки." },
      { id: "health-gkv-list", label: "Официальный список Krankenkassen", organization: "GKV-Spitzenverband", url: "https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp", checkedAt: "2 октября 2026", scope: "Германия · фильтр Берлин", evidence: "Кассы, регионы допуска, актуальные Zusatzbeiträge и переход на официальный сайт выбранной кассы." },
      { id: "health-aok-join", label: "AOK Nordost: онлайн-заявление", organization: "AOK Nordost", url: "https://www.aok.de/mw/nordost/mitgliedsantrag/", checkedAt: "2 октября 2026", scope: "Берлин, Бранденбург, Мекленбург-Передняя Померания", evidence: "Официальное заявление на членство, условия применимости и контакты AOK Nordost." },
      { id: "health-aok-berlin", label: "AOK Nordost в Берлине: контакты и офисы", organization: "AOK Nordost", url: "https://www.aok.de/pk/nordost/region/berlin/", checkedAt: "2 октября 2026", scope: "Берлин", evidence: "Онлайн-сервисы, письменный контакт и поиск сервисных центров в Берлине." },
      { id: "health-tk-join", label: "Techniker Krankenkasse: онлайн-заявление", organization: "Techniker Krankenkasse", url: "https://www.tk.de/techniker/mitglied-werden-2003672", checkedAt: "2 октября 2026", scope: "Германия", evidence: "Официальный онлайн-путь вступления в TK." },
      { id: "health-tk-berlin", label: "Techniker Krankenkasse: отделение Berlin-Mitte", organization: "Techniker Krankenkasse", url: "https://www.tk.de/service/app/2024928/filiale/detail.app", checkedAt: "2 октября 2026", scope: "Берлин", evidence: "Официальная страница берлинского отделения TK." },
      { id: "health-barmer-join", label: "BARMER: онлайн-заявление", organization: "BARMER", url: "https://www.barmer.de/mitglied-werden", checkedAt: "2 октября 2026", scope: "Германия", evidence: "Официальный онлайн-путь вступления в BARMER." },
      { id: "health-barmer-contact", label: "BARMER: письменный контакт и консультация", organization: "BARMER", url: "https://www.barmer.de/persoenliche-beratung", checkedAt: "2 октября 2026", scope: "Германия · отделения в Берлине", evidence: "Контактная форма, чат, другие каналы и поиск отделений." },
      { id: "health-insured-groups", label: "Кто подлежит GKV и Familienversicherung", organization: "Bundesministerium für Gesundheit", url: "https://www.bundesgesundheitsministerium.de/gesetzlich-versicherte", checkedAt: "30 октября 2026", scope: "Германия", evidence: "Группы обязательного страхования, студенты, семейное страхование; Geringfügigkeitsgrenze 603 € в месяц в 2026 году." },
      { id: "health-family-limit", label: "Граница дохода для Familienversicherung в 2026 году", organization: "Techniker Krankenkasse", url: "https://www.tk.de/techniker/versicherung/tk-leistungen/schwangerschaft-und-familie/versichert-als-familie-in-der-familienversicherung/einkommensgrenze-familienversicherung-2005696", checkedAt: "30 октября 2026", scope: "Германия", evidence: "В 2026 году общая граница дохода – 565 € в месяц, при Minijob – 603 €." },
      { id: "health-contributions", label: "Взносы и границы GKV в 2026 году", organization: "Bundesministerium für Gesundheit", url: "https://www.bundesgesundheitsministerium.de/beitraege", checkedAt: "30 октября 2026", scope: "Германия", evidence: "Jahresarbeitsentgeltgrenze 77 400 € в 2026 году и распределение взносов." },
      { id: "health-choice", label: "Выбор и смена Krankenkasse", organization: "Bundesministerium für Gesundheit", url: "https://www.bundesgesundheitsministerium.de/themen/krankenversicherung/online-ratgeber-krankenversicherung/krankenversicherung/wahl-und-wechsel-der-krankenkasse", checkedAt: "30 октября 2026", scope: "Германия", evidence: "Допустимые кассы, обязанность быстро сообщить работодателю и правила смены." },
      { id: "health-student", label: "Медицинское страхование студентов", organization: "gesund.bund.de", url: "https://gesund.bund.de/krankenversicherung-studierende", checkedAt: "2 октября 2026", scope: "Германия", evidence: "Семейная, студенческая обязательная и добровольная GKV, а также последствия освобождения в пользу PKV." },
      { id: "health-student-berlin", label: "Электронное подтверждение для берлинского вуза", organization: "Freie Universität Berlin", url: "https://www.fu-berlin.de/studium/studieren/studienorganisation/krankenversicherung.html", checkedAt: "30 октября 2026", scope: "Берлин", evidence: "Студент обращается в немецкую GKV, а касса электронно передаёт вузу страховой статус." },
      { id: "health-benefit", label: "Страхование при Grundsicherung", organization: "Bundesagentur für Arbeit", url: "https://www.arbeitsagentur.de/grundsicherung/finanziell-absichern/gesundheit-versicherung", checkedAt: "2 октября 2026", scope: "Германия", evidence: "Jobcenter оплачивает взносы или субсидию; страхование действует со дня подачи заявления при выполнении условий." },
      { id: "health-jobcenter-online", label: "Онлайн-сервисы Jobcenter", organization: "Bundesagentur für Arbeit", url: "https://www.arbeitsagentur.de/grundsicherung/online-services-im-ueberblick", checkedAt: "2 октября 2026", scope: "Германия", evidence: "Онлайн-заявления, сообщения, документы и изменение сведений." },
      { id: "health-egk", label: "Электронная медицинская карта eGK", organization: "gesund.bund.de", url: "https://gesund.bund.de/die-elektronische-gesundheitskarte", checkedAt: "30 октября 2026", scope: "Германия", evidence: "Карту выдаёт Krankenkasse; назначение, фото с 15 лет и данные на карте." },
      { id: "health-proof", label: "Лечение с другим подтверждением страхования", organization: "gesund.bund.de", url: "https://gesund.bund.de/arztwahl-und-terminsuche", checkedAt: "2 октября 2026", scope: "Германия", evidence: "Для лечения обычно предъявляют eGK или другое подтверждение страхования." },
      { id: "health-gkv-pkv", label: "Переход между GKV и PKV", organization: "Bundesministerium für Gesundheit", url: "https://www.bundesgesundheitsministerium.de/themen/krankenversicherung/online-ratgeber-krankenversicherung/krankenversicherung/wechsel-zwischen-gkv-und-pkv", checkedAt: "30 октября 2026", scope: "Германия", evidence: "Ограничения перехода; действующий полис не следует прекращать до подтверждения нового режима." },
      { id: "health-pkv-list", label: "Список частных страховых компаний и контакты", organization: "Verband der Privaten Krankenversicherung", url: "https://www.pkv.de/verband/ueber-uns/mitglieder-pkv-verband/", checkedAt: "3 октября 2026", scope: "Германия", evidence: "Список компаний-членов объединения, их контакты и разграничение полного и дополнительного страхования." },
    ],
    keywords: "krankenkasse gkv pkv страховка медицинская eGK gesundheitskarte работодатель студент jobcenter familienversicherung",
    audience: ["all", "eu", "nonEU", "ukraine", "protection"],
    life: ["all", "work", "family", "study", "business"],
    accent: "mint",
    time: "онлайн или через офис кассы · общий срок не установлен",
    actionMethods: [
      {
        id: "health-employee-online",
        type: "online",
        title: "Оформить государственную страховку онлайн при работе по найму",
        badge: "Без визита",
        summary: "Выбрать открытую в Берлине Krankenkasse, подать заявление на её официальном сайте и сообщить выбор работодателю.",
        deadline: "Выберите кассу до начала работы или сообщите работодателю как можно быстрее после её начала.",
        preparationTime: "Единая официальная оценка времени заполнения не опубликована.",
        appointmentTime: "Запись не требуется; заявление подаётся на сайте выбранной Krankenkasse.",
        processingTime: "Единый официальный срок вступления и выпуска eGK не установлен; его сообщает выбранная касса.",
        fee: "Отдельной платы за заявление нет; взносы удерживаются из дохода, работодатель участвует в их уплате.",
        prerequisites: ["Обычная занятость выше Minijob-границы.", "Доход не превышает Jahresarbeitsentgeltgrenze 77 400 € в 2026 году либо обязанность GKV подтверждена кассой.", "Покрытие должно быть непрерывным; прежний полис не отменён до подтверждения нового."],
        documents: ["Документ личности", "Адрес и контактные данные", "Дата начала и данные работодателя", "Сведения о текущем или предыдущем страховании", "Фото для eGK: когда его запросит Krankenkasse"],
        steps: [
          "Проверьте, что ваша работа не является только Minijob и что выбранный путь GKV соответствует доходу.",
          "Откройте официальный список, выберите Bundesland Berlin и сравните допуск, Zusatzbeitrag, сервис и дополнительные услуги.",
          "Перейдите из списка на официальный сайт выбранной Krankenkasse и откройте Mitglied werden / Mitgliedsantrag.",
          "Заполните заявление, укажите работодателя, дату начала работы и сведения о предыдущем страховании; сохраните подтверждение отправки.",
          "Как можно быстрее сообщите работодателю название выбранной Krankenkasse.",
          "Получите подтверждение членства. Если нужен врач до eGK, запросите у кассы временный Versicherungsnachweis.",
          "После запроса передайте фото и проверьте имя и адрес на полученной eGK.",
        ],
        expectedResult: ["Krankenkasse письменно или электронно подтвердила членство и дату начала.", "Работодатель знает выбранную кассу.", "eGK получена либо выдан временный Versicherungsnachweis."],
        fallback: ["Если касса не подтверждает обязательную GKV, запросите письменное объяснение и используйте маршрут проверки режима.", "Если eGK задерживается, попросите временное подтверждение страхования.", "Не отменяйте действующий полис до подтверждения новой защиты."],
        links: [
          { label: "Выбрать Krankenkasse для Берлина", url: "https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp", kind: "primary" },
          { label: "Проверить группы обязательной GKV", url: "https://www.bundesgesundheitsministerium.de/gesetzlich-versicherte", kind: "secondary" },
          { label: "Проверить eGK", url: "https://gesund.bund.de/die-elektronische-gesundheitskarte", kind: "secondary" },
        ],
        sourceIds: ["health-overview", "health-gkv-list", "health-insured-groups", "health-contributions", "health-egk"],
        stepSourceIds: [["health-overview", "health-contributions"], ["health-gkv-list"], ["health-gkv-list"], ["health-newcomers"], ["health-choice"], ["health-egk", "health-proof"], ["health-egk"]],
        factSourceIds: { deadline: ["health-choice"], preparationTime: ["health-gkv-list"], appointmentTime: ["health-gkv-list"], processingTime: ["health-gkv-list", "health-egk"], fee: ["health-contributions"] },
      },
      {
        id: "health-employee-direct",
        type: "in-person",
        title: "Оформить через офис или письменную поддержку кассы",
        badge: "Лично или письменно",
        summary: "Выбрать кассу по официальному списку, открыть её контакты и оформить членство с сотрудником кассы.",
        deadline: "Свяжитесь с кассой до начала работы или сразу после неё и быстро сообщите выбор работодателю.",
        preparationTime: "Единая официальная оценка не опубликована.",
        appointmentTime: "Национального правила записи нет: адрес, часы и необходимость термина определяет выбранная Krankenkasse.",
        processingTime: "Единого официального срока нет; попросите кассу назвать дату начала членства и выпуска eGK письменно.",
        fee: "Консультация и заявление в выбранной GKV не оплачиваются отдельно; членские взносы зависят от дохода.",
        prerequisites: ["Вы выбрали кассу, открытую для жителей или работников Берлина.", "Вы проверили применимость GKV к своему статусу.", "Вы готовы получить письменное подтверждение, а не только устный ответ."],
        documents: ["Документ личности", "Адрес", "Данные работодателя и дата начала", "Сведения о прежней страховке", "Фото для eGK: если касса готова принять его сразу"],
        steps: [
          "В официальном списке отфильтруйте кассы для Берлина и откройте сайт выбранной Krankenkasse.",
          "На сайте кассы откройте Kontakt / Geschäftsstellen и проверьте адрес, часы и нужна ли запись.",
          "Напишите кассе или посетите офис, попросите проверить основание GKV и оформить Mitgliedschaft.",
          "Передайте только те документы, которые запросила сама Krankenkasse, и возьмите подтверждение заявления.",
          "Сообщите работодателю название кассы и сохраните подтверждённую дату начала страхования.",
          "Получите eGK; до её доставки запросите временный Versicherungsnachweis при необходимости лечения.",
        ],
        expectedResult: ["Основание и начало членства подтверждены выбранной Krankenkasse.", "Работодатель уведомлён.", "eGK заказана или выдан временный Versicherungsnachweis."],
        fallback: ["Если ближайший офис не принимает без записи, используйте онлайн-заявление этой же кассы или её официальный телефон.", "Если касса считает GKV неприменимой, запросите письменное решение и не прекращайте прежнюю страховку."],
        links: [
          { label: "Найти кассу и её официальный сайт", url: "https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp", kind: "primary" },
          { label: "Проверить правила выбора кассы", url: "https://www.bundesgesundheitsministerium.de/themen/krankenversicherung/online-ratgeber-krankenversicherung/krankenversicherung/wahl-und-wechsel-der-krankenkasse", kind: "secondary" },
        ],
        sourceIds: ["health-gkv-list", "health-choice", "health-egk"],
        stepSourceIds: [["health-gkv-list"], ["health-gkv-list"], ["health-insured-groups"], ["health-gkv-list"], ["health-choice"], ["health-egk", "health-proof"]],
        factSourceIds: { deadline: ["health-choice"], preparationTime: ["health-gkv-list"], appointmentTime: ["health-gkv-list"], processingTime: ["health-gkv-list", "health-egk"], fee: ["health-contributions"] },
      },
      {
        id: "health-student",
        type: "hybrid",
        title: "Подтвердить страховку для учёбы",
        badge: "Krankenkasse → вуз",
        summary: "Определить семейную, студенческую или добровольную GKV и поручить немецкой кассе электронно передать статус в берлинский вуз.",
        deadline: "Свяжитесь с Krankenkasse после Zulassung и до завершения зачисления; срок самого вуза проверяется отдельно.",
        preparationTime: "Единая официальная оценка не опубликована.",
        appointmentTime: "Обычно личный визит не требуется; точный канал зависит от выбранной кассы.",
        processingTime: "Федеральный единый срок не опубликован; вуз и касса показывают статус электронного сообщения отдельно.",
        fee: "Заявление бесплатно; взнос зависит от семейной, студенческой или добровольной формы GKV.",
        prerequisites: ["Есть Zulassung или данные вуза для зачисления.", "Вы не освобождаетесь от studentische Versicherungspflicht без проверки последствий.", "Если есть иностранная страховка или EHIC, её достаточность подтверждает немецкая GKV."],
        documents: ["Документ личности", "Zulassungsbescheid или данные вуза", "Сведения о семейной или иностранной страховке", "Адрес и контактные данные"],
        steps: [
          "Проверьте, возможна ли Familienversicherung; иначе определите studentische Pflichtversicherung или добровольную GKV.",
          "Выберите немецкую Krankenkasse из официального списка и свяжитесь с ней онлайн или через офис.",
          "Передайте данные вуза и попросите проверить страховой статус для зачисления.",
          "Попросите Krankenkasse электронно направить вузу Versicherungsstatus; бумажная карта сама по себе не заменяет это сообщение.",
          "Проверьте в портале вуза, что электронное сообщение получено, и выполните оставшиеся шаги Immatrikulation.",
          "После подтверждения членства получите eGK или временный Versicherungsnachweis.",
        ],
        expectedResult: ["Krankenkasse определила ваш страховой статус.", "Берлинский вуз получил электронное подтверждение.", "Членство и eGK оформлены либо подтверждено другое допустимое покрытие."],
        fallback: ["Если вам 30 лет или больше, попросите кассу проверить добровольную GKV или иной допустимый режим.", "Если вы уже в PKV или хотите освобождение, не принимайте решение без официальной проверки: освобождение обычно действует до конца учёбы и не отзывается."],
        links: [
          { label: "Проверить варианты для студентов", url: "https://gesund.bund.de/krankenversicherung-studierende", kind: "primary" },
          { label: "Проверить электронную передачу в Берлине", url: "https://www.fu-berlin.de/studium/studieren/studienorganisation/krankenversicherung.html", kind: "secondary" },
          { label: "Выбрать Krankenkasse", url: "https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp", kind: "secondary" },
        ],
        sourceIds: ["health-student", "health-student-berlin", "health-gkv-list"],
        stepSourceIds: [["health-student", "health-insured-groups"], ["health-gkv-list"], ["health-student-berlin"], ["health-student-berlin"], ["health-student-berlin"], ["health-egk", "health-proof"]],
        factSourceIds: { deadline: ["health-student-berlin"], preparationTime: ["health-student"], appointmentTime: ["health-gkv-list"], processingTime: ["health-student-berlin"], fee: ["health-student", "health-contributions"] },
      },
      {
        id: "health-family",
        type: "hybrid",
        title: "Подать на Familienversicherung",
        badge: "Через кассу члена семьи",
        summary: "Обратиться в Krankenkasse супруга, партнёра или родителя и пройти официальную проверку условий бесплатного семейного страхования.",
        deadline: "Обратитесь сразу после возникновения семейного основания или прекращения прежней страховки; единого срока подачи федеральный источник не публикует.",
        preparationTime: "Единая официальная оценка не опубликована.",
        appointmentTime: "Личный визит обычно не обязателен; форму и канал определяет Krankenkasse члена семьи.",
        processingTime: "Единый официальный срок не установлен; касса проверяет состав семьи, доход и другие основания.",
        fee: "При подтверждённой Familienversicherung отдельный взнос за члена семьи не взимается.",
        prerequisites: ["Супруг, зарегистрированный партнёр или родитель состоит в GKV.", "Есть Wohnsitz или gewöhnlicher Aufenthalt в Германии.", "Доход и отсутствие другой обязательной страховки соответствуют условиям, что окончательно проверяет касса."],
        documents: ["Документы личности членов семьи", "Подтверждение родства или партнёрства", "Адрес", "Сведения о доходах и другой страховке по запросу кассы"],
        steps: [
          "Откройте официальные условия и не ограничивайтесь только проверкой суммы дохода.",
          "Свяжитесь с Krankenkasse того члена семьи, через которого планируется страхование.",
          "Запросите Antrag auf Familienversicherung и список документов именно для вашей семьи.",
          "Подайте заявление и сведения о доходах и другом страховании через официальный канал кассы.",
          "Получите письменное подтверждение начала Familienversicherung.",
          "Передайте фото, если оно требуется, и получите отдельную eGK на каждого застрахованного.",
        ],
        expectedResult: ["Krankenkasse подтвердила Familienversicherung и дату начала.", "Каждый член семьи получил свой Versicherungsnachweis или eGK."],
        fallback: ["Если доход выше границы или действует другое обязательное страхование, попросите кассу письменно указать, какой собственный режим страхования требуется.", "Не считайте семейное страхование автоматическим: на каждого человека подаётся отдельное заявление."],
        links: [
          { label: "Проверить официальные условия семьи", url: "https://www.bundesgesundheitsministerium.de/gesetzlich-versicherte", kind: "primary" },
          { label: "Проверить общее устройство GKV", url: "https://gesund.bund.de/krankenversicherung", kind: "secondary" },
        ],
        sourceIds: ["health-insured-groups", "health-family-limit", "health-overview", "health-egk"],
        stepSourceIds: [["health-insured-groups"], ["health-insured-groups"], ["health-insured-groups"], ["health-insured-groups"], ["health-insured-groups"], ["health-egk"]],
        factSourceIds: { deadline: ["health-insured-groups"], preparationTime: ["health-insured-groups"], appointmentTime: ["health-insured-groups"], processingTime: ["health-insured-groups"], fee: ["health-insured-groups"] },
      },
      {
        id: "health-benefit",
        type: "hybrid",
        title: "Страхование через Grundsicherung",
        badge: "Jobcenter + Krankenkasse",
        summary: "Выбрать кассу, сообщить её Jobcenter и получить покрытие взносов или субсидию по официальному решению.",
        deadline: "Подайте заявление на Grundsicherung и сообщите выбранную кассу как можно раньше; страхование при выполнении условий начинается со дня заявления.",
        preparationTime: "Зависит от заявления на Grundsicherung; единая оценка не опубликована.",
        appointmentTime: "Многие действия доступны через jobcenter.digital; личный приём зависит от вашего Jobcenter.",
        processingTime: "Срок зависит от решения Jobcenter и Krankenkasse; единого официального срока нет.",
        fee: "Jobcenter оплачивает взносы GKV либо при условиях выдаёт субсидию к действующему страхованию.",
        prerequisites: ["Подано или готовится заявление на Grundsicherung.", "Вы сообщили Jobcenter фактический текущий страховой статус.", "Вы не меняете GKV/PKV без проверки последствий."],
        documents: ["Данные Krankenkasse или полиса", "Документы заявления на Grundsicherung", "Mitgliedsbescheinigung или иной страховой Nachweis по запросу", "Сведения о взносах: если требуется субсидия"],
        steps: [
          "Проверьте официальный порядок покрытия взносов при Grundsicherung.",
          "Если вы можете выбрать GKV, используйте официальный список и оформите членство в выбранной кассе.",
          "Укажите Krankenkasse в заявлении Jobcenter или передайте изменение через официальный онлайн-сервис.",
          "Загрузите запрошенный Versicherungsnachweis и сведения о взносах только через Jobcenter или кассу.",
          "Дождитесь Bescheid Jobcenter и подтверждения Krankenkasse; сравните даты начала.",
          "Получите eGK или временный Versicherungsnachweis.",
        ],
        expectedResult: ["Jobcenter подтвердил оплату взносов или субсидию.", "Krankenkasse подтвердила страхование и дату начала.", "eGK или временный Versicherungsnachweis доступны."],
        fallback: ["Если вы остались в PKV, Jobcenter может выдавать субсидию, а не переводить в GKV: не прекращайте полис без решения.", "Если даты Jobcenter и кассы расходятся, отправьте обеим сторонам письменный запрос с Bescheid и подтверждением членства."],
        links: [
          { label: "Проверить оплату страхования Jobcenter", url: "https://www.arbeitsagentur.de/grundsicherung/finanziell-absichern/gesundheit-versicherung", kind: "primary" },
          { label: "Открыть онлайн-сервисы Jobcenter", url: "https://www.arbeitsagentur.de/grundsicherung/online-services-im-ueberblick", kind: "secondary" },
          { label: "Выбрать Krankenkasse", url: "https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp", kind: "secondary" },
        ],
        sourceIds: ["health-benefit", "health-jobcenter-online", "health-gkv-list", "health-egk"],
        stepSourceIds: [["health-benefit"], ["health-gkv-list"], ["health-jobcenter-online"], ["health-jobcenter-online"], ["health-benefit"], ["health-egk", "health-proof"]],
        factSourceIds: { deadline: ["health-benefit"], preparationTime: ["health-benefit"], appointmentTime: ["health-jobcenter-online"], processingTime: ["health-benefit"], fee: ["health-benefit"] },
      },
      {
        id: "health-egk",
        type: "hybrid",
        title: "Получить eGK или временное подтверждение",
        badge: "После подтверждения GKV",
        summary: "Проверить членство, передать фото в Krankenkasse и не оставаться без доказательства страхования, пока карта изготавливается.",
        deadline: "Специального срока нет; запросите подтверждение сразу, если требуется лечение или доказательство страховки.",
        preparationTime: "Единая официальная оценка не опубликована.",
        appointmentTime: "Личный визит не обязателен, если ваша касса принимает фото и запрос онлайн или по почте.",
        processingTime: "Единого официального срока изготовления eGK нет: срок зависит от кассы.",
        fee: "eGK выдаётся Krankenkasse в рамках членства без отдельной платы.",
        prerequisites: ["Немецкая GKV уже подтвердила членство.", "Имя и адрес в данных кассы актуальны.", "Для человека с 15 лет подготовлено фото, кроме официальных исключений."],
        documents: ["Номер застрахованного или подтверждение членства", "Фото для eGK с 15 лет", "Актуальный адрес", "Документ личности: если касса запрашивает идентификацию"],
        steps: [
          "Свяжитесь со своей Krankenkasse через её официальный кабинет, телефон или офис.",
          "Проверьте, подтверждено ли членство и какой адрес используется для доставки.",
          "Передайте фото способом, указанным кассой; для застрахованных младше 15 лет фото не требуется.",
          "Если карта нужна неотложно, запросите временный Versicherungsnachweis для врача.",
          "Получив eGK, проверьте имя и сохраните контакты кассы на случай потери карты.",
        ],
        expectedResult: ["eGK получена и данные проверены.", "Либо до доставки карты выдан временный Versicherungsnachweis."],
        fallback: ["Если карта не пришла, проверьте адрес и статус фото у кассы.", "Для приёма врача используйте другое подтверждение страхования, которое выдала Krankenkasse."],
        links: [
          { label: "Проверить правила eGK", url: "https://gesund.bund.de/die-elektronische-gesundheitskarte", kind: "primary" },
          { label: "Проверить другой Versicherungsnachweis", url: "https://gesund.bund.de/arztwahl-und-terminsuche", kind: "secondary" },
        ],
        sourceIds: ["health-egk", "health-proof"],
        stepSourceIds: [["health-egk"], ["health-egk"], ["health-egk"], ["health-proof"], ["health-egk"]],
        factSourceIds: { deadline: ["health-proof"], preparationTime: ["health-egk"], appointmentTime: ["health-egk"], processingTime: ["health-egk"], fee: ["health-egk"] },
      },
      {
        id: "health-switch-gkv",
        type: "online",
        title: "Сменить одну GKV на другую",
        badge: "Новая касса ведёт переход",
        summary: "Сравнить официальные Zusatzbeiträge и сервис, подать заявление новой кассе и сообщить работодателю о смене.",
        deadline: "Обычная смена возможна с учётом 12-месячной Bindungsfrist; точную дату начала подтверждает новая касса.",
        preparationTime: "Единая официальная оценка не опубликована.",
        appointmentTime: "Запись не требуется при онлайн-заявлении.",
        processingTime: "Точную дату перехода сообщает новая Krankenkasse после проверки Bindungsfrist и иных условий.",
        fee: "Отдельной платы за смену GKV нет; сравнивайте Zusatzbeitrag и услуги.",
        prerequisites: ["Вы уже состоите в немецкой GKV.", "Вы проверили Bindungsfrist или наличие Sonderkündigungsrecht.", "Вы не прекращаете старое членство до подтверждения новой кассы."],
        documents: ["Данные текущей Krankenkasse", "Документ личности и адрес", "Данные работодателя", "Сведения для заявления новой кассы"],
        steps: [
          "Проверьте официальные правила смены и свою 12-месячную Bindungsfrist.",
          "Сравните кассы, открытые в Берлине, по Zusatzbeitrag, сервису и дополнительным услугам.",
          "Подайте Mitgliedsantrag на официальном сайте новой Krankenkasse.",
          "Дождитесь подтверждения новой кассы с датой начала и не отменяйте защиту самостоятельно раньше этой даты.",
          "Как можно быстрее сообщите работодателю название новой Krankenkasse.",
          "Получите новую eGK и прекратите использовать карту прежней кассы после окончания старого членства.",
        ],
        expectedResult: ["Новая Krankenkasse подтвердила дату начала.", "Работодатель уведомлён.", "Новая eGK получена без разрыва покрытия."],
        fallback: ["Если Bindungsfrist не закончилась, попросите новую кассу указать первую допустимую дату.", "При повышении Zusatzbeitrag проверьте Sonderkündigungsrecht на официальной странице."],
        links: [
          { label: "Проверить правила смены", url: "https://www.bundesgesundheitsministerium.de/themen/krankenversicherung/online-ratgeber-krankenversicherung/krankenversicherung/wahl-und-wechsel-der-krankenkasse", kind: "primary" },
          { label: "Сравнить официальный список", url: "https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp", kind: "secondary" },
        ],
        sourceIds: ["health-choice", "health-gkv-list", "health-egk"],
        stepSourceIds: [["health-choice"], ["health-gkv-list"], ["health-gkv-list"], ["health-choice"], ["health-choice"], ["health-egk"]],
        factSourceIds: { deadline: ["health-overview", "health-choice"], preparationTime: ["health-gkv-list"], appointmentTime: ["health-gkv-list"], processingTime: ["health-choice"], fee: ["health-gkv-list"] },
      },
      {
        id: "health-clarify",
        type: "hybrid",
        title: "Сначала подтвердить GKV или PKV",
        badge: "Без рискованной отмены",
        summary: "Использовать официальные критерии и получить письменную проверку Krankenkasse до заключения или прекращения полиса.",
        deadline: "Проверьте режим до начала работы, учёбы или окончания действующей страховки.",
        preparationTime: "Соберите статус занятости, доход, прежнее страхование и основание пребывания.",
        appointmentTime: "Можно начать онлайн или по телефону; личная консультация зависит от выбранной кассы.",
        processingTime: "Единого срока проверки нет; попросите письменный ответ и дату возможного начала.",
        fee: "Проверка у GKV не оплачивается отдельно; условия PKV зависят от договора и личных факторов.",
        prerequisites: ["Ваш случай не подтверждает простой обязательный путь GKV.", "Действующая страховка сохраняется до письменного решения.", "Вы готовы раскрывать персональные данные только официальной кассе или страховщику."],
        documents: ["Трудовой договор и доход: если работаете", "Immatrikulation или Zulassung: если учитесь", "Сведения о прежней GKV/PKV или иностранной страховке", "Основание семейного страхования: если применимо"],
        steps: [
          "Откройте официальный обзор и определите, какая именно деталь требует проверки: доход выше границы, Minijob, самозанятость, возраст студента, PKV или иностранная страховка.",
          "Выберите подходящую GKV из официального списка и запросите письменную Prüfung der Versicherungspflicht / Mitgliedschaft.",
          "Если письменный ответ допускает PKV, откройте список частных страховщиков. Запросите несколько персональных предложений и сравните покрытие и условия, а не только цену.",
          "Не прекращайте старый полис до письменного подтверждения нового режима и даты начала.",
          "После ответа вернитесь в NOSTRES и выберите применимый маршрут: работник, студент, семья, Jobcenter или eGK.",
        ],
        expectedResult: ["Есть письменное подтверждение применимого режима и даты начала.", "Действующее покрытие не прерывается.", "Понятен следующий официальный канал оформления."],
        fallback: ["Если ответы разных организаций расходятся, запросите письменное решение с основанием.", "При отказе Krankenkasse запросите Bescheid; устный отказ не заменяет официальное решение."],
        links: [
          { label: "Проверить официальный обзор", url: "https://gesund.bund.de/krankenversicherung", kind: "primary" },
          { label: "Проверить переход GKV ↔ PKV", url: "https://www.bundesgesundheitsministerium.de/themen/krankenversicherung/online-ratgeber-krankenversicherung/krankenversicherung/wechsel-zwischen-gkv-und-pkv", kind: "secondary" },
          { label: "Выбрать официальную GKV для проверки", url: "https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp", kind: "secondary" },
          { label: "Найти частных страховщиков и контакты", url: "https://www.pkv.de/verband/ueber-uns/mitglieder-pkv-verband/", kind: "secondary" },
        ],
        sourceIds: ["health-overview", "health-newcomers", "health-insured-groups", "health-gkv-pkv", "health-gkv-list", "health-pkv-list"],
        stepSourceIds: [["health-overview", "health-insured-groups"], ["health-gkv-list"], ["health-gkv-pkv", "health-pkv-list"], ["health-gkv-pkv", "health-newcomers"], ["health-overview"]],
        factSourceIds: { deadline: ["health-newcomers"], preparationTime: ["health-insured-groups"], appointmentTime: ["health-gkv-list"], processingTime: ["health-gkv-list"], fee: ["health-overview"] },
      },
    ],
  },
  {
    id: "self-employment",
    category: "Работа и бизнес",
    scope: "Берлин",
    title: "Gewerbe или Freiberuf (своё дело или фриланс)",
    summary: "Не путать свободную профессию с Gewerbe, проверить право работать и зарегистрироваться в нужном органе.",
    applies: "Вы планируете работать на себя в Берлине или уже начали самостоятельную деятельность.",
    questions: [
      { id: "type", prompt: "Как вы определяете деятельность?", options: [{ value: "freelance", label: "Freier Beruf" }, { value: "trade", label: "Gewerbe" }, { value: "unsure", label: "Не уверен(а)" }] },
      { id: "permission", prompt: "Ваш документ разрешает самозанятость?", options: [{ value: "eu", label: "Я гражданин ЕС / ЕЭЗ" }, { value: "allowed", label: "Да, разрешает" }, { value: "unclear", label: "Не знаю / ограничивает" }] },
      { id: "started", prompt: "Вы уже начали деятельность?", options: yesNo },
    ],
    steps: [
      "Сначала проверьте право на самостоятельную деятельность в вашем документе о пребывании.",
      "Определите, относится ли деятельность к Freier Beruf или Gewerbe; окончательную налоговую квалификацию делает Finanzamt.",
      "Для Freier Beruf подайте Fragebogen zur steuerlichen Erfassung через ELSTER; для Gewerbe сначала используйте Berliner Gewerbeanmeldung.",
      "Не выставляйте счета с выдуманной Steuernummer и заранее проверьте НДС и обязательные страхования.",
    ],
    documents: ["Паспорт и Aufenthaltstitel: если применимо", "Описание деятельности", "Берлинский адрес бизнеса", "Прогноз доходов и расходов", "Разрешения или профессиональные документы: для регулируемой деятельности"],
    fallback: "Если граница между Freier Beruf и Gewerbe неясна или есть иностранные доходы, подготовьте факты и получите индивидуальную налоговую консультацию до регистрации.",
    sources: [
      { label: "Как зарегистрироваться как Freiberufler", organization: "Existenzgründungsportal des Bundes", url: "https://www.existenzgruendungsportal.de/Redaktion/DE/So-gehts/Unternehmensanmeldung/als-freiberuflerin-und-freiberufler-anmelden" },
      { label: "Fragebogen zur steuerlichen Erfassung", organization: "ELSTER", url: "https://www.elster.de/eportal/formulare-leistungen/alleformulare/fseeun" },
      { label: "Gewerbe anmelden в Берлине", organization: "ServicePortal Berlin", url: "https://service.berlin.de/dienstleistung/121921/" },
      { label: "Право на работу и самозанятость", organization: "Landesamt für Einwanderung Berlin", url: "https://www.berlin.de/einwanderung/aufenthalt/erwerbstaetigkeit/" },
    ],
    keywords: "freiberufler gewerbe самозанятость фриланс elster steuernummer бизнес регистрация",
    audience: ["all", "eu", "nonEU", "ukraine", "protection"],
    life: ["all", "work", "business"],
    accent: "blue",
    time: "15–20 минут на маршрут",
  },
  {
    id: "recognition",
    category: "Работа и образование",
    scope: "Германия",
    title: "Anerkennung (признание иностранной квалификации)",
    summary: "Понять, обязательно ли признание, найти компетентный орган и не заказывать лишние переводы заранее.",
    applies: "У вас есть иностранный диплом или профессиональная квалификация, которую вы хотите использовать в Германии.",
    questions: [
      { id: "profession", prompt: "Какой у вас случай?", options: [{ value: "regulated", label: "Регулируемая профессия" }, { value: "nonregulated", label: "Нерегулируемая профессия" }, { value: "academic", label: "Высшее образование" }, { value: "unsure", label: "Не знаю" }] },
      { id: "goal", prompt: "Для чего нужен результат?", options: [{ value: "work", label: "Работа" }, { value: "visa", label: "Виза / ВНЖ" }, { value: "study", label: "Продолжение учёбы" }] },
      { id: "docs", prompt: "Есть диплом и приложение с предметами?", options: yesNo },
    ],
    steps: [
      "Введите точное название профессии в Anerkennungs-Finder.",
      "Проверьте, регулируется ли профессия и какой орган отвечает за неё в Берлине.",
      "Проверьте индивидуальный перечень документов до заказа переводов и заверений.",
      "Подайте заявление в указанный компетентный орган и сохраните Bescheid.",
    ],
    documents: ["Документ личности", "Диплом / свидетельство квалификации", "Приложение с предметами и часами", "Подтверждения опыта: если есть", "Переводы только по требованиям компетентного органа"],
    fallback: "Если документов не хватает, сначала используйте официальную консультацию. Для академического диплома в нерегулируемой профессии может быть нужна Zeugnisbewertung ZAB, а не профессиональное признание.",
    sources: [
      { label: "Anerkennungs-Finder", organization: "Anerkennung in Deutschland: официальный портал", url: "https://www.anerkennung-in-deutschland.de/html/de/anerkennungs-finder.php" },
      { label: "Пошаговый процесс признания", organization: "Anerkennung in Deutschland", url: "https://www.anerkennung-in-deutschland.de/html/de/anerkennung-bekommen.php" },
      { label: "Оценка иностранного высшего образования", organization: "Zentralstelle für ausländisches Bildungswesen", url: "https://www.kmk.org/zentralstelle-fuer-auslaendisches-bildungswesen/zentralstelle-fuer-auslaendisches-bildungswesen/ueber-die-zab.html" },
    ],
    keywords: "диплом признание квалификация anerkennung beruf zeugnisbewertung zab перевод профессия",
    audience: ["all", "eu", "nonEU", "ukraine", "protection"],
    life: ["all", "work", "study"],
    accent: "lilac",
    time: "10–15 минут на маршрут",
  },
  {
    id: "childcare-school",
    category: "Семья",
    scope: "Берлин",
    title: "Kita или Schule (детский сад или школа)",
    summary: "Выбрать Kita-Gutschein, обычную школу или Willkommensklasse с учётом возраста и немецкого языка.",
    applies: "Вы живёте в Берлине с ребёнком и ищете детский сад или школьное место.",
    questions: [
      { id: "age", prompt: "Возраст ребёнка", options: [{ value: "under6", label: "До 6 лет" }, { value: "6to15", label: "6–15 лет" }, { value: "16plus", label: "16–18 лет" }] },
      { id: "german", prompt: "Ребёнок говорит по-немецки?", options: [{ value: "none", label: "Нет или почти нет" }, { value: "some", label: "Немного" }, { value: "fluent", label: "Уверенно" }] },
      { id: "registered", prompt: "Есть Anmeldung в Берлине?", options: yesNo },
    ],
    steps: [
      "Для Kita подайте заявку на Gutschein через ServicePortal и затем ищите место в Kita-Navigator.",
      "Для школьника без достаточного немецкого свяжитесь с Koordinierungsstelle Schulamt вашего Wohnbezirk.",
      "После распределения лично зарегистрируйте ребёнка в назначенной школе.",
      "Для подростков 16–18 лет проверьте отдельный путь Willkommensklasse в Oberstufenzentrum.",
    ],
    documents: ["Документ ребёнка и родителя", "Anmeldung / адрес в Берлине", "Свидетельство о рождении", "Предыдущие школьные документы: если есть", "Подтверждение занятости / учёбы родителей: для объёма Kita, если требуется"],
    fallback: "Если ребёнок школьного возраста ещё не распределён, обращайтесь в координационный пункт Schulamt своего района; не ждите самостоятельного ответа от случайно выбранной школы.",
    sources: [
      { label: "Подать на Kita-Gutschein", organization: "ServicePortal Berlin", url: "https://service.berlin.de/dienstleistung/324873/" },
      { label: "Kita- и Willkommensgutschein", organization: "Senatsverwaltung für Bildung, Jugend und Familie", url: "https://www.berlin.de/sen/jugend/familie-und-kinder/kindertagesbetreuung/kita-gutschein/" },
      { label: "Willkommensklassen и обращение в Schulamt", organization: "Berliner Familienportal", url: "https://familienportal.berlin.de/artikel/willkommensklassen-in-berlin" },
      { label: "Регистрация в Willkommensklasse OSZ, 16+", organization: "Land Berlin", url: "https://www.berlin.de/osz/integration-und-vielfalt/willkommensklassen/formular.1391308.php" },
    ],
    keywords: "ребенок школа kita kindergarten gutschein willkommensklasse schulamt садик образование",
    audience: ["all", "eu", "nonEU", "ukraine", "protection"],
    life: ["all", "family"],
    accent: "coral",
    time: "10–15 минут на маршрут",
  },
];

export const categories = ["Все", "Первые шаги", "Пребывание", "Налоги", "Здоровье", "Работа и бизнес", "Работа и образование", "Семья"];

export const anmeldungProblems: RouteProblem[] = [
  {
    id: "no_appointment",
    label: "Нет свободной записи",
    title: "Проверьте официальный календарь повторно или используйте 115",
    description: "Берлин сообщает, что дополнительные термины добавляются ежедневно. Подтверждение уже забронированного термина считается доказательством соблюдения 14-дневного срока, даже если приём будет позже.",
    methodTypes: ["in-person"],
    sourceIds: ["appointment-rules", "anmeldung-appointment"],
    actions: [
      { label: "Проверить запись снова", url: "https://service.berlin.de/terminvereinbarung/termin/all/120686/", kind: "primary" },
      { label: "Открыть правила записи", url: "https://service.berlin.de/terminvereinbarung/", kind: "secondary" },
      { label: "Найти все Bürgeramt", url: "https://service.berlin.de/standorte/buergeraemter/", kind: "secondary" },
    ],
  },
  {
    id: "eid_unavailable",
    label: "Не работает eID или PIN",
    title: "Проверьте карту в AusweisApp или перейдите в Bürgeramt",
    description: "Transport-PIN можно заменить на собственный шестизначный PIN в AusweisApp. Если PIN забыт или функция eID не активирована, используйте официальную услугу Bürgeramt. Чтобы не пропустить срок Anmeldung, можно сразу перейти на личный способ.",
    methodTypes: ["online"],
    sourceIds: ["ausweisapp", "eid-activate", "eid-pin", "anmeldung-main"],
    actions: [
      { label: "Проверить AusweisApp", url: "https://www.ausweisapp.bund.de/download", kind: "primary" },
      { label: "Активировать eID", url: "https://service.berlin.de/dienstleistung/329830/", kind: "secondary" },
      { label: "Установить или восстановить PIN", url: "https://service.berlin.de/dienstleistung/329833/", kind: "secondary" },
    ],
    switchToMethodId: "anmeldung-personal",
  },
  {
    id: "online_service_error",
    label: "Онлайн-сервис не принимает данные",
    title: "Не ищите обходной путь: проверьте условия и выберите Bürgeramt",
    description: "Если официальный онлайн-сервис не принимает применимую ситуацию, сохраните сообщение об ошибке и используйте подтверждённый личный способ. NOSTRES не рекомендует повторно вводить данные через неофициальные сервисы.",
    methodTypes: ["online"],
    sourceIds: ["anmeldung-online", "anmeldung-main", "anmeldung-appointment"],
    actions: [
      { label: "Проверить условия онлайн-подачи", url: "https://serviceportal.gemeinsamonline.de/Onlinedienste/Service/Entry/EWA", kind: "primary" },
      { label: "Перейти к записи в Bürgeramt", url: "https://service.berlin.de/terminvereinbarung/termin/all/120686/", kind: "secondary" },
    ],
    switchToMethodId: "anmeldung-personal",
  },
  {
    id: "missing_document",
    label: "Не хватает документа",
    title: "Сначала найдите точное требование на странице услуги",
    description: "Для Anmeldung договор аренды не заменяет Wohnungsgeberbestätigung. При первой регистрации в Берлине могут дополнительно понадобиться имеющиеся документы гражданского состояния; для специальных случаев: отдельные формы.",
    methodTypes: ["online", "in-person"],
    sourceIds: ["anmeldung-main"],
    actions: [
      { label: "Открыть документы и формы", url: "https://service.berlin.de/dienstleistung/120686/", kind: "primary" },
    ],
  },
  {
    id: "address_unclear",
    label: "Неясно, куда идти",
    title: "Для обычной Anmeldung можно выбрать любое Bürgeramt Берлина",
    description: "Откройте официальный список, выберите район и проверьте страницу конкретного отделения. Для отдельных статусов ServicePortal может указывать специальную компетенцию.",
    methodTypes: ["in-person"],
    sourceIds: ["anmeldung-main", "buergeraemter"],
    actions: [
      { label: "Найти Bürgeramt и адрес", url: "https://service.berlin.de/standorte/buergeraemter/", kind: "primary" },
      { label: "Проверить компетенцию", url: "https://service.berlin.de/dienstleistung/120686/", kind: "secondary" },
    ],
  },
  {
    id: "source_unavailable",
    label: "Официальная ссылка не открывается",
    title: "Используйте основной ServicePortal и сообщите NOSTRES об ошибке",
    description: "Не заменяйте официальный источник блогом или рекламной страницей. Откройте основную страницу услуги или ServicePortal Berlin и отправьте отчёт, чтобы ссылка попала в очередь проверки.",
    methodTypes: ["online", "in-person"],
    sourceIds: ["anmeldung-main"],
    actions: [
      { label: "Открыть основную страницу Anmeldung", url: "https://service.berlin.de/dienstleistung/120686/", kind: "primary" },
      { label: "Открыть ServicePortal Berlin", url: "https://service.berlin.de/", kind: "secondary" },
    ],
  },
];

export const taxIdProblems: RouteProblem[] = [
  {
    id: "taxid_mail_missing",
    label: "Письмо не приходит",
    title: "Проверьте срок и адрес, затем используйте повторный запрос",
    description: "После первой Anmeldung официальный ориентир составляет 4–8 недель. Если прошло 3 месяца, используйте форму BZSt. Результат повторного запроса также приходит только бумажным письмом.",
    methodTypes: ["hybrid", "online"],
    sourceIds: ["taxid-bund-portal", "taxid-online-form", "taxid-berlin-main"],
    actions: [
      { label: "Открыть повторный запрос BZSt", url: "https://www.elster.de/bportal/formulare-leistungen/alleformulare/idnr", kind: "primary" },
      { label: "Проверить официальные сроки", url: "https://verwaltung.bund.de/leistungsverzeichnis/DE/leistung/99102044101000/herausgeber/LeiKa-102730390/region/00", kind: "secondary" },
    ],
  },
  {
    id: "taxid_online_error",
    label: "Онлайн-форма не принимает данные",
    title: "Проверьте Hauptwohnsitz и написание личных данных",
    description: "Адрес и личные данные должны совпадать с официальными реестрами. Не отправляйте данные через неофициальные формы; при срочной необходимости выберите личный Finanzamt.",
    methodTypes: ["online"],
    sourceIds: ["taxid-online-form", "taxid-berlin-main"],
    actions: [
      { label: "Открыть официальную форму заново", url: "https://www.elster.de/bportal/formulare-leistungen/alleformulare/idnr", kind: "primary" },
      { label: "Проверить правила ServicePortal", url: "https://service.berlin.de/dienstleistung/329123/", kind: "secondary" },
    ],
    switchToMethodId: "taxid-urgent",
  },
  {
    id: "taxid_address_mismatch",
    label: "Адрес не совпадает",
    title: "Сначала проверьте текущую Meldeadresse",
    description: "Без отдельного подтверждения личности IdNr. направляют только на текущую Meldeadresse. Если в реестре указан неправильный адрес, исправьте регистрацию через Bürgeramt, а затем повторите запрос.",
    methodTypes: ["online", "hybrid"],
    sourceIds: ["taxid-berlin-main", "taxid-anmeldung"],
    actions: [
      { label: "Проверить правила отправки", url: "https://service.berlin.de/dienstleistung/329123/", kind: "primary" },
      { label: "Открыть Anmeldung в Берлине", url: "https://service.berlin.de/dienstleistung/120686/", kind: "secondary" },
    ],
  },
  {
    id: "taxid_urgent_need",
    label: "Номер нужен срочно",
    title: "Используйте подтверждённый срочный путь через Finanzamt",
    description: "ServicePortal Berlin указывает личное обращение в Finanzamt как срочный вариант. Потребуется подтвердить личность подходящим документом.",
    methodTypes: ["hybrid", "online"],
    sourceIds: ["taxid-berlin-main", "taxid-finanzamt-finder"],
    actions: [
      { label: "Найти своё Finanzamt", url: "https://www.berlin.de/sen/finanzen/steuern/finanzaemter/zustaendigkeit-finden/artikel.1065064.php", kind: "primary" },
      { label: "Проверить основание", url: "https://service.berlin.de/dienstleistung/329123/", kind: "secondary" },
    ],
    switchToMethodId: "taxid-urgent",
  },
  {
    id: "taxid_office_unclear",
    label: "Непонятно, какой Finanzamt",
    title: "Компетенция зависит от цели и адреса",
    description: "Для обычного личного обращения используйте берлинский поиск по адресу. Для работника без Meldepflicht компетентен Finanzamt работодателя; для другой налоговой обязанности: Finanzamt, ведущий Einkommensteuer.",
    methodTypes: ["in-person", "hybrid"],
    sourceIds: ["taxid-finanzamt-finder", "taxid-no-registration"],
    actions: [
      { label: "Найти Finanzamt по адресу", url: "https://www.berlin.de/sen/finanzen/steuern/finanzaemter/zustaendigkeit-finden/artikel.1065064.php", kind: "primary" },
      { label: "Проверить специальную компетенцию", url: "https://service.berlin.de/dienstleistung/329216/", kind: "secondary" },
    ],
  },
  {
    id: "taxid_missing_document",
    label: "Не хватает документа",
    title: "Проверьте комплект для выбранного способа",
    description: "Для повторного онлайн-запроса документы не загружаются. Для срочного личного обращения нужен документ личности; для выдачи лицу без Meldepflicht: форма 010250 и копия паспорта или Personalausweis.",
    methodTypes: ["online", "in-person", "hybrid"],
    sourceIds: ["taxid-bund-portal", "taxid-no-registration", "taxid-form-010250"],
    actions: [
      { label: "Проверить официальный комплект", url: "https://service.berlin.de/dienstleistung/329216/", kind: "primary" },
      { label: "Скачать форму 010250", url: "https://www.berlin.de/sen/finanzen/steuern/downloads/einkommen-und-lohnsteuerformulare/010250-antrag-vergabe-idnr.pdf", kind: "secondary" },
    ],
  },
  {
    id: "taxid_source_unavailable",
    label: "Официальная ссылка не открывается",
    title: "Вернитесь к основному ServicePortal и сообщите об ошибке",
    description: "Не заменяйте официальную форму рекламным посредником. Используйте основную страницу услуги и отправьте NOSTRES сообщение, чтобы источник попал в очередь проверки.",
    methodTypes: ["online", "in-person", "hybrid"],
    sourceIds: ["taxid-berlin-main", "taxid-bzst"],
    actions: [
      { label: "Открыть ServicePortal Berlin", url: "https://service.berlin.de/dienstleistung/329123/", kind: "primary" },
      { label: "Открыть раздел BZSt", url: "https://www.bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/StID/stid.html", kind: "secondary" },
    ],
  },
];

export const healthProblems: RouteProblem[] = [
  {
    id: "health_status_unclear",
    label: "Касса не подтверждает мой статус",
    title: "Запросите письменную проверку применимого режима",
    description: "Не меняйте GKV, PKV или иностранное покрытие только по устному ответу. Попросите Krankenkasse письменно подтвердить Versicherungspflicht, право на Mitgliedschaft и дату начала.",
    methodTypes: ["online", "in-person", "hybrid"],
    sourceIds: ["health-overview", "health-insured-groups", "health-gkv-pkv"],
    actions: [
      { label: "Проверить группы GKV", url: "https://www.bundesgesundheitsministerium.de/gesetzlich-versicherte", kind: "primary" },
      { label: "Проверить переход GKV ↔ PKV", url: "https://www.bundesgesundheitsministerium.de/themen/krankenversicherung/online-ratgeber-krankenversicherung/krankenversicherung/wechsel-zwischen-gkv-und-pkv", kind: "secondary" },
    ],
    switchToMethodId: "health-clarify",
  },
  {
    id: "health_no_confirmation",
    label: "Нет подтверждения членства",
    title: "Проверьте дату начала и запросите Versicherungsnachweis",
    description: "Сохранённая заявка ещё не всегда доказывает действующее покрытие. Попросите кассу подтвердить дату начала членства и выдать временный страховой документ, если eGK ещё не готова.",
    methodTypes: ["online", "in-person", "hybrid"],
    sourceIds: ["health-egk", "health-proof"],
    actions: [
      { label: "Проверить, чем подтверждается страхование", url: "https://gesund.bund.de/arztwahl-und-terminsuche", kind: "primary" },
      { label: "Проверить eGK", url: "https://gesund.bund.de/die-elektronische-gesundheitskarte", kind: "secondary" },
    ],
  },
  {
    id: "health_card_missing",
    label: "eGK не приходит",
    title: "Проверьте членство, адрес и фото у своей Krankenkasse",
    description: "Карту выпускает сама Krankenkasse. Проверьте подтверждение членства, почтовый адрес и статус фотографии; до доставки попросите временный Versicherungsnachweis.",
    methodTypes: ["online", "in-person", "hybrid"],
    sourceIds: ["health-egk", "health-proof"],
    actions: [
      { label: "Проверить официальные правила eGK", url: "https://gesund.bund.de/die-elektronische-gesundheitskarte", kind: "primary" },
      { label: "Проверить лечение без готовой карты", url: "https://gesund.bund.de/arztwahl-und-terminsuche", kind: "secondary" },
    ],
  },
  {
    id: "health_employer_unconfirmed",
    label: "Работодатель не видит кассу",
    title: "Повторно сообщите название кассы и приложите подтверждение",
    description: "После выбора или смены GKV работодатель должен знать новую кассу. Передайте официальное подтверждение членства и попросите сверить электронную Meldung.",
    methodTypes: ["online", "in-person"],
    sourceIds: ["health-choice"],
    actions: [
      { label: "Проверить правила уведомления работодателя", url: "https://www.bundesgesundheitsministerium.de/themen/krankenversicherung/online-ratgeber-krankenversicherung/krankenversicherung/wahl-und-wechsel-der-krankenkasse", kind: "primary" },
    ],
  },
  {
    id: "health_university_unconfirmed",
    label: "Вуз не получил сообщение",
    title: "Попросите Krankenkasse повторить электронную передачу",
    description: "Для берлинского вуза бумажная eGK или обычная Mitgliedsbescheinigung не заменяет электронное сообщение о статусе. Сообщите кассе точное название вуза и проверьте статус в портале зачисления.",
    methodTypes: ["hybrid"],
    sourceIds: ["health-student-berlin", "health-student"],
    actions: [
      { label: "Проверить порядок передачи в вуз", url: "https://www.fu-berlin.de/studium/studieren/studienorganisation/krankenversicherung.html", kind: "primary" },
      { label: "Проверить варианты для студентов", url: "https://gesund.bund.de/krankenversicherung-studierende", kind: "secondary" },
    ],
  },
  {
    id: "health_jobcenter_mismatch",
    label: "Jobcenter и касса указывают разные даты",
    title: "Сопоставьте Bescheid и подтверждение Krankenkasse",
    description: "Отправьте обеим сторонам письменный запрос с Bescheid, подтверждением членства и датами. Не полагайтесь только на телефонный разговор, если остаётся разрыв покрытия.",
    methodTypes: ["hybrid"],
    sourceIds: ["health-benefit", "health-jobcenter-online"],
    actions: [
      { label: "Открыть порядок страхования Jobcenter", url: "https://www.arbeitsagentur.de/grundsicherung/finanziell-absichern/gesundheit-versicherung", kind: "primary" },
      { label: "Отправить сообщение через Jobcenter", url: "https://www.arbeitsagentur.de/grundsicherung/online-services-im-ueberblick", kind: "secondary" },
    ],
  },
  {
    id: "health_source_unavailable",
    label: "Официальная ссылка не открывается",
    title: "Используйте федеральный обзор и сообщите об ошибке",
    description: "Не заменяйте официальный источник рекламной сравнительной страницей. Вернитесь к gesund.bund.de или BMG и отправьте отчёт NOSTRES.",
    methodTypes: ["online", "in-person", "hybrid"],
    sourceIds: ["health-overview", "health-gkv-list"],
    actions: [
      { label: "Открыть gesund.bund.de", url: "https://gesund.bund.de/krankenversicherung", kind: "primary" },
      { label: "Открыть список GKV", url: "https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp", kind: "secondary" },
    ],
  },
];

export const sourceDirectory = [
  { name: "ServicePortal Berlin", purpose: "Anmeldung, запись и адреса берлинских Bürgeramt", url: "https://service.berlin.de/" },
  { name: "Willkommenszentrum Berlin", purpose: "Поиск жилья, документы для заявки и социальное жильё", url: "https://willkommenszentrum.berlin.de/ru/zhilyo/poisk-zhilya" },
  { name: "ServicePortal Berlin: WBS", purpose: "Условия и подача заявления на социальное жильё", url: "https://service.berlin.de/dienstleistung/120671/" },
  { name: "Bundeszentralamt für Steuern", purpose: "Личная Steuer-ID и официальные разъяснения", url: "https://www.bzst.de/" },
  { name: "ELSTER", purpose: "Официальная онлайн-форма повторного сообщения Steuer-ID", url: "https://www.elster.de/" },
  { name: "gesund.bund.de", purpose: "Медицинское страхование и права застрахованных", url: "https://gesund.bund.de/" },
  { name: "GKV-Spitzenverband", purpose: "Официальный список Krankenkassen, регионы допуска и Zusatzbeiträge", url: "https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp" },
  { name: "Bundesagentur für Arbeit", purpose: "Arbeitslosengeld, Grundsicherung, Jobcenter и покрытие медицинских взносов", url: "https://www.arbeitsagentur.de/grundsicherung" },
  { name: "Familienkasse", purpose: "Kindergeld: условия, онлайн-заявление и документы", url: "https://www.arbeitsagentur.de/familie-und-kinder/infos-rund-um-kindergeld" },
];

function anmeldungOnlineCoreIsEligible(answers: Record<string, string>) {
  return answers.from === "germany"
    && answers.residenceType === "main"
    && answers.age === "adult"
    && answers.citizenship === "eu"
    && ["single", "familyTogether"].includes(answers.household);
}

export function getVisibleQuestions(journey: Journey, answers: Record<string, string>) {
  if (journey.id === "anmeldung") {
    return journey.questions.filter((question) => {
      if (question.id === "residenceType") return answers.from === "germany";
      if (question.id === "onlineId") return anmeldungOnlineCoreIsEligible(answers);
      return true;
    });
  }

  if (journey.id === "tax-id") {
    return journey.questions.filter((question) => {
      if (question.id === "registrationHistory") return answers.idStatus !== "have";
      if (question.id === "firstRegistrationAge") {
        return answers.registrationHistory === "current" && ["notReceived", "unsure"].includes(answers.idStatus);
      }
      if (question.id === "registrationDuty") return answers.registrationHistory === "never";
      if (question.id === "urgency") return answers.registrationHistory === "current" && answers.idStatus !== "have";
      return true;
    });
  }

  if (journey.id === "health") {
    const needsBasis = answers.goal === "join" || (answers.goal === "switch" && answers.insured !== "gkv");
    return journey.questions.filter((question) => {
      if (question.id === "situation") return needsBasis;
      if (question.id === "employeeBand") return needsBasis && answers.situation === "employee";
      if (question.id === "studentAge") return needsBasis && answers.situation === "student";
      if (question.id === "familyCheck") return needsBasis && answers.situation === "family";
      return true;
    });
  }

  return journey.questions;
}

/** Собственное жильё: онлайн-сервис Берлина просит подтверждение от арендодателя только при съёмном жилье;
 * в перечне для личного визита исключение для собственников на странице услуги не указано. */
function withOwnerHousing(method: ActionMethod): ActionMethod {
  const note = method.type === "online"
    ? "Подтверждение от арендодателя (Wohnungsgeberbestätigung) не загружайте: онлайн-сервис просит его, если вы живёте в съёмном жилье."
    : "Wohnungsgeberbestätigung (подтверждение от предоставляющего жильё): в перечне документов для визита исключение для собственников не указано, поэтому подготовьте её.";
  return {
    ...method,
    documents: method.documents.map((item) => (/^Wohnungsgeberbestätigung/.test(item) ? note : item)),
    prerequisites: [...method.prerequisites, "Вы указали, что жильё принадлежит вам: перечень документов ниже учитывает это."],
  };
}

export function getAvailableActionMethods(journey: Journey, answers: Record<string, string>): AvailableActionMethod[] {
  if (!journey.actionMethods) return [];
  const visibleQuestions = getVisibleQuestions(journey, answers);
  if (visibleQuestions.some((question) => !answers[question.id])) return [];

  const available = (id: string, label: string) => {
    const method = journey.actionMethods?.find((item) => item.id === id);
    return method ? { ...method, availability: "ready" as const, availabilityLabel: label } : null;
  };

  if (journey.id === "tax-id") {
    const methods: AvailableActionMethod[] = [];
    if (answers.idStatus === "have") {
      const method = available("taxid-find", "Можно проверить сейчас");
      return method ? [method] : [];
    }

    if (answers.registrationHistory === "current") {
      const shouldWait = ["notReceived", "unsure"].includes(answers.idStatus) && answers.firstRegistrationAge === "under3";
      const primary = available(shouldWait ? "taxid-wait" : "taxid-online", shouldWait ? "Автоматический путь уже запущен" : "Можно отправить сейчас");
      if (primary) methods.push(primary);
      const urgent = available("taxid-urgent", answers.urgency === "urgent" ? "Подходит для срочной ситуации" : "Запасной путь при срочности");
      if (urgent) methods.push(urgent);
      return methods;
    }

    if (answers.registrationHistory === "previous") {
      const method = available("taxid-online", "Можно отправить сейчас");
      return method ? [method] : [];
    }

    const branchId = answers.registrationDuty === "mustRegister"
      ? "taxid-anmeldung-first"
      : answers.registrationDuty === "employee"
        ? "taxid-nonresident-employee"
        : answers.registrationDuty === "tax"
          ? "taxid-nonresident-tax"
          : "";
    if (!branchId) return [];
    const method = available(branchId, branchId === "taxid-anmeldung-first" ? "Начните с Anmeldung" : "Специальный путь подтверждён");
    return method ? [method] : [];
  }

  if (journey.id === "health") {
    const healthMethod = (id: string, label: string) => available(id, label);
    if (answers.goal === "card") {
      const method = healthMethod(answers.insured === "gkv" ? "health-egk" : "health-clarify", answers.insured === "gkv" ? "Можно запросить сейчас" : "Сначала подтвердите вид страхования");
      return method ? [method] : [];
    }

    if (answers.goal === "switch" && answers.insured === "gkv") {
      const method = healthMethod("health-switch-gkv", "Можно начать сравнение сейчас");
      return method ? [method] : [];
    }

    if (answers.insured === "private") {
      const method = healthMethod("health-clarify", "Сначала нужна письменная проверка перехода");
      return method ? [method] : [];
    }

    if (answers.situation === "employee") {
      if (answers.insured === "gkv" && answers.goal === "join") {
        const method = healthMethod("health-egk", "Членство уже есть: проверьте подтверждение");
        return method ? [method] : [];
      }
      if (answers.employeeBand === "compulsory") {
        return [
          healthMethod("health-employee-online", "Можно подать онлайн"),
          healthMethod("health-employee-direct", "Можно оформить через кассу"),
        ].flatMap((method) => method ? [method] : []);
      }
      const method = healthMethod("health-clarify", answers.employeeBand === "mini" ? "Minijob не создаёт страхование через работу" : "Нужна проверка режима");
      return method ? [method] : [];
    }

    if (answers.situation === "student") {
      const method = healthMethod("health-student", answers.studentAge === "thirtyPlus" ? "Нужна проверка добровольной GKV" : "Можно запустить проверку для вуза");
      return method ? [method] : [];
    }

    if (answers.situation === "family") {
      const method = healthMethod(answers.familyCheck === "incomeHigh" ? "health-clarify" : "health-family", answers.familyCheck === "likely" ? "Можно подать на проверку семьи" : "Касса должна подтвердить условия");
      return method ? [method] : [];
    }

    if (answers.situation === "benefit") {
      const method = healthMethod("health-benefit", "Скоординируйте Jobcenter и кассу");
      return method ? [method] : [];
    }

    const method = healthMethod("health-clarify", "Сначала подтвердите GKV или PKV");
    return method ? [method] : [];
  }

  const adjust = (method: ActionMethod | undefined) => (method && answers.housing === "owner" ? withOwnerHousing(method) : method);
  const personal = adjust(journey.actionMethods.find((method) => method.id === "anmeldung-personal"));
  const online = adjust(journey.actionMethods.find((method) => method.id === "anmeldung-online"));
  const methods: AvailableActionMethod[] = [];

  if (online && anmeldungOnlineCoreIsEligible(answers) && answers.onlineId !== "none") {
    methods.push({
      ...online,
      availability: answers.onlineId === "ready" ? "ready" : "needs-setup",
      availabilityLabel: answers.onlineId === "ready" ? "Можно начать сейчас" : "Доступно после настройки eID и BundID",
    });
  }

  if (personal) {
    methods.push({ ...personal, availability: "ready", availabilityLabel: "Доступно по официальной записи" });
  }

  return methods;
}

export function getPersonalizedResult(journeyId: string, answers: Record<string, string>): PersonalizedResult | null {
  const journey = journeys.find((item) => item.id === journeyId);
  if (!journey || getVisibleQuestions(journey, answers).some((question) => !answers[question.id])) return null;

  if (journeyId === "anmeldung") {
    if (anmeldungOnlineCoreIsEligible(answers) && answers.onlineId === "ready") {
      return { title: "Вы можете выбрать: онлайн или Bürgeramt", text: "Оба способа применимы. Онлайн не требует записи и официально занимает до 3 рабочих дней на проверку; при личном визите Meldebestätigung выдают сразу после проверки документов.", actionLabel: "Проверить официальные условия", actionUrl: journey.sources[0].url };
    }
    if (anmeldungOnlineCoreIsEligible(answers) && answers.onlineId === "setup") {
      return { title: "Онлайн доступен после настройки или выберите Bürgeramt", text: "У вас подходящая ситуация для электронной регистрации, но сначала потребуются BundID, активная eID, PIN и AusweisApp. Если не хотите настраивать их сейчас, можно выбрать личный визит.", actionLabel: "Проверить официальные условия", actionUrl: journey.sources[0].url };
    }

    const reason = answers.from === "abroad"
      ? "это первая регистрация после переезда из другой страны"
      : answers.residenceType === "multiple"
        ? "после переезда у вас останется ещё одна квартира в Германии, поэтому нужно определить Hauptwohnung и Nebenwohnung"
        : answers.age !== "adult"
          ? "онлайн-сервис предназначен для совершеннолетнего заявителя"
          : answers.citizenship !== "eu"
            ? "официальный онлайн-сервис Anmeldung сейчас указан только для граждан Германии и ЕС; электронный Aufenthaltstitel eAT для этой услуги не принимается"
            : answers.household === "childSpecial"
              ? "ситуация ребёнка требует документов о согласии законных представителей"
              : answers.onlineId === "none"
                ? "нет подходящего Personalausweis или eID-карты для электронной идентификации"
                : "ваша ситуация не входит в подтверждённые условия онлайн-сервиса";

    return { title: "Ваш подтверждённый путь: Bürgeramt", text: tr("Онлайн-вариант не показывается, потому что {reason}. Можно записаться в любое берлинское Bürgeramt.").replace("{reason}", tr(reason)), actionLabel: "Перейти сразу к записи на Anmeldung", actionUrl: "https://service.berlin.de/terminvereinbarung/termin/all/120686/" };
  }

  if (journeyId === "residence") {
    if (answers.status === "eu") return { title: "Обычный Aufenthaltstitel, как правило, не нужен", text: "Граждане ЕС/ЕЭЗ пользуются свободой передвижения. После переезда зарегистрируйте адрес; для членов семьи без гражданства ЕС действует отдельная Aufenthaltskarte.", actionLabel: "Открыть правила для ЕС", actionUrl: journey.sources[2].url };
    const warning = answers.expiry === "expired" ? "Документ уже истёк: не полагайтесь на автоматическое продление и получите индивидуальную оценку." : answers.expiry === "less8" ? "Срок близко: подавайте сейчас и сохраните подтверждение подачи." : undefined;
    return { title: "Начните с точной онлайн-услуги LEA", text: tr("Цель: {purpose}. Сначала найдите соответствующий онлайн-Antrag; если его нет, используйте контактную форму компетентного отдела.").replace("{purpose}", tr(answers.purpose === "work" ? "работа" : answers.purpose === "study" ? "учёба" : answers.purpose === "family" ? "семья" : answers.purpose === "business" ? "самозанятость" : "другая")), actionLabel: "Выбрать услугу LEA", actionUrl: journey.sources[0].url, warning };
  }

  if (journeyId === "tax-id") {
    if (answers.idStatus === "have") {
      return { title: "Новая Steuer-ID вам не нужна", text: "Используйте уже присвоенную 11-значную IdNr.: она действует всю жизнь и не меняется при переезде или браке. Не путайте её со Steuernummer бизнеса.", actionLabel: "Проверить, где найти номер", actionUrl: journey.sources.find((source) => source.id === "taxid-berlin-faq")!.url };
    }

    if (answers.registrationHistory === "current") {
      const shouldWait = ["notReceived", "unsure"].includes(answers.idStatus) && answers.firstRegistrationAge === "under3";
      if (shouldWait) {
        return { title: answers.urgency === "urgent" ? "Можно ждать письмо или обратиться в Finanzamt срочно" : "Пока действует автоматический путь после Anmeldung", text: "Официальный ориентир автоматической отправки: 4–8 недель. Если письма нет через 3 месяца, используйте повторный онлайн-запрос; при срочной необходимости ServicePortal допускает личное обращение в Finanzamt.", actionLabel: "Проверить официальный срок", actionUrl: journey.sources.find((source) => source.id === "taxid-bund-portal")!.url };
      }
      return { title: answers.urgency === "urgent" ? "Выберите онлайн-запрос или срочный Finanzamt" : "Запросите повторное сообщение IdNr. онлайн", text: "BZSt повторно сообщает ту же пожизненную IdNr. Средняя обработка онлайн-формы: 4 недели; номер приходит бумажным письмом, а не по email или телефону.", actionLabel: "Открыть форму BZSt", actionUrl: journey.sources.find((source) => source.id === "taxid-online-form")!.url };
    }

    if (answers.registrationHistory === "previous") {
      return { title: "Номер уже существует: запросите его повторное сообщение", text: "Предыдущая Anmeldung означает, что IdNr. могла быть присвоена раньше. Новый номер не создают; используйте форму BZSt и укажите текущий Hauptwohnsitz.", actionLabel: "Открыть форму BZSt", actionUrl: journey.sources.find((source) => source.id === "taxid-online-form")!.url };
    }

    if (answers.registrationDuty === "mustRegister") {
      return { title: "Сначала выполните Anmeldung", text: "Если вы живёте в Германии и обязаны зарегистрировать адрес, форма для лиц без Meldepflicht не является заменой Anmeldung. После регистрации данные передадут в BZSt автоматически.", actionLabel: "Открыть официальную Anmeldung", actionUrl: journey.sources.find((source) => source.id === "taxid-anmeldung")!.url };
    }

    if (answers.registrationDuty === "employee") {
      return { title: "Используйте форму 010250 через Finanzamt работодателя", text: "Этот специальный путь предназначен для человека без Meldepflicht, который начинает работу по найму в Германии и нуждается в IdNr. для ELStAM.", actionLabel: "Скачать форму 010250", actionUrl: journey.sources.find((source) => source.id === "taxid-form-010250")!.url };
    }

    if (answers.registrationDuty === "tax") {
      return { title: "Используйте форму 010250 через компетентный Finanzamt", text: "Для человека без Meldepflicht, но с налоговой обязанностью в Германии, IdNr. запрашивает Finanzamt. При подаче Einkommensteuererklärung отдельная форма обычно не нужна.", actionLabel: "Проверить специальную процедуру", actionUrl: journey.sources.find((source) => source.id === "taxid-no-registration")!.url };
    }

    return { title: "Отдельный запрос Steuer-ID вам сейчас не нужен", text: "Номер присваивается при Anmeldung или когда у вас появляется налоговая связь с Германией, например работа или доход. Пока нет ни того, ни другого, специальный путь через Finanzamt не применяется. Когда появится адрес в Германии, номер придёт после Anmeldung. Не отправляйте личные данные в сторонние сервисы только ради получения номера.", actionLabel: "Открыть официальные условия", actionUrl: journey.sources.find((source) => source.id === "taxid-no-registration")!.url };
  }

  if (journeyId === "health") {
    const source = (id: string) => journey.sources.find((item) => item.id === id)!.url;
    if (answers.goal === "card") {
      if (answers.insured === "gkv") return { title: "Запросите eGK или временный Versicherungsnachweis", text: "Карту выдаёт ваша Krankenkasse. Для человека с 15 лет обычно требуется фото. Если лечение нужно до доставки карты, запросите у кассы другое официальное подтверждение страхования.", actionLabel: "Проверить правила eGK", actionUrl: source("health-egk") };
      return { title: "Сначала подтвердите членство в немецкой GKV", text: "eGK выдаётся только застрахованным в GKV. При PKV, иностранной страховке или неясном статусе сначала получите письменное подтверждение применимого режима.", actionLabel: "Проверить официальный обзор", actionUrl: source("health-overview"), warning: "Не отменяйте действующий полис до письменного подтверждения нового покрытия." };
    }

    if (answers.goal === "switch" && answers.insured === "gkv") {
      return { title: "Вы можете сравнить GKV и подать заявление новой кассе", text: "Проверьте 12-месячную Bindungsfrist, Zusatzbeitrag и сервис. Точную дату перехода подтверждает новая Krankenkasse; после этого быстро сообщите её работодателю.", actionLabel: "Проверить правила смены", actionUrl: source("health-choice") };
    }

    if (answers.insured === "private") {
      return { title: "Не прекращайте PKV до проверки права на GKV", text: "Переход между системами разрешён не во всех случаях. Попросите выбранную GKV письменно подтвердить Versicherungspflicht или право на членство и дату начала.", actionLabel: "Проверить переход GKV и PKV", actionUrl: source("health-gkv-pkv"), warning: "Разрыв между полисами недопустим: сначала подтверждение нового покрытия, затем прекращение старого." };
    }

    if (answers.situation === "employee") {
      if (answers.insured === "gkv" && answers.goal === "join") return { title: "Новое членство не требуется: сообщите действующую GKV работодателю", text: "Проверьте дату действия членства и eGK. Работодатель должен знать название выбранной Krankenkasse; при смене используйте отдельный путь.", actionLabel: "Проверить правила выбора кассы", actionUrl: source("health-choice") };
      if (answers.employeeBand === "compulsory") return { title: "Выберите государственную больничную кассу: онлайн или через офис", text: "Официальный список показывает кассы, открытые в Берлине, и их актуальные Zusatzbeiträge. После заявления сообщите выбранную кассу работодателю.", actionLabel: "Открыть список Krankenkassen", actionUrl: source("health-gkv-list") };
      if (answers.employeeBand === "mini") return { title: "Minijob сам по себе не создаёт медицинское страхование", text: "Нужно другое основание: семейная страховка, Jobcenter, учёба, добровольная GKV или иной применимый режим. Сначала запросите письменную проверку.", actionLabel: "Проверить официальный обзор", actionUrl: source("health-overview") };
      return { title: "Сначала подтвердите, обязательна ли GKV", text: answers.employeeBand === "above" ? "Доход выше Jahresarbeitsentgeltgrenze может открыть выбор между добровольной GKV и PKV, но переход зависит от предыдущего страхования и других условий." : "Особый трудовой статус или неизвестный доход требуют проверки кассой до заключения или отмены полиса.", actionLabel: "Проверить группы застрахованных", actionUrl: source("health-insured-groups"), warning: "Не выбирайте PKV только по цене: возвращение в GKV может быть ограничено." };
    }

    if (answers.situation === "student") {
      const text = answers.studentAge === "familyPossible"
        ? "Сначала проверьте бесплатную Familienversicherung; если она не подходит, Krankenkasse определит studentische Pflichtversicherung и передаст страховой статус вузу электронно."
        : answers.studentAge === "thirtyPlus"
          ? "После 30 лет studentische Pflichtversicherung обычно заканчивается; попросите кассу проверить добровольную GKV или другой применимый режим."
          : "Немецкая Krankenkasse проверит studentische Pflichtversicherung и электронно передаст вузу страховой статус.";
      return { title: "Обратитесь в немецкую Krankenkasse для электронной передачи в вуз", text, actionLabel: "Проверить страхование студентов", actionUrl: source("health-student") };
    }

    if (answers.situation === "family") {
      if (answers.familyCheck === "incomeHigh") return { title: "Familienversicherung, вероятно, не подходит: нужна собственная страховка", text: "Доход выше общей границы 565 € в месяц (при Minijob – 603 €) в 2026 году препятствует бесплатному семейному страхованию. Попросите кассу письменно определить собственный режим.", actionLabel: "Проверить официальные условия семьи", actionUrl: source("health-insured-groups") };
      return { title: "Подайте заявление в Krankenkasse члена семьи", text: "Семейное страхование не возникает автоматически: касса проверяет родство, проживание, доход и отсутствие другого обязательного режима для каждого человека.", actionLabel: "Проверить Familienversicherung", actionUrl: source("health-insured-groups") };
    }

    if (answers.situation === "benefit") {
      return { title: "Свяжите заявление Jobcenter с выбранной Krankenkasse", text: "При выполнении условий Jobcenter оплачивает взносы или субсидию. Укажите текущий статус честно, выберите кассу при наличии права и сравните даты в Bescheid и подтверждении кассы.", actionLabel: "Проверить страхование через Jobcenter", actionUrl: source("health-benefit") };
    }

    return { title: "Сначала получите письменную проверку режима", text: "Для самозанятости, иностранной страховки и других особых случаев нельзя безопасно вывести GKV или PKV только из одного ответа. Выберите официальную GKV и запросите Prüfung der Versicherungspflicht / Mitgliedschaft.", actionLabel: "Открыть официальный обзор", actionUrl: source("health-overview"), warning: "NOSTRES не рекомендует отменять существующее покрытие до подтверждения нового." };
  }

  if (journeyId === "self-employment") {
    if (answers.permission === "unclear") return { title: "Сначала проверьте право на самозанятость", text: "Регистрация бизнеса не заменяет разрешение на работу. Проверьте формулировку в Aufenthaltstitel и условия LEA до начала деятельности.", actionLabel: "Открыть правила LEA", actionUrl: journey.sources[3].url, warning: "Не начинайте деятельность, пока право на неё не подтверждено." };
    if (answers.type === "trade") return { title: "Ваш первый маршрут: Gewerbeanmeldung", text: "Для Gewerbe в Берлине доступна онлайн-подача. После неё всё равно потребуется налоговая регистрация через ELSTER.", actionLabel: "Открыть Gewerbeanmeldung", actionUrl: journey.sources[2].url };
    if (answers.type === "freelance") return { title: "Начните с Finanzamt через ELSTER", text: "Freiberufler обычно не подают Gewerbeanmeldung. Передайте Fragebogen zur steuerlichen Erfassung и дождитесь Steuernummer.", actionLabel: "Открыть Fragebogen в ELSTER", actionUrl: journey.sources[1].url };
    return { title: "Определите вид деятельности по официальному перечню", text: "Freier Beruf и Gewerbe регистрируются в разных органах и облагаются по-разному. Федеральный гайд перечисляет свободные профессии: если ваша деятельность в нём, путь идёт через Finanzamt, если нет – через Gewerbeanmeldung. Заранее подготовьте точное описание деятельности.", actionLabel: "Открыть гайд для Freiberufler", actionUrl: journey.sources[0].url };
  }

  if (journeyId === "recognition") {
    if (answers.profession === "academic" && answers.goal !== "study") return { title: "Проверьте Zeugnisbewertung ZAB", text: "Для иностранного высшего образования в нерегулируемой профессии часто используется оценка диплома, а не профессиональное признание. Сначала подтвердите путь в Anerkennungs-Finder.", actionLabel: "Открыть ZAB", actionUrl: journey.sources[2].url };
    return { title: "Начните с Anerkennungs-Finder", text: answers.docs === "no" ? "Сервис покажет компетентный орган. Если комплекта документов нет, компетентный орган, указанный сервисом, называет допустимые альтернативы; до этого не заказывайте переводы." : "Сервис покажет компетентный орган и перечень документов именно для вашей профессии и места работы.", actionLabel: "Запустить Anerkennungs-Finder", actionUrl: journey.sources[0].url };
  }

  if (journeyId === "childcare-school") {
    if (answers.age === "under6") return { title: "Ваш путь: Kita-Gutschein", text: "Подайте на Gutschein в своём Jugendamt через официальный сервис, затем ищите место. Объём Betreuung зависит от возраста и подтверждённой потребности.", actionLabel: "Подать на Kita-Gutschein", actionUrl: journey.sources[0].url };
    if (answers.age === "16plus" && answers.german !== "fluent") return { title: "Проверьте Willkommensklasse в OSZ", text: "Для вновь прибывших подростков 16–18 лет есть отдельная регистрация в Willkommensklasse Oberstufenzentrum.", actionLabel: "Открыть форму OSZ", actionUrl: journey.sources[3].url };
    if (answers.german !== "fluent") return { title: "Обратитесь в Koordinierungsstelle своего Schulamt", text: "Координационный пункт по месту жительства определит школу и формат обучения; после распределения нужна личная регистрация в школе.", actionLabel: "Открыть официальный порядок", actionUrl: journey.sources[2].url };
    return { title: "Начните со Schulamt или школы по району", text: "При достаточном немецком ребёнка могут направить в обычный класс. Точный порядок зависит от возраста, Wohnbezirk и типа школы.", actionLabel: "Открыть школьную информацию", actionUrl: journey.sources[2].url };
  }

  return null;
}
