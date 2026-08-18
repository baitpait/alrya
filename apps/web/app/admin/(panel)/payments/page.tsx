import type { Metadata } from "next";
import Link from "next/link";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { PaymentCreateModal } from "@/components/admin/PaymentCreateModal";
import { prisma } from "@/lib/prisma";
import { addPayment, deletePayment } from "../events/actions";

export const metadata: Metadata = { title: "الدفعات" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
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

function toDateInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function eventLabel(opts: {
  id: number;
  customer: { firstName: string; lastName: string; phone: string };
  agreementNo: string | null;
}) {
  const name = `${opts.customer.firstName} ${opts.customer.lastName}`.trim();
  const agreement = opts.agreementNo ? ` · اتفاقية ${opts.agreementNo}` : "";
  return `#${opts.id} · ${name} · ${opts.customer.phone}${agreement}`;
}

export default async function AdminPaymentsPage({ searchParams }: Props) {
  const { q: qRaw } = await searchParams;
  const q = (qRaw ?? "").trim();

  const [payments, events] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      include: {
        event: {
          include: { customer: true },
        },
      },
      where: q
        ? {
            OR: [
              { method: { contains: q } },
              { note: { contains: q } },
              { event: { customer: { firstName: { contains: q } } } },
              { event: { customer: { lastName: { contains: q } } } },
              { event: { customer: { phone: { contains: q } } } },
            ],
          }
        : undefined,
    }),
    prisma.event.findMany({
      orderBy: { id: "desc" },
      include: { customer: true },
      take: 200,
    }),
  ]);

  const today = toDateInputValue(new Date());
  const eventOptions = events.map((e) => ({
    id: e.id,
    label: eventLabel(e),
  }));

  return (
    <div className="stack-gap">
      <section className="panel">
        <div className="calendar-toolbar">
          <h1>الدفعات</h1>
          <div className="calendar-toolbar-actions">
            <PaymentCreateModal
              action={addPayment}
              events={eventOptions}
              today={today}
            />
          </div>
        </div>

        <form method="get" className="inline-form" style={{ marginBottom: "1rem" }}>
          <label>
            بحث (اسم / هاتف / طريقة / ملاحظة)
            <input name="q" defaultValue={q} placeholder="مثال: أحمد أو نقدي" />
          </label>
          <button type="submit" className="btn-primary">
            بحث
          </button>
          {q ? (
            <Link className="btn-secondary" href="/admin/payments">
              مسح البحث
            </Link>
          ) : null}
        </form>

        {payments.length === 0 ? (
          <p className="empty-hint">
            {q
              ? "لا نتائج لهذا الفلتر."
              : "لا دفعات مسجّلة بعد. أضيفي أول دفعة من الزر أعلاه واربطيها بمناسبة."}
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>التاريخ</th>
                  <th>الزبون</th>
                  <th>المناسبة</th>
                  <th>المبلغ</th>
                  <th>الطريقة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td className="cell-ltr">{formatDateTimeAr(p.paidAt)}</td>
                    <td>
                      {p.event.customer.firstName} {p.event.customer.lastName}
                    </td>
                    <td>#{p.eventId}</td>
                    <td className="cell-ltr">{Number(p.amount).toFixed(2)} ₪</td>
                    <td>{p.method || "—"}</td>
                    <td className="row-actions row-actions--icons">
                      <ActionIconLink
                        href={`/admin/events/${p.eventId}`}
                        label={`فتح المناسبة #${p.eventId}`}
                        kind="event"
                      />
                      <ConfirmDelete
                        action={deletePayment}
                        id={p.id}
                        fieldName="recordId"
                        hiddenFields={{ eventId: p.eventId }}
                        label={`حذف دفعة ${Number(p.amount).toFixed(2)}`}
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
