import type { Metadata } from "next";
import Link from "next/link";
import { ContactMessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "رسائل التواصل" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<ContactMessageStatus, string> = {
  NEW: "جديدة",
  READ: "مقروءة",
  ARCHIVED: "مؤرشفة",
};

type Props = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

function formatDateTimeAr(d: Date) {
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function AdminMessagesPage({ searchParams }: Props) {
  const { q: qRaw, status: statusRaw } = await searchParams;
  const q = (qRaw ?? "").trim();
  const statusFilter = (statusRaw ?? "").trim();
  const status =
    statusFilter && statusFilter in STATUS_LABEL
      ? (statusFilter as ContactMessageStatus)
      : undefined;

  const [messages, newCount] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { phone: { contains: q } },
                { subject: { contains: q } },
                { body: { contains: q } },
              ],
            }
          : {}),
      },
    }),
    prisma.contactMessage.count({ where: { status: ContactMessageStatus.NEW } }),
  ]);

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>رسائل التواصل</h1>
        <p>
          استفسارات صفحة «تواصل معنا» — منفصلة عن طلبات الحجز. غير مقروءة:{" "}
          <strong>{newCount}</strong>
        </p>

        <form method="get" className="inline-form" style={{ marginBottom: "1rem" }}>
          <label>
            بحث (اسم / هاتف / موضوع)
            <input name="q" defaultValue={q} placeholder="مثال: أحمد" />
          </label>
          <label>
            الحالة
            <select name="status" defaultValue={statusFilter}>
              <option value="">الكل</option>
              {(Object.keys(STATUS_LABEL) as ContactMessageStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">تصفية</button>
          {q || statusFilter ? (
            <Link className="text-link" href="/admin/messages">
              مسح الفلتر
            </Link>
          ) : null}
        </form>

        {messages.length === 0 ? (
          <p>{q || statusFilter ? "لا نتائج لهذا الفلتر." : "لا رسائل بعد."}</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>الهاتف</th>
                  <th>الموضوع</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.name}</td>
                    <td className="cell-ltr">{m.phone}</td>
                    <td>{m.subject || "—"}</td>
                    <td>{STATUS_LABEL[m.status]}</td>
                    <td className="cell-ltr">{formatDateTimeAr(m.createdAt)}</td>
                    <td>
                      <Link className="text-link" href={`/admin/messages/${m.id}`}>
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
