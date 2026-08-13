import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "استوديو الراية",
  description: "منصة إدارة استوديو الراية",
};

export default async function Home() {
  let dbOk = false;
  let tableCount = 0;
  let errorMessage: string | null = null;

  try {
    const rows = await prisma.$queryRaw<{ c: bigint }[]>`
      SELECT COUNT(*) AS c
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
    `;
    tableCount = Number(rows[0]?.c ?? 0);
    dbOk = true;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "تعذر الاتصال بقاعدة البيانات";
  }

  return (
    <main
      style={{
        fontFamily: "Tahoma, Arial, sans-serif",
        direction: "rtl",
        padding: "2rem",
        maxWidth: "40rem",
        margin: "0 auto",
        lineHeight: 1.7,
        textAlign: "center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/branding/alraya-studio-logo.png"
        alt="استوديو الراية — علامة الجودة والاحتراف"
        width={160}
        height={160}
        style={{
          width: 160,
          height: 160,
          objectFit: "contain",
          borderRadius: "0.75rem",
          marginBottom: "1rem",
        }}
      />
      <h1>استوديو الراية</h1>
      <p style={{ color: "#6b7280", marginTop: 0 }}>علامة الجودة والاحتراف</p>
      <p>لوحة الإدارة جاهزة للتشغيل</p>
      <ul>
        <li>Next.js: يعمل</li>
        <li>
          MySQL عبر Prisma:{" "}
          {dbOk ? `متصل · ${tableCount} جدول` : `غير متصل — ${errorMessage}`}
        </li>
      </ul>
      <p style={{ marginTop: "1.25rem" }}>
        <Link
          href="/admin"
          style={{
            display: "inline-block",
            padding: "0.65rem 1rem",
            background: "#5955D1",
            color: "#fff",
            borderRadius: "0.6rem",
            textDecoration: "none",
          }}
        >
          الدخول إلى لوحة الإدارة
        </Link>
      </p>
    </main>
  );
}
