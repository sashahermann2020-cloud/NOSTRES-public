import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { READY_LOCALES, localizedPath } from "../app/i18n/locales.ts";
import { detectPlatform } from "../app/install-platform.ts";

const root = new URL("../", import.meta.url);
const pngSize = (path) => {
  const data = readFileSync(new URL(path, root));
  assert.equal(data.subarray(1, 4).toString("ascii"), "PNG", `${path} is not PNG`);
  return `${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`;
};

test("each interface language has an install manifest for the same app", () => {
  for (const { code, dir } of READY_LOCALES) {
    const manifest = JSON.parse(readFileSync(new URL(`public/manifest/${code}.webmanifest`, root), "utf8"));
    assert.equal(manifest.id, "/", code);
    assert.equal(manifest.name, "NOSTRES", code);
    assert.equal(manifest.lang, code);
    assert.equal(manifest.dir, dir, code);
    assert.equal(manifest.start_url, localizedPath("/", code), code);
    assert.equal(manifest.scope, "/", code);
    assert.equal(manifest.display, "standalone", code);
    assert.ok(manifest.description && manifest.description.length > 10, code);
    assert.ok(!("prefer_related_applications" in manifest) || manifest.prefer_related_applications === false, code);
    const sizes = manifest.icons.filter((icon) => icon.purpose === "any").map((icon) => icon.sizes);
    assert.ok(sizes.includes("192x192") && sizes.includes("512x512"), code);
    assert.ok(manifest.icons.some((icon) => icon.purpose === "maskable"), code);
    for (const icon of manifest.icons) assert.equal(pngSize(`public${icon.src}`), icon.sizes, icon.src);
  }
  assert.equal(pngSize("public/icons/apple-touch-icon.png"), "180x180");
});

test("install hint matches the visitor's platform", () => {
  const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
  const ipad = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
  const macChrome = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
  const android = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";
  assert.equal(detectPlatform(iphone, "iPhone", 5), "ios");
  assert.equal(detectPlatform(ipad, "MacIntel", 5), "ios");
  assert.equal(detectPlatform(ipad, "MacIntel", 0), "mac-safari");
  assert.equal(detectPlatform(macChrome, "MacIntel", 0), "other");
  assert.equal(detectPlatform(android, "Linux armv8l", 5), "other");
});

test("pages link the manifest of the page language and the home-screen icon", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `install-${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
  const ctx = { waitUntil() {}, passThroughOnException() {} };
  for (const [path, code] of [["/", "ru"], ["/en", "en"], ["/ar/mvp-test", "ar"]]) {
    const response = await worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), env, ctx);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, new RegExp(`<link rel="manifest" href="/manifest/${code}\\.webmanifest"`), path);
    assert.match(html, /<link rel="apple-touch-icon" href="\/icons\/apple-touch-icon\.png"/, path);
    assert.match(html, /<meta name="theme-color" content="#f1f4f7"/, path);
  }
});
