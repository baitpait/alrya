import { prisma } from "@/lib/prisma";

export type CalendarEventDto = {
  id: string;
  title: string;
  start: string;
  end: string;
  url?: string;
  extendedProps: {
    eventServiceId: number;
    eventId: number;
    customerName: string;
    serviceName: string;
    venue: string | null;
    hall: string | null;
    city: string | null;
    price: number;
  };
};

export async function listCalendarEvents(): Promise<CalendarEventDto[]> {
  const rows = await prisma.eventService.findMany({
    orderBy: { startsAt: "asc" },
    include: {
      service: true,
      event: { include: { customer: true } },
    },
  });

  return rows.map((row) => {
    const customerName = `${row.event.customer.firstName} ${row.event.customer.lastName}`;
    return {
      id: String(row.id),
      title: `${row.service.name} — ${customerName}`,
      start: row.startsAt.toISOString(),
      end: row.endsAt.toISOString(),
      extendedProps: {
        eventServiceId: row.id,
        eventId: row.eventId,
        customerName,
        serviceName: row.service.name,
        venue: row.venue,
        hall: row.hall,
        city: row.city,
        price: Number(row.price),
      },
    };
  });
}
