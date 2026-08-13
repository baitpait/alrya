import { prisma } from "@/lib/prisma";
import {
  BookingStatus,
  ContactMessageStatus,
  EventStatus,
} from "@prisma/client";

export type UpcomingAppointment = {
  id: number;
  eventId: number;
  title: string;
  customerName: string;
  startsAt: Date;
  endsAt: Date;
};

export type DashboardStats = {
  pendingBookings: number;
  newMessages: number;
  eventsPreparing: number;
  eventsInProgress: number;
  customers: number;
  activeServices: number;
  paymentsTotal: number;
  remainingTotal: number;
  upcoming: UpcomingAppointment[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();

  const [
    pendingBookings,
    newMessages,
    eventsPreparing,
    eventsInProgress,
    customers,
    activeServices,
    paymentAgg,
    discountAgg,
    totalPriceAgg,
    upcomingRows,
  ] = await Promise.all([
    prisma.bookingRequest.count({ where: { status: BookingStatus.PENDING } }),
    prisma.contactMessage.count({ where: { status: ContactMessageStatus.NEW } }),
    prisma.event.count({ where: { status: EventStatus.PREPARING } }),
    prisma.event.count({ where: { status: EventStatus.IN_PROGRESS } }),
    prisma.customer.count(),
    prisma.service.count({ where: { active: true } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.discount.aggregate({ _sum: { amount: true } }),
    prisma.event.aggregate({ _sum: { totalPrice: true } }),
    prisma.eventService.findMany({
      where: { startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      take: 8,
      include: {
        service: true,
        event: { include: { customer: true } },
      },
    }),
  ]);

  const paymentsTotal = Number(paymentAgg._sum.amount ?? 0);
  const discountsTotal = Number(discountAgg._sum.amount ?? 0);
  const totalPrice = Number(totalPriceAgg._sum.totalPrice ?? 0);

  return {
    pendingBookings,
    newMessages,
    eventsPreparing,
    eventsInProgress,
    customers,
    activeServices,
    paymentsTotal,
    remainingTotal: totalPrice - discountsTotal - paymentsTotal,
    upcoming: upcomingRows.map((row) => ({
      id: row.id,
      eventId: row.eventId,
      title: row.service.name,
      customerName: `${row.event.customer.firstName} ${row.event.customer.lastName}`,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
    })),
  };
}
