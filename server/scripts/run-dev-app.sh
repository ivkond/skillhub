#!/usr/bin/env bash

set -euo pipefail

SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE="${SPRING_PROFILES_ACTIVE:-local}"

cd "$SERVER_DIR"

./gradlew :skillhub-app:clean :skillhub-app:bootJar -x test >/dev/null

APP_JAR="$(find skillhub-app/build/libs -maxdepth 1 -type f -name 'skillhub-app.jar' | head -n 1)"
if [[ -z "$APP_JAR" ]]; then
  echo "Could not locate packaged skillhub-app jar under skillhub-app/build/libs" >&2
  exit 1
fi

exec "${JAVA_BIN:-java}" -jar "$APP_JAR" --spring.profiles.active="$PROFILE" "$@"
