/**
 * Темы маршрутов на главной (PROJECT_SPEC.md, «Главная: темы маршрутов»).
 * Один источник для фильтра-чипов и для разделов списка: у каждого маршрута одна основная тема
 * (в ней он стоит в общем списке) и, если по смыслу он нужен ещё где-то, дополнительные темы
 * (по ним он находится через фильтр).
 *
 * Правило разделения: денежная выплата от государства – «Пособия и льготы», даже если она семейная;
 * «Семья и дети» – дела вокруг детей без выплаты (садик, школа, рождение, отпуск, защита материнства);
 * «Банк и связь» – только бытовые договоры (счёт, телефон, интернет);
 * «Переезд в Германию» – то, что делают до въезда и при въезде: выбор пути, визы, воссоединение семьи, ввоз животного;
 * «Документы и статус» – документы уже в Германии: регистрация, вид на жительство, гражданство;
 * «Транспорт и досуг» – проезд и регистрация транспорта, культура и досуг, включая льготы на них.
 */
export const THEMES = [
  "Переезд в Германию",
  "Документы и статус",
  "Жильё",
  "Здоровье",
  "Семья и дети",
  "Работа и бизнес",
  "Пособия и льготы",
  "Защита и помощь",
  "Налоги",
  "Банк и связь",
  "Транспорт и досуг",
  "Учёба и язык",
  "Животные",
] as const;

export type Theme = (typeof THEMES)[number];

export const ROUTE_THEMES: Record<string, { primary: Theme; also?: Theme[] }> = {
  anmeldung: { primary: "Документы и статус", also: ["Жильё"] },
  lea: { primary: "Документы и статус" },
  workpermit: { primary: "Документы и статус", also: ["Работа и бизнес"] },
  reunion: { primary: "Переезд в Германию", also: ["Документы и статус", "Семья и дети"] },
  einbuergerung: { primary: "Документы и статус" },

  housing: { primary: "Жильё" },
  wohnungsgeber: { primary: "Жильё" },
  umzug: { primary: "Жильё", also: ["Документы и статус"] },
  wbs: { primary: "Жильё" },

  health: { primary: "Здоровье" },
  doctor: { primary: "Здоровье" },
  urgent: { primary: "Здоровье" },
  mental: { primary: "Здоровье", also: ["Пособия и льготы", "Защита и помощь"] },
  schwerbehinderung: { primary: "Здоровье", also: ["Пособия и льготы"] },

  kita: { primary: "Семья и дети" },
  mutterschutz: { primary: "Семья и дети", also: ["Пособия и льготы", "Работа и бизнес"] },
  elternzeit: { primary: "Семья и дети", also: ["Работа и бизнес"] },

  employment: { primary: "Работа и бизнес" },
  business: { primary: "Работа и бизнес", also: ["Налоги"] },
  jobcenter: { primary: "Работа и бизнес", also: ["Пособия и льготы"] },
  recognition: { primary: "Работа и бизнес", also: ["Учёба и язык"] },

  kindergeld: { primary: "Пособия и льготы", also: ["Семья и дети"] },
  kinderzuschlag: { primary: "Пособия и льготы", also: ["Семья и дети"] },
  elterngeld: { primary: "Пособия и льготы", also: ["Семья и дети"] },
  bildungspaket: { primary: "Пособия и льготы", also: ["Семья и дети"] },
  wohngeld: { primary: "Пособия и льготы", also: ["Жильё"] },
  arbeitslosengeld: { primary: "Пособия и льготы", also: ["Работа и бизнес"] },
  grundsicherungsgeld: { primary: "Пособия и льготы", also: ["Работа и бизнес"] },
  pflegegeld: { primary: "Пособия и льготы", also: ["Здоровье"] },

  discrimination: { primary: "Защита и помощь", also: ["Работа и бизнес", "Жильё"] },
  homeless: { primary: "Защита и помощь", also: ["Жильё", "Пособия и льготы"] },
  hardship: { primary: "Защита и помощь", also: ["Пособия и льготы"] },
  violence: { primary: "Защита и помощь", also: ["Семья и дети", "Здоровье"] },

  "tax-id": { primary: "Налоги", also: ["Документы и статус"] },
  steuererklaerung: { primary: "Налоги" },

  bank: { primary: "Банк и связь" },
  telecom: { primary: "Банк и связь" },

  language: { primary: "Учёба и язык" },
  sprachkurs: { primary: "Учёба и язык" },
  study: { primary: "Учёба и язык" },

  dog: { primary: "Животные" },
  petmove: { primary: "Переезд в Германию", also: ["Животные"] },
  petpass: { primary: "Животные" },
  vet: { primary: "Животные" },
  dogtrainer: { primary: "Животные" },
  transport: { primary: "Транспорт и досуг", also: ["Пособия и льготы"] },
  culture: { primary: "Транспорт и досуг", also: ["Пособия и льготы", "Семья и дети"] },
  kfz: { primary: "Транспорт и досуг", also: ["Документы и статус"] },
  relocation: { primary: "Переезд в Германию", also: ["Работа и бизнес", "Учёба и язык", "Семья и дети"] },
  chancenkarte: { primary: "Переезд в Германию", also: ["Работа и бизнес"] },
  workvisa: { primary: "Переезд в Германию", also: ["Работа и бизнес"] },
  volunteer: { primary: "Переезд в Германию", also: ["Работа и бизнес"] },
  studyvisa: { primary: "Переезд в Германию", also: ["Учёба и язык"] },
  company: { primary: "Работа и бизнес", also: ["Налоги"] },
  socialnumber: { primary: "Работа и бизнес", also: ["Документы и статус", "Здоровье"] },
  settlement: { primary: "Документы и статус" },
  notary: { primary: "Работа и бизнес", also: ["Документы и статус"] },
};

/** Маршрут без записи в ROUTE_THEMES – ошибка; tests/route-themes.test.mjs проверяет, что запись есть у каждого. */
export const themeOf = (id: string): Theme => ROUTE_THEMES[id]?.primary ?? "Документы и статус";

/** Маршрут виден при выбранном фильтре: «Все» или его основная либо дополнительная тема. */
export const inTheme = (id: string, filter: string) =>
  filter === "Все" || ROUTE_THEMES[id]?.primary === filter || Boolean(ROUTE_THEMES[id]?.also?.includes(filter as Theme));
