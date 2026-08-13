import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactMessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { archiveMessage, deleteMessage, markMessageRead } from "../actions";

const STATUS_LABEL: Record<ContactMessageStatus, string> = {
  NEW: "جديدة",
  READ: "مقروءة",
  ARCHIVED: "مؤرشفة",
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `رسالة #${id}` };
}

export const dynamic = "force-dynamic";

function formatDateTimeAr(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function AdminMessageDetailPage({ params }: Props) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) notFound();

  if (message.status === ContactMessageStatus.NEW) {
    await prisma.contactMessage.update({
      where: { id },
      data: { status: ContactMessageStatus.READ, readAt: new Date() },
    });
    message.status = ContactMessageStatus.READ;
    message.readAt = new Date();
  }

  return (
    <div className="stack-gap">
      <p>
        <Link className="text-link" href="/admin/messages">
          ← رجوع للرسائل
        </Link>
      </p>

      <section className="panel">
        <h1>رسالة #{message.id}</h1>
        <p>
          الحالة: <strong>{STATUS_LABEL[message.status]}</strong> · وصلت{" "}
          <span className="cell-ltr">{formatDateTimeAr(message.createdAt)}</span>
        </p>

        <ul className="detail-list">
          <li>
            <strong>الاسم:</strong> {message.name}
          </li>
          <li>
            <strong>الهاتف:</strong>{" "}
            <span className="cell-ltr">{message.phone}</span>
          </li>
          <li>
            <strong>البريد:</strong> {message.email || "—"}
          </li>
          <li>
            <strong>الموضوع:</strong> {message.subject || "—"}
          </li>
          <li>
            <strong>المصدر:</strong> {message.source || "—"}
          </li>
          <li>
            <strong>قُرئت:</strong>{" "}
            <span className="cell-ltr">{formatDateTimeAr(message.readAt)}</span>
          </li>
        </ul>

        <h2>نص الرسالة</h2>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{message.body}</p>

        <div className="row-actions" style={{ marginTop: "1.25rem" }}>
          {message.status !== ContactMessageStatus.READ ? (
            <form action={markMessageRead}>
              <input type="hidden" name="id" value={message.id} />
              <button type="submit">تعليم كمقروءة</button>
            </form>
          ) : null}
          {message.status !== ContactMessageStatus.ARCHIVED ? (
            <form action={archiveMessage}>
              <input type="hidden" name="id" value={message.id} />
              <button type="submit">أرشفة</button>
            </form>
          ) : null}
          <form action={deleteMessage}>
            <input type="hidden" name="id" value={message.id} />
            <button type="submit" className="btn-danger">
              حذف
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
