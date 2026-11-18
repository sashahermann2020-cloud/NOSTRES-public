import { SOURCE_LOCALE, localeDir, localizedPath, type LocaleCode } from "./locales.ts";

/**
 * Язык запроса на сервере. Воркер кладёт его в AsyncLocalStorage (globalThis.__nostresLocale):
 * так перевод не зависит от общего состояния модулей, а одновременные запросы не мешают друг другу.
 * Здесь же запоминаются строки, использованные при рендере, — их клиент получает для точной гидратации.
 */
export type ServerContext = { locale: LocaleCode; dictionary: Record<string, string>; used: Record<string, string> };

export function serverContext(): ServerContext | undefined {
  if (typeof window !== "undefined") return undefined;
  const storage = (globalThis as { __nostresLocale?: { getStore(): ServerContext | undefined } }).__nostresLocale;
  return storage?.getStore();
}

/** Язык текущего серверного запроса; без контекста — русский. */
export function serverLocale(): LocaleCode {
  return serverContext()?.locale ?? SOURCE_LOCALE;
}
export const serverDir = () => localeDir(serverLocale());

/** Перевод строки на сервере; без контекста или перевода возвращает исходный текст. */
export function serverTr(text: string): string {
  const context = serverContext();
  if (!context) return text;
  const value = context.dictionary[text];
  if (value === undefined) return text;
  context.used[text] = value;
  return value;
}

/** Адрес внутри сайта с языковым префиксом текущего запроса (на сервере и в браузере через store). */
export function serverHref(href: string): string {
  return localizeHref(href, serverLocale());
}

/** Добавляет языковой префикс к внутреннему адресу; внешние адреса, якоря и почта остаются как есть. */
export function localizeHref(href: string, code: LocaleCode): string {
  if (!href || code === SOURCE_LOCALE || !href.startsWith("/") || href.startsWith("//") || href.startsWith("/api/")) return href;
  if (href === `/${code}` || href.startsWith(`/${code}/`) || href.startsWith(`/${code}?`) || href.startsWith(`/${code}#`)) return href;
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const tail = cut === -1 ? "" : href.slice(cut);
  return localizedPath(path, code) + tail;
}
