import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { GalleryEditModal } from "@/components/admin/GalleryCreateModal";
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
      <AdminBackLink href="/admin/settings?tab=gallery" label="رجوع للمعرض" />

      <section className="panel">
        <div className="calendar-toolbar">
          <h1>{item.title}</h1>
          <div className="calendar-toolbar-actions">
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
          </div>
        </div>
        {item.caption ? <p>{item.caption}</p> : null}
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{ maxWidth: "min(100%, 420px)", borderRadius: "0.75rem" }}
          />
        ) : null}
        <ul className="detail-list">
          <li>الترتيب: {item.sortOrder}</li>
          <li>الحالة: {item.published ? "منشور" : "مخفي"}</li>
        </ul>
      </section>
    </div>
  );
}
