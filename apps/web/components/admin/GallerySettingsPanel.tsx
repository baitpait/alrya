import Link from "next/link";
import { FilterChips, filterHref } from "@/components/admin/FilterChips";
import {
  GalleryCreateModal,
  GalleryEditModal,
} from "@/components/admin/GalleryCreateModal";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import {
  createGalleryItem,
  deleteGalleryItem,
  updateGalleryItem,
} from "@/app/admin/(panel)/gallery/actions";
import { prisma } from "@/lib/prisma";

type Props = {
  q?: string;
  published?: string;
};

const LIST = "/admin/settings";

export async function GallerySettingsPanel({ q: qRaw = "", published: pubRaw = "" }: Props) {
  const q = qRaw.trim();
  const publishedFilter = pubRaw.trim();

  const items = await prisma.galleryItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
    where: {
      ...(publishedFilter === "1" ? { published: true } : {}),
      ...(publishedFilter === "0" ? { published: false } : {}),
      ...(q
        ? {
            OR: [{ title: { contains: q } }, { caption: { contains: q } }],
          }
        : {}),
    },
  });

  const base = { tab: "gallery" as const };

  return (
    <section className="panel">
      <div className="calendar-toolbar">
        <h2>معرض الأعمال</h2>
        <div className="calendar-toolbar-actions">
          <Link className="btn-secondary" href="/portfolio" target="_blank">
            معاينة الموقع
          </Link>
          <GalleryCreateModal action={createGalleryItem} />
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

      <form method="get" className="inline-form report-print-hide" style={{ marginBottom: "1rem" }}>
        <input type="hidden" name="tab" value="gallery" />
        {publishedFilter ? (
          <input type="hidden" name="published" value={publishedFilter} />
        ) : null}
        <label>
          بحث (عنوان / وصف)
          <input name="q" defaultValue={q} placeholder="مثال: حنا" />
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
        <p>{q || publishedFilter ? "لا نتائج لهذا الفلتر." : "لا أعمال بعد."}</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>العنوان</th>
                <th>ترتيب</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.title}</td>
                  <td>{item.sortOrder}</td>
                  <td>{item.published ? "منشور" : "مخفي"}</td>
                  <td className="row-actions row-actions--icons">
                    <GalleryEditModal
                      action={updateGalleryItem}
                      item={{
                        id: item.id,
                        title: item.title,
                        caption: item.caption,
                        imageUrl: item.imageUrl,
                        videoUrl: item.videoUrl,
                        sortOrder: item.sortOrder,
                        published: item.published,
                      }}
                    />
                    <ConfirmDelete action={deleteGalleryItem} id={item.id} />
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
