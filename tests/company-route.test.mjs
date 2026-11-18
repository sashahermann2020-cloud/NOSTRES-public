import assert from "node:assert/strict";
import test from "node:test";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const officialHosts = new Set(["service.berlin.de", "www.ihk.de", "www.gesetze-im-internet.de", "www.elster.de", "www.bva.bund.de", "www.bundesjustizamt.de", "www.berlin.de"]);
const vague = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;

function allPlans() {
  const out = [];
  (function walk(answers) {
    const next = questionsFor("company", answers).find((question) => !answers[question.id]);
    if (!next) return out.push([answers, planFor("company", answers)]);
    for (const [value] of next.options) walk({ ...answers, [next.id]: value });
  })({});
  return out;
}
const links = (plan) => [...(plan.steps ?? []), ...(plan.methods ?? []).flatMap((m) => m.steps)].flatMap((s) => [s.action, s.source, s.alternative]).filter(Boolean).map((a) => a.href);

test("company: every answer path ends in a concrete plan with official links", () => {
  const plans = allPlans();
  assert.ok(plans.length >= 20);
  for (const [answers, plan] of plans) {
    assert.ok(plan.steps.length > 0, JSON.stringify(answers));
    assert.doesNotMatch(JSON.stringify(plan), vague);
    for (const href of links(plan)) if (!href.startsWith("/")) assert.ok(officialHosts.has(new URL(href).host), href);
  }
});

test("company: UG needs full payment, GmbH half of 25 000 €", () => {
  const ug = JSON.stringify(planFor("company", { stage: "plan", form: "ug", founders: "simple", residence: "eu", trade: "trade" }));
  assert.match(ug, /полностью и только деньгами/);
  const gmbh = JSON.stringify(planFor("company", { stage: "plan", form: "gmbh", founders: "simple", residence: "eu", trade: "trade" }));
  assert.match(gmbh, /12 500 €/);
  assert.match(gmbh, /Amtsgericht Charlottenburg/);
});

test("company: Musterprotokoll only for up to three founders and one director", () => {
  const complex = planFor("company", { stage: "plan", form: "gmbh", founders: "complex", residence: "eu", trade: "trade" });
  assert.equal(complex.methods[0].steps.find((s) => /Gesellschaftsvertrag|Musterprotokoll/.test(s.title)).title, "Подготовьте свой Gesellschaftsvertrag");
});

test("company: non-EU founders get the permit check, abroad defaults to the video notary", () => {
  const abroad = planFor("company", { stage: "plan", form: "ug", founders: "simple", residence: "abroad", trade: "trade" });
  assert.equal(abroad.fit, "conditional");
  assert.equal(abroad.steps, abroad.methods[1].steps);
  assert.equal(abroad.steps[0].action.href, "/berlin/pereezd-v-germaniyu");
  const permit = planFor("company", { stage: "registered", residence: "permit", trade: "other" });
  assert.match(permit.steps[0].title, /ВНЖ/);
  assert.ok(!permit.steps.some((s) => /Gewerbe/.test(s.title)));
});

test("company: registered company gets tax, transparency and yearly disclosure", () => {
  const plan = planFor("company", { stage: "registered", residence: "eu", trade: "trade" });
  const titles = plan.steps.map((s) => s.title).join(" | ");
  for (const word of [/Gewerbe/, /ELSTER/, /Transparenzregister/, /отчётность/]) assert.match(titles, word);
  assert.match(JSON.stringify(plan.steps), /выписку из Handelsregister/);
});

test("business: company structure leads to the GmbH/UG route", () => {
  const plan = planFor("business", { city: "berlin", status: "eu", kind: "trade", structure: "other" });
  assert.equal(plan.next.href, "/berlin/gmbh-ug");
});
