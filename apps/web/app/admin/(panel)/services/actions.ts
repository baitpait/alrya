"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ServiceKind } from "@prisma/client";

function requireName(value: FormDataEntryValue | null, label: string) {
  const name = String(value ?? "").trim();
  if (!name) {
    throw new Error(`${label} مطلوب.`);
  }
  return name;
}

export async function createService(formData: FormData) {
  const name = requireName(formData.get("name"), "اسم الخدمة");
  const kindRaw = String(formData.get("kind") ?? "EVENT");
  const kind = kindRaw === "SESSION" ? ServiceKind.SESSION : ServiceKind.EVENT;

  await prisma.service.create({
    data: { name, kind, active: true },
  });

  revalidatePath("/admin/services");
}

export async function updateService(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("معرّف الخدمة غير صالح.");
  }

  const name = requireName(formData.get("name"), "اسم الخدمة");
  const kindRaw = String(formData.get("kind") ?? "EVENT");
  const kind = kindRaw === "SESSION" ? ServiceKind.SESSION : ServiceKind.EVENT;
  const active = formData.get("active") === "on";

  await prisma.service.update({
    where: { id },
    data: { name, kind, active },
  });

  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${id}`);
}

export async function setServiceActive(formData: FormData) {
  const id = Number(formData.get("id"));
  const active = formData.get("active") === "true";
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("معرّف الخدمة غير صالح.");
  }

  await prisma.service.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${id}`);
}

export async function createOffer(formData: FormData) {
  const serviceId = Number(formData.get("serviceId"));
  if (!Number.isFinite(serviceId) || serviceId <= 0) {
    throw new Error("معرّف الخدمة غير صالح.");
  }

  const name = requireName(formData.get("name"), "اسم العرض");
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = Number(priceRaw);
  if (!priceRaw || !Number.isFinite(price) || price < 0) {
    throw new Error("السعر مطلوب ويجب أن يكون رقماً صحيحاً.");
  }

  const audience = String(formData.get("audience") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const listPriceRaw = String(formData.get("listPrice") ?? "").trim();
  let listPrice: number | null = null;
  if (listPriceRaw) {
    listPrice = Number(listPriceRaw);
    if (!Number.isFinite(listPrice) || listPrice < 0) {
      throw new Error("سعر البدل يجب أن يكون رقماً صالحاً.");
    }
  }

  await prisma.offer.create({
    data: {
      serviceId,
      name,
      price,
      listPrice,
      audience,
      description,
    },
  });

  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${serviceId}`);
}

export async function updateOffer(formData: FormData) {
  const id = Number(formData.get("id"));
  const serviceId = Number(formData.get("serviceId"));
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(serviceId) || serviceId <= 0) {
    throw new Error("معرّف غير صالح.");
  }

  const name = requireName(formData.get("name"), "اسم العرض");
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = Number(priceRaw);
  if (!priceRaw || !Number.isFinite(price) || price < 0) {
    throw new Error("السعر مطلوب ويجب أن يكون رقماً صحيحاً.");
  }

  const audience = String(formData.get("audience") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const listPriceRaw = String(formData.get("listPrice") ?? "").trim();
  let listPrice: number | null = null;
  if (listPriceRaw) {
    listPrice = Number(listPriceRaw);
    if (!Number.isFinite(listPrice) || listPrice < 0) {
      throw new Error("سعر البدل يجب أن يكون رقماً صالحاً.");
    }
  }

  await prisma.offer.update({
    where: { id },
    data: { name, price, listPrice, audience, description },
  });

  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${serviceId}`);
}

export async function deleteOffer(formData: FormData) {
  const id = Number(formData.get("recordId") ?? formData.get("id"));
  const serviceId = Number(formData.get("serviceId"));
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("معرّف العرض غير صالح.");
  }

  await prisma.offer.delete({ where: { id } });

  revalidatePath("/admin/services");
  if (Number.isFinite(serviceId) && serviceId > 0) {
    revalidatePath(`/admin/services/${serviceId}`);
  }
}
