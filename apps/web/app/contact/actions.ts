"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

export type ContactState = { error?: string };

export async function submitContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    redirect("/contact/thanks");
  }

  try {
    const name = requireText(formData.get("name"), "الاسم");
    const phone = requireText(formData.get("phone"), "رقم الهاتف");
    const body = requireText(formData.get("body"), "الرسالة");
    const email = optionalText(formData.get("email"));
    const subject = optionalText(formData.get("subject"));

    await prisma.contactMessage.create({
      data: {
        name,
        phone,
        email,
        subject,
        body,
        source: "contact_page",
      },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "تعذر إرسال الرسالة." };
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  redirect("/contact/thanks");
}
