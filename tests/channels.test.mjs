import assert from "node:assert/strict";
import test from "node:test";
import { channelKindLabels, channelMatrices, channelStatusLabels } from "../app/channels.ts";

const officialHosts = ["service.berlin.de", "www.berlin.de", "www.bzst.de", "verwaltung.bund.de", "www.aok.de", "www.tk.de", "gesund.bund.de", "www.bafin.de", "www.verbraucherzentrale.de"];

test("every matrix is sourced from an official host, dated, and covers distinct known channels", () => {
  assert.deepEqual(Object.keys(channelMatrices).sort(), ["anmeldung", "bank", "business", "dog", "dog-listed", "health", "housing-wbs", "lea", "tax-id"]);
  for (const [id, matrix] of Object.entries(channelMatrices)) {
    assert.ok(officialHosts.includes(new URL(matrix.sourceUrl).host), `${id}: official host`);
    assert.match(matrix.checkedAt, /^\d{1,2} \S+ 20\d\d$/);
    (matrix.moreSources ?? []).forEach((source) => assert.ok(officialHosts.includes(new URL(source.url).host), `${id}: more sources`));
    const kinds = matrix.channels.map((channel) => channel.kind);
    assert.equal(new Set(kinds).size, kinds.length, `${id}: no duplicate channels`);
    assert.ok(["online", "phone", "representative"].every((kind) => kinds.includes(kind)), `${id}: covers remote channels`);
    for (const channel of matrix.channels) {
      assert.ok(channel.kind in channelKindLabels && channel.status in channelStatusLabels);
      assert.ok(channel.note.length > 20, `${id}/${channel.kind}: explains conditions`);
    }
  }
});

test("Anmeldung online is conditional on eID and excludes eAT; phone is never an available channel for Anmeldung or Steuer-ID", () => {
  const anmeldung = Object.fromEntries(channelMatrices.anmeldung.channels.map((c) => [c.kind, c]));
  assert.equal(anmeldung.online.status, "conditional");
  assert.match(anmeldung.online.note, /eAT/);
  assert.notEqual(anmeldung.phone.status, "available");
  const taxId = Object.fromEntries(channelMatrices["tax-id"].channels.map((c) => [c.kind, c]));
  assert.equal(taxId.phone.status, "not-possible");
  assert.equal(taxId.email.status, "not-possible");
});
