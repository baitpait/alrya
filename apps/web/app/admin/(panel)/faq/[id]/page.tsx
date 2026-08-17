import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
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
      <AdminBackLink href="/admin/faq" label="رجوع للأسئلة" />

      <section className="panel">
        <h1>{item.question}</h1>
        <form action={updateFaqItem} className="inline-form">
          <input type="hidden" name="id" value={item.id} />
          <label>
            السؤال
            <input name="question" required defaultValue={item.question} />
          </label>
          <label>
            الجواب
            <textarea name="answer" required rows={5} defaultValue={item.answer} />
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
            منشور
          </label>
          <button type="submit">حفظ</button>
        </form>
        <ConfirmDelete action={deleteFaqItem} id={item.id} />
      </section>
    </div>
  );
}
