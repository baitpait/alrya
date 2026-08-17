import type { Metadata } from "next";
import Link from "next/link";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { ReportToolbar } from "@/components/admin/ReportToolbar";
import { formatDateAr, reportStaff } from "@/lib/reports";

export const metadata: Metadata = { title: "تقرير خدمات الموظفين" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ employee?: string; customer?: string; supervisor?: string }>;
};

export default async function ReportStaffPage({ searchParams }: Props) {
  const { employee: empRaw, customer: custRaw, supervisor: supRaw } = await searchParams;
  const employee = (empRaw ?? "").trim();
  const customer = (custRaw ?? "").trim();
  const supervisor = (supRaw ?? "").trim();
  const rows = await reportStaff({ employee, customer, supervisor });
  const salarySum = rows.reduce((s, r) => s + (r.salary ?? 0), 0);
  const bonusSum = rows.reduce((s, r) => s + (r.bonus ?? 0), 0);
  const qs = new URLSearchParams();
  if (employee) qs.set("employee", employee);
  if (customer) qs.set("customer", customer);
  if (supervisor) qs.set("supervisor", supervisor);
  const hasFilter = Boolean(employee || customer || supervisor);

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>تقرير خدمات الموظفين</h1>
        <p>
          كل تعيين على موعد بتاريخ — مثال: محمد على حنا أحمد يظهر هنا براتب ومكافأة إن وُجدت.
        </p>
        <ReportToolbar kind="staff" query={qs.toString()} />

        <form method="get" className="inline-form report-print-hide" style={{ marginBottom: "1rem" }}>
          <label>
            الموظف / الوظيفة
            <input name="employee" defaultValue={employee} placeholder="مثال: محمد" />
          </label>
          <label>
            الزبون
            <input name="customer" defaultValue={customer} placeholder="مثال: أحمد" />
          </label>
          <label>
            المشرف
            <input name="supervisor" defaultValue={supervisor} placeholder="اسم المشرف" />
          </label>
          <button type="submit">تصفية</button>
          {hasFilter ? (
            <Link className="text-link" href="/admin/reports/staff">
              مسح الفلتر
            </Link>
          ) : null}
        </form>

        {rows.length === 0 ? (
          <p>{hasFilter ? "لا نتائج لهذا الفلتر." : "لا تعيينات طاقم بعد."}</p>
        ) : (
          <>
            <p>
              عدد الصفوف: {rows.length} · مجموع الرواتب: {salarySum.toFixed(2)} · مجموع
              المكافآت: {bonusSum.toFixed(2)}
            </p>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الموظف</th>
                    <th>الزبون</th>
                    <th>الخدمة</th>
                    <th>من</th>
                    <th>الوظيفة</th>
                    <th>راتب</th>
                    <th>مكافأة</th>
                    <th>مشرف</th>
                    <th className="report-print-hide">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.employee}</td>
                      <td>{r.customer}</td>
                      <td>{r.service}</td>
                      <td>{formatDateAr(r.startsAt)}</td>
                      <td>{r.jobTitle ?? "—"}</td>
                      <td>{r.salary != null ? r.salary.toFixed(2) : "—"}</td>
                      <td>{r.bonus != null ? r.bonus.toFixed(2) : "—"}</td>
                      <td>{r.supervisor ?? "—"}</td>
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
