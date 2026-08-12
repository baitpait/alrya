#!/usr/bin/env bash
# بداية جلسة Cursor → واتساب (إدارة + مبرمج بأسلوب راقٍ)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
cat >/dev/null || true

if [[ ! -f .env ]]; then
  echo '{}'
  exit 0
fi

FOCUS="${1:-متابعة خطة إنتاج استوديو الراية}"
node tools/pm-notify.mjs session-start --focus "$FOCUS" >/dev/null 2>&1 || true
echo '{}'
exit 0
