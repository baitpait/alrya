import type { Metadata } from "next";
import Link from "next/link";
import { ReportToolbar } from "@/components/admin/ReportToolbar";
import { reportOffers } from "@/lib/reports";

export const metadata: Metadata = { title: "تقرير العروض" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ReportOffersPage({ searchParams }: Props) {
  const { q: qRaw } = await searchParams;
  const q = (qRaw ?? "").trim();
  const rows = await reportOffers({ q });
  const qs = q ? `q=${encodeURIComponent(q)}` : "";

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>تقرير العروض / الباقات</h1>
        <ReportToolbar kind="offers" query={qs} />

        <form method="get" className="inline-form report-print-hide" style={{ marginBottom: "1rem" }}>
          <label>
            بحث (عرض / خدمة / جمهور)
            <input name="q" defaultValue={q} placeholder="مثال: عرس" />
          </label>
          <button type="submit" className="btn-primary">
            بحث
          </button>
          {q ? (
            <Link className="btn-secondary" href="/admin/reports/offers">
              مسح البحث
            </Link>
          ) : null}
        </form>

        {rows.length === 0 ? (
          <p>{q ? "لا نتائج لهذا الفلتر." : "لا عروض مسجّلة بعد."}</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>العرض</th>
                  <th>الخدمة</th>
                  <th>الجمهور</th>
                  <th>السعر</th>
                  <th>بدل</th>
                  <th>استُخدم في مواعيد</th>
                  <th className="report-print-hide">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.name}</td>
                    <td>{r.service}</td>
                    <td>{r.audience ?? "—"}</td>
                    <td>{r.price.toFixed(2)}</td>
                    <td>{r.listPrice != null ? r.listPrice.toFixed(2) : "—"}</td>
                    <td>{r.usedOn}</td>
                    <td className="row-actions report-print-hide">
                      <Link href="/admin/services">الخدمات</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
