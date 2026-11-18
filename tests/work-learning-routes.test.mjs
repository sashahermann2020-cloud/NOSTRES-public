import test from "node:test";
import assert from "node:assert/strict";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const forbidden = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
const hosts = new Set(["service.berlin.de", "www.berlin.de", "willkommenszentrum.berlin.de", "www.make-it-in-germany.com", "www.anerkennung-in-deutschland.de", "www.bamf.de", "www.bmi.bund.de", "www.arbeitsagentur.de", "www.auswaertiges-amt.de", "www.germany.info", "www.goethe.de", "bamf-navi.bamf.de", "www.uni-assist.de", "anabin.kmk.org", "www.fu-berlin.de", "www.hwr-berlin.de", "www.daad.de", "www.myguide.de", "www.hochschulkompass.de", "www.ihk.de", "arztsuche.116117.de", "web.arbeitsagentur.de", "mein-now.de", "www.ak-berlin.de", "www.ihk-fosa.de", "zab.kmk.org"]);

function plans(id) {
  const out = [];
  (function walk(a) {
    const next = questionsFor(id, a).find((item) => !a[item.id]);
    if (!next) { out.push([a, planFor(id, a)]); return; }
    next.options.forEach(([value]) => walk({ ...a, [next.id]: value }));
  })({});
  return out;
}
function links(plan) {
  const all = [];
  const add = (x) => x && all.push(x.href);
  plan.steps.forEach((s) => { add(s.action); add(s.source); add(s.alternative); });
  (plan.methods ?? []).forEach((m) => m.steps.forEach((s) => { add(s.action); add(s.source); add(s.alternative); }));
  add(plan.next);
  return all;
}

for (const id of ["workpermit", "recognition", "language", "reunion", "sprachkurs", "study"]) {
  test(`${id}: every result is concrete, has steps and only official links`, () => {
    const all = plans(id);
    assert.ok(all.length >= 5);
    for (const [answers, plan] of all) {
      assert.doesNotMatch(JSON.stringify(plan), forbidden, JSON.stringify(answers));
      assert.ok(plan.steps.length >= 1, JSON.stringify(answers));
      assert.ok(plan.fit, JSON.stringify(answers));
      for (const href of links(plan)) {
        if (href.startsWith("/")) continue;
        assert.ok(hosts.has(new URL(href).host), `${id}: unexpected host ${href}`);
      }
      (plan.methods ?? []).forEach((m) => assert.ok(m.steps.length >= 2 && m.documents.length >= 1, `${id} ${m.id}`));
    }
  });
}

test("workpermit: salary and education change the permit", () => {
  const base = { place: "inde", edu: "university", job: "yes", recog: "yes", regulated: "no", stage: "new", family: "no" };
  assert.match(planFor("workpermit", { ...base, salary: "high" }).title, /Blaue Karte/);
  assert.doesNotMatch(planFor("workpermit", { ...base, salary: "low", age45: "no" }).title, /Blaue Karte/);
  assert.equal(planFor("workpermit", { place: "abroad", edu: "none" }).fit, "redirect");
});

test("recognition: profession decides the authority", () => {
  const base = { place: "abroad", employer: "no", funding: "none", papers: "yes" };
  assert.match(JSON.stringify(planFor("recognition", { ...base, field: "doctor" })), /LAGeSo/);
  assert.match(JSON.stringify(planFor("recognition", { ...base, field: "trade" })), /Handwerkskammer/);
});

test("language: entitlement and exemption change the result", () => {
  const base = { german: "no", distance: "no", format: "general" };
  assert.match(planFor("language", { ...base, status: "first", income: "no" }).title, /Teilnahmeberechtigung/);
  assert.match(planFor("language", { ...base, status: "eu", income: "no" }).title, /допуск/);
  assert.match(JSON.stringify(planFor("language", { ...base, status: "first", income: "yes" })), /630\.027r/);
});

test("reunion: visa, language and income change the result", () => {
  const base = { sponsor: "foreign", who: "spouse", place: "abroad", visafree: "no", skilled: "no", lang: "have", income: "own" };
  assert.match(JSON.stringify(planFor("reunion", base)), /Auslandsportal/);
  assert.doesNotMatch(JSON.stringify(planFor("reunion", { ...base, visafree: "yes" })), /Auslandsportal/);
  assert.equal(planFor("reunion", { ...base, lang: "no" }).fit, "conditional");
  assert.equal(planFor("reunion", { ...base, income: "benefit" }).fit, "conditional");
  assert.equal(planFor("reunion", { ...base, skilled: "yes", income: "own", parents: "no" }).fit, "fits");
});

test("recognition: profession branches name the authority, fee and language rule", () => {
  const base = { place: "abroad", employer: "no", funding: "none", papers: "yes" };
  const architect = JSON.stringify(planFor("recognition", { ...base, field: "architect" }));
  assert.match(architect, /Architektenkammer Berlin/);
  assert.match(architect, /155–515 €/);
  assert.match(architect, /знание немецкого не проверяют/);
  assert.match(JSON.stringify(planFor("recognition", { ...base, field: "commercial" })), /Koch\/Köchin/);
  assert.match(JSON.stringify(planFor("recognition", { ...base, field: "degree" })), /208 €/);
  assert.match(JSON.stringify(planFor("recognition", { ...base, field: "doctor" })), /Kenntnisprüfung/);
  assert.match(JSON.stringify(planFor("recognition", { ...base, field: "engineer" })), /200 €/);
});
