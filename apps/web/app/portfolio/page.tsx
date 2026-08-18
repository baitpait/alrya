import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicChrome } from "@/components/public/PublicChrome";
import { isSafeHttpUrl, isSafeLocalPath } from "@/lib/safe-url";

export const metadata: Metadata = {
  title: "أعمالنا",
  description: "معرض أعمال استوديو الراية — أعراس وجلسات تصوير",
};
export const dynamic = "force-dynamic";

function safeMediaSrc(raw: string | null | undefined) {
  const s = (raw ?? "").trim();
  if (!s) return null;
  if (isSafeLocalPath(s) || isSafeHttpUrl(s)) return s;
  return null;
}

export default async function PortfolioPage() {
  const items = await prisma.galleryItem.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
  });

  return (
    <PublicChrome>
      <main className="public-page">
        <div className="public-page-inner">
          <h1>أعمالنا</h1>
          <p className="public-lead">
            لمحات من توثيق الأعراس والجلسات. احجزوا مناسبتكم وخلّوا ذكرياتكم بأعلى جودة.
          </p>
          {items.length === 0 ? (
            <p>المعرض قيد التحديث — تقدروا تشوفوا نماذج بعد إضافة الأعمال من لوحة الإدارة.</p>
          ) : (
            <ul className="portfolio-grid">
              {items.map((item) => {
                const imageSrc = (() => {
                  const s = safeMediaSrc(item.imageUrl);
                  if (!s || /\.svg($|\?)/i.test(s)) return null;
                  return s;
                })();
                const videoHref =
                  item.videoUrl && isSafeHttpUrl(item.videoUrl) ? item.videoUrl : null;
                return (
                  <li key={item.id} className="portfolio-card">
                    {imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageSrc} alt={item.title} />
                    ) : (
                      <div className="portfolio-placeholder">{item.title}</div>
                    )}
                    <div className="portfolio-card-body">
                      <h2>{item.title}</h2>
                      {item.caption ? <p>{item.caption}</p> : null}
                      {videoHref ? (
                        <a href={videoHref} target="_blank" rel="noopener noreferrer">
                          شاهد الفيديو
                        </a>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p>
            <Link className="landing-cta" href="/book">
              احجز الآن
            </Link>
          </p>
        </div>
      </main>
    </PublicChrome>
  );
}
