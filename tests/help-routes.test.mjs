import assert from "node:assert/strict";
import test from "node:test";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

// Официальные страницы ведомств и сайты крупных организаций помощи (решение владельца 19.11.2026).
const hosts = new Set([
  "www.berlin.de", "berlin.de", "service.berlin.de", "fairmieten-fairwohnen.de", "www.adnb.de", "www.antidiskriminierungsstelle.de", "antidiskriminierungsstelle.de",
  "www.gesetze-im-internet.de", "gewaltschutzambulanz.charite.de", "www.nora-notruf.de", "www.kaeltehilfe-berlin.de", "www.berliner-stadtmission.de",
  "www.caritas.de", "www.berliner-tafel.de", "www.drk-berlin.de", "www.mbeon.de", "bamf-navi.bamf.de", "www.big-hotline.de", "www.hilfetelefon.de", "www.maennerhilfetelefon.de",
]);
const vague = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
function allPlans(id) {
  const out = [];
  (function walk(answers) {
    const next = questionsFor(id, answers).find((question) => !answers[question.id]);
    if (!next) return out.push([answers, planFor(id, answers)]);
    for (const [value] of next.options) walk({ ...answers, [next.id]: value });
  })({});
  return out;
}
const links = (plan) => plan.steps.flatMap((s) => [s.action, s.source, s.alternative]).filter(Boolean).map((a) => a.href);

for (const [id, count] of [["discrimination", 11], ["homeless", 6], ["hardship", 5], ["violence", 6]]) {
  test(`${id}: every path is concrete, without long dashes, and links only to official pages`, () => {
    const plans = allPlans(id);
    assert.equal(plans.length, count);
    for (const [answers, plan] of plans) {
      assert.ok(plan.steps.length > 0 && plan.fit, JSON.stringify(answers));
      const text = JSON.stringify(plan);
      assert.doesNotMatch(text, vague);
      assert.ok(!text.includes("\u2014"), JSON.stringify(answers));
      for (const href of links(plan)) if (!href.startsWith("/") && !href.startsWith("tel:")) assert.ok(hosts.has(new URL(href).host), href);
    }
  });
}

test("urgent situations show help at once, without further questions", () => {
  for (const [id, answers] of [["homeless", { situation: "tonight" }], ["violence", { who: "danger" }], ["discrimination", { where: "attack" }]]) {
    assert.equal(questionsFor(id, answers).length, 1, id);
    assert.ok(planFor(id, answers).steps.length >= 3, id);
  }
});

test("facts follow the official pages", () => {
  assert.match(JSON.stringify(planFor("discrimination", { where: "work", goal: "claim" })), /2 месяцев/);
  assert.match(JSON.stringify(planFor("discrimination", { where: "police", goal: "claim" })), /6 месяцев/);
  assert.match(JSON.stringify(planFor("homeless", { situation: "threat", stage: "court" })), /один раз за 2 года/);
  assert.match(JSON.stringify(planFor("homeless", { situation: "tonight" })), /030 343 971 40/);
  assert.match(JSON.stringify(planFor("homeless", { situation: "lost", status: "asylum" })), /Landesamt für Flüchtlingsangelegenheiten/);
  assert.match(JSON.stringify(planFor("violence", { who: "woman", need: "shelter" })), /030 611 03 00/);
  assert.match(JSON.stringify(planFor("violence", { who: "man" })), /0800 123 99 00/);
  assert.match(JSON.stringify(planFor("hardship", { need: "advice", age: "adult" })), /48 часов/);
});

test("violence: a written channel comes before a call when the person may not be safe to talk", () => {
  const advice = planFor("violence", { who: "woman", need: "advice" });
  assert.equal(advice.steps[0].mode, "Онлайн");
  assert.equal(planFor("violence", { who: "man" }).steps[0].mode, "Онлайн");
});
