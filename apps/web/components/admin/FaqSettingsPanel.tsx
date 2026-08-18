import Link from "next/link";
import { FilterChips, filterHref } from "@/components/admin/FilterChips";
import { FaqCreateModal, FaqEditModal } from "@/components/admin/FaqCreateModal";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import {
  createFaqItem,
  deleteFaqItem,
  updateFaqItem,
} from "@/app/admin/(panel)/faq/actions";
import { prisma } from "@/lib/prisma";

type Props = {
  q?: string;
  published?: string;
};

const LIST = "/admin/settings";

export async function FaqSettingsPanel({ q: qRaw = "", published: pubRaw = "" }: Props) {
  const q = qRaw.trim();
  const publishedFilter = pubRaw.trim();

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

  const base = { tab: "faq" as const };

  return (
    <section className="panel">
      <div className="calendar-toolbar">
        <h2>الأسئلة الشائعة</h2>
        <div className="calendar-toolbar-actions">
          <Link className="btn-secondary" href="/faq" target="_blank">
            معاينة الموقع
          </Link>
          <FaqCreateModal action={createFaqItem} />
        </div>
      </div>

      <FilterChips
        items={[
          {
            href: filterHref(LIST, { ...base, q }),
            label: "الكل",
            active: !publishedFilter,
          },
          {
            href: filterHref(LIST, { ...base, q, published: "1" }),
            label: "منشور",
            active: publishedFilter === "1",
          },
          {
            href: filterHref(LIST, { ...base, q, published: "0" }),
            label: "مخفي",
            active: publishedFilter === "0",
          },
        ]}
      />

      <form method="get" className="inline-form" style={{ marginBottom: "1rem" }}>
        <input type="hidden" name="tab" value="faq" />
        {publishedFilter ? (
          <input type="hidden" name="published" value={publishedFilter} />
        ) : null}
        <label>
          بحث
          <input name="q" defaultValue={q} placeholder="مثال: عربون أو تسليم" />
        </label>
        <button type="submit" className="btn-primary">
          بحث
        </button>
        {q ? (
          <Link
            className="btn-secondary"
            href={filterHref(LIST, { ...base, published: publishedFilter })}
          >
            مسح البحث
          </Link>
        ) : null}
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
                    <FaqEditModal
                      action={updateFaqItem}
                      item={{
                        id: item.id,
                        question: item.question,
                        answer: item.answer,
                        sortOrder: item.sortOrder,
                        published: item.published,
                      }}
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
  );
}
