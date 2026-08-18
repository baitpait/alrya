import type { Metadata } from "next";
import Link from "next/link";
import { SettingsTabs, type SettingsTabId } from "@/components/admin/SettingsTabs";
import { GallerySettingsPanel } from "@/components/admin/GallerySettingsPanel";
import { FaqSettingsPanel } from "@/components/admin/FaqSettingsPanel";
import { getSiteSettings } from "@/lib/site-settings";
import { saveSiteSettings } from "./actions";

export const metadata: Metadata = { title: "الإعدادات" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    tab?: string;
    saved?: string;
    error?: string;
    q?: string;
    published?: string;
  }>;
};

function parseTab(raw: string | undefined): SettingsTabId {
  if (
    raw === "about" ||
    raw === "social" ||
    raw === "contact" ||
    raw === "gallery" ||
    raw === "faq"
  ) {
    return raw;
  }
  return "contact";
}

export default async function AdminSettingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab = parseTab(sp.tab);
  const saved = sp.saved === "1";
  const error = (sp.error ?? "").trim();
  const q = sp.q ?? "";
  const published = sp.published ?? "";
  const settings = await getSiteSettings();

  return (
    <div className="stack-gap">
      <section className="panel">
        <div className="calendar-toolbar">
          <h1>إعدادات الموقع</h1>
          <div className="calendar-toolbar-actions">
            <Link className="btn-secondary" href="/" target="_blank">
              الرئيسية
            </Link>
            <Link className="btn-secondary" href="/about" target="_blank">
              من نحن
            </Link>
            <Link className="btn-secondary" href="/contact" target="_blank">
              تواصل
            </Link>
            {tab === "gallery" ? (
              <Link className="btn-secondary" href="/portfolio" target="_blank">
                المعرض
              </Link>
            ) : null}
            {tab === "faq" ? (
              <Link className="btn-secondary" href="/faq" target="_blank">
                الأسئلة
              </Link>
            ) : null}
          </div>
        </div>

        {saved ? (
          <p className="settings-flash settings-flash--ok" role="status">
            تم حفظ الإعدادات بنجاح.
          </p>
        ) : null}
        {error ? (
          <p className="settings-flash settings-flash--err" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      <SettingsTabs
        initialTab={tab}
        contact={
          <section className="panel">
            <h2>تواصل وواتساب</h2>
            <form action={saveSiteSettings} className="inline-form">
              <input type="hidden" name="_tab" value="contact" />
              <label>
                رقم واتساب (مع رمز الدولة، بدون +)
                <input
                  className="input-ltr"
                  name="whatsapp_number"
                  defaultValue={settings.whatsapp_number}
                  placeholder="97059xxxxxxx"
                />
              </label>
              <label>
                رسالة افتراضية عند فتح واتساب
                <input
                  name="whatsapp_default_message"
                  defaultValue={settings.whatsapp_default_message}
                  placeholder="مرحبا، أريد الاستفسار عن…"
                />
              </label>
              <label>
                هاتف ظاهر للعامة
                <input
                  className="input-ltr"
                  name="phone_public"
                  defaultValue={settings.phone_public}
                />
              </label>
              <label>
                بريد ظاهر للعامة
                <input
                  className="input-ltr"
                  name="email_public"
                  type="email"
                  defaultValue={settings.email_public}
                />
              </label>
              <label>
                العنوان
                <input name="address_text" defaultValue={settings.address_text} />
              </label>
              <button type="submit" className="btn-primary">
                حفظ التواصل
              </button>
            </form>
          </section>
        }
        about={
          <section className="panel">
            <h2>من نحن</h2>
            <form action={saveSiteSettings} className="inline-form">
              <input type="hidden" name="_tab" value="about" />
              <label>
                عنوان الصفحة
                <input
                  name="about_headline"
                  defaultValue={settings.about_headline}
                />
              </label>
              <label>
                نص القصة
                <textarea
                  name="about_body"
                  rows={6}
                  defaultValue={settings.about_body}
                />
              </label>
              <button type="submit" className="btn-primary">
                حفظ من نحن
              </button>
            </form>
          </section>
        }
        social={
          <section className="panel">
            <h2>السوشيال</h2>
            <form action={saveSiteSettings} className="inline-form">
              <input type="hidden" name="_tab" value="social" />
              <label>
                إنستغرام (https فقط)
                <input
                  className="input-ltr"
                  name="social_instagram"
                  defaultValue={settings.social_instagram}
                  placeholder="https://instagram.com/…"
                />
              </label>
              <label>
                فيسبوك (https فقط)
                <input
                  className="input-ltr"
                  name="social_facebook"
                  defaultValue={settings.social_facebook}
                  placeholder="https://facebook.com/…"
                />
              </label>
              <label>
                تيك توك
                <input
                  className="input-ltr"
                  name="social_tiktok"
                  defaultValue={settings.social_tiktok}
                />
              </label>
              <label>
                يوتيوب
                <input
                  className="input-ltr"
                  name="social_youtube"
                  defaultValue={settings.social_youtube}
                />
              </label>
              <label>
                سناب شات
                <input
                  className="input-ltr"
                  name="social_snapchat"
                  defaultValue={settings.social_snapchat}
                />
              </label>
              <button type="submit" className="btn-primary">
                حفظ السوشيال
              </button>
            </form>
          </section>
        }
        gallery={<GallerySettingsPanel q={q} published={published} />}
        faq={<FaqSettingsPanel q={q} published={published} />}
      />
    </div>
  );
}
