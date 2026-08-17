"use client";

import Link from "next/link";
import { PrintButton } from "./PrintButton";

type Props = {
  kind: string;
  query?: string;
};

/** شريط تقارير — كل العناصر بنفس هوية .btn-secondary */
export function ReportToolbar({ kind, query }: Props) {
  const qs = query ? `?${query}` : "";
  return (
    <div className="report-toolbar report-print-hide">
      <a className="btn-secondary" href={`/api/admin/reports/${kind}${qs}`}>
        تصدير Excel
      </a>
      <PrintButton />
      <Link className="btn-secondary" href="/admin/reports">
        كل التقارير
      </Link>
    </div>
  );
}
