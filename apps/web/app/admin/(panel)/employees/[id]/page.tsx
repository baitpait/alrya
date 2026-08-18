import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { EmployeeForm } from "@/components/admin/EmployeeForm";
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
        <EmployeeForm
          mode="edit"
          action={updateEmployee}
          roles={roles.map((r) => ({ id: r.id, name: r.name }))}
          employee={{
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            roleId: user.roleId,
            active: user.active,
          }}
        />
        <div className="detail-footer-actions" style={{ marginTop: "0.75rem" }}>
          <ConfirmDelete
            action={deleteEmployee}
            id={user.id}
            fieldName="recordId"
            label={`حذف / تعطيل ${user.name}`}
            message={`تعطيل أو حذف الموظف ${user.name}؟`}
          />
        </div>
      </section>

      <section className="panel">
        <h2>تعييناته ({user.assignments.length})</h2>
        {user.assignments.length === 0 ? (
          <p>لا تعيينات بعد.</p>
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
