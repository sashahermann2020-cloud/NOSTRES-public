import assert from "node:assert/strict";
import test from "node:test";
import { channelFor, makePlan } from "../app/berlin/start/plan.ts";

const base = {
  location: "already", housing: "moved", registered: "no", family: "none", children: "none", dog: "none", car: "none", taxId: "no", insurance: "yes",
  permit: "no", work: "other", doctor: false, business: false, access: "online", eid: "no", visit: "no",
};

test("a recent arrival gets Anmeldung before tax ID and no unearned online promise", () => {
  const tasks = makePlan(base);
  assert.deepEqual(tasks.map((task) => task.id), ["anmeldung", "tax-id"]);
  assert.equal(tasks[0].sequence, "now");
  assert.equal(tasks[1].sequence, "after");
  assert.match(tasks[0].channel, /личный приём/);
  assert.match(tasks[0].note, /представителя/);
  assert.match(tasks[1].channel, /по почте/);
  assert.match(channelFor(tasks[0], base), /Пока этого нет/);
  assert.match(channelFor(tasks[1], base), /автоматически/);
});

test("looking for housing does not tell someone to register a place before moving in", () => {
  const tasks = makePlan({ ...base, location: "moving", housing: "search" });
  assert.deepEqual(tasks.slice(0, 2).map((task) => task.id), ["housing", "anmeldung"]);
  assert.equal(tasks[1].sequence, "after");
  assert.match(tasks[1].after, /После въезда/);
});

test("insurance and a document deadline are parallel priorities; doctor has a condition", () => {
  const tasks = makePlan({ ...base, registered: "berlin", housing: "settled", permit: "renew", insurance: "no", taxId: "yes", doctor: true });
  assert.deepEqual(tasks.map((task) => task.id), ["lea", "health", "doctor"]);
  assert.equal(tasks[0].sequence, "now");
  assert.equal(tasks[1].sequence, "now");
  assert.equal(tasks[2].sequence, "check");
  assert.match(tasks[0].channel, /возможное приглашение лично/);
  assert.match(channelFor(tasks[0], { ...base, access: "office" }), /нельзя выбрать/);
});

test("uncertain answers request a check; settled answers do not fabricate tasks", () => {
  const uncertain = makePlan({ ...base, registered: "unsure", housing: "settled", permit: "unsure" });
  assert.deepEqual(uncertain.map((task) => task.id), ["permit-check", "address-check", "tax-id"]);
  assert.deepEqual(makePlan({ ...base, registered: "berlin", housing: "settled", taxId: "yes" }), []);
});

test("a person outside Berlin sees future address work after a move", () => {
  const tasks = makePlan({ ...base, location: "elsewhere", housing: "settled", registered: "elsewhere", insurance: "no" });
  assert.equal(tasks.find((task) => task.id === "address-check").sequence, "after");
  assert.equal(tasks.find((task) => task.id === "health").sequence, "check");
});

test("a family gets only relevant child and household coverage checks", () => {
  const tasks = makePlan({ ...base, registered: "berlin", housing: "settled", taxId: "yes", family: "together", children: "both", kita: "need", school: "arranged", familyInsurance: "unsure" });
  assert.deepEqual(tasks.map((task) => task.id), ["kita", "health"]);
  assert.match(tasks.find((task) => task.id === "health").note, /каждого взрослого и ребёнка/);
});

test("a settled registered dog does not create a false address task, but missing mandatory coverage does", () => {
  const tasks = makePlan({ ...base, registered: "berlin", housing: "settled", taxId: "yes", dog: "registered", dogInsurance: "no" });
  assert.deepEqual(tasks.map((task) => task.id), ["dog-insurance"]);
  assert.match(tasks[0].note, /Listenhunde/);
  assert.doesNotMatch(tasks[0].note, /Берлин требует покрытие/);
});

test("a new dog, car, and profession receive distinct conditional checks", () => {
  const tasks = makePlan({ ...base, registered: "berlin", housing: "settled", taxId: "yes", dog: "moving", dogInsurance: "unsure", car: "need", business: true });
  assert.deepEqual(tasks.map((task) => task.id), ["dog-insurance", "dog", "car-insurance", "business", "professional-insurance", "pension-self"]);
  assert.match(tasks.find((task) => task.id === "car-insurance").note, /eVB/);
  assert.match(tasks.find((task) => task.id === "professional-insurance").note, /Не все/);
});

test("employee contributions are checked through employer while confirmed coverage adds no task", () => {
  const person = { ...base, registered: "berlin", housing: "settled", taxId: "yes", work: "employee" };
  assert.deepEqual(makePlan({ ...person, employeeCoverage: "unsure" }).map((task) => task.id), ["employee-social"]);
  assert.deepEqual(makePlan({ ...person, employeeCoverage: "yes" }), []);
});

test("already self-employed people still see profession-specific mandatory checks", () => {
  const tasks = makePlan({ ...base, registered: "berlin", housing: "settled", taxId: "yes", work: "self" });
  assert.deepEqual(tasks.map((task) => task.id), ["professional-insurance", "pension-self"]);
});

test("written-only preference prioritizes verified dog and postal daycare channels", () => {
  const written = { ...base, noPhone: true };
  const dog = makePlan({ ...written, dog: "unregistered", dogInsurance: "yes" }).find((item) => item.id === "dog");
  const kita = makePlan({ ...written, children: "under6", kita: "need" }).find((item) => item.id === "kita");
  assert.match(channelFor(dog, written), /электронной почте или почтой/);
  assert.match(channelFor(kita, written), /отправить его почтой/);
  assert.doesNotMatch(channelFor(dog, written), /телефон.*основн/);
});

test("without eID and without an office visit, Anmeldung shows its verified representative path and states the limit", () => {
  const inaccessible = { ...base, noPhone: true, eid: "no", visit: "no" };
  const anmeldung = makePlan(inaccessible).find((item) => item.id === "anmeldung");
  assert.match(channelFor(anmeldung, inaccessible), /представитель.*письменной доверенностью/);
  assert.match(channelFor(anmeldung, inaccessible), /подтверждённой письменной альтернативы нет/);
  assert.doesNotMatch(channelFor(anmeldung, inaccessible), /можно подать по почте/);
});

test("bank and telecom are added only when chosen as extra goals", () => {
  assert.ok(!makePlan(base).some((task) => task.id === "bank" || task.id === "telecom"));
  const tasks = makePlan({ ...base, bank: true, telecom: true });
  assert.deepEqual(tasks.filter((task) => ["bank", "telecom"].includes(task.id)).map((task) => task.href), ["/berlin/bank", "/berlin/svyaz"]);
});
