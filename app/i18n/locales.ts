/** Языки интерфейса. Русский – язык-источник: все тексты в коде написаны по-русски. */
export type LocaleCode = "ru" | "en" | "de" | "es" | "it" | "tr" | "ar" | "pt" | "fr";
export const LOCALES: ReadonlyArray<{ code: LocaleCode; name: string; dir: "ltr" | "rtl"; /** Показывать язык в переключателе, когда перевод готов. */ ready: boolean }> = [
  { code: "ru", name: "Русский", dir: "ltr", ready: true },
  { code: "en", name: "English", dir: "ltr", ready: true },
  { code: "de", name: "Deutsch", dir: "ltr", ready: true },
  { code: "es", name: "Español", dir: "ltr", ready: true },
  { code: "it", name: "Italiano", dir: "ltr", ready: true },
  { code: "tr", name: "Türkçe", dir: "ltr", ready: true },
  { code: "ar", name: "العربية", dir: "rtl", ready: true },
  { code: "pt", name: "Português", dir: "ltr", ready: true },
  { code: "fr", name: "Français", dir: "ltr", ready: true },
];
export const SOURCE_LOCALE: LocaleCode = "ru";
export const isLocale = (value: string | null | undefined): value is LocaleCode => LOCALES.some((locale) => locale.code === value);

/** Языки с готовым переводом (кроме русского они открываются по адресам вида /en/...). */
export const READY_LOCALES = LOCALES.filter((item) => item.ready);
export const localeDir = (code: LocaleCode): "ltr" | "rtl" => LOCALES.find((item) => item.code === code)?.dir ?? "ltr";

/** Раскладывает адрес на язык и путь без языкового префикса: /en/berlin/start → en, /berlin/start. Русский – без префикса. */
export function splitLocalePath(pathname: string): { locale: LocaleCode; path: string } {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  const code = match?.[1];
  if (code && code !== SOURCE_LOCALE && isLocale(code) && READY_LOCALES.some((item) => item.code === code)) {
    const rest = match?.[2] ?? "/";
    return { locale: code, path: rest === "" ? "/" : rest };
  }
  return { locale: SOURCE_LOCALE, path: pathname };
}

/** Адрес страницы на нужном языке: /berlin/start → /en/berlin/start; корень → /en. */
export function localizedPath(path: string, code: LocaleCode): string {
  if (code === SOURCE_LOCALE) return path;
  return path === "/" ? `/${code}` : `/${code}${path}`;
}

/** Код региона для Open Graph. */
export const OG_LOCALES: Record<LocaleCode, string> = { ru: "ru_RU", en: "en_US", de: "de_DE", es: "es_ES", it: "it_IT", tr: "tr_TR", ar: "ar_AR", pt: "pt_BR", fr: "fr_FR" };

/** Имя файла со строками одной страницы: /berlin/anmeldung → berlin/anmeldung, корень → _root. */
export const pageDictionaryName = (path: string) => (path.replace(/^\/+|\/+$/g, "") || "_root");
