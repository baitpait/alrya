import type { Metadata } from "next";
import Link from "next/link";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { ReportToolbar } from "@/components/admin/ReportToolbar";
import { formatDateAr, reportDiscounts } from "@/lib/reports";

export const metadata: Metadata = { title: "تقرير الخصومات" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ReportDiscountsPage({ searchParams }: Props) {
  const { q: qRaw } = await searchParams;
  const q = (qRaw ?? "").trim();
  const rows = await reportDiscounts({ q });
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const qs = q ? `q=${encodeURIComponent(q)}` : "";

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>تقرير الخصومات</h1>
        <p>خصومات المناسبات مع السبب — مثال: خصم على عرس أحمد يظهر هنا.</p>
        <ReportToolbar kind="discounts" query={qs} />

        <form method="get" className="inline-form report-print-hide" style={{ marginBottom: "1rem" }}>
          <label>
            بحث (اسم / هاتف / سبب)
            <input name="q" defaultValue={q} placeholder="مثال: أحمد" />
          </label>
          <button type="submit">تصفية</button>
          {q ? (
            <Link className="text-link" href="/admin/reports/discounts">
              مسح الفلتر
            </Link>
          ) : null}
        </form>

        {rows.length === 0 ? (
          <p>{q ? "لا نتائج لهذا الفلتر." : "لا خصومات مسجّلة بعد."}</p>
        ) : (
          <>
            <p>
              عدد الصفوف: {rows.length} · مجموع الخصومات: {total.toFixed(2)}
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
                    <th>السبب</th>
                    <th className="report-print-hide">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{formatDateAr(r.createdAt)}</td>
                      <td>{r.customer}</td>
                      <td>{r.eventId}</td>
                      <td>{r.amount.toFixed(2)}</td>
                      <td>{r.reason ?? "—"}</td>
                      <td className="row-actions report-print-hide">
                        <ActionIconLink
                          href={`/admin/events/${r.eventId}`}
                          label={`فتح المناسبة #${r.eventId}`}
                          kind="open"
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
