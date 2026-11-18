import test from "node:test";
import assert from "node:assert/strict";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

const forbidden = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;
const hosts = new Set(["www.bmbfsfj.bund.de", "familienportal.de", "www.gesetze-im-internet.de", "service.berlin.de", "www.bmwsb.bund.de"]);

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

for (const id of ["elternzeit", "wohngeld"]) {
  test(`${id}: every result is concrete, has steps and only official links`, () => {
    const all = plans(id);
    assert.ok(all.length >= 6);
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

test("elternzeit: employees only, deadlines depend on the child's age and parent", () => {
  assert.equal(planFor("elternzeit", { work: "other" }).fit, "redirect");
  assert.deepEqual(questionsFor("elternzeit", { work: "other" }).map((x) => x.id), ["work"]);
  const small = JSON.stringify(planFor("elternzeit", { work: "employee", stage: "small", parttime: "no", insurance: "gkv" }));
  const older = JSON.stringify(planFor("elternzeit", { work: "employee", stage: "older", parttime: "no", insurance: "gkv" }));
  assert.match(small, /7 недель/);
  assert.match(older, /13 недель/);
  assert.match(JSON.stringify(planFor("elternzeit", { work: "employee", stage: "pregnant", parent: "mother", parttime: "no", insurance: "gkv" })), /Mutterschutz/);
  assert.match(JSON.stringify(planFor("elternzeit", { work: "employee", stage: "small", parttime: "yes", insurance: "pkv" })), /32 часов/);
});

test("wohngeld: other housing benefits and status decide, retroactive start matters", () => {
  assert.equal(planFor("wohngeld", { home: "rent", benefit: "basic" }).fit, "redirect");
  assert.equal(planFor("wohngeld", { home: "rent", benefit: "none", recent: "no", citizen: "eu" }).fit, "fits");
  assert.equal(planFor("wohngeld", { home: "rent", benefit: "none", recent: "no", citizen: "noneu", permit: "excluded" }).fit, "redirect");
  const retro = planFor("wohngeld", { home: "rent", benefit: "none", recent: "yes", citizen: "eu" });
  const plain = planFor("wohngeld", { home: "rent", benefit: "none", recent: "no", citizen: "eu" });
  assert.notEqual(JSON.stringify(retro), JSON.stringify(plain));
  assert.deepEqual(retro.methods.map((m) => m.id), ["online", "paper"]);
  assert.match(JSON.stringify(planFor("wohngeld", { home: "own", benefit: "none", recent: "no", citizen: "eu" })), /Lastenzuschuss/);
});
