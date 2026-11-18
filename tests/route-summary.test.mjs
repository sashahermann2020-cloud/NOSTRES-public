import assert from "node:assert/strict";
import test from "node:test";
import { buildRouteSummary, issueTypeLabels, toAbsoluteLink, uniqueSources } from "../app/route-summary.ts";

const steps = [
  { title: "Проверьте условия", detail: "Сверьте документы", mode: "Онлайн", done: true, links: [{ label: "Услуга", href: "https://service.berlin.de/a" }, { label: "Мой план", href: "/berlin/start" }] },
  { title: "Подайте заявление", done: false, links: [{ label: "Услуга", href: "https://service.berlin.de/a" }, { label: "Форма", href: "https://service.berlin.de/b" }] },
];

test("summary lists progress, steps, absolute links and the check date", () => {
  const text = buildRouteSummary({ routeTitle: "Тест", resultTitle: "Итог", resultSummary: "Кратко", note: "Осторожно", steps, checkedAt: "5 октября 2026" });
  assert.match(text, /Выполнено шагов: 1 из 2/);
  assert.match(text, /\[x\] 1\. Проверьте условия \(Онлайн\)/);
  assert.match(text, /\[ \] 2\. Подайте заявление/);
  assert.match(text, /Мой план: https:\/\/nostres\.world\/berlin\/start/);
  assert.match(text, /Важно: Осторожно/);
  assert.match(text, /проверены: 5 октября 2026/);
});

test("sources are deduplicated, external only, and ids fit the API limit", () => {
  const list = uniqueSources([...steps, { links: [{ label: "Длинная", href: `https://example.org/${"x".repeat(200)}` }] }]);
  assert.deepEqual(list.slice(0, 2).map((s) => s.href), ["https://service.berlin.de/a", "https://service.berlin.de/b"]);
  assert.equal(list.length, 3);
  assert.ok(list.every((s) => s.id.length <= 80));
  assert.equal(toAbsoluteLink("https://x.y"), "https://x.y");
});

test("issue types match what the API accepts", () => {
  assert.deepEqual(issueTypeLabels.map(([value]) => value), ["broken_link", "information_changed", "wrong_geography", "unclear_instruction", "missing_official_option"]);
});
