"use server";

import { revalidatePath } from "next/cache";
import { EventServiceStatus, EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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

/** إضافة موعد من التقويم → EventService حقيقي (+ مناسبة جديدة إن لزم) */
export async function createCalendarAppointment(formData: FormData) {
  const customerId = Number(formData.get("customerId"));
  const serviceId = Number(formData.get("serviceId"));
  let eventId = Number(formData.get("eventId") || 0);
  const offerIdRaw = String(formData.get("offerId") ?? "").trim();
  const offerId = offerIdRaw ? Number(offerIdRaw) : null;

  if (!Number.isFinite(customerId) || customerId <= 0) {
    throw new Error("اختاري زبوناً.");
  }
  if (!Number.isFinite(serviceId) || serviceId <= 0) {
    throw new Error("اختاري خدمة.");
  }

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
  if (endsAt <= startsAt) {
    throw new Error("تاريخ النهاية يجب أن يكون بعد البداية.");
  }

  const price = Number(String(formData.get("price") ?? "").trim());
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("السعر مطلوب.");
  }

  const city = String(formData.get("city") ?? "").trim() || null;
  const venue = String(formData.get("venue") ?? "").trim() || null;
  const hall = String(formData.get("hall") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!Number.isFinite(eventId) || eventId <= 0) {
    const created = await prisma.event.create({
      data: {
        customerId,
        status: EventStatus.PREPARING,
        totalPrice: 0,
        notes: notes ? `من التقويم: ${notes}` : "أُنشئت من التقويم",
      },
    });
    eventId = created.id;
  } else {
    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing || existing.customerId !== customerId) {
      throw new Error("المناسبة لا تطابق الزبون المختار.");
    }
  }

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
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
}

export async function updateCalendarAppointment(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف الموعد غير صالح.");

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
  if (endsAt <= startsAt) {
    throw new Error("تاريخ النهاية يجب أن يكون بعد البداية.");
  }

  const price = Number(String(formData.get("price") ?? "").trim());
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("السعر مطلوب.");
  }

  const city = String(formData.get("city") ?? "").trim() || null;
  const venue = String(formData.get("venue") ?? "").trim() || null;
  const hall = String(formData.get("hall") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const updated = await prisma.eventService.update({
    where: { id },
    data: { startsAt, endsAt, price, city, venue, hall, notes },
  });

  await refreshEventTotal(updated.eventId);
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${updated.eventId}`);
}
