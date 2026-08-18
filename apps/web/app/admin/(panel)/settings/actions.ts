"use server";

import { requireManager } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

function safeTab(raw: string) {
  if (raw === "about" || raw === "social" || raw === "contact") return raw;
  return "contact";
}

export async function saveSiteSettings(formData: FormData) {
  await requireManager();
  const tab = safeTab(String(formData.get("_tab") ?? "contact"));

  try {
    for (const key of SITE_SETTING_KEYS) {
      if (!formData.has(key)) continue;
      let value = String(formData.get(key) ?? "").trim();
      if (SOCIAL_KEYS.has(key) && value) {
        value = sanitizeExternalHttpUrl(value, "رابط السوشيال") ?? "";
      }
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  } catch (err) {
    const msg =
      err instanceof Error && err.message.trim()
        ? err.message.trim()
        : "تعذّر حفظ الإعدادات.";
    redirect(
      `/admin/settings?tab=${tab}&error=${encodeURIComponent(msg)}`,
    );
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/book");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidatePath("/faq");
  revalidatePath("/portfolio");

  redirect(`/admin/settings?tab=${tab}&saved=1`);
}
