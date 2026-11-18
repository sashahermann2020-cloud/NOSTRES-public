import assert from "node:assert/strict";
import test from "node:test";

import { official, questions, stepsFor } from "../app/berlin/wohnungssuche/housing-plan.ts";

const base = { housing: "apartment", income: "german", schufa: "yes", registration: "no", wbs: "no" };

test("each housing situation has an official path and address check", () => {
  for (const housing of questions[0].options.map(([value]) => value)) {
    for (const registration of questions[3].options.map(([value]) => value)) {
      const steps = stepsFor({ ...base, housing, registration });
      assert.ok(steps.some((step) => step.title.includes("регистрации")), `${housing}/${registration}`);
      assert.ok(steps.some((step) => step.link?.href.startsWith("https://")), `${housing}/${registration}`);
      assert.ok(steps.every((step) => step.source.href.startsWith("https://")), `${housing}/${registration}`);
    }
  }
});

test("keeping another registered address exposes the separate official service", () => {
  const steps = stepsFor({ ...base, registration: "yes" });
  assert.ok(steps.some((step) => step.alternative?.href === official.secondaryAddress));
  assert.match(steps.at(-1).detail, /не становится автоматически дополнительным/);
});

test("WBS application offers online and postal options without promising eligibility", () => {
  const steps = stepsFor({ ...base, wbs: "unknown" });
  assert.equal(steps[0].link.href, "/berlin/wbs");
  assert.equal(steps[0].alternative.href, official.wbsOnline);
  assert.match(steps[0].detail, /решение принимает районное жилищное ведомство/);
  assert.match(steps[0].detail, /Срок рассмотрения на странице услуги не указан/);
  assert.equal(stepsFor({ ...base, wbs: "no" }).some((step) => step.link?.href === "/berlin/wbs"), false);
});

test("housing offers ready search options from official pages", async () => {
  const { searchOptions } = await import("../app/berlin/wohnungssuche/housing-plan.ts");
  assert.deepEqual(searchOptions.map((o) => o.id), ["municipal", "coop", "private", "swap"]);
  const hosts = ["www.inberlinwohnen.de", "willkommenszentrum.berlin.de", "www.datenschutz-berlin.de", "www.berlin.de", "service.berlin.de", "liste-antraege.bda.service.berlin.de"];
  searchOptions.forEach((o) => o.links.forEach((l) => assert.ok(hosts.includes(new URL(l.href).host), l.href)));
  assert.match(searchOptions[0].summary, /WBM/);
  assert.doesNotMatch(JSON.stringify(searchOptions), /immobilienscout|wg-gesucht|kleinanzeigen/i);
});
