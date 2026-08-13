import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createCustomer, deleteCustomer } from "./actions";

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
        <h1>الزبائن</h1>
        <p>سجل زبائن الاستوديو — أساس ربط المناسبات لاحقاً.</p>

        <form action={createCustomer} className="inline-form">
          <h2>إضافة زبون</h2>
          <label>
            الاسم الأول
            <input name="firstName" required />
          </label>
          <label>
            اسم العائلة
            <input name="lastName" required />
          </label>
          <label>
            الهاتف
            <input name="phone" required />
          </label>
          <label>
            هاتف إضافي
            <input name="altPhone" />
          </label>
          <label>
            البريد
            <input name="email" type="email" />
          </label>
          <label>
            العنوان
            <input name="address" />
          </label>
          <label>
            رقم الهوية
            <input className="input-ltr" name="nationalId" placeholder="اختياري" />
          </label>
          <label>
            الجنس
            <select name="gender" defaultValue="">
              <option value="">—</option>
              <option value="MALE">ذكر</option>
              <option value="FEMALE">أنثى</option>
            </select>
          </label>
          <button type="submit">حفظ الزبون</button>
        </form>
      </section>

      <section className="panel">
        <h2>القائمة ({customers.length})</h2>
        {customers.length === 0 ? (
          <p>لا زبائن بعد.</p>
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
                    <td className="row-actions">
                      <Link className="text-link" href={`/admin/customers/${c.id}`}>
                        تفاصيل
                      </Link>
                      <form action={deleteCustomer}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="btn-danger">
                          حذف
                        </button>
                      </form>
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
