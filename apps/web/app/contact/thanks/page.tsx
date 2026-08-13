import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PublicChrome } from "@/components/public/PublicChrome";

export const metadata: Metadata = { title: "تم استلام الرسالة" };

export default function ContactThanksPage() {
  return (
    <PublicChrome>
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
            <h1>وصلت رسالتكم</h1>
            <p>شكراً لتواصلكم مع استوديو الراية. نرد عليكم في أقرب وقت.</p>
            <Link className="landing-cta" href="/">
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </main>
    </PublicChrome>
  );
}
