import assert from "node:assert/strict";
import test from "node:test";

test("renders a skip link, focusable main target, and native labelled questionnaire controls", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("accessibility", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(new Request("http://localhost/berlin/start", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /class="skip-link" href="#top"/);
  assert.match(html, /<main class="start-page" id="top" tabindex="-1"/);
  assert.match(html, /<fieldset class="start-question"><legend>Вы уже в Берлине\?<\/legend>/);
  assert.match(html, /<input type="radio" name="location" value="already"[^>]*\/>\s*<span>Да, живу здесь<\/span>/);
});
