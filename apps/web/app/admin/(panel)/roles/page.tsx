import type { Metadata } from "next";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { RoleCreateModal } from "@/components/admin/RoleCreateModal";
import { prisma } from "@/lib/prisma";
import { createRole, deleteRole } from "./actions";

export const metadata: Metadata = { title: "الأدوار" };
export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const roles = await prisma.role.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { users: true } } },
  });

  return (
    <div className="stack-gap">
      <section className="panel">
        <div className="calendar-toolbar">
          <h1>الأدوار</h1>
          <RoleCreateModal action={createRole} />
        </div>
      </section>

      <section className="panel">
        <h2>القائمة ({roles.length})</h2>
        {roles.length === 0 ? (
          <p>لا أدوار بعد.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الدور</th>
                  <th>الوصف</th>
                  <th>موظفون</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.description || "—"}</td>
                    <td>{r._count.users}</td>
                    <td className="row-actions row-actions--icons">
                      {r._count.users === 0 ? (
                        <ConfirmDelete
                          action={deleteRole}
                          id={r.id}
                          fieldName="recordId"
                          label={`حذف الدور ${r.name}`}
                        />
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
