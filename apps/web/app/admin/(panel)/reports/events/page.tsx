import type { Metadata } from "next";
import Link from "next/link";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { ReportToolbar } from "@/components/admin/ReportToolbar";
import { EVENT_STATUS_AR, formatDateAr, parseEventStatus, reportEvents } from "@/lib/reports";

export const metadata: Metadata = { title: "تقرير المناسبات" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function ReportEventsPage({ searchParams }: Props) {
  const { q: qRaw, status: statusRaw } = await searchParams;
  const q = (qRaw ?? "").trim();
  const status = parseEventStatus(statusRaw);
  const rows = await reportEvents({ q, status });
  const total = rows.reduce((s, r) => s + r.totalPrice, 0);
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (status) qs.set("status", status);

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>تقرير المناسبات</h1>
        <p>كل مناسبة في النظام مع الزبون والحالة والإجمالي.</p>
        <ReportToolbar kind="events" query={qs.toString()} />

        <form method="get" className="inline-form report-print-hide" style={{ marginBottom: "1rem" }}>
          <label>
            بحث (اسم / هاتف / اتفاقية)
            <input name="q" defaultValue={q} placeholder="مثال: أحمد" />
          </label>
          <label>
            الحالة
            <select name="status" defaultValue={status ?? ""}>
              <option value="">الكل</option>
              {(Object.keys(EVENT_STATUS_AR) as Array<keyof typeof EVENT_STATUS_AR>).map((k) => (
                <option key={k} value={k}>
                  {EVENT_STATUS_AR[k]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">تصفية</button>
          {q || status ? (
            <Link className="text-link" href="/admin/reports/events">
              مسح الفلتر
            </Link>
          ) : null}
        </form>

        {rows.length === 0 ? (
          <p>{q || status ? "لا نتائج لهذا الفلتر." : "لا مناسبات بعد."}</p>
        ) : (
          <>
            <p>
              عدد الصفوف: {rows.length} · مجموع الإجمالي: {total.toFixed(2)}
            </p>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الزبون</th>
                    <th>الهاتف</th>
                    <th>الحالة</th>
                    <th>الإجمالي</th>
                    <th>خدمات</th>
                    <th>دفعات</th>
                    <th>أُنشئت</th>
                    <th className="report-print-hide">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.customer}</td>
                      <td className="cell-ltr">{r.phone}</td>
                      <td>{r.status}</td>
                      <td>{r.totalPrice.toFixed(2)}</td>
                      <td>{r.services}</td>
                      <td>{r.payments}</td>
                      <td>{formatDateAr(r.createdAt)}</td>
                      <td className="row-actions report-print-hide">
                        <ActionIconLink
                          href={`/admin/events/${r.id}`}
                          label={`فتح المناسبة #${r.id}`}
                          kind="event"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
