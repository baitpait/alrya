import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicChrome } from "@/components/public/PublicChrome";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description: "إجابات عن الحجز والعربون والتسليم في استوديو الراية",
};
export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const items = await prisma.faqItem.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  return (
    <PublicChrome>
      <main className="public-page">
        <div className="public-page-inner">
          <h1>الأسئلة الشائعة</h1>
          <p className="public-lead">
            إجابات سريعة قبل ما تتصلوا — وإذا ما لقيتوا جوابكم، راسلونا من صفحة التواصل.
          </p>
          {items.length === 0 ? (
            <p>لا أسئلة منشورة حالياً.</p>
          ) : (
            <div className="faq-list">
              {items.map((item) => (
                <details key={item.id} className="faq-item">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          )}
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
