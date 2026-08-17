import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { prisma } from "@/lib/prisma";
import { deleteEmployee, updateEmployee } from "../actions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `موظف #${id}` };
}

export const dynamic = "force-dynamic";

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

export default async function AdminEmployeeDetailPage({ params }: Props) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const [user, roles] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        assignments: {
          orderBy: { id: "desc" },
          include: {
            eventService: {
              include: {
                service: true,
                event: { include: { customer: true } },
              },
            },
          },
        },
      },
    }),
    prisma.role.findMany({ orderBy: { id: "asc" } }),
  ]);

  if (!user) notFound();

  return (
    <div className="stack-gap">
      <AdminBackLink href="/admin/employees" label="رجوع للموظفين" />

      <section className="panel">
        <h1>{user.name}</h1>
        <form action={updateEmployee} className="inline-form">
          <input type="hidden" name="id" value={user.id} />
          <label>
            الاسم
            <input name="name" required defaultValue={user.name} />
          </label>
          <label>
            البريد
            <input
              className="input-ltr"
              name="email"
              type="email"
              required
              defaultValue={user.email}
            />
          </label>
          <label>
            الهاتف
            <input className="input-ltr" name="phone" defaultValue={user.phone ?? ""} />
          </label>
          <label>
            الدور
            <select name="roleId" required defaultValue={user.roleId}>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            الحالة
            <select name="active" defaultValue={user.active ? "1" : "0"}>
              <option value="1">نشط</option>
              <option value="0">معطّل</option>
            </select>
          </label>
          <label>
            كلمة مرور جديدة (اختياري)
            <input className="input-ltr" name="password" type="password" minLength={8} />
          </label>
          <button type="submit">حفظ</button>
        </form>
        <form action={deleteEmployee} style={{ marginTop: "0.75rem" }}>
          <input type="hidden" name="id" value={user.id} />
          <button type="submit" className="btn-danger">
            حذف / تعطيل
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>تعييناته ({user.assignments.length})</h2>
        {user.assignments.length === 0 ? (
          <p>لا تعيينات بعد — عيّنيه من تفاصيل المناسبة على خدمة بتاريخ.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الخدمة</th>
                  <th>الزبون</th>
                  <th>من</th>
                  <th>الوظيفة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {user.assignments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.eventService.service.name}</td>
                    <td>
                      {a.eventService.event.customer.firstName}{" "}
                      {a.eventService.event.customer.lastName}
                    </td>
                    <td className="cell-ltr">
                      {formatDateTimeAr(a.eventService.startsAt)}
                    </td>
                    <td>{a.jobTitle || "—"}</td>
                    <td>
                      <Link
                        className="text-link"
                        href={`/admin/events/${a.eventService.eventId}`}
                      >
                        المناسبة
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
