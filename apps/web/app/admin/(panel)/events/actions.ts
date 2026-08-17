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
  const agreementNo = String(formData.get("agreementNo") ?? "").trim() || null;
  const deliveryRaw = String(formData.get("deliveryDueAt") ?? "").trim();
  let deliveryDueAt: Date | null = null;
  if (deliveryRaw) {
    deliveryDueAt = new Date(`${deliveryRaw}T12:00:00`);
    if (Number.isNaN(deliveryDueAt.getTime())) {
      throw new Error("آخر موعد للاستلام غير صالح.");
    }
  }

  await prisma.event.update({
    where: { id },
    data: { status, notes, agreementNo, deliveryDueAt },
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
  revalidatePath("/admin/calendar");
}

export async function deleteEventService(formData: FormData) {
  const id = Number(formData.get("recordId") ?? formData.get("id"));
  const eventId = Number(formData.get("eventId"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  await prisma.eventServiceEmployee.deleteMany({ where: { eventServiceId: id } });
  await prisma.eventService.delete({ where: { id } });
  if (Number.isFinite(eventId) && eventId > 0) {
    await refreshEventTotal(eventId);
    revalidatePath(`/admin/events/${eventId}`);
  }
  revalidatePath("/admin/events");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/employees");
  revalidatePath("/admin/my-assignments");
}

export async function deleteEvent(formData: FormData) {
  const id = Number(formData.get("recordId") ?? formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  const serviceIds = (
    await prisma.eventService.findMany({
      where: { eventId: id },
      select: { id: true },
    })
  ).map((s) => s.id);
  if (serviceIds.length > 0) {
    await prisma.eventServiceEmployee.deleteMany({
      where: { eventServiceId: { in: serviceIds } },
    });
  }
  await prisma.payment.deleteMany({ where: { eventId: id } });
  await prisma.discount.deleteMany({ where: { eventId: id } });
  await prisma.eventService.deleteMany({ where: { eventId: id } });
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/events");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/employees");
  revalidatePath("/admin/my-assignments");
}

function parsePositiveAmount(raw: FormDataEntryValue | null, label: string) {
  const text = String(raw ?? "").trim();
  const amount = Number(text);
  if (!text || !Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${label} يجب أن يكون أكبر من صفر.`);
  }
  return amount;
}

export async function addPayment(formData: FormData) {
  const eventId = Number(formData.get("eventId"));
  if (!Number.isFinite(eventId) || eventId <= 0) {
    throw new Error("مناسبة غير صالحة.");
  }

  const amount = parsePositiveAmount(formData.get("amount"), "مبلغ الدفعة");
  const method = String(formData.get("method") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;
  const paidDate = String(formData.get("paidDate") ?? "").trim();
  const paidTime = String(formData.get("paidTime") ?? "").trim() || "12:00";
  let paidAt = new Date();
  if (paidDate) {
    paidAt = new Date(`${paidDate}T${paidTime}`);
    if (Number.isNaN(paidAt.getTime())) throw new Error("تاريخ الدفعة غير صالح.");
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("المناسبة غير موجودة.");

  await prisma.payment.create({
    data: { eventId, amount, method, note, paidAt },
  });

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  revalidatePath("/admin/payments");
}

export async function deletePayment(formData: FormData) {
  const id = Number(formData.get("recordId") ?? formData.get("id"));
  const eventId = Number(formData.get("eventId"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  await prisma.payment.delete({ where: { id } });
  if (Number.isFinite(eventId) && eventId > 0) {
    revalidatePath(`/admin/events/${eventId}`);
  }
  revalidatePath("/admin/payments");
  revalidatePath("/admin/events");
}

export async function addDiscount(formData: FormData) {
  const eventId = Number(formData.get("eventId"));
  if (!Number.isFinite(eventId) || eventId <= 0) {
    throw new Error("مناسبة غير صالحة.");
  }

  const amount = parsePositiveAmount(formData.get("amount"), "مبلغ الخصم");
  const reason = String(formData.get("reason") ?? "").trim() || null;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("المناسبة غير موجودة.");

  await prisma.discount.create({
    data: { eventId, amount, reason },
  });

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  revalidatePath("/admin/payments");
}

export async function deleteDiscount(formData: FormData) {
  const id = Number(formData.get("recordId") ?? formData.get("id"));
  const eventId = Number(formData.get("eventId"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  await prisma.discount.delete({ where: { id } });
  if (Number.isFinite(eventId) && eventId > 0) {
    revalidatePath(`/admin/events/${eventId}`);
  }
  revalidatePath("/admin/payments");
  revalidatePath("/admin/events");
}

export async function assignEmployeeToService(formData: FormData) {
  const eventId = Number(formData.get("eventId"));
  const eventServiceId = Number(formData.get("eventServiceId"));
  const userId = Number(formData.get("userId"));
  if (!Number.isFinite(eventServiceId) || eventServiceId <= 0) {
    throw new Error("خدمة المناسبة غير صالحة.");
  }
  if (!Number.isFinite(userId) || userId <= 0) {
    throw new Error("اختاري موظفاً.");
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, active: true },
  });
  if (!user) throw new Error("الموظف غير موجود أو معطّل.");

  const dup = await prisma.eventServiceEmployee.findFirst({
    where: { eventServiceId, userId },
  });
  if (dup) throw new Error("هذا الموظف معيّن مسبقاً على نفس الموعد.");

  const jobTitle = String(formData.get("jobTitle") ?? "").trim() || null;
  const salaryRaw = String(formData.get("salary") ?? "").trim();
  const bonusRaw = String(formData.get("bonus") ?? "").trim();
  const supervisorRaw = String(formData.get("supervisorId") ?? "").trim();
  const salary = salaryRaw ? Number(salaryRaw) : null;
  const bonus = bonusRaw ? Number(bonusRaw) : null;
  if (salaryRaw && (!Number.isFinite(salary) || (salary ?? 0) < 0)) {
    throw new Error("الراتب غير صالح.");
  }
  if (bonusRaw && (!Number.isFinite(bonus) || (bonus ?? 0) < 0)) {
    throw new Error("المكافأة غير صالحة.");
  }
  const supervisorId = supervisorRaw ? Number(supervisorRaw) : null;
  if (supervisorId && supervisorId === userId) {
    throw new Error("المشرف لا يكون نفس الموظف.");
  }

  await prisma.eventServiceEmployee.create({
    data: {
      eventServiceId,
      userId,
      jobTitle,
      salary,
      bonus,
      supervisorId:
        supervisorId && Number.isFinite(supervisorId) ? supervisorId : null,
    },
  });

  if (Number.isFinite(eventId) && eventId > 0) {
    revalidatePath(`/admin/events/${eventId}`);
  }
  revalidatePath("/admin/employees");
  revalidatePath(`/admin/employees/${userId}`);
  revalidatePath("/admin/my-assignments");
}

export async function unassignEmployee(formData: FormData) {
  const id = Number(formData.get("recordId") ?? formData.get("id"));
  const eventId = Number(formData.get("eventId"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  await prisma.eventServiceEmployee.delete({ where: { id } });
  if (Number.isFinite(eventId) && eventId > 0) {
    revalidatePath(`/admin/events/${eventId}`);
  }
  revalidatePath("/admin/employees");
  revalidatePath("/admin/my-assignments");
}
