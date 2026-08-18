"use client";

import { PrintButton } from "./PrintButton";

type Props = {
  kind: string;
  query?: string;
};

/** شريط تقارير — التنقّل بين الأنواع من منيو الشريط الجانبي */
export function ReportToolbar({ kind, query }: Props) {
  const qs = query ? `?${query}` : "";
  return (
    <div className="report-toolbar report-print-hide">
      <a className="btn-secondary" href={`/api/admin/reports/${kind}${qs}`}>
        تصدير Excel
      </a>
      <PrintButton />
    </div>
  );
}
