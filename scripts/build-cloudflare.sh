#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
placeholder_id="00000000-0000-4000-8000-000000000000"

if [[ -z "${NOSTRES_D1_DATABASE_ID:-}" ]]; then
  echo "Set NOSTRES_D1_DATABASE_ID in the Cloudflare Build environment before building NOSTRES." >&2
  exit 64
fi

if [[ "${NOSTRES_D1_DATABASE_ID}" == "${placeholder_id}" && "${NOSTRES_D1_ALLOW_PLACEHOLDER:-}" != "1" ]]; then
  echo "The placeholder D1 ID is allowed only for CI validation, not deployment." >&2
  exit 64
fi

if [[ ! "${NOSTRES_D1_DATABASE_ID}" =~ ^[[:xdigit:]-]{16,64}$ ]]; then
  echo "NOSTRES_D1_DATABASE_ID must be a Cloudflare D1 ID." >&2
  exit 64
fi

if [[ ! -x "${project_root}/node_modules/.bin/vite" ]]; then
  echo "Vite is unavailable. Run npm ci before building." >&2
  exit 69
fi

# Fresh Cloudflare builds start from a clean checkout, so prepare the dictionaries
# and translated install manifests before Vite copies public assets.
node "${project_root}/scripts/i18n-build.mjs"
node "${project_root}/scripts/manifest-build.mjs"

export NOSTRES_CLOUDFLARE_BUILD=1
"${project_root}/node_modules/.bin/vite" build

# Маленькие словари страниц для серверного перевода (воркер читает их вместо полного словаря).
node --import "${project_root}/scripts/node-stubs/register-cloudflare-stub.mjs" "${project_root}/scripts/i18n-pages.mjs" "${project_root}/dist/client"

# Vinext emits its resolved Wrangler config with an internal legacy_env field.
# Wrangler 4 no longer accepts that field when deploying the generated config.
node - "${project_root}/dist/server/wrangler.json" <<'NODE'
const fs = require("node:fs");
const path = process.argv[2];
const config = JSON.parse(fs.readFileSync(path, "utf8"));
delete config.legacy_env;
// Воркер читает словари языков из статических файлов через привязку ASSETS.
if (config.assets) config.assets.binding = "ASSETS";
// Мониторинг внешних ссылок: каждые 15 минут проверяется небольшая порция.
config.triggers = { crons: ["*/15 * * * *"] };
fs.writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
NODE

