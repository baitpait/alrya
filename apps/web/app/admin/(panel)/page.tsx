import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { formatMoney } from "@/lib/event-finance";
import { getVerifiedSession } from "@/lib/authz";

export const metadata: Metadata = { title: "لوحة التحكم" };
export const dynamic = "force-dynamic";

function formatDateTimeAr(d: Date) {
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function AdminHomePage() {
  const session = await getVerifiedSession();
  const isManager = session?.isManager ?? false;
  const stats = await getDashboardStats();

  const managerCards = [
    {
      label: "طلبات جديدة",
      value: String(stats.pendingBookings),
      href: "/admin/bookings?status=PENDING",
    },
    {
      label: "رسائل غير مقروءة",
      value: String(stats.newMessages),
      href: "/admin/messages?status=NEW",
    },
    {
      label: "مناسبات قيد التحضير",
      value: String(stats.eventsPreparing),
      href: "/admin/events?status=PREPARING",
    },
    {
      label: "مناسبات قيد العمل",
      value: String(stats.eventsInProgress),
      href: "/admin/events?status=IN_PROGRESS",
    },
    {
      label: "الزبائن",
      value: String(stats.customers),
      href: "/admin/customers",
    },
    {
      label: "خدمات نشطة",
      value: String(stats.activeServices),
      href: "/admin/services",
    },
    {
      label: "إجمالي التحصيل",
      value: formatMoney(stats.paymentsTotal),
      href: "/admin/payments",
      ltr: true,
    },
    {
      label: "المتبقي الكلي",
      value: formatMoney(stats.remainingTotal),
      href: "/admin/events",
      ltr: true,
    },
  ];

  const staffCards = [
    {
      label: "مناسبات قيد التحضير",
      value: String(stats.eventsPreparing),
      href: "/admin/events?status=PREPARING",
    },
    {
      label: "مناسبات قيد العمل",
      value: String(stats.eventsInProgress),
      href: "/admin/events?status=IN_PROGRESS",
    },
    {
      label: "مواعيدي",
      value: "افتح",
      href: "/admin/my-assignments",
    },
    {
      label: "التقويم",
      value: "افتح",
      href: "/admin/calendar",
    },
  ];

  const cards = isManager ? managerCards : staffCards;

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>لوحة التحكم</h1>
        <p>
          {isManager ? (
            <>
              أرقام حية من MySQL — كل بطاقة تفتح الصفحة المفلترة.{" "}
              <Link className="text-link" href="/admin/reports">
                التقارير
              </Link>
            </>
          ) : (
            <>
              مرحباً {session?.name ?? ""} — هذي شاشة الطاقم: مواعيدك والتقويم.{" "}
              <Link className="text-link" href="/admin/my-assignments">
                مناسباتي
              </Link>
            </>
          )}
        </p>

        <div className="dash-grid" aria-label="مؤشرات التشغيل">
          {cards.map((card) => (
            <Link key={card.href + card.label} href={card.href} className="dash-card">
              <span>{card.label}</span>
              <strong className={"ltr" in card && card.ltr ? "cell-ltr" : undefined}>
                {card.value}
              </strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="calendar-toolbar">
          <h2>المواعيد القادمة</h2>
          <Link className="text-link" href="/admin/calendar">
            فتح التقويم
          </Link>
        </div>
        {stats.upcoming.length === 0 ? (
          <p>لا مواعيد قادمة — أضيفي خدمة بتاريخ من المناسبة أو من التقويم.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الخدمة</th>
                  <th>الزبون</th>
                  <th>من</th>
                  <th>إلى</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats.upcoming.map((row) => (
                  <tr key={row.id}>
                    <td>{row.title}</td>
                    <td>{row.customerName}</td>
                    <td className="cell-ltr">{formatDateTimeAr(row.startsAt)}</td>
                    <td className="cell-ltr">{formatDateTimeAr(row.endsAt)}</td>
                    <td>
                      <Link className="text-link" href={`/admin/events/${row.eventId}`}>
                        المناسبة
                      </Link>
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
