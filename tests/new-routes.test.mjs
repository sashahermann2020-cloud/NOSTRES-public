import assert from "node:assert/strict";
import test from "node:test";
import { official, planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

test("doctor route only reveals relevant questions and gives an action for every coverage state", () => {
  assert.deepEqual(questionsFor("doctor", {}).map((q) => q.id), ["coverage"]);
  assert.deepEqual(questionsFor("doctor", { coverage: "private", kind: "gp" }).map((q) => q.id), ["coverage", "kind", "lang"]);
  assert.deepEqual(questionsFor("doctor", { coverage: "public", kind: "specialist", code: "no" }).map((q) => q.id), ["coverage", "kind", "lang", "code"]);
  assert.deepEqual(questionsFor("doctor", { coverage: "public", kind: "specialist", code: "yes" }).map((q) => q.id), ["coverage", "kind", "lang", "code"]);
  assert.deepEqual(questionsFor("doctor", { coverage: "public", kind: "gp" }).map((q) => q.id), ["coverage", "kind", "lang"]);
  assert.equal(planFor("doctor", { coverage: "none" }).steps[0].action.href, "/berlin/health-insurance");
  assert.equal(planFor("doctor", { coverage: "private", kind: "gp" }).steps[0].action.href, official.doctorSearch);
  const online = planFor("doctor", { coverage: "public", kind: "specialist", code: "yes" });
  assert.deepEqual(online.methods.map((m) => m.id), ["online", "practice"]);
  assert.equal(online.methods[0].steps[0].action.href, official.appointment);
  assert.equal(planFor("doctor", { coverage: "private", kind: "gp" }).methods.length, 1);
  assert.ok(!planFor("doctor", { coverage: "public", kind: "specialist", code: "no" }).steps.some((s) => s.action.href === official.appointment));
});

test("urgent route separates emergency, uncertainty, regular care, and on-call care", () => {
  assert.deepEqual(questionsFor("urgent", { danger: "yes" }).map((q) => q.id), ["danger"]);
  assert.deepEqual(questionsFor("urgent", { danger: "no" }).map((q) => q.id), ["danger", "wait"]);
  assert.match(planFor("urgent", { danger: "yes" }).title, /112/);
  assert.equal(planFor("urgent", { danger: "unsure" }).steps[0].action.href, official.navigator);
  assert.equal(planFor("urgent", { danger: "no", wait: "yes" }).steps[0].action.href, "/berlin/vrach");
  assert.equal(planFor("urgent", { danger: "no", wait: "no" }).steps[0].action.href, official.urgentPractices);
});

test("business route does not send restricted residents or freelance work to Gewerbe form", () => {
  const base = { city: "berlin", status: "noneu", permission: "allowed" };
  assert.deepEqual(questionsFor("business", { city: "berlin", status: "noneu", permission: "restricted" }).map((q) => q.id), ["city", "status", "permission"]);
  assert.equal(planFor("business", { ...base, permission: "restricted" }).steps[0].action.href, official.residence);
  assert.equal(planFor("business", { ...base, kind: "freelance" }).steps.at(-1).action.href, official.taxForm);
  assert.ok(!planFor("business", { ...base, kind: "freelance" }).steps.some((s) => s.action.href === official.businessOnline));
  const trade = planFor("business", { ...base, kind: "trade", structure: "solo" });
  assert.deepEqual(questionsFor("business", { ...base, kind: "trade", structure: "solo" }).map((q) => q.id), ["city", "status", "permission", "kind", "structure"]);
  assert.equal(trade.methods.find((m) => m.id === "online").steps[1].action.href, official.businessOnline);
  assert.equal(trade.methods.find((m) => m.id === "personal").steps[1].action.href, official.businessService);
  for (const id of ["doctor", "urgent", "business"]) {
    const answer = id === "doctor" ? { coverage: "unknown" } : id === "urgent" ? { danger: "yes" } : { city: "berlin", status: "unknown" };
    assert.ok(planFor(id, answer).steps.every((s) => s.source.href.startsWith("https://")));
  }
});
