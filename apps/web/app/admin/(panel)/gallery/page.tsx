import type { Metadata } from "next";
import Link from "next/link";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { prisma } from "@/lib/prisma";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { createGalleryItem, deleteGalleryItem } from "./actions";

export const metadata: Metadata = { title: "المعرض" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; published?: string }>;
};

export default async function AdminGalleryPage({ searchParams }: Props) {
  const { q: qRaw, published: pubRaw } = await searchParams;
  const q = (qRaw ?? "").trim();
  const publishedFilter = (pubRaw ?? "").trim();

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

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>معرض الأعمال</h1>
        <p>
          ما يُنشر هنا يظهر في{" "}
          <Link className="text-link" href="/portfolio" target="_blank">
            /portfolio
          </Link>
          . يمكن رفع صورة أو لصق رابط، وإضافة رابط فيديو اختيارياً.
        </p>

        <form method="get" className="inline-form report-print-hide" style={{ marginBottom: "1rem" }}>
          <label>
            بحث (عنوان / وصف)
            <input name="q" defaultValue={q} placeholder="مثال: حنا" />
          </label>
          <label>
            الحالة
            <select name="published" defaultValue={publishedFilter}>
              <option value="">الكل</option>
              <option value="1">منشور</option>
              <option value="0">مخفي</option>
            </select>
          </label>
          <button type="submit">تصفية</button>
          {q || publishedFilter ? (
            <Link className="text-link" href="/admin/gallery">
              مسح الفلتر
            </Link>
          ) : null}
        </form>

        <form action={createGalleryItem} className="inline-form">
          <h2>إضافة عمل</h2>
          <label>
            العنوان
            <input name="title" required placeholder="مثال: عرس أحمد" />
          </label>
          <label>
            وصف قصير
            <input name="caption" placeholder="قاعة… / حنا…" />
          </label>
          <label>
            رفع صورة
            <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif" />
          </label>
          <label>
            أو رابط صورة (http/https أو /مسار — بدون SVG)
            <input className="input-ltr" name="imageUrl" placeholder="/portfolio/… أو https://…" />
          </label>
          <label>
            رابط فيديو https فقط (اختياري)
            <input className="input-ltr" name="videoUrl" placeholder="https://youtube.com/…" />
          </label>
          <label>
            الترتيب
            <input className="input-ltr" name="sortOrder" type="number" defaultValue={0} />
          </label>
          <label className="check-row">
            <input name="published" type="checkbox" value="1" defaultChecked />
            منشور على الموقع
          </label>
          <button type="submit">إضافة</button>
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
                      <ActionIconLink
                        href={`/admin/gallery/${item.id}`}
                        label={`عرض / تعديل ${item.title}`}
                        kind="edit"
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
    </div>
  );
}
