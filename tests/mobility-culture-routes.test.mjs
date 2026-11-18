import assert from "node:assert/strict";
import test from "node:test";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const officialHosts = new Set([
  "www.bundesregierung.de",
  "www.vbb.de",
  "www.bvg.de",
  "service.berlin.de",
  "www.berlin.de",
  "familienportal.berlin.de",
  "www.smb.museum",
  "www.museumsportal-berlin.de",
  "kulturleben-berlin.de",
  "fairgnuegen.berlin.de",
]);
const vagueOutcome = /(уточните|сверьте|спросите|узнайте у|недостаточно данных|пока не подтвержд)/i;

function allPlans(id) {
  const out = [];
  (function walk(answers) {
    const next = questionsFor(id, answers).find((question) => !answers[question.id]);
    if (!next) {
      out.push([answers, planFor(id, answers)]);
      return;
    }
    for (const [value] of next.options) walk({ ...answers, [next.id]: value });
  })({});
  return out;
}

function linksIn(plan) {
  const links = [];
  const add = (action) => action?.href && links.push(action.href);
  for (const step of plan.steps ?? []) {
    add(step.action);
    add(step.source);
    add(step.alternative);
  }
  for (const method of plan.methods ?? []) {
    for (const step of method.steps) {
      add(step.action);
      add(step.source);
      add(step.alternative);
    }
  }
  add(plan.next);
  return links;
}

for (const id of ["transport", "culture"]) {
  test(`${id}: every answer path has concrete methods, documents and official sources`, () => {
    const results = allPlans(id);
    assert.ok(results.length >= 40, `${id}: ${results.length} answer paths`);
    for (const [answers, plan] of results) {
      assert.ok(Object.keys(answers).length <= (id === "transport" ? 4 : 3), `${id}: too many questions for ${JSON.stringify(answers)}`);
      assert.ok(plan.title, JSON.stringify(answers));
      assert.ok(plan.fit, JSON.stringify(answers));
      assert.ok((plan.methods ?? []).length > 0, JSON.stringify(answers));
      assert.doesNotMatch(JSON.stringify(plan), vagueOutcome, `${id}: ${JSON.stringify(answers)}`);
      for (const method of plan.methods) {
        assert.ok(method.title && method.summary, `${id} ${JSON.stringify(answers)} ${method.id}`);
        assert.ok(method.documents.length > 0, `${id} ${JSON.stringify(answers)} ${method.id}: documents`);
        assert.ok(method.steps.length >= 2, `${id} ${JSON.stringify(answers)} ${method.id}: steps`);
      }
      for (const href of linksIn(plan)) {
        if (href.startsWith("/")) continue;
        assert.ok(officialHosts.has(new URL(href).hostname), `${id}: unexpected source ${href}`);
      }
    }
  });
}

test("transport: school, university, apprenticeship, social and disability fares stay distinct", () => {
  assert.deepEqual(questionsFor("transport", {}).map((question) => question.id), ["profile"]);
  assert.deepEqual(questionsFor("transport", { profile: "under6" }).map((question) => question.id), ["profile"]);

  const school = JSON.stringify(planFor("transport", { profile: "school", zone: "ab", frequency: "occasional", channel: "online" }));
  assert.match(school, /Schülerticket Berlin AB/);
  assert.match(school, /nur online|только онлайн/i);

  const semester = JSON.stringify(planFor("transport", { profile: "student", zone: "de", frequency: "frequent", channel: "online" }));
  assert.match(semester, /Deutschlandsemesterticket/);
  assert.match(semester, /37,80/);
  assert.match(semester, /ICE, IC (?:и|und|and) EC/);

  const otherStudent = JSON.stringify(planFor("transport", { profile: "student_other", zone: "ab", frequency: "frequent", channel: "both" }));
  assert.match(otherStudent, /Monatskarte Ausbildung/);
  assert.match(otherStudent, /15 Credit Points/);
  assert.match(otherStudent, /55,40/);
  assert.match(otherStudent, /77,50/);

  const apprenticeship = JSON.stringify(planFor("transport", { profile: "training", zone: "de", frequency: "frequent", channel: "both" }));
  assert.match(apprenticeship, /Deutschlandticket Zuschuss Ausbildung/);
  assert.match(apprenticeship, /22,05/);
  assert.match(apprenticeship, /59,85/);
  assert.match(apprenticeship, /37,80/);

  const social = JSON.stringify(planFor("transport", { profile: "social", zone: "ab", frequency: "frequent", channel: "both" }));
  assert.match(social, /Berlin-Ticket S/);
  assert.match(social, /27,50/);
  assert.match(social, /Berlin AB/);
  assert.match(social, /не.*Deutschlandticket/);

  const disability = JSON.stringify(planFor("transport", { profile: "disability", zone: "de", frequency: "occasional", channel: "online" }));
  assert.match(disability, /Wertmarke/);
  assert.match(disability, /Merkzeichen B/);
});

test("transport: purchase channels are shown only where an operator offers them", () => {
  const online = planFor("transport", { profile: "regular", zone: "de", frequency: "frequent", channel: "online" });
  assert.ok(online.methods.some((method) => method.id === "deutschlandticket-online"));
  assert.ok(!online.methods.some((method) => method.id === "deutschlandticket-in-person"));

  const inPerson = planFor("transport", { profile: "regular", zone: "de", frequency: "frequent", channel: "in_person" });
  assert.ok(inPerson.methods.some((method) => method.id === "deutschlandticket-in-person"));
  assert.ok(!inPerson.methods.some((method) => method.id === "deutschlandticket-online"));
  assert.match(JSON.stringify(inPerson), /не продаётся|nicht verkauft|not sold/i);

  const both = planFor("transport", { profile: "regular", zone: "ab", frequency: "occasional", channel: "both" });
  assert.ok(both.methods.some((method) => method.id === "vbb-local-online"));
  assert.ok(both.methods.some((method) => method.id === "vbb-local-sales"));
});

test("culture: benefits are separate by audience and no universal refugee discount is promised", () => {
  const child = JSON.stringify(planFor("culture", { profile: "child", activity: "museum" }));
  assert.match(child, /children-museums|Staatliche Museen/);
  assert.match(child, /до 18 лет|until age 18/);
  assert.doesNotMatch(child, /Berliner FamilienPass/);

  const family = JSON.stringify(planFor("culture", { profile: "family", activity: "leisure" }));
  assert.match(family, /Berliner FamilienPass/);
  assert.match(family, /Bildungs- und Teilhabepaket/);

  const social = JSON.stringify(planFor("culture", { profile: "social", activity: "stage", proof: "yes" }));
  assert.match(social, /Fairgnügen/);
  assert.match(social, /3 €/);
  assert.match(social, /Wohngeld/);
  assert.match(social, /Bedarfsgemeinschaft/);

  const lowIncome = JSON.stringify(planFor("culture", { profile: "lowincome", activity: "all", proof: "no" }));
  assert.match(lowIncome, /KulturLeben/);
  assert.match(lowIncome, /1 200/);
  assert.match(lowIncome, /не онлайн-заявление/);

  const student = JSON.stringify(planFor("culture", { profile: "student", activity: "museum" }));
  assert.match(student, /50%/);
  assert.match(student, /ALG I/);

  const disability = JSON.stringify(planFor("culture", { profile: "disability", activity: "museum" }));
  assert.match(disability, /GdB от 50/);
  assert.match(disability, /Merkzeichen B/);

  const refugee = JSON.stringify(planFor("culture", { profile: "refugee", activity: "museum" }));
  assert.match(refugee, /Museumsportal/);
  assert.match(refugee, /не общая скидка по статусу/);
  assert.doesNotMatch(refugee, /3 €/);
  assert.doesNotMatch(refugee, /получателям Bürgergeld/);
});

// Строже, чем общий тест: ответ должен менять способы, а не только список «почему».
for (const id of ["transport", "culture"]) {
  test(`${id}: every visible question changes the methods, not only the explanation`, () => {
    const sig = (a) => { const { why, ...rest } = planFor(id, a); void why; return JSON.stringify(rest); };
    const idle = new Set();
    const used = new Set();
    (function go(a) {
      const qs = questionsFor(id, a);
      for (const q of qs) {
        if (!a[q.id]) continue;
        idle.add(q.id);
        const variants = new Set(q.options.map(([v]) => { const b = { ...a, [q.id]: v }; return questionsFor(id, b).every((x) => b[x.id]) ? sig(b) : `open:${v}`; }));
        if (variants.size > 1) used.add(q.id);
      }
      const next = qs.find((q) => !a[q.id]);
      if (next) next.options.forEach(([v]) => go({ ...a, [next.id]: v }));
    })({});
    assert.deepEqual([...idle].filter((q) => !used.has(q)), []);
  });
}

test("analytics: new routes are allowed, but only the method type is recorded", async () => {
  const { readFileSync } = await import("node:fs");
  const api = readFileSync(new URL("../app/api/mvp-events/route.ts", import.meta.url), "utf8") + readFileSync(new URL("../app/api/mvp-events/rules.ts", import.meta.url), "utf8");
  const guided = readFileSync(new URL("../app/berlin/new-routes/GuidedRoute.tsx", import.meta.url), "utf8");
  assert.match(api, /"transport", "culture"/);
  assert.match(guided, /GENERIC_METHOD_ROUTES = new Set<RouteId>\(\["transport", "culture"\]\)/);
  assert.match(guided, /GENERIC_METHOD_ROUTES\.has\(id\) \? `kind:\$\{kind\}` : value/);
});
