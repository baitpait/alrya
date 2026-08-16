"use server";

import { requireManager } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { ContactMessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function markMessageRead(formData: FormData) {
  await requireManager();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  await prisma.contactMessage.update({
    where: { id },
    data: { status: ContactMessageStatus.READ, readAt: new Date() },
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
  revalidatePath("/admin");
}

export async function archiveMessage(formData: FormData) {
  await requireManager();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  await prisma.contactMessage.update({
    where: { id },
    data: { status: ContactMessageStatus.ARCHIVED },
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
  revalidatePath("/admin");
}

export async function deleteMessage(formData: FormData) {
  await requireManager();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
