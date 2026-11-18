/*
 * NOSTRES: копии открытых страниц для работы без сети (решение владельца 18.11.2026, PROJECT_SPEC.md «Установка на устройство»).
 * Страница всегда загружается из сети, если сеть есть: копия используется только без подключения, поэтому устаревший текст не показывается при работающем интернете.
 * Сохраняются только публичные страницы сайта и их файлы. Ответы на вопросы здесь не хранятся: они и так лежат в localStorage.
 * Не кэшируются: /api/, /_monitor/, запросы не GET и чужие сайты.
 */
const VERSION = "v1";
const PAGES = `nostres-pages-${VERSION}`;
const FILES = `nostres-files-${VERSION}`;
const MAX_PAGES = 80;
const MAX_FILES = 400;
const NETWORK_TIMEOUT_MS = 6000;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith("nostres-") && name !== PAGES && name !== FILES) await caches.delete(name);
    await self.clients.claim();
  })());
});

const skip = (url) => url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/_monitor/") || url.pathname === "/sw.js";
const pageKey = (url) => url.origin + url.pathname;

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i += 1) await cache.delete(keys[i]);
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then((value) => { clearTimeout(timer); resolve(value); }, (error) => { clearTimeout(timer); reject(error); });
  });
}

/** Страница: сначала сеть; копия сохраняется с датой. Без сети — копия, без копии — список сохранённых страниц. */
async function page(request) {
  const url = new URL(request.url);
  const key = pageKey(url);
  try {
    const response = await withTimeout(fetch(request), NETWORK_TIMEOUT_MS);
    if (response.ok && (response.headers.get("content-type") ?? "").includes("text/html")) {
      const html = await response.clone().text();
      const title = (/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "").slice(0, 200);
      const headers = new Headers(response.headers);
      headers.delete("content-encoding");
      headers.delete("content-length");
      headers.set("x-nostres-saved", new Date().toISOString());
      headers.set("x-nostres-title", encodeURIComponent(title));
      const cache = await caches.open(PAGES);
      await cache.delete(key);
      await cache.put(key, new Response(html, { status: 200, headers }));
      trim(PAGES, MAX_PAGES);
    }
    return response;
  } catch {
    const cached = await caches.match(key, { cacheName: PAGES });
    if (cached) return cached;
    return offlinePage(url);
  }
}

/** Файлы сайта (скрипты, стили, шрифты, значки, словари): из сети с сохранением, без сети — сохранённая копия. */
async function file(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(FILES);
      await cache.put(request, response.clone());
      trim(FILES, MAX_FILES);
    }
    return response;
  } catch {
    const cached = await caches.match(request, { cacheName: FILES });
    if (cached) return cached;
    throw new Error("offline");
  }
}

/* Первая открытая страница загружается до того, как работник начал перехватывать запросы: страница присылает свой адрес и файлы, и они сохраняются отдельно. */
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "nostres-save" || !Array.isArray(data.urls)) return;
  event.waitUntil((async () => {
    for (const raw of data.urls.slice(0, 200)) {
      let url;
      try { url = new URL(raw, self.location.origin); } catch { continue; }
      if (skip(url)) continue;
      try {
        if (raw === data.page) await page(new Request(url.href, { headers: { accept: "text/html" } }));
        else await file(new Request(url.href));
      } catch { /* без сети сохранить нельзя */ }
    }
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (skip(url)) return;
  if (request.mode === "navigate") event.respondWith(page(request));
  else event.respondWith(file(request));
});

/* Страница без сети, если копии нет. Тексты на 9 языках сайта (этот файл не проходит через i18n-extract). */
const TEXT = {
  ru: ["Нет подключения к интернету", "Эта страница ещё не сохранена на устройстве. Страницы сохраняются, когда вы открываете их с интернетом.", "Сохранённые страницы", "Сохранённых страниц пока нет."],
  en: ["No internet connection", "This page has not been saved on your device yet. Pages are saved when you open them while online.", "Saved pages", "No saved pages yet."],
  de: ["Keine Internetverbindung", "Diese Seite ist noch nicht auf Ihrem Gerät gespeichert. Seiten werden gespeichert, wenn Sie sie mit Internet öffnen.", "Gespeicherte Seiten", "Noch keine gespeicherten Seiten."],
  es: ["Sin conexión a internet", "Esta página aún no está guardada en su dispositivo. Las páginas se guardan cuando las abre con conexión.", "Páginas guardadas", "Todavía no hay páginas guardadas."],
  it: ["Nessuna connessione a internet", "Questa pagina non è ancora salvata sul dispositivo. Le pagine vengono salvate quando le apre con la connessione.", "Pagine salvate", "Ancora nessuna pagina salvata."],
  tr: ["İnternet bağlantısı yok", "Bu sayfa henüz cihazınıza kaydedilmedi. Sayfalar, internet varken açtığınızda kaydedilir.", "Kaydedilen sayfalar", "Henüz kaydedilmiş sayfa yok."],
  ar: ["لا يوجد اتصال بالإنترنت", "لم تُحفظ هذه الصفحة على جهازك بعد. تُحفظ الصفحات عندما تفتحها وأنت متصل بالإنترنت.", "الصفحات المحفوظة", "لا توجد صفحات محفوظة بعد."],
  pt: ["Sem ligação à internet", "Esta página ainda não está guardada no seu dispositivo. As páginas são guardadas quando as abre com ligação.", "Páginas guardadas", "Ainda não há páginas guardadas."],
  fr: ["Pas de connexion internet", "Cette page n’est pas encore enregistrée sur votre appareil. Les pages sont enregistrées lorsque vous les ouvrez avec une connexion.", "Pages enregistrées", "Aucune page enregistrée pour l’instant."],
};
const escape = (value) => value.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

async function offlinePage(url) {
  const lang = /^\/(en|de|es|it|tr|ar|pt|fr)(\/|$)/.exec(url.pathname)?.[1] ?? "ru";
  const [title, text, listTitle, empty] = TEXT[lang];
  const cache = await caches.open(PAGES);
  const items = [];
  for (const request of await cache.keys()) {
    const saved = await cache.match(request);
    const name = decodeURIComponent(saved?.headers.get("x-nostres-title") ?? "").replace(/ \| NOSTRES$/, "") || new URL(request.url).pathname;
    items.push(`<li><a href="${escape(new URL(request.url).pathname)}">${escape(name)}</a></li>`);
  }
  const body = `<!doctype html><html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} | NOSTRES</title><style>body{font:17px/1.55 system-ui,sans-serif;margin:0;padding:32px 16px;background:#f1f4f7;color:#17263f}main{max-width:640px;margin:0 auto}h1{font-size:28px;line-height:1.15}a{color:#17263f}li{margin:8px 0}</style><main><h1>${escape(title)}</h1><p>${escape(text)}</p><h2>${escape(listTitle)}</h2>${items.length ? `<ul>${items.join("")}</ul>` : `<p>${escape(empty)}</p>`}</main></html>`;
  return new Response(body, { status: 503, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
