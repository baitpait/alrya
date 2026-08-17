import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { updateCustomer, deleteCustomer } from "../actions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = await prisma.customer.findUnique({ where: { id: Number(id) } });
  return {
    title: c ? `${c.firstName} ${c.lastName}` : "زبون",
  };
}

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({ params }: Props) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      events: { orderBy: { id: "desc" }, include: { _count: { select: { services: true } } } },
    },
  });
  if (!customer) notFound();

  return (
    <div className="stack-gap">
      <AdminBackLink href="/admin/customers" label="رجوع للزبائن" />

      <section className="panel">
        <h1>
          {customer.firstName} {customer.lastName}
        </h1>
        <form action={updateCustomer} className="inline-form">
          <input type="hidden" name="id" value={customer.id} />
          <label>
            الاسم الأول
            <input name="firstName" required defaultValue={customer.firstName} />
          </label>
          <label>
            اسم العائلة
            <input name="lastName" required defaultValue={customer.lastName} />
          </label>
          <label>
            الهاتف
            <input name="phone" required defaultValue={customer.phone} />
          </label>
          <label>
            هاتف إضافي
            <input name="altPhone" defaultValue={customer.altPhone ?? ""} />
          </label>
          <label>
            البريد
            <input name="email" type="email" defaultValue={customer.email ?? ""} />
          </label>
          <label>
            العنوان
            <input name="address" defaultValue={customer.address ?? ""} />
          </label>
          <label>
            رقم الهوية
            <input
              className="input-ltr"
              name="nationalId"
              defaultValue={customer.nationalId ?? ""}
              placeholder="من اتفاقية التصوير"
            />
          </label>
          <label>
            الجنس
            <select name="gender" defaultValue={customer.gender ?? ""}>
              <option value="">—</option>
              <option value="MALE">ذكر</option>
              <option value="FEMALE">أنثى</option>
            </select>
          </label>
          <button type="submit" className="btn-primary">
            حفظ التعديل
          </button>
        </form>
        <div className="detail-footer-actions" style={{ marginTop: "0.75rem" }}>
          <ConfirmDelete
            action={deleteCustomer}
            id={customer.id}
            fieldName="recordId"
            label={`حذف الزبون ${customer.firstName}`}
            message="تأكيد حذف الزبون؟ لا يمكن التراجع إن لم تكن له مناسبات."
          />
        </div>
      </section>

      <section className="panel">
        <h2>مناسباته ({customer.events.length})</h2>
        {customer.events.length === 0 ? (
          <p>
            لا مناسبات — أنشئي من{" "}
            <Link className="text-link" href="/admin/events">
              صفحة المناسبات
            </Link>
            .
          </p>
        ) : (
          <ul className="stack-gap">
            {customer.events.map((e) => (
              <li key={e.id}>
                <Link className="text-link" href={`/admin/events/${e.id}`}>
                  مناسبة #{e.id} — {e.status} — خدمات: {e._count.services}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
