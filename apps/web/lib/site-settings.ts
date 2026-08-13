import { prisma } from "@/lib/prisma";

export const SITE_SETTING_KEYS = [
  "whatsapp_number",
  "whatsapp_default_message",
  "phone_public",
  "email_public",
  "social_instagram",
  "social_facebook",
  "social_tiktok",
  "social_youtube",
  "social_snapchat",
  "address_text",
] as const;

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];

export type SiteSettings = Record<SiteSettingKey, string>;

const EMPTY: SiteSettings = {
  whatsapp_number: "",
  whatsapp_default_message: "",
  phone_public: "",
  email_public: "",
  social_instagram: "",
  social_facebook: "",
  social_tiktok: "",
  social_youtube: "",
  social_snapchat: "",
  address_text: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: [...SITE_SETTING_KEYS] } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...EMPTY, ...map };
}

export function digitsOnly(raw: string) {
  return raw.replace(/\D/g, "");
}

export function waMeUrl(number: string, message?: string) {
  const digits = digitsOnly(number);
  if (!digits) return null;
  const text = (message ?? "").trim();
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${q}`;
}

export type SocialLink = {
  key: SiteSettingKey;
  label: string;
  href: string;
};

export function visibleSocialLinks(settings: SiteSettings): SocialLink[] {
  const items: { key: SiteSettingKey; label: string }[] = [
    { key: "social_instagram", label: "إنستغرام" },
    { key: "social_facebook", label: "فيسبوك" },
    { key: "social_tiktok", label: "تيك توك" },
    { key: "social_youtube", label: "يوتيوب" },
    { key: "social_snapchat", label: "سناب شات" },
  ];
  return items
    .map((item) => ({ ...item, href: settings[item.key].trim() }))
    .filter((item) => item.href.length > 0);
}
