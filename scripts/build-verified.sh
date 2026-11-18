#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "${script_dir}/.." && pwd)"
cd "${project_root}"

vinext="${project_root}/node_modules/.bin/vinext"
if [[ ! -x "${vinext}" ]]; then
  echo "vinext is unavailable. Run npm ci first." >&2
  exit 69
fi

echo "Generating runtime translation dictionaries..."
node "${script_dir}/i18n-build.mjs"
node "${script_dir}/manifest-build.mjs"

echo "Running vinext build..."
"${vinext}" build
