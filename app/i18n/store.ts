import { useSyncExternalStore } from "react";
import { isLocale, localizedPath, READY_LOCALES, SOURCE_LOCALE, splitLocalePath, type LocaleCode } from "./locales.ts";
import { localizeHref, serverContext } from "./server-context.ts";

/**
 * Переводы по исходной строке: ключ — русский текст из кода, значение — перевод.
 * Если перевода нет, показывается русский текст, а не пустое место.
 * Язык задаётся адресом: /en/..., /de/... и так далее, русский — без префикса.
 * На сервере перевод берётся из контекста запроса, в браузере — из строк, вшитых в страницу для гидратации,
 * а полный словарь подгружается позже для динамических частей маршрутов.
 */
type Dictionary = Record<string, string>;
export const LANGUAGE_STORAGE_KEY = "nostres-lang";
const DICTIONARY_VERSION = "1";
const isServer = typeof window === "undefined";

let locale: LocaleCode = SOURCE_LOCALE;
let dictionary: Dictionary = {};
let version = 0;
const listeners = new Set<() => void>();
const cache = new Map<LocaleCode, Dictionary>();

// Браузер: язык берётся из адреса, а строки для первого рендера — из страницы, чтобы гидратация совпала с серверным HTML.
if (!isServer) {
  try {
    const fromUrl = splitLocalePath(window.location.pathname).locale;
    if (fromUrl !== SOURCE_LOCALE) {
      const boot = (window as unknown as { __NOSTRES_I18N?: { locale?: string; dict?: Dictionary } }).__NOSTRES_I18N;
      locale = fromUrl;
      dictionary = boot?.dict ?? {};
    }
  } catch { /* адрес недоступен */ }
}

const notify = () => { version += 1; listeners.forEach((listener) => listener()); };
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

export const currentLocale = (): LocaleCode => serverContext()?.locale ?? locale;

function lookup(text: string): string | undefined {
  const context = serverContext();
  if (context) {
    const value = context.dictionary[text];
    if (value !== undefined) context.used[text] = value;
    return value;
  }
  if (isServer || locale === SOURCE_LOCALE) return undefined;
  return dictionary[text];
}

/** Перевод строки на текущий язык; при отсутствии перевода возвращает исходный русский текст. */
export function tr(text: string): string {
  return lookup(text) ?? text;
}

/** Перевод строки или null, если для неё нет перевода. */
export function translated(text: string): string | null {
  return lookup(text) ?? null;
}

/** Внутренний адрес с языковым префиксом текущей страницы. */
export function lh(href: string | undefined | null): string {
  if (!href) return href ?? "";
  return localizeHref(href, currentLocale());
}

async function load(code: LocaleCode): Promise<Dictionary> {
  const cached = cache.get(code);
  if (cached) return cached;
  try {
    const response = await fetch(`/i18n/${code}.json?v=${DICTIONARY_VERSION}`);
    if (!response.ok) return {};
    const data = (await response.json()) as Dictionary;
    cache.set(code, data);
    return data;
  } catch {
    return {};
  }
}

/** Заголовок вкладки при переходах внутри сайта: сервер присылает метаданные по-русски, а переводим их здесь. */
let titleObserver: MutationObserver | null = null;
function syncTitle() {
  if (typeof document === "undefined" || locale === SOURCE_LOCALE) return;
  const current = document.title;
  if (!/[А-Яа-яЁё]/.test(current)) return;
  const suffix = " | NOSTRES";
  const base = current.endsWith(suffix) ? current.slice(0, -suffix.length) : current;
  const known = dictionary[current] ?? (dictionary[base] ? `${dictionary[base]}${suffix}` : null);
  const heading = document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim();
  const next = known ?? (heading ? `${heading}${suffix}` : null);
  if (next && next !== current) document.title = next;
}
function watchTitle() {
  if (titleObserver || typeof MutationObserver === "undefined") return;
  const target = document.querySelector("title");
  if (!target) return;
  titleObserver = new MutationObserver(() => window.setTimeout(syncTitle, 150));
  titleObserver.observe(target, { childList: true, characterData: true, subtree: true });
}

/** Меняет язык: запоминает выбор и открывает ту же страницу по адресу нужного языка. */
export function switchLocale(code: LocaleCode): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code); } catch { /* память браузера может быть недоступна */ }
  const { locale: current, path } = splitLocalePath(window.location.pathname);
  if (code === current) return;
  window.location.assign(`${localizedPath(path, code)}${window.location.search.replace(/([?&])lang=[^&]*&?/, "$1").replace(/[?&]$/, "")}${window.location.hash}`);
}

/**
 * Запуск в браузере: переводит на адрес языка, если выбран ?lang= или сохранён другой язык;
 * на страницах с языком подгружает полный словарь.
 */
export async function initLocale(): Promise<void> {
  if (typeof window === "undefined") return;
  const { locale: current } = splitLocalePath(window.location.pathname);
  let wanted: string | null = null;
  let explicit = false;
  try { wanted = new URLSearchParams(window.location.search).get("lang"); explicit = isLocale(wanted); } catch { /* адрес недоступен */ }
  if (!isLocale(wanted)) {
    if (current === SOURCE_LOCALE) { try { wanted = window.localStorage.getItem(LANGUAGE_STORAGE_KEY); } catch { wanted = null; } }
    else wanted = current;
  }
  if (isLocale(wanted) && wanted !== current && (explicit || current === SOURCE_LOCALE) && READY_LOCALES.some((item) => item.code === wanted)) {
    const { path } = splitLocalePath(window.location.pathname);
    const search = window.location.search.replace(/([?&])lang=[^&]*&?/, "$1").replace(/[?&]$/, "");
    window.location.replace(`${localizedPath(path, wanted)}${search}${window.location.hash}`);
    return;
  }
  if (current !== SOURCE_LOCALE) {
    const full = await load(current);
    if (Object.keys(full).length) { dictionary = full; locale = current; notify(); }
    watchTitle();
    window.setTimeout(syncTitle, 300);
  }
}

/** Подписывает компонент на смену языка; возвращает текущий язык. */
export function useLocale(): LocaleCode {
  useSyncExternalStore(subscribe, () => version, () => 0);
  return currentLocale();
}

/** Переводит все строки внутри данных (объекты, массивы), не меняя структуру; ссылки и коды без перевода остаются как есть. */
export function trDeep<T>(value: T): T {
  if (currentLocale() === SOURCE_LOCALE) return value;
  if (typeof value === "string") return (lookup(value) ?? value) as T;
  if (Array.isArray(value)) return value.map((item) => trDeep(item)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) out[key] = trDeep(item);
    return out as T;
  }
  return value;
}

/** Перевод шаблона с подстановками: {name} заменяется значением из values. */
export function trf(template: string, values: Record<string, string | number>): string {
  return tr(template).replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
