import type { Metadata } from "next";
import Link from "next/link";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { prisma } from "@/lib/prisma";
import { createService, setServiceActive } from "./actions";

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
        <h1>الخدمات</h1>
        <p>كتالوج الخدمات (عرس، حنا…) — كل خدمة لها عروض/باقات بأسعار.</p>

        <form action={createService} className="inline-form">
          <h2>إضافة خدمة</h2>
          <label>
            الاسم
            <input name="name" required placeholder="مثال: عرس" />
          </label>
          <label>
            النوع
            <select name="kind" defaultValue="EVENT">
              <option value="EVENT">مناسبة</option>
              <option value="SESSION">جلسة</option>
            </select>
          </label>
          <button type="submit">حفظ الخدمة</button>
        </form>
      </section>

      <section className="panel">
        <h2>القائمة</h2>
        {services.length === 0 ? (
          <p>لا توجد خدمات بعد. أضيفي أول خدمة من النموذج أعلاه.</p>
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
                      <ActionIconLink
                        href={`/admin/services/${s.id}`}
                        label={`تعديل / عروض ${s.name}`}
                        kind="edit"
                      />
                      <form action={setServiceActive}>
                        <input type="hidden" name="id" value={s.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={s.active ? "false" : "true"}
                        />
                        <button type="submit" className="btn-secondary">
                          {s.active ? "تعطيل" : "تفعيل"}
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
