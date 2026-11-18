import assert from "node:assert/strict";
import test from "node:test";
import { explainTerms } from "../app/term-explanations.ts";
import { everydayPlan } from "../app/berlin/new-routes/everyday-plans.ts";
import { planFor } from "../app/berlin/new-routes/route-plans.ts";

test("German terms in everyday routes get a short Russian explanation and are never doubled", () => {
  const text = explainTerms("Basiskonto и Videoident, Postident. Listenhunde, Hunderegister, Ordnungsamt. Ordnungsamt");
  assert.match(text, /Basiskonto \(базовый счёт/);
  assert.match(text, /Videoident \(проверка личности по видеосвязи\)/);
  assert.match(text, /Hunderegister \(городской реестр собак\)/);
  assert.equal(explainTerms("Hunderegister (городской реестр собак)"), "Hunderegister (городской реестр собак)");
  assert.equal((text.match(/Ordnungsamt \(/g) ?? []).length, 1);
  const plans = [
    everydayPlan("bank", { goal: "open", id: "authority", address: "no" }),
    everydayPlan("dog", { stage: "new", breed: "yes" }),
    planFor("business", { city: "berlin", status: "eu", kind: "trade", structure: "solo" }),
  ];
  for (const plan of plans) {
    const all = [plan.title, plan.summary, plan.note ?? "", ...(plan.methods ?? []).flatMap((m) => [m.title, m.summary, ...m.conditions, ...m.documents, ...m.steps.map((s) => s.detail)])];
    for (const line of all) {
      const done = explainTerms(line);
      assert.doesNotMatch(done, /\([^()]*\([^()]*\)[^()]*\)\)/, `nested explanation in: ${done}`);
    }
  }
});

test("explanations are never put inside existing parentheses across bank, wbs, telecom and dog routes", async () => {
  const { questionsForEveryday } = await import("../app/berlin/new-routes/everyday-plans.ts");
  const nested = /\([^()]*\([^()]*\)/;
  const combos = { bank: [], wbs: [], telecom: [], dog: [] };
  for (const goal of ["open", "another", "refused"]) for (const id of ["de", "eu", "foreign", "authority", "ukraine", "fiction", "none", "unknown"]) for (const address of ["yes", "no"]) combos.bank.push({ goal, id, address });
  for (const status of ["eu", "permit", "short", "none", "unknown"]) for (const stay of ["yes", "no", "unknown"]) for (const household of ["alone", "family", "wg"]) combos.wbs.push({ status, stay, household });
  for (const need of ["new", "switch", "cancel", "problem"]) for (const issue of ["speed", "outage", "change"]) combos.telecom.push({ need, issue });
  for (const stage of ["new", "move", "ended"]) for (const breed of ["yes", "no", "unsure"]) for (const leash of ["yes", "no"]) combos.dog.push({ stage, breed, leash });
  for (const [id, list] of Object.entries(combos)) for (const a of list) {
    const p = everydayPlan(id, a);
    const lines = [p.title, p.summary, p.note, ...(p.why ?? []), ...p.steps.flatMap((s) => [s.title, s.detail]), ...(p.methods ?? []).flatMap((m) => [m.title, m.summary, m.availabilityLabel, ...m.conditions, ...m.documents, ...m.steps.flatMap((s) => [s.title, s.detail]), ...(m.providers ?? []).flatMap((pr) => [pr.summary, ...(pr.conditions ?? [])])]), ...questionsForEveryday(id, a).flatMap((q) => [q.prompt, ...q.options.map((o) => o[1])])];
    for (const line of lines) if (typeof line === "string") assert.doesNotMatch(explainTerms(line), nested, `nested parentheses in ${id} ${JSON.stringify(a)}: ${line.slice(0, 80)}`);
  }
});
