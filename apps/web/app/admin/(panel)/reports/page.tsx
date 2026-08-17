import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "التقارير" };

const REPORTS = [
  {
    href: "/admin/reports/events",
    title: "المناسبات",
    summary: "زبون، حالة، إجمالي، عدد الخدمات والدفعات.",
  },
  {
    href: "/admin/reports/payments",
    title: "الدفعات / التحصيل",
    summary: "كل الدفعات المسجّلة مع الزبون والمبلغ.",
  },
  {
    href: "/admin/reports/discounts",
    title: "الخصومات",
    summary: "خصومات المناسبات والسبب.",
  },
  {
    href: "/admin/reports/staff",
    title: "خدمات الموظفين",
    summary: "تعيينات الطاقم: موظف، زبون، راتب، مكافأة، مشرف.",
  },
  {
    href: "/admin/reports/offers",
    title: "العروض / الباقات",
    summary: "أسعار العروض وكم مرة استُخدمت في المواعيد.",
  },
];

export default function AdminReportsPage() {
  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>التقارير</h1>
        <p>
          نفس أرقام الشاشات. «تصدير Excel» يفتح في Excel، و«طباعة / PDF» من نافذة
          الطباعة في المتصفح.
        </p>
        <div className="dash-grid">
          {REPORTS.map((r) => (
            <Link key={r.href} href={r.href} className="dash-card">
              <span>{r.title}</span>
              <strong style={{ fontSize: "1rem", fontWeight: 600 }}>{r.summary}</strong>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
