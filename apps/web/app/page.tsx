import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicChrome } from "@/components/public/PublicChrome";

export const metadata: Metadata = {
  title: "استوديو الراية — حجز مناسبات",
  description: "سجّل موعدك مع استوديو الراية — علامة الجودة والاحتراف",
};

export default function HomePage() {
  return (
    <PublicChrome>
    <div className="landing">
      <section className="landing-hero" aria-label="استوديو الراية">
        <div className="landing-hero-media" aria-hidden="true" />
        <div className="landing-hero-content">
          <Image
            className="landing-hero-logo"
            src="/branding/alraya-studio-logo.png"
            alt="استوديو الراية — علامة الجودة والاحتراف"
            width={200}
            height={200}
            priority
          />
          <h1 className="landing-headline">نوثّق لحظاتكم بأناقة واحتراف</h1>
          <p className="landing-lead">علامة الجودة والاحتراف — أعراس وجلسات تصوير</p>
          <Link className="landing-cta" href="/book">
            احجز الآن
          </Link>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-inner">
          <h2>تصوير يناسب مناسبتكم</h2>
          <p>
            من الحنا إلى ليلة العرس والجلسات الخاصة — فريق استوديو الراية معكم خطوة
            بخطوة. اتركوا طلبكم ونتواصل معكم لتثبيت الموعد.
          </p>
          <p>
            <Link className="landing-cta" href="/book">
              سجّل طلب حجز
            </Link>
          </p>
          <p style={{ marginTop: "1.25rem" }}>
            <Link className="landing-admin-link" href="/contact">
              تواصل معنا
            </Link>
          </p>
          <p style={{ marginTop: "2rem" }}>
            <Link className="landing-admin-link" href="/admin">
              دخول لوحة الإدارة
            </Link>
          </p>
        </div>
      </section>
    </div>
    </PublicChrome>
  );
}
