import assert from "node:assert/strict";
import test from "node:test";
import { splitGermanRuns } from "../app/german-runs-split.ts";

const marked = (text) => splitGermanRuns(text).map((p) => (p.german ? `[${p.text}]` : p.text)).join("");

test("German terms in Russian and Arabic text are found for lang=de markup", () => {
  assert.equal(marked("Придите в Berliner Krisendienst без записи."), "Придите в [Berliner Krisendienst] без записи.");
  assert.equal(marked("Отправьте Arbeitsunfähigkeitsbescheinigung, PTV 11 и eID-карту."), "Отправьте [Arbeitsunfähigkeitsbescheinigung], [PTV 11] и [eID]-карту.");
  assert.equal(marked("Звоните 030 39063-10 или 112."), "Звоните 030 39063-10 или 112.");
  assert.equal(marked("تواصل مع Sozialpsychiatrischer Dienst في منطقتك"), "تواصل مع [Sozialpsychiatrischer Dienst] في منطقتك");
  assert.equal(marked("Только русский текст"), "Только русский текст");
});
