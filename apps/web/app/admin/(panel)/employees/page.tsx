import type { Metadata } from "next";
import Link from "next/link";
import { FilterChips, filterHref } from "@/components/admin/FilterChips";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { EmployeeCreateModal, EmployeeFormModal } from "@/components/admin/EmployeeCreateModal";
import { prisma } from "@/lib/prisma";
import { createEmployee, deleteEmployee, updateEmployee } from "./actions";

export const metadata: Metadata = { title: "الموظفين" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; roleId?: string; active?: string }>;
};

export default async function AdminEmployeesPage({ searchParams }: Props) {
  const { q: qRaw, roleId: roleRaw, active: activeRaw } = await searchParams;
  const q = (qRaw ?? "").trim();
  const roleId = Number(roleRaw);
  const activeFilter = (activeRaw ?? "").trim();

  const [roles, employees] = await Promise.all([
    prisma.role.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { users: true } } },
    }),
    prisma.user.findMany({
      orderBy: { id: "desc" },
      include: {
        role: true,
        _count: { select: { assignments: true } },
      },
      where: {
        ...(Number.isFinite(roleId) && roleId > 0 ? { roleId } : {}),
        ...(activeFilter === "1" ? { active: true } : {}),
        ...(activeFilter === "0" ? { active: false } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { email: { contains: q } },
                { phone: { contains: q } },
              ],
            }
          : {}),
      },
    }),
  ]);

  return (
    <div className="stack-gap">
      <section className="panel">
        <div className="calendar-toolbar">
          <h1>الموظفين</h1>
          <EmployeeCreateModal
            action={createEmployee}
            roles={roles.map((r) => ({ id: r.id, name: r.name }))}
          />
        </div>

        <FilterChips
          label="الحالة"
          items={[
            {
              href: filterHref("/admin/employees", { q, roleId: roleRaw }),
              label: "الكل",
              active: !activeFilter,
            },
            {
              href: filterHref("/admin/employees", { q, roleId: roleRaw, active: "1" }),
              label: "نشط",
              active: activeFilter === "1",
            },
            {
              href: filterHref("/admin/employees", { q, roleId: roleRaw, active: "0" }),
              label: "معطّل",
              active: activeFilter === "0",
            },
          ]}
        />
        <FilterChips
          label="الدور"
          items={[
            {
              href: filterHref("/admin/employees", { q, active: activeFilter }),
              label: "الكل",
              active: !roleRaw,
            },
            ...roles.map((r) => ({
              href: filterHref("/admin/employees", {
                q,
                active: activeFilter,
                roleId: String(r.id),
              }),
              label: r.name,
              active: roleId === r.id,
            })),
          ]}
        />

        <form method="get" className="inline-form" style={{ marginBottom: "1rem" }}>
          {roleRaw ? <input type="hidden" name="roleId" value={roleRaw} /> : null}
          {activeFilter ? <input type="hidden" name="active" value={activeFilter} /> : null}
          <label>
            بحث (اسم / بريد / هاتف)
            <input name="q" defaultValue={q} placeholder="مثال: محمد" />
          </label>
          <button type="submit" className="btn-primary">
            بحث
          </button>
          {q ? (
            <Link
              className="btn-secondary"
              href={filterHref("/admin/employees", { roleId: roleRaw, active: activeFilter })}
            >
              مسح البحث
            </Link>
          ) : null}
        </form>
      </section>

      <section className="panel">
        <h2>القائمة ({employees.length})</h2>
        {employees.length === 0 ? (
          <p>{q || roleRaw || activeFilter ? "لا نتائج لهذا الفلتر." : "لا موظفين بعد."}</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>البريد</th>
                  <th>الدور</th>
                  <th>تعيينات</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td className="cell-ltr">{u.email}</td>
                    <td>{u.role.name}</td>
                    <td>{u._count.assignments}</td>
                    <td>{u.active ? "نشط" : "معطّل"}</td>
                    <td className="row-actions row-actions--icons">
                      <EmployeeFormModal
                        mode="edit"
                        action={updateEmployee}
                        roles={roles.map((r) => ({ id: r.id, name: r.name }))}
                        employee={{
                          id: u.id,
                          name: u.name,
                          email: u.email,
                          phone: u.phone,
                          roleId: u.roleId,
                          active: u.active,
                        }}
                      />
                      <ActionIconLink
                        href={`/admin/employees/${u.id}`}
                        label={`تعيينات ${u.name}`}
                        kind="view"
                      />
                      <ConfirmDelete
                        action={deleteEmployee}
                        id={u.id}
                        fieldName="recordId"
                        label={`حذف / تعطيل ${u.name}`}
                        message={`تعطيل أو حذف الموظف ${u.name}؟`}
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
