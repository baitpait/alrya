import type { Metadata } from "next";
import { EventStatus } from "@prisma/client";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { EventCreateModal } from "@/components/admin/EventCreateModal";
import { FilterChips } from "@/components/admin/FilterChips";
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

  const statuses = (Object.keys(STATUS_LABEL) as EventStatus[]).map((s) => ({
    value: s,
    label: STATUS_LABEL[s],
  }));

  return (
    <div className="stack-gap">
      <section className="panel">
        <div className="calendar-toolbar">
          <h1>المناسبات</h1>
          <EventCreateModal
            action={createEvent}
            customers={customers.map((c) => ({
              id: c.id,
              firstName: c.firstName,
              lastName: c.lastName,
              phone: c.phone,
            }))}
            statuses={statuses}
          />
        </div>

        <FilterChips
          items={[
            { href: "/admin/events", label: "الكل", active: !statusFilter },
            ...(Object.keys(STATUS_LABEL) as EventStatus[]).map((s) => ({
              href: `/admin/events?status=${s}`,
              label: STATUS_LABEL[s],
              active: statusFilter === s,
            })),
          ]}
        />
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
