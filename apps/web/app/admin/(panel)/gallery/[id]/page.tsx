import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { deleteGalleryItem, updateGalleryItem } from "../actions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `عمل #${id}` };
}

export const dynamic = "force-dynamic";

export default async function AdminGalleryItemPage({ params }: Props) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="stack-gap">
      <AdminBackLink href="/admin/gallery" label="رجوع للمعرض" />

      <section className="panel">
        <h1>{item.title}</h1>
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{ maxWidth: "min(100%, 420px)", borderRadius: "0.75rem" }}
          />
        ) : null}

        <form action={updateGalleryItem} className="inline-form">
          <input type="hidden" name="id" value={item.id} />
          <label>
            العنوان
            <input name="title" required defaultValue={item.title} />
          </label>
          <label>
            وصف
            <input name="caption" defaultValue={item.caption ?? ""} />
          </label>
          <label>
            استبدال الصورة (رفع)
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
            />
          </label>
          <label>
            رابط الصورة (http/https أو /مسار — بدون SVG)
            <input className="input-ltr" name="imageUrl" defaultValue={item.imageUrl ?? ""} />
          </label>
          <label>
            رابط فيديو (https فقط)
            <input className="input-ltr" name="videoUrl" defaultValue={item.videoUrl ?? ""} />
          </label>
          <label>
            الترتيب
            <input className="input-ltr" name="sortOrder" type="number" defaultValue={item.sortOrder} />
          </label>
          <label className="check-row">
            <input
              name="published"
              type="checkbox"
              value="1"
              defaultChecked={item.published}
            />
            منشور على الموقع
          </label>
          <button type="submit">حفظ</button>
        </form>

        <ConfirmDelete action={deleteGalleryItem} id={item.id} />
      </section>
    </div>
  );
}
