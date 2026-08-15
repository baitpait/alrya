import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicChrome } from "@/components/public/PublicChrome";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "من نحن",
  description: "استوديو الراية — علامة الجودة والاحتراف",
};
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const headline = settings.about_headline.trim() || "استوديو الراية";
  const body =
    settings.about_body.trim() ||
    "نوثّق مناسباتكم باحتراف. شعارنا: علامة الجودة والاحتراف.";

  return (
    <PublicChrome>
      <main className="public-page">
        <div className="public-page-inner about-page">
          <Image
            src="/branding/alraya-studio-logo.png"
            alt="استوديو الراية — علامة الجودة والاحتراف"
            width={140}
            height={140}
            priority
          />
          <h1>{headline}</h1>
          <p className="public-tagline">علامة الجودة والاحتراف</p>
          <p className="public-lead">{body}</p>
          {settings.address_text.trim() ? (
            <p>العنوان: {settings.address_text}</p>
          ) : null}
          <p>
            <Link className="landing-cta" href="/book">
              احجز الآن
            </Link>
          </p>
          <p>
            <Link className="landing-admin-link" href="/contact">
              تواصل معنا
            </Link>
          </p>
        </div>
      </main>
    </PublicChrome>
  );
}
