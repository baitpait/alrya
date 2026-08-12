#!/usr/bin/env bash
# نهاية جلسة/وكيل → واتساب: شكر وتقدير لنهلة نيابة عن الشركة
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
cat >/dev/null || true

if [[ ! -f .env ]]; then
  echo '{}'
  exit 0
fi

node tools/pm-notify.mjs session-end --summary "أُغلقت جلسة العمل مع المهندسة نهلة البستنجي على مشروع استوديو الراية. نشكر تعبها وجهدها ونتابع بوابات الاختبار اليدوي." >/dev/null 2>&1 || true
echo '{}'
exit 0
