import test from "node:test";
import assert from "node:assert/strict";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const forbidden = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
const hosts = new Set(["www.bundesgesundheitsministerium.de", "md-bund.de", "www.berlin.de", "www.gesetze-im-internet.de", "service.berlin.de", "www.arbeitsagentur.de", "www.fimportal.de", "www.rundfunkbeitrag.de"]);

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

for (const id of ["pflegegeld", "schwerbehinderung", "wohnungsgeber", "umzug"]) {
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

test("pflegegeld: insurance, two-year rule and stage decide the route", () => {
  assert.equal(planFor("pflegegeld", { who: "self", insurance: "none" }).fit, "redirect");
  assert.equal(planFor("pflegegeld", { who: "self", insurance: "gkv", stage: "new", years: "no" }).fit, "redirect");
  const fresh = JSON.stringify(planFor("pflegegeld", { who: "self", insurance: "gkv", stage: "new", years: "yes", care: "family" }));
  const refused = JSON.stringify(planFor("pflegegeld", { who: "self", insurance: "gkv", stage: "refused", care: "family" }));
  assert.match(fresh, /25 рабочих дней/);
  assert.match(refused, /одного месяца/);
  assert.match(JSON.stringify(planFor("pflegegeld", { who: "self", insurance: "pkv", stage: "new", years: "yes", care: "service" })), /MEDICPROOF/);
  assert.match(fresh, /347/);
});

test("schwerbehinderung: GdB decides what follows, new applications go by post", () => {
  assert.equal(planFor("schwerbehinderung", { stage: "decided", gdb: "mid" }).fit, "conditional");
  assert.match(JSON.stringify(planFor("schwerbehinderung", { stage: "decided", gdb: "mid" })), /Gleichstellung/);
  assert.equal(planFor("schwerbehinderung", { stage: "decided", gdb: "low" }).fit, "redirect");
  assert.match(JSON.stringify(planFor("schwerbehinderung", { stage: "new", status: "noneu", who: "self" })), /Postfach 310929/);
  assert.match(JSON.stringify(planFor("schwerbehinderung", { stage: "waiting", sent: "window" })), /infoservice@lageso/);
});

test("wohnungsgeber: tenant and landlord get different results", () => {
  assert.notEqual(JSON.stringify(planFor("wohnungsgeber", { role: "owner" })), JSON.stringify(planFor("wohnungsgeber", { role: "agent" })));
  assert.match(JSON.stringify(planFor("wohnungsgeber", { role: "tenant", state: "need", late: "no" })), /Bundesmeldegesetz/);
  assert.equal(planFor("wohnungsgeber", { role: "tenant", state: "refused", late: "yes" }).fit, "conditional");
});

test("umzug: online registration only with eID, abroad goes to Anmeldung", () => {
  assert.equal(planFor("umzug", { from: "abroad" }).fit, "redirect");
  const eid = planFor("umzug", { from: "berlin", doc: "eid", household: "alone", benefit: "none" });
  const eat = planFor("umzug", { from: "berlin", doc: "eat", household: "alone", benefit: "none" });
  assert.deepEqual(eid.methods.map((m) => m.id), ["online", "buergeramt"]);
  assert.deepEqual(eat.methods.map((m) => m.id), ["buergeramt"]);
  assert.notEqual(JSON.stringify(eid), JSON.stringify(planFor("umzug", { from: "berlin", doc: "eid", household: "alone", benefit: "jobcenter" })));
});
