import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";

// Правило текстов (PROJECT_SPEC «Тексты и термины»): длинное тире не используется ни в русских текстах, ни в переводах.
const root = new URL("../", import.meta.url);
const files = ["i18n/source.tsv", ...readdirSync(new URL("i18n/translations/", root)).map((f) => `i18n/translations/${f}`)];

test("в текстах сайта и переводах нет длинного тире", () => {
  for (const file of files) {
    const lines = readFileSync(new URL(file, root), "utf8").split("\n").filter((line) => line.includes("—"));
    assert.equal(lines.length, 0, `${file}: ${lines.slice(0, 3).join(" | ")}`);
  }
});
