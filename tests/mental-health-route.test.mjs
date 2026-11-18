import assert from "node:assert/strict";
import test from "node:test";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const hosts = new Set([
  "www.berliner-krisendienst.de", "gesund.bund.de", "www.berlin.de", "www.nora-notruf.de", "www.telefonseelsorge.de", "online.telefonseelsorge.de",
  "willkommenszentrum.berlin.de", "service.berlin.de", "arztsuche.116117.de", "www.116117-termine.de", "www.kbv.de", "www.116117.de",
  "www.bundesgesundheitsministerium.de", "www.arbeitsagentur.de",
]);
const vague = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
function allPlans() {
  const out = [];
  (function walk(answers) {
    const next = questionsFor("mental", answers).find((question) => !answers[question.id]);
    if (!next) return out.push([answers, planFor("mental", answers)]);
    for (const [value] of next.options) walk({ ...answers, [next.id]: value });
  })({});
  return out;
}
const steps = (plan) => [...(plan.steps ?? []), ...(plan.methods ?? []).flatMap((m) => m.steps)];
const links = (plan) => steps(plan).flatMap((s) => [s.action, s.source, s.alternative]).filter(Boolean).map((a) => a.href);

test("mental: every path is concrete and links only to official pages", () => {
  const plans = allPlans();
  assert.equal(plans.length, 23);
  for (const [answers, plan] of plans) {
    assert.ok(plan.steps.length > 0, JSON.stringify(answers));
    assert.ok(plan.fit, JSON.stringify(answers));
    assert.doesNotMatch(JSON.stringify(plan), vague);
    for (const href of links(plan)) if (!href.startsWith("/") && !href.startsWith("tel:")) assert.ok(hosts.has(new URL(href).host), href);
  }
});

test("mental: a crisis shows help at once, and a call is never the first step", () => {
  assert.deepEqual(questionsFor("mental", { need: "crisis" }).map((q) => q.id), ["need"]);
  const crisis = planFor("mental", { need: "crisis" });
  assert.notEqual(crisis.steps[0].mode, "Звонок");
  assert.ok(crisis.steps.some((s) => s.mode === "Онлайн"), "a written channel is offered");
  assert.ok(crisis.steps.findIndex((s) => s.mode === "Звонок") > crisis.steps.findIndex((s) => s.mode === "Онлайн"), "phone comes after the written channel");
  for (const [answers, plan] of allPlans()) if (answers.contact !== "phone") assert.notEqual(plan.steps[0].mode, "Звонок", JSON.stringify(answers));
});

test("mental: the chosen contact channel leads the plan", () => {
  for (const need of ["psychiatry", "therapy"]) {
    assert.equal(planFor("mental", { need, insurance: "gkv", contact: "written" }).steps[0].mode, "Онлайн");
    assert.equal(planFor("mental", { need, insurance: "gkv", contact: "inperson" }).steps[0].mode, "Лично");
    assert.equal(planFor("mental", { need, insurance: "gkv", contact: "phone" }).steps[0].mode, "Звонок");
  }
});

test("mental: facts follow the official pages", () => {
  const therapy = JSON.stringify(planFor("mental", { need: "therapy", insurance: "gkv", contact: "written" }));
  assert.match(therapy, /до 150 минут/);
  assert.match(therapy, /до 600 минут/);
  assert.match(therapy, /4 недель/);
  assert.match(JSON.stringify(planFor("mental", { need: "jobcenter" })), /5,36 €/);
  assert.match(JSON.stringify(planFor("mental", { need: "therapy", insurance: "none", contact: "written" })), /\/berlin\/health-insurance/);
  assert.match(JSON.stringify(planFor("mental", { need: "crisis" })), /Große Hamburger Straße 5/);
});
