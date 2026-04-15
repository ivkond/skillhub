#!/usr/bin/env bash
# Staging smoke + pass/fail messages. Invoked from `make staging` so Windows cmd
# never parses POSIX `if VAR=value ...`.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

: "${STAGING_API_URL:?STAGING_API_URL must be set}"
: "${STAGING_WEB_URL:?STAGING_WEB_URL must be set}"
: "${STAGING_COMPOSE:?STAGING_COMPOSE must be set}"
: "${BOOTSTRAP_ADMIN_USERNAME:=admin}"
: "${BOOTSTRAP_ADMIN_PASSWORD:?BOOTSTRAP_ADMIN_PASSWORD must be set}"

export BOOTSTRAP_ADMIN_USERNAME
export BOOTSTRAP_ADMIN_PASSWORD

if bash scripts/smoke-test.sh "$STAGING_API_URL"; then
  printf '\nStaging passed. Environment is running:\n'
  printf '  Web UI:  %s\n' "$STAGING_WEB_URL"
  printf '  Backend: %s\n' "$STAGING_API_URL"
  printf '\nRun '\''make staging-down'\'' to stop.\n'
  printf 'Run '\''make pr'\'' to create a pull request.\n'
else
  printf '\nSmoke tests FAILED. Printing logs...\n'
  eval "$STAGING_COMPOSE logs server"
  make staging-down
  exit 1
fi
