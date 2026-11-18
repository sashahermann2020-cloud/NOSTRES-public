import assert from "node:assert/strict";
import test from "node:test";
import { hasMonitorAccess, safeEqual, sha256Hex } from "../worker/monitor-access.ts";

function fakeDb(hash) {
  return { prepare: () => ({ run: async () => ({}), bind: () => ({ first: async () => (hash ? { hash } : null) }) }) };
}

test("sha256Hex and safeEqual behave as expected", async () => {
  assert.equal(await sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.equal(safeEqual("a", "a"), true);
  assert.equal(safeEqual("a", "b"), false);
  assert.equal(safeEqual("ab", "a"), false);
});

test("monitor pages need the exact key", async () => {
  const key = "k".repeat(32);
  const db = fakeDb(await sha256Hex(key));
  assert.equal(await hasMonitorAccess(db, new Request(`https://x.test/_monitor/test?key=${key}`)), true);
  assert.equal(await hasMonitorAccess(db, new Request("https://x.test/_monitor/test", { headers: { "x-monitor-key": key } })), true);
  assert.equal(await hasMonitorAccess(db, new Request("https://x.test/_monitor/test?key=wrong")), false);
  assert.equal(await hasMonitorAccess(db, new Request(`https://x.test/_monitor/test?key=${"z".repeat(32)}`)), false);
  assert.equal(await hasMonitorAccess(db, new Request("https://x.test/_monitor/test")), false);
  assert.equal(await hasMonitorAccess(fakeDb(null), new Request(`https://x.test/_monitor/test?key=${key}`)), false);
});

test("на обычном пути запрос к базе не создаёт таблицу", async () => {
  const key = "m".repeat(32);
  const statements = [];
  const db = { prepare: (sql) => { statements.push(sql); return { run: async () => ({}), bind: () => ({ first: async () => ({ hash: await sha256Hex(key) }) }) }; } };
  assert.equal(await hasMonitorAccess(db, new Request(`https://x.test/_monitor/test?key=${key}`)), true);
  assert.equal(await hasMonitorAccess(db, new Request("https://x.test/_monitor/test?key=" + "n".repeat(32))), false);
  assert.ok(statements.every((sql) => !/CREATE TABLE/i.test(sql)), statements.join(" | "));
});

test("после серии неверных ключей база с этого адреса больше не опрашивается", async () => {
  let reads = 0;
  const key = "p".repeat(32);
  const db = { prepare: () => ({ run: async () => ({}), bind: () => ({ first: async () => { reads += 1; return { hash: await sha256Hex(key) }; } }) }) };
  const request = (value) => new Request(`https://x.test/_monitor/test?key=${value}`, { headers: { "cf-connecting-ip": "203.0.113.7" } });
  for (let i = 0; i < 10; i += 1) assert.equal(await hasMonitorAccess(db, request("q".repeat(30 + i))), false);
  assert.equal(reads, 10);
  assert.equal(await hasMonitorAccess(db, request("r".repeat(32))), false);
  assert.equal(await hasMonitorAccess(db, request(key)), false, "адрес заблокирован на окно, даже с верным ключом");
  assert.equal(reads, 10, "заблокированный адрес не обращается к базе");
  // другой адрес не затронут
  assert.equal(await hasMonitorAccess(db, new Request(`https://x.test/_monitor/test?key=${key}`, { headers: { "cf-connecting-ip": "203.0.113.8" } })), true);
});

test("если таблицы нет, она создаётся один раз и доступа нет", async () => {
  const statements = [];
  const db = { prepare: (sql) => { statements.push(sql); return { run: async () => ({}), bind: () => ({ first: async () => { throw new Error("no such table: access_tokens"); } }) }; } };
  const url = "https://x.test/_monitor/test?key=" + "t".repeat(32);
  assert.equal(await hasMonitorAccess(db, new Request(url, { headers: { "cf-connecting-ip": "198.51.100.1" } })), false);
  assert.equal(await hasMonitorAccess(db, new Request(url, { headers: { "cf-connecting-ip": "198.51.100.2" } })), false);
  assert.equal(statements.filter((sql) => /CREATE TABLE/i.test(sql)).length, 1);
});
