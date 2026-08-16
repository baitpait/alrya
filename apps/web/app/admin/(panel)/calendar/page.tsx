import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { listCalendarEvents } from "@/lib/calendar-events";
import { getVerifiedSession } from "@/lib/authz";
import { CalendarApp } from "@/components/admin/CalendarApp";

export const metadata: Metadata = { title: "التقويم" };
export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  const session = await getVerifiedSession();
  const canEdit = session?.isManager ?? false;

  const [calendarEvents, customers, services, offers, events] = await Promise.all([
    listCalendarEvents(),
    canEdit
      ? prisma.customer.findMany({ orderBy: { id: "desc" } })
      : Promise.resolve(
          [] as Awaited<ReturnType<typeof prisma.customer.findMany>>,
        ),
    canEdit
      ? prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } })
      : Promise.resolve(
          [] as Awaited<ReturnType<typeof prisma.service.findMany>>,
        ),
    canEdit
      ? prisma.offer.findMany({
          include: { service: true },
          orderBy: { id: "desc" },
        })
      : Promise.resolve(
          [] as Awaited<
            ReturnType<
              typeof prisma.offer.findMany<{ include: { service: true } }>
            >
          >,
        ),
    canEdit
      ? prisma.event.findMany({
          orderBy: { id: "desc" },
          include: { customer: true },
        })
      : Promise.resolve(
          [] as Awaited<
            ReturnType<
              typeof prisma.event.findMany<{ include: { customer: true } }>
            >
          >,
        ),
  ]);

  return (
    <CalendarApp
      canEdit={canEdit}
      initialEvents={calendarEvents}
      customers={customers.map((c) => ({
        id: c.id,
        label: `${c.firstName} ${c.lastName} — ${c.phone}`,
      }))}
      services={services.map((s) => ({ id: s.id, label: s.name }))}
      offers={offers.map((o) => ({
        id: o.id,
        serviceId: o.serviceId,
        label: `${o.service.name} / ${o.name} (${Number(o.price).toFixed(2)})`,
        price: Number(o.price),
      }))}
      events={events.map((e) => ({
        id: e.id,
        customerId: e.customerId,
        label: `#${e.id} — ${e.customer.firstName} ${e.customer.lastName}`,
      }))}
    />
  );
}
