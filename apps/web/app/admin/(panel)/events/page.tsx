import type { Metadata } from "next";
import Link from "next/link";
import { EventStatus } from "@prisma/client";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { prisma } from "@/lib/prisma";
import { createEvent } from "./actions";

export const metadata: Metadata = { title: "المناسبات" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<EventStatus, string> = {
  PREPARING: "قيد التحضير",
  IN_PROGRESS: "قيد العمل",
  COMPLETED: "منتهية",
  CANCELLED: "ملغية",
};

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminEventsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const statusFilter =
    sp.status && Object.values(EventStatus).includes(sp.status as EventStatus)
      ? (sp.status as EventStatus)
      : undefined;

  const [customers, events] = await Promise.all([
    prisma.customer.findMany({ orderBy: { id: "desc" } }),
    prisma.event.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { id: "desc" },
      include: {
        customer: true,
        _count: { select: { services: true } },
      },
    }),
  ]);

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>المناسبات</h1>
        <p>مناسبة مربوطة بزبون، وتحتها مواعيد خدمات بتاريخ (مثل حنا وعرس).</p>

        <div className="row-actions" style={{ marginTop: "0.75rem" }}>
          <Link className="text-link" href="/admin/events">
            الكل
          </Link>
          {(Object.keys(STATUS_LABEL) as EventStatus[]).map((s) => (
            <Link key={s} className="text-link" href={`/admin/events?status=${s}`}>
              {STATUS_LABEL[s]}
            </Link>
          ))}
        </div>

        <form action={createEvent} className="inline-form">
          <h2>إنشاء مناسبة</h2>
          <label>
            الزبون
            <select name="customerId" required defaultValue="">
              <option value="" disabled>
                اختاري زبوناً
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} — {c.phone}
                </option>
              ))}
            </select>
          </label>
          <label>
            الحالة
            <select name="status" defaultValue="PREPARING">
              {(Object.keys(STATUS_LABEL) as EventStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            ملاحظات
            <textarea name="notes" rows={2} />
          </label>
          <button type="submit" disabled={customers.length === 0}>
            حفظ المناسبة
          </button>
          {customers.length === 0 ? (
            <p>أضيفي زبوناً أولاً من صفحة الزبائن.</p>
          ) : null}
        </form>
      </section>

      <section className="panel">
        <h2>
          القائمة
          {statusFilter ? ` — ${STATUS_LABEL[statusFilter]}` : ""} ({events.length})
        </h2>
        {events.length === 0 ? (
          <p>لا مناسبات في هذا العرض.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الزبون</th>
                  <th>الحالة</th>
                  <th>الخدمات</th>
                  <th>الإجمالي</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>
                      {e.customer.firstName} {e.customer.lastName}
                    </td>
                    <td>{STATUS_LABEL[e.status]}</td>
                    <td>{e._count.services}</td>
                    <td className="cell-ltr">{Number(e.totalPrice).toFixed(2)}</td>
                    <td>
                      <ActionIconLink
                        href={`/admin/events/${e.id}`}
                        label={`تفاصيل مناسبة #${e.id}`}
                        kind="view"
                      />
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
