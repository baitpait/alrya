"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ContactMessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function readMessageId(formData: FormData) {
  const id = Number(
    formData.get("messageId") ?? formData.get("recordId") ?? formData.get("id"),
  );
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");
  return id;
}

export async function markMessageRead(formData: FormData) {
  const id = readMessageId(formData);

  await prisma.contactMessage.update({
    where: { id },
    data: { status: ContactMessageStatus.READ, readAt: new Date() },
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
  revalidatePath("/admin");
}

export async function archiveMessage(formData: FormData) {
  const id = readMessageId(formData);

  await prisma.contactMessage.update({
    where: { id },
    data: { status: ContactMessageStatus.ARCHIVED },
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
  revalidatePath("/admin");
}

export async function deleteMessage(formData: FormData) {
  const id = readMessageId(formData);

  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  redirect("/admin/messages");
}
