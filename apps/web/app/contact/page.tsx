import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PublicChrome } from "@/components/public/PublicChrome";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = { title: "تواصل معنا" };

export default function ContactPage() {
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
            <h1>تواصل معنا</h1>
            <p>استفسار عام — لطلب حجز مناسبة استخدمي صفحة الحجز.</p>
          </header>
          <ContactForm />
          <p>
            <Link className="book-back" href="/book">
              طلب حجز مناسبة
            </Link>
          </p>
          <Link className="book-back" href="/">
            ← العودة للرئيسية
          </Link>
        </div>
      </main>
    </PublicChrome>
  );
}
