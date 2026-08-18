import type { Metadata } from "next";
import Link from "next/link";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import {
  CustomerCreateModal,
  CustomerEditModal,
} from "@/components/admin/CustomerCreateModal";
import { prisma } from "@/lib/prisma";
import { createCustomer, deleteCustomer, updateCustomer } from "./actions";

export const metadata: Metadata = { title: "الزبائن" };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { id: "desc" },
    include: { _count: { select: { events: true } } },
  });

  return (
    <div className="stack-gap">
      <section className="panel">
        <div className="calendar-toolbar">
          <h1>الزبائن</h1>
          <CustomerCreateModal action={createCustomer} />
        </div>
      </section>

      <section className="panel">
        <h2>القائمة ({customers.length})</h2>
        {customers.length === 0 ? (
          <p className="empty-hint">لا زبائن بعد. أضيفي أول زبون من الزر أعلاه.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>الهاتف</th>
                  <th>مناسبات</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>
                      <Link href={`/admin/customers/${c.id}`}>
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td>{c.phone}</td>
                    <td>{c._count.events}</td>
                    <td className="row-actions row-actions--icons">
                      <CustomerEditModal
                        action={updateCustomer}
                        customer={{
                          id: c.id,
                          firstName: c.firstName,
                          lastName: c.lastName,
                          phone: c.phone,
                          altPhone: c.altPhone,
                          email: c.email,
                          address: c.address,
                          nationalId: c.nationalId,
                          gender: c.gender,
                        }}
                      />
                      <ActionIconLink
                        href={`/admin/customers/${c.id}`}
                        label={`مناسبات الزبون ${c.firstName}`}
                        kind="event"
                      />
                      <ConfirmDelete
                        action={deleteCustomer}
                        id={c.id}
                        fieldName="recordId"
                        label={`حذف الزبون ${c.firstName}`}
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
