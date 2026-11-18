import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { hearingItems, hearingForRoute, hearingBlockFor } from "../app/hearing-access.ts";
import { ROUTE_IDS } from "../app/api/mvp-events/rules.ts";

const hosts = new Set(["sozialrecht.berlin.de", "www.berlin.de", "www.gesetze-im-internet.de", "www.bundesnetzagentur.de", "www.116117.de", "www.berliner-feuerwehr.de", "www.nora-notruf.de", "www.bundesgesundheitsministerium.de"]);
const vague = /(уточните|сверьте|спросите|узнайте у|недостаточно данных)/i;

test("hearing block: every route part exists, links are official, texts are concrete", () => {
  for (const [route, keys] of Object.entries(hearingForRoute)) {
    assert.ok(ROUTE_IDS.has(route), route);
    for (const key of keys) assert.ok(hearingItems[key], `${route}: ${key}`);
  }
  for (const item of Object.values(hearingItems)) {
    assert.doesNotMatch(item.title + item.text, vague, item.id);
    assert.ok(item.links.length > 0, item.id);
    for (const link of item.links) assert.ok(hosts.has(new URL(link.href).host), link.href);
  }
});

test("hearing block: visits get the interpreter right, emergencies get calls without voice", () => {
  for (const route of ["anmeldung", "lea"]) assert.ok(hearingBlockFor(route).some((i) => i.id === "interpreterBerlin"), route);
  for (const route of ["jobcenter", "grundsicherungsgeld", "arbeitslosengeld", "doctor", "health"]) assert.ok(hearingBlockFor(route).some((i) => i.id === "interpreterSocial"), route);
  for (const route of ["urgent", "mental"]) assert.equal(hearingBlockFor(route)[0].id, "emergency", route);
  assert.deepEqual(hearingBlockFor("notary"), []);
});

test("hearing block is rendered by both route engines", () => {
  assert.match(readFileSync(new URL("../app/berlin/new-routes/GuidedRoute.tsx", import.meta.url), "utf8"), /<HearingAccess routeId=\{id\} \/>/);
  assert.match(readFileSync(new URL("../app/berlin/anmeldung/AnmeldungJourney.tsx", import.meta.url), "utf8"), /<HearingAccess routeId=\{journey\.id\} \/>/);
});
