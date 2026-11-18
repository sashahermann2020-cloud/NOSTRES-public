import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const ignored = new Set([".git", "node_modules", "dist", ".next", ".wrangler"]);
const retiredNames = [
  [0x6d, 0x69, 0x72, 0x6d, 0x69],
  [0x43c, 0x438, 0x440, 0x43c, 0x438],
  [0x43c, 0x438, 0x440, 0x20, 0x43c, 0x438, 0x433, 0x440, 0x430, 0x43d, 0x442, 0x43e, 0x432],
].map((points) => String.fromCharCode(...points));
const forbidden = new RegExp(retiredNames.join("|"), "i");

test("project files and assets consistently use the current name", async () => {
  async function scan(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const filename = path.join(folder, entry.name);
      const relative = path.relative(root, filename);
      assert.doesNotMatch(relative, forbidden, `Retired name in path: ${relative}`);
      if (entry.isDirectory()) await scan(filename);
      else if (entry.isFile() && !/\.(woff2?|png|jpe?g|webp|gif|ico|pdf|zip|tar|gz)$/.test(filename)) {
        assert.doesNotMatch(await readFile(filename, "utf8"), forbidden, `Retired name in ${relative}`);
      }
    }
  }
  await scan(root);
  for (const filename of ["app/globals.css", "app/layout.tsx"]) {
    const content = await readFile(path.join(root, filename), "utf8");
    for (const [, asset] of content.matchAll(/(?:url\(|href=)["'](\/fonts\/[^"']+)["']/g)) {
      await readFile(path.join(root, "public", asset));
    }
  }
});
