"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function requireText(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} مطلوب.`);
  return text;
}

function parsePublished(raw: FormDataEntryValue | null) {
  const v = String(raw ?? "");
  return v === "1" || v === "true" || v === "on";
}

function parseSort(raw: FormDataEntryValue | null) {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function revalidatePublic() {
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

export async function createFaqItem(formData: FormData) {
  const question = requireText(formData.get("question"), "السؤال");
  const answer = requireText(formData.get("answer"), "الجواب");
  await prisma.faqItem.create({
    data: {
      question,
      answer,
      sortOrder: parseSort(formData.get("sortOrder")),
      published: parsePublished(formData.get("published")),
    },
  });
  revalidatePublic();
}

export async function updateFaqItem(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");
  const question = requireText(formData.get("question"), "السؤال");
  const answer = requireText(formData.get("answer"), "الجواب");
  await prisma.faqItem.update({
    where: { id },
    data: {
      question,
      answer,
      sortOrder: parseSort(formData.get("sortOrder")),
      published: parsePublished(formData.get("published")),
    },
  });
  revalidatePublic();
  revalidatePath(`/admin/faq/${id}`);
  redirect("/admin/faq");
}

export async function deleteFaqItem(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");
  await prisma.faqItem.delete({ where: { id } });
  revalidatePublic();
  redirect("/admin/faq");
}
