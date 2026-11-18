import vinext from "vinext";
import { defineConfig } from "vite";

const LOCAL_D1_PLACEHOLDER_ID = "00000000-0000-4000-8000-000000000000";
const IS_CLOUDFLARE_BUILD = process.env.NOSTRES_CLOUDFLARE_BUILD === "1";
const D1_DATABASE_ID = IS_CLOUDFLARE_BUILD
  ? process.env.NOSTRES_D1_DATABASE_ID ?? LOCAL_D1_PLACEHOLDER_ID
  : LOCAL_D1_PLACEHOLDER_ID;

// Binding names used by the Worker: the D1 database is available as `DB`; no R2 bucket.
const d1: string | null = "DB";
const r2: string | null = null;

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: IS_CLOUDFLARE_BUILD
            ? process.env.NOSTRES_D1_DATABASE_NAME ?? "nostres"
            : "site-creator-d1",
          database_id: D1_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
    },
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: localBindingConfig,
      }),
    ],
  };
});
