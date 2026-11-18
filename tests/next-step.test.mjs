import assert from "node:assert/strict";
import test from "node:test";
import { makePlan } from "../app/berlin/start/plan.ts";
import { blockers, nextStep, waiting } from "../app/berlin/start/next-step.ts";

const base = {
  location: "already", housing: "moved", registered: "no", family: "none", children: "none", dog: "none", car: "none", taxId: "no", insurance: "yes",
  permit: "no", work: "other", doctor: false, business: false, access: "online", eid: "no", visit: "no",
};

test("tax ID waits for Anmeldung, then becomes the next step", () => {
  const plan = makePlan(base);
  const done = new Set();
  const isDone = (item) => done.has(item.id);
  assert.equal(nextStep(plan, isDone).id, "anmeldung");
  assert.deepEqual(waiting(plan, isDone).map((entry) => [entry.item.id, entry.blockedBy.map((b) => b.id)]), [["tax-id", ["anmeldung"]]]);
  done.add("anmeldung");
  assert.equal(nextStep(plan, isDone).id, "tax-id");
  assert.equal(waiting(plan, isDone).length, 0);
});

test("a person still searching for housing starts with housing, not registration", () => {
  const plan = makePlan({ ...base, location: "moving", housing: "search" });
  assert.equal(nextStep(plan, () => false).id, "housing");
  const anmeldung = plan.find((item) => item.id === "anmeldung");
  assert.deepEqual(blockers(anmeldung, plan, () => false).map((item) => item.id), ["housing"]);
});

test("a dependency that is not in the plan does not block", () => {
  const plan = makePlan({ ...base, registered: "berlin", housing: "settled", taxId: "no" });
  const taxId = plan.find((item) => item.id === "tax-id");
  assert.equal(blockers(taxId, plan, () => false).length, 0);
});

test("nothing left means no next step", () => {
  const plan = makePlan(base);
  assert.equal(nextStep(plan, () => true), null);
});
