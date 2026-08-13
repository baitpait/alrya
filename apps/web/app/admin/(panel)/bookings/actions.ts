"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BookingStatus, EventServiceStatus, EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function parseDateAndTime(
  dateValue: FormDataEntryValue | null,
  timeValue: FormDataEntryValue | null,
  label: string,
) {
  const datePart = String(dateValue ?? "").trim();
  const timePart = String(timeValue ?? "").trim() || "18:00";
  if (!datePart) throw new Error(`${label} مطلوب.`);
  const date = new Date(`${datePart}T${timePart}`);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} غير صالح.`);
  return date;
}

async function refreshEventTotal(eventId: number) {
  const agg = await prisma.eventService.aggregate({
    where: { eventId },
    _sum: { price: true },
  });
  await prisma.event.update({
    where: { id: eventId },
    data: { totalPrice: agg._sum.price ?? 0 },
  });
}

function revalidateBookingPaths(eventId?: number, customerId?: number) {
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/events");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/calendar");
  if (eventId) revalidatePath(`/admin/events/${eventId}`);
  if (customerId) revalidatePath(`/admin/customers/${customerId}`);
}

/** تحويل طلب حجز → زبون + مناسبة + EventService (يظهر على التقويم) */
export async function convertBookingRequest(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  const booking = await prisma.bookingRequest.findUnique({
    where: { id },
    include: { service: { include: { offers: { orderBy: { id: "asc" }, take: 1 } } } },
  });
  if (!booking) throw new Error("الطلب غير موجود.");
  if (booking.status === BookingStatus.CONVERTED) {
    throw new Error("هذا الطلب محوّل مسبقاً.");
  }
  if (booking.status === BookingStatus.REJECTED) {
    throw new Error("لا يمكن تحويل طلب مرفوض.");
  }

  const serviceIdRaw = String(formData.get("serviceId") ?? "").trim();
  const serviceId = serviceIdRaw
    ? Number(serviceIdRaw)
    : booking.serviceId
      ? booking.serviceId
      : NaN;
  if (!Number.isFinite(serviceId) || serviceId <= 0) {
    throw new Error("اختاري خدمة للتحويل.");
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { offers: { orderBy: { id: "asc" }, take: 1 } },
  });
  if (!service) throw new Error("الخدمة غير موجودة.");

  const startsAt = parseDateAndTime(
    formData.get("startsDate"),
    formData.get("startsTime"),
    "تاريخ البداية",
  );
  const endsAt = parseDateAndTime(
    formData.get("endsDate"),
    formData.get("endsTime"),
    "تاريخ النهاية",
  );
  if (endsAt <= startsAt) throw new Error("النهاية يجب أن تكون بعد البداية.");

  let price = Number(String(formData.get("price") ?? "").trim());
  if (!Number.isFinite(price) || price < 0) {
    const offerPrice = service.offers[0] ? Number(service.offers[0].price) : 0;
    price = offerPrice;
  }

  const city =
    String(formData.get("city") ?? "").trim() || booking.city || null;
  const venue =
    String(formData.get("venue") ?? "").trim() || booking.venue || null;
  const hall =
    String(formData.get("hall") ?? "").trim() || booking.hall || null;

  const existingCustomer = await prisma.customer.findFirst({
    where: { phone: booking.phone },
    orderBy: { id: "desc" },
  });

  const customer =
    existingCustomer ??
    (await prisma.customer.create({
      data: {
        firstName: booking.groomName.trim(),
        lastName: (booking.brideName ?? "").trim() || "—",
        phone: booking.phone.trim(),
        altPhone: booking.altPhone,
        address: [booking.city, booking.venue].filter(Boolean).join(" · ") || null,
      },
    }));

  const event = await prisma.event.create({
    data: {
      customerId: customer.id,
      status: EventStatus.PREPARING,
      notes: booking.notes,
      totalPrice: 0,
    },
  });

  await prisma.eventService.create({
    data: {
      eventId: event.id,
      serviceId: service.id,
      offerId: service.offers[0]?.id ?? null,
      startsAt,
      endsAt,
      city,
      venue,
      hall,
      price,
      status: EventServiceStatus.IN_PROGRESS,
      notes: booking.notes,
    },
  });

  await refreshEventTotal(event.id);

  await prisma.bookingRequest.update({
    where: { id },
    data: {
      status: BookingStatus.CONVERTED,
      convertedCustomerId: customer.id,
      convertedEventId: event.id,
      serviceId: service.id,
    },
  });

  revalidateBookingPaths(event.id, customer.id);
  revalidatePath(`/admin/bookings/${id}`);
  redirect(`/admin/events/${event.id}`);
}

export async function rejectBookingRequest(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  const booking = await prisma.bookingRequest.findUnique({ where: { id } });
  if (!booking) throw new Error("الطلب غير موجود.");
  if (booking.status === BookingStatus.CONVERTED) {
    throw new Error("لا يمكن رفض طلب محوّل.");
  }

  const reason = String(formData.get("reason") ?? "").trim();
  const notes = reason
    ? [booking.notes, `رفض الإدارة: ${reason}`].filter(Boolean).join("\n")
    : booking.notes;

  await prisma.bookingRequest.update({
    where: { id },
    data: {
      status: BookingStatus.REJECTED,
      notes,
    },
  });

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
}

export async function markBookingContacted(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  const booking = await prisma.bookingRequest.findUnique({ where: { id } });
  if (!booking) throw new Error("الطلب غير موجود.");
  if (
    booking.status === BookingStatus.CONVERTED ||
    booking.status === BookingStatus.REJECTED
  ) {
    throw new Error("لا يمكن تغيير حالة هذا الطلب.");
  }

  await prisma.bookingRequest.update({
    where: { id },
    data: { status: BookingStatus.CONTACTED },
  });

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
}
