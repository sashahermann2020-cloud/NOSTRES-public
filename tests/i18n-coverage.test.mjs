import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const languages = ["en", "de", "es", "it", "tr", "ar", "pt", "fr"];
const unescape = (text) => text.replace(/\\(\\|t|n)/g, (_, code) => (code === "t" ? "\t" : code === "n" ? "\n" : "\\"));

test("all extracted source strings have translations and runtime dictionaries in eight languages", async () => {
  const sourceLines = (await readFile(new URL("../i18n/source.tsv", import.meta.url), "utf8")).trimEnd().split("\n");
  const source = new Map(sourceLines.map((line) => {
    const [id, origin, ...text] = line.split("\t");
    return [id, { origin, text: unescape(text.join("\t")) }];
  }));
  const newRouteRows = [...source.values()].filter(({ origin }) => origin === "route:transport" || origin === "route:culture");
  assert.ok(newRouteRows.length > 300);

  for (const language of languages) {
    const lines = (await readFile(new URL(`../i18n/translations/${language}.tsv`, import.meta.url), "utf8")).trimEnd().split("\n");
    const translations = new Map(lines.filter(Boolean).map((line) => {
      const [id, ...text] = line.split("\t");
      return [id, unescape(text.join("\t"))];
    }));
    for (const [id, { origin }] of source) {
      assert.ok(translations.get(id)?.trim(), `${language}: missing ${id} (${origin})`);
    }

    const runtime = JSON.parse(await readFile(new URL(`../public/i18n/${language}.json`, import.meta.url), "utf8"));
    for (const { text } of source.values()) assert.ok(runtime[text]?.trim(), `${language}: runtime missing source text: ${text}`);
  }
});
