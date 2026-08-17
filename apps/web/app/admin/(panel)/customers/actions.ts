"use server";

import { requireManager } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function requireText(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} مطلوب.`);
  return text;
}

function parseGender(raw: string): Gender | null {
  if (raw === "MALE") return Gender.MALE;
  if (raw === "FEMALE") return Gender.FEMALE;
  return null;
}

export async function createCustomer(formData: FormData) {
  await requireManager();
  const firstName = requireText(formData.get("firstName"), "الاسم الأول");
  const lastName = requireText(formData.get("lastName"), "اسم العائلة");
  const phone = requireText(formData.get("phone"), "الهاتف");
  const altPhone = String(formData.get("altPhone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const nationalId = String(formData.get("nationalId") ?? "").trim() || null;
  const gender = parseGender(String(formData.get("gender") ?? ""));

  await prisma.customer.create({
    data: {
      firstName,
      lastName,
      phone,
      altPhone,
      email,
      address,
      nationalId,
      gender,
    },
  });

  revalidatePath("/admin/customers");
  revalidatePath("/admin/events");
}

export async function updateCustomer(formData: FormData) {
  await requireManager();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف الزبون غير صالح.");

  const firstName = requireText(formData.get("firstName"), "الاسم الأول");
  const lastName = requireText(formData.get("lastName"), "اسم العائلة");
  const phone = requireText(formData.get("phone"), "الهاتف");
  const altPhone = String(formData.get("altPhone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const nationalId = String(formData.get("nationalId") ?? "").trim() || null;
  const gender = parseGender(String(formData.get("gender") ?? ""));

  await prisma.customer.update({
    where: { id },
    data: {
      firstName,
      lastName,
      phone,
      altPhone,
      email,
      address,
      nationalId,
      gender,
    },
  });

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin/events");
}

export async function deleteCustomer(formData: FormData) {
  await requireManager();
  const id = Number(formData.get("recordId") ?? formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف الزبون غير صالح.");

  const eventsCount = await prisma.event.count({ where: { customerId: id } });
  if (eventsCount > 0) {
    throw new Error("لا يمكن حذف زبون لديه مناسبات. احذفي المناسبات أولاً أو عطّلي السجل لاحقاً.");
  }

  await prisma.customer.delete({ where: { id } });
  revalidatePath("/admin/customers");
}
