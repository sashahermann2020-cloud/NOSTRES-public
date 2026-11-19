import assert from "node:assert/strict";
import test from "node:test";

const routes = [
  "/berlin/start",
  "/berlin/anmeldung",
  "/berlin/steuer-id",
  "/berlin/health-insurance",
  "/berlin/wohnungssuche",
  "/berlin/aufenthalt",
  "/berlin/vrach",
  "/berlin/srochnaya-pomoshch",
  "/berlin/samostoyatelnaya-rabota",
  "/berlin/bank",
  "/berlin/svyaz",
  "/berlin/wbs",
  "/berlin/sobaka/marshrut",
  "/berlin/kindergeld",
  "/berlin/jobcenter",
  "/berlin/kita-schule",
  "/berlin/rabota-po-najmu",
  "/berlin/elterngeld",
  "/berlin/kinderzuschlag",
  "/berlin/steuererklaerung",
  "/berlin/elternzeit",
  "/berlin/wohngeld",
  "/berlin/mutterschutz",
  "/berlin/bildungspaket",
  "/berlin/pflegegeld",
  "/berlin/schwerbehinderung",
  "/berlin/wohnungsgeber",
  "/berlin/umzug",
  "/berlin/arbeitslosengeld",
  "/berlin/grundsicherungsgeld",
  "/berlin/kfz-ummeldung",
  "/berlin/einbuergerung",
  "/berlin/aufenthalt-rabota",
  "/berlin/anerkennung",
  "/berlin/integrationskurs",
  "/berlin/familiennachzug",
  "/berlin/sprachkurs",
  "/berlin/pereezd-s-zhivotnym",
  "/berlin/heimtierausweis",
  "/berlin/veterinar",
  "/berlin/dressirovka",
  "/berlin/studium-ausbildung",
  "/berlin/pereezd-v-germaniyu",
  "/berlin/chancenkarte",
  "/berlin/viza-rabota",
  "/berlin/viza-volontyor",
  "/berlin/viza-uchyoba",
  "/berlin/notar",
  "/berlin/psihicheskoe-zdorovye",
  "/berlin/diskriminaciya",
  "/berlin/bez-zhilya",
  "/berlin/trudnaya-situaciya",
  "/berlin/domashnee-nasilie",
  "/berlin/niederlassungserlaubnis",
  "/berlin/sozialversicherungsnummer",
  "/berlin/gmbh-ug",
];

test("all twenty-one Berlin entry points render semantic landmarks and headings", async (t) => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("a11y-routes", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
  const ctx = { waitUntil() {}, passThroughOnException() {} };

  for (const path of routes) {
    await t.test(path, async () => {
      const response = await worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), env, ctx);
      assert.equal(response.status, 200, path);
      const html = await response.text();
      assert.match(html, /<main\b[^>]*>/i, `${path}: missing main landmark`);
      assert.match(html, /<h1\b[^>]*>/i, `${path}: missing page heading`);
      assert.match(html, /<html\b[^>]*lang="ru"/i, `${path}: document language must be Russian`);
      assert.doesNotMatch(html, /<img\b(?![^>]*\balt=)[^>]*>/gi, `${path}: image missing alt attribute`);
    });
  }
});
