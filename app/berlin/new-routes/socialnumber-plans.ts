import type { Action, Answers, Plan, Question, Step } from "./route-model.ts";

type Mode = Step["mode"];
const act = (label: string, href: string): Action => ({ label, href });
const q = (id: string, prompt: string, options: readonly (readonly [string, string])[]): Question => ({ id, prompt, options });
const step = (title: string, detail: string, mode: Mode, action: Action, source: Action = action, alternative?: Action): Step => ({ title, detail, mode, action, source, alternative });

/** Официальные страницы маршрута «номер социального страхования и номер медицинской страховки» (сверены 12 ноября 2026 года). */
export const socialNumberOfficial = {
  proof: "https://www.deutsche-rentenversicherung.de/DRV/DE/Experten/Arbeitgeber-und-Steuerberater/summa-summarum/Lexikon/V/versicherungsnummernachweis.html",
  free2026: "https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2026/260928-vnn-gibt-es-kostenfrei",
  firstJob: "https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2025/250709-versicherungsnummernachweis",
  faq: "https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Allgemeine-Informationen/Wissenswertes-zur-Rente/FAQs/Versicherung/Versicherungsunterlagen_liste.html",
  online: "https://kundenportal.deutsche-rentenversicherung.de/od/",
  egk: "https://gesund.bund.de/die-elektronische-gesundheitskarte",
  egkBmg: "https://www.bundesgesundheitsministerium.de/themen/digitalisierung/elektronische-gesundheitskarte",
};
const o = socialNumberOfficial;

export const socialNumberQuestions = [
  q("need", "Какой номер вам нужен?", [["sv", "Номер социального страхования (Sozialversicherungsnummer), его просит работодатель"], ["kv", "Номер медицинской страховки (Krankenversichertennummer) на карте eGK"], ["tax", "Налоговый номер для работодателя (Steuer-ID)"]]),
  q("work", "Работали ли вы уже в Германии по трудовому договору?", [["first", "Нет, это моя первая работа в Германии"], ["unknown", "Да, но номера я не знаю"], ["proof", "Номер знаю, но нужен Versicherungsnummernachweis (документ с номером)"]]),
  q("insured", "Вы уже застрахованы в государственной больничной кассе?", [["card", "Да, карта eGK у меня есть"], ["nocard", "Да, но карты нет: потерял(а) или ещё не пришла"], ["no", "Нет, пока не застрахован(а)"]]),
] as const;

export function socialNumberVisible(a: Answers): readonly Question[] {
  const [need, work, insured] = socialNumberQuestions;
  if (a.need === "sv") return [need, work];
  if (a.need === "kv") return [need, insured];
  return [need];
}

const hotline = "Бесплатная линия Deutsche Rentenversicherung: 0800 1000 4800, пн–чт 8:00–19:00, пт 8:00–15:30. Сам номер по телефону не сообщают: это запрещают правила защиты данных.";
const paidWarning = step(
  "Не платите посредникам",
  "Versicherungsnummernachweis выдают бесплатно. Некоторые сайты в интернете берут за него деньги: это не запрещено, но такие сайты обязаны прямо писать, что они не ведомство. Заказывайте документ только у Deutsche Rentenversicherung или в своей больничной кассе.",
  "Выбор",
  act("DRV: документ бесплатный, осторожно с платными сайтами", o.free2026),
);

export function socialNumberPlan(a: Answers): Plan {
  const note = "Это общая информация. Условия взяты с официальных страниц Deutsche Rentenversicherung, gesund.bund.de и Федерального министерства здравоохранения.";
  if (!a.need || a.need === "tax") return {
    fit: "redirect",
    why: ["Вам нужен налоговый номер, а не номер социального страхования"],
    title: "Steuer-ID — это отдельный налоговый номер",
    summary: "Работодатель просит два разных номера: налоговый Steuer-ID и номер социального страхования. Steuer-ID присваивает налоговое ведомство; как его получить или восстановить, показывает отдельный маршрут.",
    steps: [step("Откройте маршрут Steuer-ID", "Маршрут покажет, присвоен ли вам Steuer-ID и как получить его письмо заново. Номер социального страхования выдаёт Deutsche Rentenversicherung: если он тоже нужен, вернитесь сюда и выберите его.", "Онлайн", act("Маршрут: Steuer-ID", "/berlin/steuer-id"), act("DRV: что такое Versicherungsnummernachweis", o.proof))],
    note,
    next: act("Маршрут: Steuer-ID", "/berlin/steuer-id"),
  };

  if (a.need === "kv") {
    const insured = a.insured ?? "card";
    if (insured === "no") return {
      fit: "insufficient",
      why: ["Вы ещё не застрахованы в государственной кассе"],
      title: "Сначала оформите медицинскую страховку",
      summary: "Карту eGK с номером медицинской страховки выдаёт государственная больничная касса своим застрахованным. Пока страховки нет, нет и номера.",
      steps: [step("Выберите страховку и кассу", "Маршрут медицинской страховки покажет, какая страховка вам положена, как вступить в кассу и что принести. После вступления касса пришлёт карту eGK с номером.", "Онлайн", act("Маршрут: медицинская страховка", "/berlin/health-insurance"), act("gesund.bund.de: карта eGK", o.egk))],
      note,
      next: act("Маршрут: медицинская страховка", "/berlin/health-insurance"),
    };
    const steps = insured === "card"
      ? [
        step("Найдите номер на карте", "Номер медицинской страховки (Krankenversichertennummer) записан на карте eGK: на лицевой стороне указаны Versichertennummer (ваш номер застрахованного) и Kennnummer der Krankenversicherung (номер кассы). Используйте только карту, которую касса прислала последней: после её получения старые карты недействительны. Карта действует не больше пяти лет, затем касса присылает новую.", "Выбор", act("gesund.bund.de: что написано на карте", o.egk), act("Минздрав: данные на карте eGK", o.egkBmg)),
        step("Если нужен PIN для онлайн-сервисов", "PIN к карте и данные для входа по NFC выдаёт ваша больничная касса.", "Онлайн", act("gesund.bund.de: PIN и вход с картой", o.egk)),
      ]
      : [
        step("Сообщите кассе, что карты нет", "Карту eGK выпускает ваша больничная касса. О потерянной или украденной карте сразу сообщите кассе; если карта не пришла, обратитесь туда же. Новую карту присылает касса, старые после этого недействительны. Карта действует не больше пяти лет, с 15 лет на ней есть фото.", "Онлайн", act("gesund.bund.de: потерянная карта и новая карта", o.egk), act("Минздрав: карта eGK", o.egkBmg)),
        step("Получите PIN к новой карте", "PIN к карте и данные для входа по NFC выдаёт ваша больничная касса.", "Онлайн", act("gesund.bund.de: PIN и вход с картой", o.egk)),
      ];
    return {
      fit: "fits",
      why: [insured === "card" ? "Вы застрахованы, карта eGK есть" : "Вы застрахованы, но карты сейчас нет"],
      title: insured === "card" ? "Номер медицинской страховки: смотрите на карте eGK" : "Нет карты eGK: новую выпускает ваша касса",
      summary: insured === "card"
        ? "Номер застрахованного записан на лицевой стороне карты eGK вашей больничной кассы."
        : "Карту и номер выдаёт ваша больничная касса: сообщите ей, что карты нет, и дождитесь новой.",
      steps,
      singleMethodNote: "Карту выпускает только ваша больничная касса: способ один.",
      note,
      next: act("Маршрут: поиск врача", "/berlin/vrach"),
    };
  }

  const work = a.work ?? "first";
  if (work === "first") return {
    fit: "fits",
    why: ["Первая работа в Германии: номер присваивается при первой регистрации у работодателя"],
    title: "Первая работа: номер социального страхования оформит работодатель",
    summary: "При первой работе номер присваивают автоматически, а Versicherungsnummernachweis (документ с номером, раньше Sozialversicherungsausweis) приходит бесплатно. Обычно этим занимается работодатель.",
    steps: [
      step("Дайте работодателю данные для заявки", "Если номера ещё нет, работодатель при регистрации работника вносит данные, нужные для его присвоения. Номер работодатель затем получает сам в электронном виде; показывать ему документ обычно не нужно.", "Выбор", act("DRV: номер при первой работе", o.firstJob), act("DRV: как работодатель получает номер", o.proof)),
      step("Дождитесь Versicherungsnummernachweis", "Документ с номером приходит бесплатно и, как правило, автоматически, когда номер присвоен. Сохраните его: номер также стоит на всех письмах Deutsche Rentenversicherung.", "Ожидание", act("DRV: документ выдают автоматически", o.free2026), act("DRV: где найти номер", o.faq)),
      step("Если документ не пришёл", `Закажите его бесплатно через онлайн-сервисы Deutsche Rentenversicherung или в своей больничной кассе. ${hotline}`, "Онлайн", act("DRV: онлайн-сервисы", o.online), act("DRV: как заказать документ", o.firstJob)),
      paidWarning,
    ],
    singleMethodNote: "Номер присваивается через работодателя: способ один, запасной — заказ у DRV или кассы.",
    note,
    next: act("Маршрут: медицинская страховка", "/berlin/health-insurance"),
  };
  if (work === "unknown") return {
    fit: "fits",
    why: ["Номер уже есть, но вы его не знаете"],
    title: "Номер есть, но неизвестен: найдите его в письмах или запросите письменно",
    summary: "Номер социального страхования стоит на всех письмах Deutsche Rentenversicherung. Если писем нет, его присылают по почте по письменному запросу.",
    steps: [
      step("Посмотрите письма Deutsche Rentenversicherung", "Номер стоит на каждом письме Deutsche Rentenversicherung и в документе Versicherungsnummernachweis, если он у вас сохранился.", "Выбор", act("DRV: где найти номер", o.faq)),
      step("Запросите номер письменно", `Напишите в Deutsche Rentenversicherung и укажите дату рождения, фамилию при рождении, место рождения и нынешний почтовый адрес. Номер пришлют по почте без задержки. ${hotline}`, "Почта", act("DRV: как запросить номер", o.faq), act("DRV: онлайн-сервисы", o.online)),
      step("Работодатель может получить номер сам", "С 1 января 2023 года работодатель запрашивает номер в электронном виде через свою программу расчёта зарплаты. Если номер передать нельзя, работодатель попросит документ.", "Ожидание", act("DRV: электронный запрос номера работодателем", o.proof)),
      paidWarning,
    ],
    singleMethodNote: "Номер сообщают только письменно: способ один.",
    note,
    next: act("Маршрут: Steuer-ID", "/berlin/steuer-id"),
  };
  return {
    fit: "fits",
    why: ["Номер известен, нужен документ Versicherungsnummernachweis"],
    title: "Новый Versicherungsnummernachweis: бесплатно у DRV или в кассе",
    summary: "Если документ потерян, повреждён или устарел, например после смены фамилии, замену выдают бесплатно.",
    steps: [
      step("Закажите документ", `Закажите Versicherungsnummernachweis через онлайн-сервисы Deutsche Rentenversicherung или в своей больничной кассе. Замена после потери, повреждения или смены данных бесплатна. ${hotline}`, "Онлайн", act("DRV: онлайн-сервисы", o.online), act("DRV: бесплатная замена документа", o.free2026)),
      step("Проверьте, нужен ли документ работодателю", "С 1 января 2023 года работодатель обычно получает номер сам в электронном виде, и документ показывать не нужно.", "Выбор", act("DRV: электронный запрос номера работодателем", o.proof)),
      paidWarning,
    ],
    singleMethodNote: "Документ выдают DRV и больничные кассы: способ выбирается в шаге.",
    note,
    next: act("Маршрут: медицинская страховка", "/berlin/health-insurance"),
  };
}
