#!/usr/bin/env bash
# نهاية جلسة/وكيل → واتساب بأسلوب مهذّب للمبرمج
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
cat >/dev/null || true

if [[ ! -f .env ]]; then
  echo '{}'
  exit 0
fi

node tools/pm-notify.mjs session-end --summary "أُغلقت جلسة العمل على مشروع استوديو الراية. نشكر الجهود ونتابع بوابات الاختبار اليدوي." >/dev/null 2>&1 || true
echo '{}'
exit 0
