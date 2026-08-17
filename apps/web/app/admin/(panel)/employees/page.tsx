import type { Metadata } from "next";
import Link from "next/link";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { prisma } from "@/lib/prisma";
import { createEmployee, createRole, deleteEmployee, deleteRole } from "./actions";

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
        <h1>الموظفين</h1>
        <p>
          طاقم الاستوديو (مصورون ومساعدون) — غير الزبائن. التعيين يكون على{" "}
          <strong>خدمة المناسبة</strong> بتاريخها.
        </p>

        <form method="get" className="inline-form" style={{ marginBottom: "1rem" }}>
          <label>
            بحث (اسم / بريد / هاتف)
            <input name="q" defaultValue={q} placeholder="مثال: محمد" />
          </label>
          <label>
            الدور
            <select name="roleId" defaultValue={roleRaw ?? ""}>
              <option value="">الكل</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            الحالة
            <select name="active" defaultValue={activeFilter}>
              <option value="">الكل</option>
              <option value="1">نشط</option>
              <option value="0">معطّل</option>
            </select>
          </label>
          <button type="submit">تصفية</button>
          {q || roleRaw || activeFilter ? (
            <Link className="text-link" href="/admin/employees">
              مسح الفلتر
            </Link>
          ) : null}
        </form>

        <form action={createEmployee} className="inline-form">
          <h2>إضافة موظف</h2>
          <label>
            الاسم
            <input name="name" required />
          </label>
          <label>
            البريد (لتسجيل الدخول)
            <input className="input-ltr" name="email" type="email" required />
          </label>
          <label>
            الهاتف
            <input className="input-ltr" name="phone" />
          </label>
          <label>
            الدور
            <select name="roleId" required defaultValue={roles[0]?.id ?? ""}>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            كلمة المرور
            <input className="input-ltr" name="password" type="password" required minLength={8} />
          </label>
          <button type="submit">حفظ الموظف</button>
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
                      <ActionIconLink
                        href={`/admin/employees/${u.id}`}
                        label={`عرض / تعديل ${u.name}`}
                        kind="edit"
                      />
                      <form action={deleteEmployee}>
                        <input type="hidden" name="id" value={u.id} />
                        <button type="submit" className="btn-danger">
                          حذف / تعطيل
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

      <section className="panel">
        <h2>الأدوار</h2>
        <form action={createRole} className="inline-form">
          <label>
            اسم الدور
            <input name="name" required placeholder="مثال: مصور" />
          </label>
          <label>
            وصف
            <input name="description" />
          </label>
          <button type="submit">إضافة دور</button>
        </form>
        {roles.length === 0 ? (
          <p>لا أدوار.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الدور</th>
                  <th>الوصف</th>
                  <th>موظفون</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.description || "—"}</td>
                    <td>{r._count.users}</td>
                    <td>
                      {r._count.users === 0 ? (
                        <form action={deleteRole}>
                          <input type="hidden" name="id" value={r.id} />
                          <button type="submit" className="btn-danger">
                            حذف
                          </button>
                        </form>
                      ) : (
                        "—"
                      )}
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
