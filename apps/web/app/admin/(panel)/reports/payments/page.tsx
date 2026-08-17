import type { Metadata } from "next";
import Link from "next/link";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { ReportToolbar } from "@/components/admin/ReportToolbar";
import { formatDateAr, reportPayments } from "@/lib/reports";

export const metadata: Metadata = { title: "تقرير الدفعات" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ReportPaymentsPage({ searchParams }: Props) {
  const { q: qRaw } = await searchParams;
  const q = (qRaw ?? "").trim();
  const rows = await reportPayments({ q });
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const qs = q ? `q=${encodeURIComponent(q)}` : "";

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>تقرير الدفعات / التحصيل</h1>
        <p>كل دفعة مسجّلة مع الزبون والمبلغ — نفس أرقام شاشة الدفعات.</p>
        <ReportToolbar kind="payments" query={qs} />

        <form method="get" className="inline-form report-print-hide" style={{ marginBottom: "1rem" }}>
          <label>
            بحث (اسم / هاتف / طريقة / ملاحظة)
            <input name="q" defaultValue={q} placeholder="مثال: أحمد أو نقدي" />
          </label>
          <button type="submit">تصفية</button>
          {q ? (
            <Link className="text-link" href="/admin/reports/payments">
              مسح الفلتر
            </Link>
          ) : null}
        </form>

        {rows.length === 0 ? (
          <p>{q ? "لا نتائج لهذا الفلتر." : "لا دفعات مسجّلة بعد."}</p>
        ) : (
          <>
            <p>
              عدد الصفوف: {rows.length} · مجموع التحصيل: {total.toFixed(2)}
            </p>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>التاريخ</th>
                    <th>الزبون</th>
                    <th>مناسبة</th>
                    <th>المبلغ</th>
                    <th>الطريقة</th>
                    <th>ملاحظة</th>
                    <th className="report-print-hide">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{formatDateAr(r.paidAt)}</td>
                      <td>{r.customer}</td>
                      <td>{r.eventId}</td>
                      <td>{r.amount.toFixed(2)}</td>
                      <td>{r.method ?? "—"}</td>
                      <td>{r.note ?? "—"}</td>
                      <td className="row-actions report-print-hide">
                        <ActionIconLink
                          href={`/admin/events/${r.eventId}`}
                          label={`فتح المناسبة #${r.eventId}`}
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
