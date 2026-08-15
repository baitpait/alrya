import { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const EVENT_STATUS_AR: Record<EventStatus, string> = {
  PREPARING: "قيد التحضير",
  IN_PROGRESS: "قيد العمل",
  COMPLETED: "منتهية",
  CANCELLED: "ملغية",
};

export type ReportKind = "events" | "payments" | "discounts" | "staff" | "offers";

export const REPORT_KINDS: ReportKind[] = [
  "events",
  "payments",
  "discounts",
  "staff",
  "offers",
];

export function parseEventStatus(raw?: string | null): EventStatus | undefined {
  const s = (raw ?? "").trim();
  if (s === "PREPARING" || s === "IN_PROGRESS" || s === "COMPLETED" || s === "CANCELLED") {
    return s;
  }
  return undefined;
}

export function toCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))];
  return `\uFEFF${lines.join("\r\n")}`;
}

export function formatDateAr(d: Date) {
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const customerNameOr = (q: string) => [
  { customer: { firstName: { contains: q } } },
  { customer: { lastName: { contains: q } } },
  { customer: { phone: { contains: q } } },
];

export async function reportEvents(filter?: { q?: string; status?: EventStatus }) {
  const q = filter?.q?.trim();
  const status = filter?.status;
  const events = await prisma.event.findMany({
    orderBy: { id: "desc" },
    include: {
      customer: true,
      _count: { select: { services: true, payments: true } },
    },
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              ...customerNameOr(q),
              { notes: { contains: q } },
              { agreementNo: { contains: q } },
            ],
          }
        : {}),
    },
  });
  return events.map((e) => ({
    id: e.id,
    customer: `${e.customer.firstName} ${e.customer.lastName}`,
    phone: e.customer.phone,
    status: EVENT_STATUS_AR[e.status],
    totalPrice: Number(e.totalPrice),
    services: e._count.services,
    payments: e._count.payments,
    createdAt: e.createdAt,
  }));
}

export async function reportPayments(filter?: { q?: string }) {
  const q = filter?.q?.trim();
  const rows = await prisma.payment.findMany({
    orderBy: { paidAt: "desc" },
    include: { event: { include: { customer: true } } },
    where: q
      ? {
          OR: [
            { method: { contains: q } },
            { note: { contains: q } },
            { event: { customer: { firstName: { contains: q } } } },
            { event: { customer: { lastName: { contains: q } } } },
            { event: { customer: { phone: { contains: q } } } },
          ],
        }
      : undefined,
  });
  return rows.map((p) => ({
    id: p.id,
    paidAt: p.paidAt,
    customer: `${p.event.customer.firstName} ${p.event.customer.lastName}`,
    eventId: p.eventId,
    amount: Number(p.amount),
    method: p.method,
    note: p.note,
  }));
}

export async function reportDiscounts(filter?: { q?: string }) {
  const q = filter?.q?.trim();
  const rows = await prisma.discount.findMany({
    orderBy: { createdAt: "desc" },
    include: { event: { include: { customer: true } } },
    where: q
      ? {
          OR: [
            { reason: { contains: q } },
            { event: { customer: { firstName: { contains: q } } } },
            { event: { customer: { lastName: { contains: q } } } },
            { event: { customer: { phone: { contains: q } } } },
          ],
        }
      : undefined,
  });
  return rows.map((d) => ({
    id: d.id,
    createdAt: d.createdAt,
    customer: `${d.event.customer.firstName} ${d.event.customer.lastName}`,
    eventId: d.eventId,
    amount: Number(d.amount),
    reason: d.reason,
  }));
}

export async function reportStaff(filter?: {
  employee?: string;
  customer?: string;
  supervisor?: string;
}) {
  const employee = filter?.employee?.trim();
  const customer = filter?.customer?.trim();
  const supervisor = filter?.supervisor?.trim();
  const rows = await prisma.eventServiceEmployee.findMany({
    orderBy: { id: "desc" },
    include: {
      user: true,
      supervisor: true,
      eventService: {
        include: {
          service: true,
          event: { include: { customer: true } },
        },
      },
    },
    where: {
      ...(employee
        ? {
            OR: [
              { user: { name: { contains: employee } } },
              { jobTitle: { contains: employee } },
            ],
          }
        : {}),
      ...(customer
        ? {
            eventService: {
              event: {
                OR: [
                  { customer: { firstName: { contains: customer } } },
                  { customer: { lastName: { contains: customer } } },
                  { customer: { phone: { contains: customer } } },
                ],
              },
            },
          }
        : {}),
      ...(supervisor
        ? {
            supervisor: { name: { contains: supervisor } },
          }
        : {}),
    },
  });
  return rows.map((a) => ({
    id: a.id,
    employee: a.user.name,
    customer: `${a.eventService.event.customer.firstName} ${a.eventService.event.customer.lastName}`,
    service: a.eventService.service.name,
    eventId: a.eventService.eventId,
    startsAt: a.eventService.startsAt,
    jobTitle: a.jobTitle,
    salary: a.salary != null ? Number(a.salary) : null,
    bonus: a.bonus != null ? Number(a.bonus) : null,
    supervisor: a.supervisor?.name ?? null,
  }));
}

export async function reportOffers(filter?: { q?: string }) {
  const q = filter?.q?.trim();
  const rows = await prisma.offer.findMany({
    orderBy: { id: "desc" },
    include: { service: true, _count: { select: { eventServices: true } } },
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { audience: { contains: q } },
            { description: { contains: q } },
            { service: { name: { contains: q } } },
          ],
        }
      : undefined,
  });
  return rows.map((o) => ({
    id: o.id,
    name: o.name,
    service: o.service.name,
    audience: o.audience,
    price: Number(o.price),
    listPrice: o.listPrice != null ? Number(o.listPrice) : null,
    usedOn: o._count.eventServices,
  }));
}
