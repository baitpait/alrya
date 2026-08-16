"use server";

import { requireManager } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SITE_SETTING_KEYS, type SiteSettingKey } from "@/lib/site-settings";
import { sanitizeExternalHttpUrl } from "@/lib/safe-url";

const SOCIAL_KEYS = new Set<SiteSettingKey>([
  "social_instagram",
  "social_facebook",
  "social_tiktok",
  "social_youtube",
  "social_snapchat",
]);

export async function saveSiteSettings(formData: FormData) {
  await requireManager();
  for (const key of SITE_SETTING_KEYS) {
    let value = String(formData.get(key) ?? "").trim();
    if (SOCIAL_KEYS.has(key) && value) {
      value = sanitizeExternalHttpUrl(value, key) ?? "";
    }
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
  revalidatePath("/about");
  revalidatePath("/faq");
  revalidatePath("/portfolio");
}
