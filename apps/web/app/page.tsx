import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
      }}
    >
      <h1>استوديو الراية</h1>
      <p>المرحلة 0 — تأسيس المشروع وقاعدة البيانات</p>
      <ul>
        <li>Next.js: يعمل</li>
        <li>
          MySQL عبر Prisma:{" "}
          {dbOk ? `متصل · ${tableCount} جدول` : `غير متصل — ${errorMessage}`}
        </li>
      </ul>
      <p>
        الواجهة الإدارية (NexLink / RTL / theme-btn) تبدأ في{" "}
        <strong>المرحلة 1</strong>.
      </p>
    </main>
  );
}
