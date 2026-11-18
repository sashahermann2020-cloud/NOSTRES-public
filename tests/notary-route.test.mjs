import assert from "node:assert/strict";
import test from "node:test";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const hosts = new Set(["www.notarkammer-berlin.de", "www.notar.de", "gmbh-gruenden.notar.de", "www.gesetze-im-internet.de", "service.berlin.de"]);
const vague = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
function allPlans() {
  const out = [];
  (function walk(answers) {
    const next = questionsFor("notary", answers).find((question) => !answers[question.id]);
    if (!next) return out.push([answers, planFor("notary", answers)]);
    for (const [value] of next.options) walk({ ...answers, [next.id]: value });
  })({});
  return out;
}
const links = (plan) => [...(plan.steps ?? []), ...(plan.methods ?? []).flatMap((m) => m.steps)].flatMap((s) => [s.action, s.source, s.alternative]).filter(Boolean).map((a) => a.href);

test("notary: every path is concrete and official", () => {
  const plans = allPlans();
  assert.equal(plans.length, 9);
  for (const [answers, plan] of plans) {
    assert.ok(plan.steps.length > 0, JSON.stringify(answers));
    assert.doesNotMatch(JSON.stringify(plan), vague);
    for (const href of links(plan)) if (!href.startsWith("/")) assert.ok(hosts.has(new URL(href).host), href);
  }
});

test("notary: company costs follow the Bundesnotarkammer examples", () => {
  assert.match(JSON.stringify(planFor("notary", { need: "company", form: "muster", mode: "office" })), /105 €/);
  assert.match(JSON.stringify(planFor("notary", { need: "company", form: "multi", mode: "office" })), /630 €/);
  assert.match(JSON.stringify(planFor("notary", { need: "company", form: "multi", mode: "video" })), /25 € за заверение по видео/);
  assert.match(JSON.stringify(planFor("notary", { need: "family" })), /бесплатно/);
});

test("company route links to the notary route", () => {
  const plan = planFor("company", { stage: "plan", form: "gmbh", founders: "simple", residence: "eu", trade: "trade" });
  assert.ok(JSON.stringify(plan).includes("/berlin/notar"));
});

test("notary: the search link matches the page language", async () => {
  const { notaryOfficial } = await import("../app/berlin/new-routes/notary-plans.ts");
  const ru = JSON.stringify(planFor("notary", { need: "other" }));
  assert.ok(ru.includes(notaryOfficial.searchRu), "ru page links to Russian-speaking notaries");
  for (const code of ["RU", "EN", "ES", "IT", "TR", "PT", "FR"]) assert.match(notaryOfficial[`search${code[0]}${code[1].toLowerCase()}`], new RegExp(`chamber=7&language=${code}&`));
  for (const [answers] of [[{ need: "company", form: "muster", mode: "video" }], [{ need: "company", form: "multi", mode: "office" }]]) assert.ok(JSON.stringify(planFor("notary", answers)).includes("language=RU"));
});
