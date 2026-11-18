import assert from "node:assert/strict";
import test from "node:test";
import { journeys, getVisibleQuestions, getAvailableActionMethods, getPersonalizedResult } from "../app/nostres-data.ts";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";

/**
 * Specification §3.1: a question is asked only when its answer changes the result.
 * The test walks every reachable answer set and reports questions whose answer never changes the outcome.
 * `pending` lists known cases awaiting a decision; the list must only shrink.
 */
const pending = new Set([]);

function walk(visible, options) {
  const sets = [];
  (function go(answers) {
    const next = visible(answers).find((q) => !answers[q.id]);
    if (!next) { sets.push({ ...answers }); return; }
    for (const [value] of options(next)) go({ ...answers, [next.id]: value });
  })({});
  return sets;
}

function idle(visible, options, signature, questionIds) {
  const sets = walk(visible, options);
  const result = [];
  for (const id of questionIds) {
    let shown = 0, changes = 0;
    for (const answers of sets) {
      if (!(id in answers)) continue;
      shown += 1;
      const base = signature(answers);
      for (const [value] of options(visible(answers).find((q) => q.id === id))) {
        if (value === answers[id]) continue;
        const other = { ...answers, [id]: value };
        if (visible(other).some((q) => !other[q.id]) || signature(other) !== base) changes += 1;
      }
    }
    if (shown > 0 && changes === 0) result.push(id);
  }
  return result;
}

for (const id of ["anmeldung", "tax-id", "health"]) {
  test(`${id}: every question changes the result`, () => {
    const journey = journeys.find((item) => item.id === id);
    const found = idle(
      (a) => getVisibleQuestions(journey, a),
      (q) => q.options.map((o) => [o.value]),
      (a) => JSON.stringify([getAvailableActionMethods(journey, a).map((m) => [m.id, m.availabilityLabel, m.badge, m.documents, m.prerequisites]), getPersonalizedResult(id, a)]),
      journey.questions.map((q) => q.id),
    ).map((q) => `${id}:${q}`);
    assert.deepEqual(found.filter((key) => !pending.has(key)), [], "questions that do not change the result must be removed or turned into steps");
    assert.deepEqual([...pending].filter((key) => key.startsWith(`${id}:`) && !found.includes(key)), [], "remove resolved entries from `pending`");
  });
}

for (const id of ["doctor", "urgent", "business", "bank", "telecom", "dog", "wbs", "lea", "housing", "kindergeld", "jobcenter", "kita", "employment", "elterngeld", "kinderzuschlag", "steuererklaerung", "elternzeit", "wohngeld", "mutterschutz", "bildungspaket", "pflegegeld", "schwerbehinderung", "wohnungsgeber", "umzug", "arbeitslosengeld", "grundsicherungsgeld", "kfz", "einbuergerung", "workpermit", "recognition", "language", "reunion", "sprachkurs", "study", "petmove", "petpass", "vet", "dogtrainer", "transport", "culture", "relocation", "chancenkarte", "workvisa", "volunteer", "studyvisa", "company", "socialnumber", "settlement", "notary", "mental"]) {
  test(`${id}: every question changes the plan`, () => {
    const all = [];
    const collect = (a) => questionsFor(id, a);
    const seen = new Map();
    (function go(a) { collect(a).forEach((q) => seen.set(q.id, q)); const n = collect(a).find((q) => !a[q.id]); if (n) n.options.forEach(([v]) => go({ ...a, [n.id]: v })); })({});
    all.push(...seen.keys());
    const found = idle(collect, (q) => q.options, (a) => JSON.stringify(planFor(id, a)), all).map((q) => `${id}:${q}`);
    assert.deepEqual(found.filter((key) => !pending.has(key)), []);
  });
}
