import test from "node:test";
import { execFileSync } from "node:child_process";

test("visual reference matches app/globals.css", () => {
  execFileSync("node", ["scripts/visual-reference-build.mjs", "--check"], { cwd: new URL("../", import.meta.url), stdio: "pipe" });
});
