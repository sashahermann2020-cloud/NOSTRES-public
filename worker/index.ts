/** Cloudflare Worker entry point for NOSTRES. */
import { buildTestReport, renderTestReport } from "./test-report";
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { AsyncLocalStorage } from "node:async_hooks";
import { INDEXABLE_PATHS, SITE_ORIGIN } from "../app/seo";
import { localizedPath, OG_LOCALES, pageDictionaryName, READY_LOCALES, SOURCE_LOCALE, splitLocalePath, type LocaleCode } from "../app/i18n/locales";
import type { ServerContext } from "../app/i18n/server-context";
import monitoredLinks from "./monitored-links.json";
import routeSources from "./route-sources.json";
import { REASON_LABELS, type RouteSources } from "./freshness";
import { buildReport, runMonitor } from "./link-monitor";
import { hasMonitorAccess, notFound } from "./monitor-access";
import { isPurgeWindow, purgeExpired } from "./retention";

// Язык запроса хранится в AsyncLocalStorage: страницы рендерятся на нужном языке, а одновременные запросы не мешают друг другу.
const localeStorage = new AsyncLocalStorage<ServerContext>();
(globalThis as { __nostresLocale?: unknown }).__nostresLocale = localeStorage;

type Dictionary = Record<string, string>;
const dictionaries = new Map<string, Promise<Dictionary>>();

function loadJson(address: URL, env: Env): Promise<Dictionary | null> {
  return (env.ASSETS ? env.ASSETS.fetch(new Request(address)) : fetch(address))
    .then(async (response) => {
      const type = response.headers.get("content-type") ?? "";
      return response.ok && type.includes("json") ? ((await response.json()) as Dictionary) : null;
    })
    .catch(() => null);
}

function cached(key: string, load: () => Promise<Dictionary | null>): Promise<Dictionary | null> {
  let promise = dictionaries.get(key);
  if (!promise) {
    promise = load().then((value) => value ?? {});
    dictionaries.set(key, promise);
    void promise.then((value) => { if (!Object.keys(value).length) dictionaries.delete(key); });
  }
  return promise.then((value) => (Object.keys(value).length ? value : null));
}

/**
 * Строки для страницы: сначала маленький файл именно этой страницы (его готовит scripts/i18n-pages.mjs при сборке),
 * иначе полный словарь языка. Так на холодном запуске не разбирается весь словарь целиком.
 */
async function dictionaryFor(code: LocaleCode, path: string, env: Env, origin: string): Promise<Dictionary> {
  const name = pageDictionaryName(path);
  const page = await cached(`${code}:${name}`, () => loadJson(new URL(`/i18n/pages/${code}/${name}.json?v=1`, origin), env));
  if (page) return page;
  return (await cached(code, () => loadJson(new URL(`/i18n/${code}.json?v=1`, origin), env))) ?? {};
}

const indexable = new Set<string>(INDEXABLE_PATHS);
const TITLE_SUFFIX = " | NOSTRES";
const translateMeta = (text: string, dictionary: Dictionary, used?: Dictionary): string => {
  const whole = dictionary[text];
  if (whole !== undefined) { if (used) used[text] = whole; return whole; }
  if (text.endsWith(TITLE_SUFFIX)) {
    const key = text.slice(0, -TITLE_SUFFIX.length);
    const base = dictionary[key];
    if (base !== undefined) { if (used) used[key] = base; return base + TITLE_SUFFIX; }
  }
  return text;
};

/** Метаданные страницы: перевод title/description/Open Graph, canonical на адрес своего языка и hreflang для всех языков. */
function localizeHead(response: Response, code: LocaleCode, path: string, dictionary: Dictionary, used?: Dictionary): Response {
  if (typeof HTMLRewriter === "undefined") return response; // например, в Node при тестах
  const self = new URL(localizedPath(path === "/" ? "/" : path.replace(/\/$/, ""), code), SITE_ORIGIN).toString();
  const cleanPath = path === "/" ? "/" : path.replace(/\/$/, "");
  const withAlternates = indexable.has(cleanPath);
  let hasCanonical = false;
  let hasOgLocale = false;
  let titleText = "";
  const translateAttribute = (name: string) => ({
    element(element: Element) {
      const value = element.getAttribute(name);
      if (value) element.setAttribute(name, translateMeta(value, dictionary, used));
    },
  });
  const rewriter = new HTMLRewriter()
    .on("title", {
      text(chunk) {
        titleText += chunk.text;
        chunk.remove();
        if (chunk.lastInTextNode) { chunk.replace(code === SOURCE_LOCALE ? titleText : translateMeta(titleText, dictionary, used)); titleText = ""; }
      },
    })
    .on('link[rel="canonical"]', { element(element) { hasCanonical = true; if (withAlternates || code !== SOURCE_LOCALE) element.setAttribute("href", self); } })
    .on('meta[property="og:url"]', { element(element) { element.setAttribute("content", self); } })
    .on('meta[property="og:locale"]', { element(element) { hasOgLocale = true; element.setAttribute("content", OG_LOCALES[code]); } })
    .on("head", {
      element(element) {
        element.onEndTag((end) => {
          let extra = "";
          if (!hasCanonical && (withAlternates || code !== SOURCE_LOCALE)) extra += `<link rel="canonical" href="${self}">`;
          if (withAlternates) {
            for (const item of READY_LOCALES) extra += `<link rel="alternate" hreflang="${item.code}" href="${new URL(localizedPath(cleanPath, item.code), SITE_ORIGIN).toString()}">`;
            extra += `<link rel="alternate" hreflang="x-default" href="${new URL(cleanPath, SITE_ORIGIN).toString()}">`;
          }
          if (code !== SOURCE_LOCALE && !hasOgLocale) extra += `<meta property="og:locale" content="${OG_LOCALES[code]}">`;
          if (extra) end.before(extra, { html: true });
        });
      },
    });
  if (code !== SOURCE_LOCALE) {
    for (const selector of ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:image:alt"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]', 'meta[name="twitter:image:alt"]']) rewriter.on(selector, translateAttribute("content"));
  }
  return rewriter.transform(response);
}

/** Вшивает в страницу строки, использованные при рендере, чтобы браузер гидратировал её на том же языке без мигания. */
function embedDictionary(response: Response, context: ServerContext): Response {
  if (!response.body) return response;
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let carry = "";
  let done = false;
  const script = () => `<script>window.__NOSTRES_I18N=${JSON.stringify({ locale: context.locale, dict: context.used }).replace(/</g, "\\u003c")}</script>`;
  const stream = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      const text = carry + decoder.decode(chunk, { stream: true });
      const at = done ? -1 : text.lastIndexOf("</body>");
      if (at !== -1) { done = true; carry = ""; controller.enqueue(encoder.encode(text.slice(0, at) + script() + text.slice(at))); return; }
      const keep = Math.min(text.length, 7);
      controller.enqueue(encoder.encode(text.slice(0, text.length - keep)));
      carry = text.slice(text.length - keep);
    },
    flush(controller) {
      if (carry) controller.enqueue(encoder.encode(carry));
      if (!done) controller.enqueue(encoder.encode(script()));
    },
  });
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(response.body.pipeThrough(stream), { status: response.status, statusText: response.statusText, headers });
}

interface Env {
  ASSETS?: Fetcher;
  DB: D1Database;
  IMAGES?: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const canonicalHost = new URL(SITE_ORIGIN).hostname;

const KIND_LABELS: Record<string, string> = { broken: "Ссылка не открывается", moved: "Страница переехала", hijacked: "Ведёт на главную или «не найдено»", content_changed: "Текст страницы изменился", recovered: "Ссылка снова работает" };
const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

async function testReport(request: Request, env: Env): Promise<Response> {
  const report = await buildTestReport(env.DB);
  const headers = { "x-robots-tag": "noindex, nofollow", "cache-control": "no-store" };
  if (!(request.headers.get("accept") ?? "").includes("text/html")) return Response.json(report, { headers });
  return new Response(renderTestReport(report), { headers: { ...headers, "content-type": "text/html; charset=utf-8" } });
}

async function linkReport(request: Request, env: Env): Promise<Response> {
  const report = await buildReport(env.DB, monitoredLinks.length, undefined, routeSources as RouteSources[]);
  const headers = { "x-robots-tag": "noindex, nofollow", "cache-control": "no-store" };
  if (!(request.headers.get("accept") ?? "").includes("text/html")) return Response.json(report, { headers });
  const date = (t: number) => new Date(t * 1000).toISOString().slice(0, 16).replace("T", " ");
  const rows = report.events.map((e) => `<tr><td>${date(e.created_at)}</td><td>${escapeHtml(KIND_LABELS[e.kind] ?? e.kind)}</td><td><a href="${escapeHtml(e.url)}">${escapeHtml(e.url)}</a><br>${escapeHtml(e.detail)}</td></tr>`).join("");
  const due = report.routes.filter((route) => route.reasons.length);
  const routeRows = due.map((route) => `<tr><td><a href="${escapeHtml(route.path)}">${escapeHtml(route.title)}</a></td><td>${escapeHtml(route.checkedAt)} (${route.daysSinceCheck} дн.)</td><td>${route.reasons.map((reason) => escapeHtml(REASON_LABELS[reason])).join("; ")}${route.changes.length ? `<br>${route.changes.slice(0, 5).map((change) => `${escapeHtml(KIND_LABELS[change.kind] ?? change.kind)}: <a href="${escapeHtml(change.url)}">${escapeHtml(change.url)}</a>`).join("<br>")}` : ""}</td></tr>`).join("");
  const unverifiable = report.routes.reduce((sum, route) => sum + route.unverifiable.length, 0);
  const routesHtml = `<h2>Маршруты к сверке</h2><p>Маршрутов: ${report.routes.length}. Нужна сверка: ${due.length}. Страниц, которые робот не может проверить (их сверяют вручную): ${unverifiable}.</p>${routeRows ? `<table><tr><th>Маршрут</th><th>Сверен</th><th>Почему</th></tr>${routeRows}</table>` : "<p>Все маршруты актуальны.</p>"}`;
  const body = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Мониторинг ссылок</title><style>body{font:16px/1.5 system-ui;margin:24px auto;max-width:960px;padding:0 16px}td,th{border-bottom:1px solid #ccc;padding:6px;text-align:left;vertical-align:top;word-break:break-word}</style><h1>Мониторинг ссылок</h1><p>Всего: ${report.total}. Работают: ${report.ok}. Не открываются: ${report.broken}. Закрыты от проверки ботами: ${report.blocked}. Ещё не проверены: ${report.notYetChecked}.</p>${routesHtml}<h2>Изменения за 30 дней</h2>${rows ? `<table><tr><th>Когда (UTC)</th><th>Что</th><th>Ссылка</th></tr>${rows}</table>` : "<p>Изменений нет.</p>"}`;
  return new Response(body, { headers: { ...headers, "content-type": "text/html; charset=utf-8" } });
}

function withNoIndex(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** Базовые защитные заголовки. Полный CSP для скриптов пока не включён: гидратация и аналитика используют встроенные скрипты. */
function withSecurityHeaders(response: Response): Response {
  if (response.status === 101) return response;
  const headers = new Headers(response.headers);
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("X-Content-Type-Options", "nosniff");
  if (!headers.has("Referrer-Policy")) headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Content-Security-Policy", "frame-ancestors 'self'; base-uri 'self'; object-src 'none'");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

/** Страницы, заменённые маршрутом: старый адрес навсегда ведёт на новый (с тем же языком). */
const MOVED_PAGES: Record<string, string> = { "/berlin/sobaka": "/berlin/sobaka/marshrut" };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === "www." + canonicalHost || (url.hostname === canonicalHost && url.protocol !== "https:")) {
      url.protocol = "https:";
      url.hostname = canonicalHost;
      url.port = "";
      return Response.redirect(url.toString(), 308);
    }

    const isCanonicalHost = url.hostname === canonicalHost;
    if ((url.pathname === "/_monitor/links" || url.pathname === "/_monitor/test") && request.method === "GET") {
      if (!(await hasMonitorAccess(env.DB, request))) return notFound();
      const page = url.pathname === "/_monitor/links" ? await linkReport(request, env) : await testReport(request, env);
      const headers = new Headers(page.headers);
      headers.set("referrer-policy", "no-referrer");
      return new Response(page.body, { status: page.status, headers });
    }
    if (!isCanonicalHost && url.pathname === "/robots.txt") {
      return withNoIndex(new Response("User-agent: *\nDisallow: /\n", {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      }));
    }

    let response: Response;
    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      if (!env.IMAGES) {
        response = new Response("Image optimization is unavailable", { status: 404 });
      } else {
        response = await handleImageOptimization(request, {
          fetchAsset: (path) => { const url = new URL(path, request.url); return env.ASSETS ? env.ASSETS.fetch(new Request(url)) : fetch(url); },
          transformImage: async (body, { width, format, quality }) => {
            const result = await env.IMAGES!.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
            return result.response();
          },
        }, allowedWidths);
      }
    } else {
      const { locale, path } = splitLocalePath(url.pathname);
      const moved = MOVED_PAGES[path.replace(/\/$/, "")];
      if (moved) {
        url.pathname = localizedPath(moved, locale);
        return Response.redirect(url.toString(), 301);
      }
      if (/^\/ru(\/|$)/.test(url.pathname)) {
        url.pathname = url.pathname.replace(/^\/ru/, "") || "/";
        return Response.redirect(url.toString(), 301);
      }
      let context: ServerContext | undefined;
      if (locale !== SOURCE_LOCALE) {
        context = { locale, dictionary: await dictionaryFor(locale, path, env, url.origin), used: {} };
        const inner = new URL(url);
        inner.pathname = path;
        request = new Request(inner.toString(), request);
      }
      response = context
        ? await localeStorage.run(context, () => handler.fetch(request, env, ctx))
        : await handler.fetch(request, env, ctx);
      if (response.headers.get("content-type")?.includes("text/html")) {
        response = localizeHead(response, locale, path, context?.dictionary ?? {}, context?.used);
        if (context) {
          response = embedDictionary(response, context);
          response.headers.set("X-Nostres-I18n", String(Object.keys(context.dictionary).length));
        }
      }
    }

    return withSecurityHeaders(isCanonicalHost ? response : withNoIndex(response));
  },
  async scheduled(controller: { scheduledTime: number }, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runMonitor(env.DB, monitoredLinks).catch((error) => console.error("link-monitor", String(error))));
    // Срок хранения событий: раз в сутки удаляются записи старше 12 месяцев.
    if (isPurgeWindow(controller.scheduledTime)) {
      ctx.waitUntil(
        purgeExpired(env.DB, new Date(controller.scheduledTime))
          .then((deleted) => console.log("retention", JSON.stringify(deleted)))
          .catch((error) => console.error("retention", String(error))),
      );
    }
  },
};
export default worker;
