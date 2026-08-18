import type { Metadata } from "next";
import Link from "next/link";
import {
  ActionIconLink,
  ActionIconSubmit,
} from "@/components/admin/AdminActionIcons";
import {
  ServiceCreateModal,
  ServiceEditModal,
} from "@/components/admin/ServiceCreateModal";
import { prisma } from "@/lib/prisma";
import { createService, setServiceActive, updateService } from "./actions";

export const metadata: Metadata = { title: "الخدمات" };
export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { id: "desc" },
    include: { _count: { select: { offers: true } } },
  });

  return (
    <div className="stack-gap">
      <section className="panel">
        <div className="calendar-toolbar">
          <h1>الخدمات</h1>
          <ServiceCreateModal action={createService} />
        </div>
      </section>

      <section className="panel">
        <h2>القائمة</h2>
        {services.length === 0 ? (
          <p>لا توجد خدمات بعد. أضيفي أول خدمة من الزر أعلاه.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>النوع</th>
                  <th>العروض</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>
                      <Link href={`/admin/services/${s.id}`}>{s.name}</Link>
                    </td>
                    <td>{s.kind === "SESSION" ? "جلسة" : "مناسبة"}</td>
                    <td>{s._count.offers}</td>
                    <td>{s.active ? "نشطة" : "معطّلة"}</td>
                    <td className="row-actions row-actions--icons">
                      <ServiceEditModal
                        action={updateService}
                        service={{
                          id: s.id,
                          name: s.name,
                          kind: s.kind,
                          active: s.active,
                        }}
                      />
                      <ActionIconLink
                        href={`/admin/services/${s.id}`}
                        label={`عروض ${s.name}`}
                        kind="open"
                      />
                      <form action={setServiceActive}>
                        <input type="hidden" name="recordId" value={s.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={s.active ? "false" : "true"}
                        />
                        <ActionIconSubmit
                          label={s.active ? `تعطيل ${s.name}` : `تفعيل ${s.name}`}
                          kind={s.active ? "disable" : "enable"}
                        />
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
