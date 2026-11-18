import assert from "node:assert/strict";
import test from "node:test";

test("redirects the canonical host to HTTPS and removes www", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("redirect-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://www.nostres.world/berlin/start?from=share"),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://nostres.world/berlin/start?from=share");
});

test("redirects plain HTTP on the canonical host to HTTPS", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("redirect-http-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://nostres.world/privacy?from=share"),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://nostres.world/privacy?from=share");
});
