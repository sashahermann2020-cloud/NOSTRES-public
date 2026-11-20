import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { canonical, INDEXABLE_PATHS, SITE_ORIGIN } from "../app/seo.ts";
import robots from "../app/robots.ts";
import sitemap from "../app/sitemap.ts";
import { topics } from "../app/berlin/topics.ts";
import { localizedPath, READY_LOCALES, splitLocalePath } from "../app/i18n/locales.ts";
import { localizeHref } from "../app/i18n/server-context.ts";

test("every indexable page has a unique canonical URL on the target Cloudflare origin", async () => {
  assert.equal(SITE_ORIGIN, "https://nostres.world");
  assert.equal(INDEXABLE_PATHS.length, 65);
  assert.equal(new Set(INDEXABLE_PATHS).size, INDEXABLE_PATHS.length);
  assert.equal(sitemap().length, 65 * READY_LOCALES.length);
  assert.deepEqual(sitemap().filter((entry) => !/^https:\/\/nostres\.world\/[a-z]{2}(\/|$)/.test(entry.url)).map((entry) => entry.url), INDEXABLE_PATHS.map(canonical));
  assert.equal(robots().sitemap, "https://nostres.world/sitemap.xml");
  assert.ok(INDEXABLE_PATHS.includes("/berlin/start"));
  assert.ok(INDEXABLE_PATHS.includes("/about"));
  assert.ok(INDEXABLE_PATHS.includes("/support"));
  assert.ok(INDEXABLE_PATHS.includes("/contact"));
  assert.ok(INDEXABLE_PATHS.includes("/privacy"));
  assert.ok(INDEXABLE_PATHS.includes("/berlin/transport-tickets"));
  assert.ok(INDEXABLE_PATHS.includes("/berlin/culture-discounts"));
  for (const path of ["/berlin/pereezd-v-germaniyu", "/berlin/chancenkarte", "/berlin/viza-rabota", "/berlin/viza-volontyor", "/berlin/viza-uchyoba"]) assert.ok(INDEXABLE_PATHS.includes(path), path);
  assert.ok(!INDEXABLE_PATHS.includes("/mvp-test"));
  for (const path of INDEXABLE_PATHS) {
    assert.ok(canonical(path).startsWith("https://nostres.world/"));
    if (path !== "/") {
      const page = await readFile(new URL(`../app${path}/page.tsx`, import.meta.url), "utf8");
      assert.match(page, /alternates: \{ canonical:/);
    }
  }
});

test("new indexed topics link to government or public-law primary sources", () => {
  for (const topic of Object.values(topics)) {
    assert.ok(INDEXABLE_PATHS.includes(topic.path));
    assert.ok(topic.facts.length >= 2);
    for (const fact of topic.facts) {
      const host = new URL(fact.source).hostname;
      assert.ok(["service.berlin.de", "www.berlin.de", "willkommenszentrum.berlin.de", "gesund.bund.de", "www.auswaertiges-amt.de", "www.make-it-in-germany.com", "www.existenzgruendungsportal.de", "www.deutsche-rentenversicherung.de"].includes(host), host);
      assert.ok(fact.answer.length > 40);
    }
  }
});

test("every language has its own URL with hreflang alternates in the sitemap", () => {
  const entries = sitemap();
  assert.equal(READY_LOCALES.length, 9);
  const anmeldung = entries.find((entry) => entry.url === "https://nostres.world/fr/berlin/anmeldung");
  assert.ok(anmeldung);
  assert.equal(anmeldung.alternates.languages["x-default"], "https://nostres.world/berlin/anmeldung");
  for (const item of READY_LOCALES) assert.equal(anmeldung.alternates.languages[item.code], canonical(localizedPath("/berlin/anmeldung", item.code)));
  assert.ok(entries.some((entry) => entry.url === "https://nostres.world/en"));
});

test("language prefixes are split, built and applied to internal links without touching external ones", () => {
  assert.deepEqual(splitLocalePath("/en/berlin/start"), { locale: "en", path: "/berlin/start" });
  assert.deepEqual(splitLocalePath("/ar"), { locale: "ar", path: "/" });
  assert.deepEqual(splitLocalePath("/berlin/start"), { locale: "ru", path: "/berlin/start" });
  assert.deepEqual(splitLocalePath("/xx/berlin"), { locale: "ru", path: "/xx/berlin" });
  assert.equal(localizedPath("/", "de"), "/de");
  assert.equal(localizedPath("/about", "ru"), "/about");
  assert.equal(localizeHref("/berlin/start?x=1#a", "fr"), "/fr/berlin/start?x=1#a");
  assert.equal(localizeHref("/fr/berlin/start", "fr"), "/fr/berlin/start");
  assert.equal(localizeHref("/api/events", "fr"), "/api/events");
  assert.equal(localizeHref("https://service.berlin.de/", "fr"), "https://service.berlin.de/");
  assert.equal(localizeHref("mailto:a@b.it", "fr"), "mailto:a@b.it");
  assert.equal(localizeHref("#top", "fr"), "#top");
  assert.equal(localizeHref("/berlin/start", "ru"), "/berlin/start");
});

test("language URLs are rendered on the server in the right language and redirect /ru to the unprefixed page", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("language-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = { ASSETS: { fetch: async (request) => {
    const name = new URL(request.url).pathname;
    try { return new Response(await readFile(new URL(`../public${name}`, import.meta.url)), { headers: { "content-type": "application/json" } }); }
    catch { return new Response("Not found", { status: 404 }); }
  } } };
  const ctx = { waitUntil() {}, passThroughOnException() {} };
  for (const [code, dir, heading] of [["en", "ltr", "Where to start in Berlin?"], ["ar", "rtl", "من أين تبدأ في برلين؟"], ["fr", "ltr", "Par où commencer à Berlin ?"]]) {
    const response = await worker.fetch(new Request(`https://nostres.world/${code}`), env, ctx);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, new RegExp(`<html lang="${code}" dir="${dir}"`));
    assert.ok(html.includes(heading), `${code} heading`);
    assert.match(html, /window\.__NOSTRES_I18N=/);
    const visible = html.replace(/<head>[\s\S]*?<\/head>/, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
    assert.deepEqual((visible.match(/[А-Яа-яЁё]+/g) ?? []).filter((word) => word !== "Русский"), [], `${code} has no untranslated Russian text`);
    assert.match(html, new RegExp(`href="/${code}/berlin/start"`));
  }
  for (const [code, dir, pagePath, sourceQuestion] of [
    ["de", "ltr", "/berlin/transport-tickets", "Кто будет пользоваться билетом?"],
    ["ar", "rtl", "/berlin/culture-discounts", "Кому нужна льгота?"],
    ["de", "ltr", "/berlin/chancenkarte", "Какое у вас образование?"],
    ["ar", "rtl", "/berlin/viza-uchyoba", "Какая у вас цель?"],
  ]) {
    const response = await worker.fetch(new Request(`https://nostres.world/${code}${pagePath}`), env, ctx);
    const html = await response.text();
    assert.equal(response.status, 200, `${code}${pagePath}`);
    assert.match(html, new RegExp(`<html lang="${code}" dir="${dir}"`));
    assert.match(html, /window\.__NOSTRES_I18N=/);
    const dictionary = JSON.parse(await readFile(new URL(`../public/i18n/${code}.json`, import.meta.url), "utf8"));
    assert.ok(dictionary[sourceQuestion], `${code} question translation`);
    assert.ok(html.includes(dictionary[sourceQuestion]), `${code} rendered route question`);
    const visible = html.replace(/<head>[\s\S]*?<\/head>/, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
    assert.deepEqual((visible.match(/[А-Яа-яЁё]+/g) ?? []).filter((word) => word !== "Русский"), [], `${code}${pagePath} has no untranslated Russian text`);
  }
  const redirect = await worker.fetch(new Request("https://nostres.world/ru/berlin/start"), env, ctx);
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get("location"), "https://nostres.world/berlin/start");
  const russian = await worker.fetch(new Request("https://nostres.world/berlin/start"), env, ctx);
  assert.match(await russian.text(), /<html lang="ru" dir="ltr"/);
});
