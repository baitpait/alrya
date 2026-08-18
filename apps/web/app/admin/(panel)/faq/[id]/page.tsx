import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { FaqEditModal } from "@/components/admin/FaqCreateModal";
import { deleteFaqItem, updateFaqItem } from "../actions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `سؤال #${id}` };
}

export const dynamic = "force-dynamic";

export default async function AdminFaqItemPage({ params }: Props) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const item = await prisma.faqItem.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="stack-gap">
      <AdminBackLink href="/admin/settings?tab=faq" label="رجوع للأسئلة" />

      <section className="panel">
        <div className="calendar-toolbar">
          <h1>{item.question}</h1>
          <div className="calendar-toolbar-actions">
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
          </div>
        </div>
        <p style={{ whiteSpace: "pre-wrap" }}>{item.answer}</p>
        <ul className="detail-list">
          <li>الترتيب: {item.sortOrder}</li>
          <li>الحالة: {item.published ? "منشور" : "مخفي"}</li>
        </ul>
      </section>
    </div>
  );
}
