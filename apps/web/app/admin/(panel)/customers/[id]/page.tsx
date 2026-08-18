import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { CustomerEditModal } from "@/components/admin/CustomerCreateModal";
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
        <div className="calendar-toolbar">
          <h1>
            {customer.firstName} {customer.lastName}
          </h1>
          <div className="calendar-toolbar-actions">
            <CustomerEditModal
              action={updateCustomer}
              customer={{
                id: customer.id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                phone: customer.phone,
                altPhone: customer.altPhone,
                email: customer.email,
                address: customer.address,
                nationalId: customer.nationalId,
                gender: customer.gender,
              }}
            />
            <ConfirmDelete
              action={deleteCustomer}
              id={customer.id}
              fieldName="recordId"
              label={`حذف الزبون ${customer.firstName}`}
              message="تأكيد حذف الزبون؟ لا يمكن التراجع إن لم تكن له مناسبات."
            />
          </div>
        </div>
        <ul className="detail-list">
          <li>الهاتف: {customer.phone}</li>
          {customer.altPhone ? <li>هاتف إضافي: {customer.altPhone}</li> : null}
          {customer.email ? <li>البريد: {customer.email}</li> : null}
          {customer.address ? <li>العنوان: {customer.address}</li> : null}
        </ul>
      </section>

      <section className="panel">
        <h2>مناسباته ({customer.events.length})</h2>
        {customer.events.length === 0 ? (
          <p>
            لا مناسبات بعد.{" "}
            <Link className="text-link" href="/admin/events">
              صفحة المناسبات
            </Link>
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الحالة</th>
                  <th>خدمات</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customer.events.map((e) => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{e.status}</td>
                    <td>{e._count.services}</td>
                    <td>
                      <Link className="text-link" href={`/admin/events/${e.id}`}>
                        فتح
                      </Link>
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
