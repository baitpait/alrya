import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import { saveSiteSettings } from "./actions";

export const metadata: Metadata = { title: "الإعدادات" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>إعدادات الموقع</h1>
        <p>
          رقم واتساب وروابط السوشيال تظهر على الصفحات العامة فوراً. اتركي الرابط
          فارغاً لإخفاء الأيقونة. نص «من نحن» يظهر في `/about`.
        </p>

        <form action={saveSiteSettings} className="inline-form">
          <h2>واتساب العائم</h2>
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

          <h2>من نحن</h2>
          <label>
            عنوان الصفحة
            <input name="about_headline" defaultValue={settings.about_headline} />
          </label>
          <label>
            نص القصة
            <textarea name="about_body" rows={5} defaultValue={settings.about_body} />
          </label>

          <h2>السوشيال</h2>
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
          <button type="submit">حفظ الإعدادات</button>
        </form>
      </section>
    </div>
  );
}
