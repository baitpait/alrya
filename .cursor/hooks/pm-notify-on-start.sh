#!/usr/bin/env bash
# بداية جلسة Cursor → واتساب (مصطفى تقرير + نهلة تحفيز وثقة)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
cat >/dev/null || true

if [[ ! -f .env ]]; then
  echo '{}'
  exit 0
fi

FOCUS="${1:-متابعة خطة إنتاج استوديو الراية مع المهندسة نهلة البستنجي}"
node tools/pm-notify.mjs session-start --focus "$FOCUS" >/dev/null 2>&1 || true
echo '{}'
exit 0
