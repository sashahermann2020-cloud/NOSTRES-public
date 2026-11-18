// Источник захода одной категорией, без персональных данных: откуда человек пришёл на сайт в этом сеансе.
// Помеченные ссылки (?utm_source=имя или ?src=имя) попадают как «utm:имя». Ничего, кроме категории, не сохраняется.
const KEY = "nostres-source";

const SEARCH: [RegExp, string][] = [[/(^|\.)google\./, "search-google"], [/(^|\.)yandex\.|(^|\.)ya\.ru$/, "search-yandex"], [/(^|\.)bing\.com$/, "search-bing"], [/(^|\.)duckduckgo\.com$/, "search-duckduckgo"], [/(^|\.)(ecosia\.org|brave\.com|yahoo\.com|baidu\.com|startpage\.com)$/, "search-other"]];
const MESSENGER = /(^|\.)(t\.me|telegram\.org|telegram\.me|web\.telegram\.org|whatsapp\.com|wa\.me|viber\.com|signal\.org|discord\.com)$/;
const SOCIAL = /(^|\.)(facebook\.com|l\.facebook\.com|instagram\.com|vk\.com|vk\.ru|ok\.ru|linkedin\.com|reddit\.com|x\.com|twitter\.com|t\.co|youtube\.com|tiktok\.com|pinterest\.com)$/;
const AI = /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$/;

export function classifySource(referrer: string, ownHost: string, search: string): string {
  try {
    const params = new URLSearchParams(search);
    const tag = (params.get("utm_source") ?? params.get("src") ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30);
    if (tag) return `utm:${tag}`;
  } catch { /* без метки */ }
  if (!referrer) return "direct";
  let host = "";
  try { host = new URL(referrer).hostname.toLowerCase(); } catch { return "direct"; }
  if (host === ownHost || host.endsWith(`.${ownHost}`)) return "internal";
  if (AI.test(host)) return "ai";
  for (const [pattern, name] of SEARCH) if (pattern.test(host)) return name;
  if (MESSENGER.test(host)) return "messenger";
  if (SOCIAL.test(host)) return "social";
  return "other-site";
}

/** Вызывать при загрузке любой страницы: первая внешняя категория запоминается на сеанс. */
export function captureSource(): void {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const source = classifySource(document.referrer, location.hostname, location.search);
    if (source !== "internal") sessionStorage.setItem(KEY, source);
  } catch { /* хранилище недоступно */ }
}

export function currentSource(): string {
  try { return sessionStorage.getItem(KEY) ?? "direct"; } catch { return "direct"; }
}
