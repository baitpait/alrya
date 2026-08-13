import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PublicChrome } from "@/components/public/PublicChrome";
import { BookForm } from "./BookForm";

export const metadata: Metadata = { title: "حجز أونلاين" };
export const dynamic = "force-dynamic";

export default async function BookPage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

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
          <h1>طلب حجز</h1>
          <p>اتركوا بياناتكم ونتواصل لتأكيد الموعد — لا يُنشأ عقد تلقائياً.</p>
        </header>
        <BookForm services={services} />
        <Link className="book-back" href="/contact">
          تواصل معنا
        </Link>
        <Link className="book-back" href="/" style={{ marginInlineStart: "1rem" }}>
          ← العودة للرئيسية
        </Link>
      </div>
    </main>
    </PublicChrome>
  );
}
