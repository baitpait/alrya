"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function requireText(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} مطلوب.`);
  return text;
}

function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function parseArabicDateParts(
  formData: FormData,
  prefix: string,
  label: string,
): Date | null {
  const day = String(formData.get(`${prefix}Day`) ?? "").trim();
  const month = String(formData.get(`${prefix}Month`) ?? "").trim();
  const year = String(formData.get(`${prefix}Year`) ?? "").trim();

  if (!day && !month && !year) return null;
  if (!day || !month || !year) {
    throw new Error(`${label}: اختاري اليوم والشهر والسنة معاً، أو اتركيهما فارغين.`);
  }

  const date = new Date(`${year}-${month}-${day}T12:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} غير صالح.`);
  // رفض تواريخ مثل 31 فبراير
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() + 1 !== Number(month) ||
    date.getDate() !== Number(day)
  ) {
    throw new Error(`${label} غير موجود في التقويم.`);
  }
  return date;
}

export type BookState = { error?: string };

export async function submitBookingRequest(
  _prev: BookState,
  formData: FormData,
): Promise<BookState> {
  try {
    const groomName = requireText(formData.get("groomName"), "اسم العريس / صاحب المناسبة");
    const phone = requireText(formData.get("phone"), "رقم الهاتف");
    const brideName = optionalText(formData.get("brideName"));
    const altPhone = optionalText(formData.get("altPhone"));
    const city = optionalText(formData.get("city"));
    const venue = optionalText(formData.get("venue"));
    const hall = optionalText(formData.get("hall"));
    const notes = optionalText(formData.get("notes"));

    const serviceRaw = String(formData.get("serviceId") ?? "").trim();
    let serviceId: number | null = null;
    if (serviceRaw) {
      serviceId = Number(serviceRaw);
      if (!Number.isFinite(serviceId) || serviceId <= 0) {
        throw new Error("الخدمة غير صالحة.");
      }
      const service = await prisma.service.findFirst({
        where: { id: serviceId, active: true },
      });
      if (!service) throw new Error("الخدمة غير موجودة.");
    }

    const preferredFrom = parseArabicDateParts(formData, "preferredFrom", "التاريخ من");
    const preferredTo = parseArabicDateParts(formData, "preferredTo", "التاريخ إلى");
    if (preferredFrom && preferredTo && preferredTo < preferredFrom) {
      throw new Error("تاريخ النهاية يجب أن يكون بعد البداية أو يساويها.");
    }

    await prisma.bookingRequest.create({
      data: {
        groomName,
        brideName,
        phone,
        altPhone,
        serviceId,
        preferredFrom,
        preferredTo,
        city,
        venue,
        hall,
        notes,
      },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "تعذر إرسال الطلب." };
  }

  redirect("/book/thanks");
}
