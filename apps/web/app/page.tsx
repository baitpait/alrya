import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicChrome } from "@/components/public/PublicChrome";
import { isSafeHttpUrl, isSafeLocalPath } from "@/lib/safe-url";

export const metadata: Metadata = {
  title: "استوديو الراية — حجز مناسبات",
  description: "سجّل موعدك مع استوديو الراية — علامة الجودة والاحتراف",
};
export const dynamic = "force-dynamic";

function safeMediaSrc(raw: string | null | undefined) {
  const s = (raw ?? "").trim();
  if (!s) return null;
  if (isSafeLocalPath(s) || isSafeHttpUrl(s)) return s;
  return null;
}

function safePhotoThumb(raw: string | null | undefined) {
  const s = safeMediaSrc(raw);
  if (!s) return null;
  if (/\.svg($|\?)/i.test(s)) return null;
  return s;
}

const FEATURES = [
  { title: "ليلة الحنا", text: "توثيق هادئ وقريب من العيلة." },
  { title: "ليلة العرس", text: "تغطية كاملة للصالة واللحظات." },
  { title: "جلسات خاصة", text: "صور بروح الاستوديو وهوية الراية." },
];

export default async function HomePage() {
  const works = await prisma.galleryItem.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
    take: 6,
  });

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
              width={176}
              height={176}
              priority
            />
            <h1 className="landing-headline">نوثّق لحظاتكم بأناقة واحتراف</h1>
            <p className="landing-lead">أعراس · حنا · جلسات تصوير — علامة الجودة والاحتراف</p>
            <Link className="landing-cta landing-cta--hero" href="/book">
              سجّل طلب حجز
            </Link>
          </div>
        </section>

        <section className="landing-section" aria-label="خدمات التصوير">
          <div className="landing-section-inner">
            <h2 className="landing-kicker">تصوير يناسب مناسبتكم</h2>
            <ul className="landing-features">
              {FEATURES.map((f) => (
                <li key={f.title} className="landing-feature">
                  <span className="landing-feature-mark" aria-hidden="true" />
                  <strong>{f.title}</strong>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="landing-section landing-section--works" aria-labelledby="home-works">
          <div className="landing-section-inner">
            <div className="landing-section-head">
              <h2 id="home-works">أعمالنا</h2>
              <Link className="landing-text-link" href="/portfolio">
                كل الأعمال
              </Link>
            </div>
            {works.length === 0 ? (
              <p className="landing-empty">المعرض قيد التحديث.</p>
            ) : (
              <ul className="landing-features">
                {works.map((item) => {
                  const photo = safePhotoThumb(item.imageUrl);
                  return (
                    <li key={item.id}>
                      <Link href="/portfolio" className="landing-feature landing-feature--link">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="landing-feature-thumb" src={photo} alt="" />
                        ) : (
                          <span className="landing-feature-mark" aria-hidden="true" />
                        )}
                        <strong>{item.title}</strong>
                        <span>{item.caption?.trim() || "من معرض الاستوديو"}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="landing-section landing-section--cta">
          <div className="landing-section-inner">
            <h2>جاهزون لتوثيق مناسبتكم</h2>
            <p>اتركوا طلبكم ونتواصل معكم لتثبيت الموعد.</p>
            <Link className="landing-cta landing-cta--hero" href="/book">
              سجّل طلب حجز
            </Link>
          </div>
        </section>
      </div>
    </PublicChrome>
  );
}
