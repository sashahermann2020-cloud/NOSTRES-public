import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";
import { chancePoints, chanceQuestions, chanceVisible, relocationQuestions, studyVisaQuestions, volunteerQuestions, workVisaQuestions } from "../app/berlin/new-routes/relocation-plans.ts";

// Маршруты переезда из страны исхода (31.10.2026): только официальные источники и страницы самих провайдеров Sperrkonto.
const officialHosts = new Set([
  "www.auswaertiges-amt.de", "digital.diplo.de", "www.make-it-in-germany.com", "www.arbeitsagentur.de",
  "www.gesetze-im-internet.de", "service.berlin.de", "www.bundesfreiwilligendienst.de", "www.jugendfreiwilligendienste.de", "youth.europa.eu",
  "www.study-in-germany.com", "australien.diplo.de", "canada.diplo.de",
]);
const providerHosts = new Set(["www.expatrio.com", "www.fintiba.com"]);
const vague = /(уточните|сверьте|спросите|узнайте у|недостаточно данных|пока не подтвержд)/i;
const ids = ["relocation", "chancenkarte", "workvisa", "volunteer", "studyvisa"];
// Внутренняя спецификация маршрутов не входит в публичное зеркало кода (scripts/public-mirror.json): там эти проверки пропускаются.
const noInternalSpec = !existsSync(new URL("../docs/ROUTES_SPEC.md", import.meta.url)) && "docs/ROUTES_SPEC.md нет в публичном зеркале";

function allPlans(id) {
  const out = [];
  (function walk(answers) {
    const next = questionsFor(id, answers).find((question) => !answers[question.id]);
    if (!next) { out.push([answers, planFor(id, answers)]); return; }
    for (const [value] of next.options) walk({ ...answers, [next.id]: value });
  })({});
  return out;
}
function links(plan) {
  const all = [];
  const add = (action) => action?.href && all.push(action.href);
  for (const s of plan.steps ?? []) { add(s.action); add(s.source); add(s.alternative); }
  for (const m of plan.methods ?? []) for (const s of m.steps) { add(s.action); add(s.source); add(s.alternative); }
  add(plan.next);
  return all;
}

for (const id of ids) {
  test(`${id}: every answer path is concrete and links only to official pages`, () => {
    const results = allPlans(id);
    assert.ok(results.length >= 20, `${id}: ${results.length}`);
    for (const [answers, plan] of results) {
      const where = `${id} ${JSON.stringify(answers)}`;
      assert.ok(plan.fit && plan.title && plan.summary, where);
      assert.ok(plan.steps.length >= 1, where);
      assert.doesNotMatch(JSON.stringify(plan), vague, where);
      for (const href of links(plan)) {
        if (href.startsWith("/")) continue;
        assert.ok(officialHosts.has(new URL(href).host), `${where}: ${href}`);
      }
      for (const method of plan.methods ?? []) {
        assert.ok(method.steps.length >= 2 && method.documents.length >= 1, `${where} ${method.id}`);
        for (const provider of method.providers ?? []) for (const link of provider.links) assert.ok(providerHosts.has(new URL(link.href).host), link.href);
      }
      if (plan.fit === "redirect" || plan.fit === "insufficient") assert.ok(plan.next, `${where}: no next route`);
    }
  });
}

test("relocation: citizenship and goal choose the path", () => {
  assert.equal(planFor("relocation", { citizen: "eu" }).fit, "fits");
  assert.equal(planFor("relocation", { citizen: "other", goal: "search", qual: "degree" }).next.href, "/berlin/chancenkarte");
  assert.equal(planFor("relocation", { citizen: "other", goal: "job", qual: "degree" }).next.href, "/berlin/viza-rabota");
  assert.equal(planFor("relocation", { citizen: "balkan", goal: "job", qual: "none" }).next.href, "/berlin/viza-rabota");
  assert.equal(planFor("relocation", { citizen: "other", goal: "job", qual: "none" }).next.href, "/berlin/viza-uchyoba");
  assert.match(JSON.stringify(planFor("relocation", { citizen: "visafree", goal: "study" })), /90 дней/);
  assert.equal(planFor("relocation", { citizen: "other", goal: "year" }).fit, "redirect");
  assert.equal(planFor("relocation", { citizen: "holiday", goal: "year", holidayCountry: "argentina", age: "to34" }).fit, "redirect");
  assert.equal(planFor("relocation", { citizen: "holiday", goal: "year", holidayCountry: "argentina", age: "to30" }).fit, "fits");
  assert.equal(planFor("relocation", { citizen: "visafree", goal: "year", holidayCountry: "australia", age: "to30" }).methods[0].id, "berlin");
});



test("Working Holiday: every question label and result text is translated in all eight public dictionaries", async () => {
  // Строки собираются из всех достижимых в анкете ответов, поэтому новый текст без перевода сразу ломает тест.
  const texts = new Set();
  const collect = (value) => {
    if (typeof value === "string") { if (/[А-Яа-яЁё]/.test(value)) texts.add(value); return; }
    if (Array.isArray(value)) { value.forEach(collect); return; }
    if (value && typeof value === "object") Object.values(value).forEach(collect);
  };
  (function walk(answers) {
    const questions = questionsFor("relocation", answers);
    collect(questions);
    const next = questions.find((question) => !answers[question.id]);
    if (!next) { if (answers.goal === "year") collect(planFor("relocation", answers)); return; }
    next.options.forEach(([value]) => walk({ ...answers, [next.id]: value }));
  })({});
  const required = [...texts];
  for (const locale of ["en", "de", "es", "it", "tr", "ar", "pt", "fr"]) {
    const dictionary = JSON.parse(await readFile(new URL(`../public/i18n/${locale}.json`, import.meta.url), "utf8"));
    const missing = required.filter((text) => !dictionary[text] || /[А-Яа-яЁё]/.test(dictionary[text]));
    assert.deepEqual(missing, [], `${locale}: untranslated Working Holiday texts`);
  }
});

test("Working Holiday: citizenship, age boundaries and application method", () => {
  const plan = (citizen, holidayCountry, age) => planFor("relocation", { citizen, goal: "year", holidayCountry, age });
  for (const country of ["us", "uk"]) {
    assert.equal(plan("visafree", country, "to30").fit, "redirect");
    assert.equal(plan("visafree", country, "to30").methods, undefined);
  }
  const australia30 = plan("visafree", "australia", "to30");
  assert.equal(australia30.methods[0].id, "berlin");
  assert.ok(australia30.methods.some((method) => method.id === "mission"));
  const australia34 = plan("visafree", "australia", "to34");
  assert.equal(australia34.fit, "conditional");
  assert.deepEqual(australia34.methods.map((method) => method.id), ["mission"]);
  assert.match(australia34.summary, /31–35.*LEA Берлина.*30 лет/);
  assert.ok(JSON.stringify(australia34).includes("australien.diplo.de"));
  assert.equal(plan("visafree", "australia", "age35").fit, "conditional");
  assert.deepEqual(plan("visafree", "australia", "age35").methods.map((method) => method.id), ["mission"]);
  const korea34 = plan("visafree", "korea", "to34");
  assert.notEqual(korea34.fit, "redirect");
  assert.deepEqual(korea34.methods.map((method) => method.id), ["mission"]);
  assert.equal(plan("visafree", "korea", "age35").fit, "redirect");
  const canada35 = plan("visafree", "canada", "age35");
  assert.notEqual(canada35.fit, "redirect");
  assert.equal(canada35.methods[0].id, "berlin");
  assert.ok(JSON.stringify(canada35).includes("canada.diplo.de"));
  assert.equal(plan("visafree", "canada", "over").fit, "redirect");
  assert.equal(plan("holiday", "argentina", "to30").methods[0].id, "mission");
  assert.equal(plan("holiday", "argentina", "to34").fit, "redirect");
  assert.equal(plan("holiday", "argentina", "minor").fit, "redirect");
  assert.equal(plan("visafree", "australia", "minor").fit, "redirect");
  assert.equal(plan("visafree", "", "to30").fit, "clarify");
  assert.equal(plan("holiday", "argentina", "").fit, "clarify");
  assert.equal(plan("holiday", "canada", "to30").fit, "clarify");
  assert.equal(plan("visafree", "argentina", "to30").fit, "clarify");
  assert.equal(plan("holiday", "australia", "to30").fit, "clarify");
  assert.equal(plan("", "australia", "to30").fit, "clarify");
  assert.equal(plan("visafree", "australia", "unknown").fit, "clarify");
  const visible = (citizen, holidayCountry) => questionsFor("relocation", { citizen, goal: "year", holidayCountry });
  const optionIds = (citizen) => visible(citizen).find((q) => q.id === "holidayCountry").options.map(([id]) => id);
  assert.ok(optionIds("visafree").includes("uk"));
  assert.ok(!optionIds("holiday").includes("uk"));
  assert.ok(!optionIds("visafree").includes("argentina"));
  assert.ok(optionIds("holiday").includes("argentina"));
  assert.ok(!visible("visafree", "uk").some((q) => q.id === "age"));
  assert.ok(visible("visafree", "canada").some((q) => q.id === "age"));
  assert.equal(plan("visafree", "uk", "").fit, "redirect");
});

test("chancenkarte: points follow the official table and 6 is the minimum", () => {
  assert.equal(chancePoints({ qual: "partial", lang: "b2", english: "yes", exp: "five", age: "to34", shortage: "yes", stay: "yes", spouse: "yes" }), 16);
  assert.equal(chancePoints({ qual: "state", lang: "a1", english: "no", exp: "none", age: "over", shortage: "no", stay: "no", spouse: "no" }), 0);
  const base = { qual: "state", english: "no", age: "to34", shortage: "no", stay: "no", spouse: "no", funds: "blocked" };
  assert.equal(planFor("chancenkarte", { ...base, lang: "b1", exp: "two" }).fit, "fits");
  assert.equal(planFor("chancenkarte", { ...base, lang: "a2", exp: "two" }).fit, "insufficient");
  assert.equal(planFor("chancenkarte", { qual: "full", funds: "commitment" }).fit, "fits");
  assert.equal(planFor("chancenkarte", { qual: "state", lang: "none" }).fit, "insufficient");
  const blocked = planFor("chancenkarte", { qual: "full", funds: "blocked" });
  assert.ok(blocked.methods[0].providers.length >= 2);
  assert.match(JSON.stringify(blocked), /1\s091\s€/);
  assert.equal(planFor("chancenkarte", { qual: "full", funds: "commitment" }).methods[0].providers, undefined);
});

test("chancenkarte: the nine-question points path is a documented exception", { skip: noInternalSpec }, async () => {
  assert.equal(chanceQuestions.length, 9);
  assert.equal(chanceVisible({ qual: "partial", lang: "b1" }).length, 9);
  assert.equal(chanceVisible({ qual: "full" }).length, 2);
  const spec = await readFile(new URL("../docs/ROUTES_SPEC.md", import.meta.url), "utf8");
  assert.match(spec, /Chancenkarte[\s\S]{0,260}(?:9|девять) вопросов/);
});

test("workvisa: education and salary choose the visa, approval only where required", () => {
  const base = { offer: "yes", qual: "degree", regulated: "no", visafree: "no" };
  const high = planFor("workvisa", { ...base, salary: "high" });
  assert.match(high.title, /Blue Card/);
  assert.doesNotMatch(JSON.stringify(high.methods[0].steps), /Vorabzustimmung/);
  assert.match(JSON.stringify(planFor("workvisa", { ...base, salary: "mid" }).methods[0].steps), /Vorabzustimmung/);
  assert.match(planFor("workvisa", { ...base, salary: "other" }).title, /специалиста с высшим/);
  assert.match(planFor("workvisa", { offer: "yes", qual: "open", german: "a2", visafree: "no" }).title, /Anerkennungspartnerschaft/);
  assert.equal(planFor("workvisa", { offer: "yes", qual: "open", german: "below" }).fit, "insufficient");
  const partnership = { offer: "yes", qual: "open", german: "a2", regulated: "yes", license: "no", visafree: "no" };
  assert.equal(planFor("workvisa", partnership).fit, "fits");
  assert.ok(!planFor("workvisa", partnership).methods[0].documents.includes("Профессиональное разрешение для работы по регулируемой профессии"));
  assert.ok(!questionsFor("workvisa", { offer: "yes", qual: "open", german: "a2" }).some((q) => q.id === "license"));
  assert.equal(planFor("workvisa", { offer: "yes", qual: "none", balkan: "yes" }).fit, "conditional");
  assert.equal(planFor("workvisa", { offer: "no" }).next.href, "/berlin/chancenkarte");
  assert.equal(planFor("workvisa", { ...base, salary: "high", visafree: "yes" }).methods[0].id, "berlin");
});

test("workvisa: regulated professions require their professional licence first", () => {
  const base = { offer: "yes", qual: "voc", regulated: "yes", visafree: "no" };
  const waiting = planFor("workvisa", { ...base, license: "no" });
  assert.equal(waiting.fit, "conditional");
  assert.equal(waiting.next.href, "/berlin/anerkennung");
  assert.match(JSON.stringify(waiting.steps), /регулируемой профессии/);
  assert.match(JSON.stringify(waiting.steps), /make-it-in-germany\.com/);

  const unknown = planFor("workvisa", { ...base, license: "unknown" });
  assert.equal(unknown.fit, "clarify");

  const ready = planFor("workvisa", { ...base, license: "yes" });
  assert.equal(ready.fit, "fits");
  assert.ok(ready.methods[0].documents.includes("Профессиональное разрешение для работы по регулируемой профессии"));

  assert.equal(questionsFor("workvisa", { offer: "yes", qual: "voc", regulated: "yes" }).some((q) => q.id === "license"), true);

  // § 18 Abs. 2 Nr. 3 AufenthG: достаточно выданного или обещанного (zugesagt) разрешения.
  const promised = planFor("workvisa", { ...base, license: "promised" });
  assert.equal(promised.fit, "fits");
  assert.ok(promised.methods[0].documents.includes("Письменное обещание ведомства выдать профессиональное разрешение (Zusage)"));
  assert.match(JSON.stringify(waiting.steps), /aufenthg_2004\/__18\.html/);

  // Гражданство спрашивается только там, где маршрут доходит до подачи.
  for (const license of ["no", "unknown"]) assert.ok(!questionsFor("workvisa", { offer: "yes", qual: "voc", regulated: "yes", license }).some((q) => q.id === "visafree"));
  for (const license of ["yes", "promised"]) assert.ok(questionsFor("workvisa", { offer: "yes", qual: "voc", regulated: "yes", license }).some((q) => q.id === "visafree"));
});

test("volunteer: age limits and own money change the result", () => {
  assert.equal(planFor("volunteer", { program: "esc", age: "over" }).fit, "redirect");
  const bfd = planFor("volunteer", { program: "bfd", age: "to26", lodging: "part", visafree: "no" });
  assert.ok(bfd.methods[0].providers.length >= 2);
  assert.match(JSON.stringify(bfd), /676\s€/);
  assert.equal(planFor("volunteer", { program: "bfd", age: "to26", lodging: "yes", visafree: "no" }).methods[0].providers, undefined);
  const olderBfd = planFor("volunteer", { program: "bfd", age: "over", lodging: "yes", visafree: "no" });
  assert.equal(olderBfd.fit, "fits");
  assert.equal(olderBfd.title, "Виза для Bundesfreiwilligendienst (BFD)");
  assert.equal(planFor("volunteer", { program: "esc", age: "to30", lodging: "yes", visafree: "yes" }).methods[0].id, "berlin");
});

test("volunteer: ESC in Germany ends at 30; humanitarian volunteering up to 35 is outside the EU", () => {
  assert.deepEqual(questionsFor("volunteer", { program: "esc", age: "to35" }).map((q) => q.id), ["program", "age"]);
  for (const age of ["to35", "over"]) {
    const plan = planFor("volunteer", { program: "esc", age });
    assert.equal(plan.fit, "redirect");
    assert.equal(plan.methods, undefined);
    assert.match(plan.summary, /вне ЕС/);
    assert.match(JSON.stringify(plan.steps), /volunteering-humanitarian-aid_en/);
  }
  assert.equal(planFor("volunteer", { program: "esc", age: "to30", lodging: "yes", visafree: "no" }).fit, "fits");
  assert.doesNotMatch(JSON.stringify(planFor("volunteer", { program: "none", age: "to35" })), /гуманитарн/);
});

test("volunteer: FSJ/FÖJ age and school conditions are linked to the official FAQ", () => {
  const young = planFor("volunteer", { program: "fsj", age: "to26" });
  const over = planFor("volunteer", { program: "fsj", age: "to30" });
  assert.equal(young.fit, "conditional");
  assert.equal(over.fit, "redirect");
  assert.match(JSON.stringify(young.steps), /jugendfreiwilligendienste\.de/);
  assert.match(JSON.stringify(young.steps), /до 27-летия/);
  assert.match(JSON.stringify(planFor("volunteer", { program: "none", age: "to26" }).steps), /завершить обязательное очное школьное обучение/);
});

test("studyvisa: goal sets the 2026 amount", () => {
  assert.match(JSON.stringify(planFor("studyvisa", { goal: "study", admission: "full", funds: "blocked" })), /11\s904\s€/);
  assert.match(JSON.stringify(planFor("studyvisa", { goal: "apply", funds: "blocked" })), /1\s091\s€/);
  assert.match(JSON.stringify(planFor("studyvisa", { goal: "ausbildung", german: "b1", type: "school", funds: "blocked" })), /959\s€/);
  assert.equal(planFor("studyvisa", { goal: "search", age: "over" }).fit, "redirect");
  assert.equal(planFor("studyvisa", { goal: "ausbildung", german: "below" }).fit, "insufficient");
  assert.equal(planFor("studyvisa", { goal: "ausbildung", german: "b1", type: "company", pay: "enough" }).methods[0].providers, undefined);
});

test("studyvisa: below B1 can use an evidenced training-language exception", () => {
  const company = { goal: "ausbildung", german: "below", type: "company", pay: "enough", languageEvidence: "tested" };
  assert.deepEqual(questionsFor("studyvisa", { goal: "ausbildung", german: "below", type: "company", pay: "enough" }).map((q) => q.id), ["goal", "german", "type", "pay", "languageEvidence"]);
  const verified = planFor("studyvisa", company);
  assert.equal(verified.fit, "fits");
  assert.ok(verified.methods[0].documents.includes("Место обучения проверило язык и письменно подтвердило, что его достаточно"));
  assert.ok(!verified.methods[0].documents.includes("Сертификат немецкого B1"));

  // § 16a Abs. 3 AufenthG: язык можно получить на будущем подготовительном курсе («erworben werden sollen»).
  const course = planFor("studyvisa", { goal: "ausbildung", german: "below", type: "school", languageEvidence: "course", funds: "blocked" });
  assert.equal(course.fit, "fits");
  assert.ok(course.methods[0].documents.includes("Есть подтверждение записи на подготовительный курс немецкого"));
  assert.doesNotMatch(JSON.stringify(studyVisaQuestions), /курс немецкого пройден/);
  assert.ok(!course.methods[0].documents.includes("Сертификат немецкого B1"));

  assert.equal(planFor("studyvisa", { goal: "ausbildung", german: "below", type: "school", languageEvidence: "none" }).fit, "insufficient");
  assert.equal(planFor("studyvisa", { goal: "search", age: "to34", german: "below" }).fit, "insufficient");
});

test("visa portal availability is conditional in every visa route", () => {
  for (const id of ids) {
    for (const [, plan] of allPlans(id)) {
      const portal = plan.methods?.find((method) => method.id === "portal");
      if (!portal) continue;
      assert.equal(portal.availability, "conditional", `${id}: ${JSON.stringify(plan.why)}`);
      assert.match(portal.availabilityLabel, /зависит от цели поездки и представительства/i);
      assert.doesNotMatch(portal.availabilityLabel, /доступно во всех/i);
    }
  }
});

test("relocation routes are registered everywhere a route must be", { skip: noInternalSpec }, async () => {
  const read = (p) => readFile(new URL(`../${p}`, import.meta.url), "utf8");
  const [api, extract, registry, spec, checks] = await Promise.all([Promise.all([read("app/api/mvp-events/route.ts"), read("app/api/mvp-events/rules.ts")]).then((parts) => parts.join("\n")), read("scripts/i18n-extract.mjs"), read("docs/ROUTE_REGISTRY.json"), read("docs/ROUTES_SPEC.md"), read("app/route-checks.ts")]);
  for (const id of ids) {
    assert.match(api, new RegExp(`"${id}"`));
    assert.match(extract, new RegExp(`"${id}"`));
    assert.match(checks, new RegExp(`${id}: "`));
  }
  for (const path of ["/berlin/pereezd-v-germaniyu", "/berlin/chancenkarte", "/berlin/viza-rabota", "/berlin/viza-volontyor", "/berlin/viza-uchyoba"]) {
    assert.ok(registry.includes(`"${path}"`), path);
    assert.ok(spec.includes(`\`${path}\``), path);
  }
});

// GuidedRoute стирает ответы на вопросы, стоящие в массиве после изменённого: порядок показа должен совпадать с порядком массива.
test("visible questions follow the order of the question array", () => {
  const arrays = { relocation: relocationQuestions, chancenkarte: chanceQuestions, workvisa: workVisaQuestions, volunteer: volunteerQuestions, studyvisa: studyVisaQuestions };
  for (const [id, array] of Object.entries(arrays)) {
    const order = array.map((q) => q.id);
    (function walk(a) {
      const visible = questionsFor(id, a).map((q) => q.id);
      const positions = visible.map((q) => order.indexOf(q));
      assert.deepEqual(positions, [...positions].sort((x, y) => x - y), `${id}: ${visible.join(",")}`);
      const next = questionsFor(id, a).find((q) => !a[q.id]);
      if (next) next.options.forEach(([v]) => walk({ ...a, [next.id]: v }));
    })({});
  }
});

test("volunteer: programs stay distinct", () => {
  const fsj = planFor("volunteer", { program: "fsj", age: "to26" });
  assert.equal(fsj.fit, "conditional");
  assert.equal(fsj.methods, undefined);
  assert.equal(planFor("volunteer", { program: "fsj", age: "to30" }).fit, "redirect");
  assert.equal(planFor("volunteer", { program: "bfd", age: "under18" }).fit, "conditional");
  assert.equal(planFor("volunteer", { program: "esc", age: "under18" }).fit, "conditional");
});
