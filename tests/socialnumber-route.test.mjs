import assert from "node:assert/strict";
import test from "node:test";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const officialHosts = new Set(["www.deutsche-rentenversicherung.de", "kundenportal.deutsche-rentenversicherung.de", "gesund.bund.de", "www.bundesgesundheitsministerium.de"]);
const vague = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
function allPlans() {
  const out = [];
  (function walk(answers) {
    const next = questionsFor("socialnumber", answers).find((question) => !answers[question.id]);
    if (!next) return out.push([answers, planFor("socialnumber", answers)]);
    for (const [value] of next.options) walk({ ...answers, [next.id]: value });
  })({});
  return out;
}
const links = (plan) => (plan.steps ?? []).flatMap((s) => [s.action, s.source, s.alternative]).filter(Boolean).map((a) => a.href);

test("socialnumber: every path is concrete and official", () => {
  const plans = allPlans();
  assert.equal(plans.length, 7);
  for (const [answers, plan] of plans) {
    assert.ok(plan.steps.length > 0, JSON.stringify(answers));
    assert.doesNotMatch(JSON.stringify(plan), vague);
    for (const href of links(plan)) if (!href.startsWith("/")) assert.ok(officialHosts.has(new URL(href).host), href);
  }
});

test("socialnumber: Steuer-ID and uninsured people go to their routes", () => {
  assert.equal(planFor("socialnumber", { need: "tax" }).next.href, "/berlin/steuer-id");
  assert.equal(planFor("socialnumber", { need: "kv", insured: "no" }).next.href, "/berlin/health-insurance");
});

test("socialnumber: the number is never given by phone and the document is free", () => {
  const unknown = JSON.stringify(planFor("socialnumber", { need: "sv", work: "unknown" }));
  assert.match(unknown, /Номер пришлют по почте/);
  assert.match(unknown, /по телефону не сообщают/);
  for (const work of ["first", "unknown", "proof"]) assert.match(JSON.stringify(planFor("socialnumber", { need: "sv", work })), /бесплатно/);
});
