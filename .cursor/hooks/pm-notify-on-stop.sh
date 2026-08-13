#!/usr/bin/env bash
# نهاية جلسة/وكيل → واتساب: تقرير للإدارة + شكر ودّي لنـهلة
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
cat >/dev/null || true

if [[ ! -f .env ]]; then
  echo '{}'
  exit 0
fi

node tools/pm-notify.mjs session-end --to both \
  --worked-on "جلسة Cursor (إغلاق تلقائي من الـ hook)" \
  --done "أُغلقت الجلسة تلقائياً — إن وُجد ملخص أدق أرسله الوكيل عند نهاية الجلسة" \
  >/dev/null 2>&1 || true
echo '{}'
exit 0
