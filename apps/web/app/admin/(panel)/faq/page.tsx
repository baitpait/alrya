import type { Metadata } from "next";
import Link from "next/link";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { FilterChips, filterHref } from "@/components/admin/FilterChips";
import { prisma } from "@/lib/prisma";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { createFaqItem, deleteFaqItem } from "./actions";

export const metadata: Metadata = { title: "الأسئلة الشائعة" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; published?: string }>;
};

export default async function AdminFaqPage({ searchParams }: Props) {
  const { q: qRaw, published: pubRaw } = await searchParams;
  const q = (qRaw ?? "").trim();
  const publishedFilter = (pubRaw ?? "").trim();

  const items = await prisma.faqItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    where: {
      ...(publishedFilter === "1" ? { published: true } : {}),
      ...(publishedFilter === "0" ? { published: false } : {}),
      ...(q
        ? {
            OR: [{ question: { contains: q } }, { answer: { contains: q } }],
          }
        : {}),
    },
  });

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>الأسئلة الشائعة</h1>

        <FilterChips
          items={[
            {
              href: filterHref("/admin/faq", { q }),
              label: "الكل",
              active: !publishedFilter,
            },
            {
              href: filterHref("/admin/faq", { q, published: "1" }),
              label: "منشور",
              active: publishedFilter === "1",
            },
            {
              href: filterHref("/admin/faq", { q, published: "0" }),
              label: "مخفي",
              active: publishedFilter === "0",
            },
          ]}
        />

        <form method="get" className="inline-form" style={{ marginBottom: "1rem" }}>
          {publishedFilter ? <input type="hidden" name="published" value={publishedFilter} /> : null}
          <label>
            بحث
            <input name="q" defaultValue={q} placeholder="مثال: عربون أو تسليم" />
          </label>
          <button type="submit" className="btn-primary">
            بحث
          </button>
          {q ? (
            <Link className="btn-secondary" href={filterHref("/admin/faq", { published: publishedFilter })}>
              مسح البحث
            </Link>
          ) : null}
        </form>

        <form action={createFaqItem} className="inline-form">
          <h2>إضافة سؤال</h2>
          <label>
            السؤال
            <input name="question" required placeholder="كيف أحجز؟" />
          </label>
          <label>
            الجواب
            <textarea name="answer" required rows={3} />
          </label>
          <label>
            الترتيب
            <input className="input-ltr" name="sortOrder" type="number" defaultValue={0} />
          </label>
          <label className="check-row">
            <input name="published" type="checkbox" value="1" defaultChecked />
            منشور
          </label>
          <button type="submit">إضافة</button>
        </form>

        {items.length === 0 ? (
          <p>{q || publishedFilter ? "لا نتائج لهذا الفلتر." : "لا أسئلة بعد."}</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>السؤال</th>
                  <th>ترتيب</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.question}</td>
                    <td>{item.sortOrder}</td>
                    <td>{item.published ? "منشور" : "مخفي"}</td>
                    <td className="row-actions row-actions--icons">
                      <ActionIconLink
                        href={`/admin/faq/${item.id}`}
                        label={`عرض / تعديل سؤال #${item.id}`}
                        kind="edit"
                      />
                      <ConfirmDelete action={deleteFaqItem} id={item.id} />
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
