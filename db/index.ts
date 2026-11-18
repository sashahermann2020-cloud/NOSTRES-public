import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export async function getDb() {
  const d1 = await getD1();
  return drizzle(d1, { schema });
}

export async function getD1() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Define a D1 binding named `DB` in your Cloudflare configuration before using the database."
    );
  }
  return env.DB;
}
