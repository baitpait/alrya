"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SITE_SETTING_KEYS } from "@/lib/site-settings";

export async function saveSiteSettings(formData: FormData) {
  for (const key of SITE_SETTING_KEYS) {
    const value = String(formData.get(key) ?? "").trim();
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/book");
  revalidatePath("/contact");
}
