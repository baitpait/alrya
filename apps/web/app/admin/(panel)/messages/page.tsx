import type { Metadata } from "next";
import Link from "next/link";
import { ContactMessageStatus } from "@prisma/client";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { FilterChips, filterHref } from "@/components/admin/FilterChips";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "صندوق الرسائل" };
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
        <div className="calendar-toolbar">
          <h1>
            صندوق الرسائل
            {newCount > 0 ? ` (${newCount} جديدة)` : ""}
          </h1>
          <div className="calendar-toolbar-actions">
            <Link className="btn-secondary" href="/contact" target="_blank">
              معاينة النموذج
            </Link>
          </div>
        </div>

        <FilterChips
          items={[
            {
              href: filterHref("/admin/messages", { q }),
              label: "الكل",
              active: !statusFilter,
            },
            ...(Object.keys(STATUS_LABEL) as ContactMessageStatus[]).map((s) => ({
              href: filterHref("/admin/messages", { q, status: s }),
              label: STATUS_LABEL[s],
              active: statusFilter === s,
            })),
          ]}
        />

        <form method="get" className="inline-form" style={{ marginBottom: "1rem" }}>
          {statusFilter ? <input type="hidden" name="status" value={statusFilter} /> : null}
          <label>
            بحث (اسم / هاتف / موضوع)
            <input name="q" defaultValue={q} placeholder="مثال: أحمد" />
          </label>
          <button type="submit" className="btn-primary">
            بحث
          </button>
          {q ? (
            <Link className="btn-secondary" href={filterHref("/admin/messages", { status: statusFilter })}>
              مسح البحث
            </Link>
          ) : null}
        </form>

        {messages.length === 0 ? (
          <p className="empty-hint">
            {q || statusFilter
              ? "لا نتائج لهذا الفلتر."
              : "لا رسائل بعد. تصل من صفحة تواصل معنا على الموقع."}
          </p>
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
                      <ActionIconLink
                        href={`/admin/messages/${m.id}`}
                        label={`عرض رسالة ${m.name}`}
                        kind="view"
                      />
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
