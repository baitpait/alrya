#!/usr/bin/env bash
# نهاية جلسة/وكيل → واتساب للإدارة فقط (تقرير: بداية/نهاية/مدة/منجز)
# الملخص الحقيقي يفضَّل من الوكيل عند «نهاية جلسة» عبر --done / --worked-on
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
cat >/dev/null || true

if [[ ! -f .env ]]; then
  echo '{}'
  exit 0
fi

node tools/pm-notify.mjs session-end --to mgmt \
  --worked-on "جلسة Cursor (إغلاق تلقائي من الـ hook)" \
  --done "أُغلقت الجلسة تلقائياً — إن وُجد ملخص أدق أرسله الوكيل يدوياً عند نهاية الجلسة" \
  >/dev/null 2>&1 || true
echo '{}'
exit 0
