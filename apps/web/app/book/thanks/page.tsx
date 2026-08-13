import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = { title: "تم استلام الطلب" };

export default function BookThanksPage() {
  return (
    <main className="book-page">
      <div className="book-shell">
        <header>
          <Image
            src="/branding/alraya-studio-logo.png"
            alt="استوديو الراية"
            width={88}
            height={88}
            priority
          />
        </header>
        <div className="thanks-card">
          <h1>شكراً لكم</h1>
          <p>
            وصل طلبكم لاستوديو الراية. فريقنا بيتواصل معكم قريباً لتثبيت التفاصيل
            والموعد.
          </p>
          <Link className="landing-cta" href="/">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
