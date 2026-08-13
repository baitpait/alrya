"use server";

import { revalidatePath } from "next/cache";
import { EventStatus, EventServiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function requireText(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} مطلوب.`);
  return text;
}

function parseDateAndTime(
  dateValue: FormDataEntryValue | null,
  timeValue: FormDataEntryValue | null,
  label: string,
) {
  const datePart = String(dateValue ?? "").trim();
  const timePart = String(timeValue ?? "").trim() || "00:00";
  if (!datePart) throw new Error(`${label} مطلوب.`);
  const date = new Date(`${datePart}T${timePart}`);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} غير صالح.`);
  return date;
}

function parseStatus(raw: string): EventStatus {
  const map: Record<string, EventStatus> = {
    PREPARING: EventStatus.PREPARING,
    IN_PROGRESS: EventStatus.IN_PROGRESS,
    COMPLETED: EventStatus.COMPLETED,
    CANCELLED: EventStatus.CANCELLED,
  };
  return map[raw] ?? EventStatus.PREPARING;
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

export async function createEvent(formData: FormData) {
  const customerId = Number(formData.get("customerId"));
  if (!Number.isFinite(customerId) || customerId <= 0) {
    throw new Error("اختاري زبوناً.");
  }
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const status = parseStatus(String(formData.get("status") ?? "PREPARING"));

  const event = await prisma.event.create({
    data: { customerId, status, notes, totalPrice: 0 },
  });

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${event.id}`);
  revalidatePath("/admin/customers");
}

export async function updateEventStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف المناسبة غير صالح.");
  const status = parseStatus(String(formData.get("status") ?? "PREPARING"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await prisma.event.update({
    where: { id },
    data: { status, notes },
  });

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
}

export async function addEventService(formData: FormData) {
  const eventId = Number(formData.get("eventId"));
  const serviceId = Number(formData.get("serviceId"));
  const offerIdRaw = String(formData.get("offerId") ?? "").trim();
  const offerId = offerIdRaw ? Number(offerIdRaw) : null;

  if (!Number.isFinite(eventId) || eventId <= 0) throw new Error("مناسبة غير صالحة.");
  if (!Number.isFinite(serviceId) || serviceId <= 0) throw new Error("اختاري خدمة.");

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
  if (endsAt <= startsAt) throw new Error("تاريخ النهاية يجب أن يكون بعد البداية.");

  let price = Number(String(formData.get("price") ?? "").trim());
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("السعر مطلوب.");
  }

  if (offerId && Number.isFinite(offerId)) {
    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (offer && offer.serviceId === serviceId) {
      // إذا تُرك السعر كما في العرض يبقى؛ وإلا نستخدم المدخل
      const priceField = String(formData.get("price") ?? "").trim();
      if (!priceField) price = Number(offer.price);
    }
  }

  const city = String(formData.get("city") ?? "").trim() || null;
  const venue = String(formData.get("venue") ?? "").trim() || null;
  const hall = String(formData.get("hall") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await prisma.eventService.create({
    data: {
      eventId,
      serviceId,
      offerId: offerId && Number.isFinite(offerId) ? offerId : null,
      startsAt,
      endsAt,
      city,
      venue,
      hall,
      price,
      status: EventServiceStatus.IN_PROGRESS,
      notes,
    },
  });

  await refreshEventTotal(eventId);
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
}

export async function deleteEventService(formData: FormData) {
  const id = Number(formData.get("id"));
  const eventId = Number(formData.get("eventId"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  await prisma.eventService.delete({ where: { id } });
  if (Number.isFinite(eventId) && eventId > 0) {
    await refreshEventTotal(eventId);
    revalidatePath(`/admin/events/${eventId}`);
  }
  revalidatePath("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  await prisma.eventService.deleteMany({ where: { eventId: id } });
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/events");
  revalidatePath("/admin/customers");
}
