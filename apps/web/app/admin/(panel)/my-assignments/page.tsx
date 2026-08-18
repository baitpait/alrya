import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getVerifiedSession } from "@/lib/authz";

export const metadata: Metadata = { title: "مناسباتي" };
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

export default async function MyAssignmentsPage() {
  const session = await getVerifiedSession();
  if (!session) redirect("/admin/login");
  const userId = Number(session.sub);

  const assignments = await prisma.eventServiceEmployee.findMany({
    where: { userId },
    orderBy: { eventService: { startsAt: "asc" } },
    include: {
      eventService: {
        include: {
          service: true,
          event: { include: { customer: true } },
        },
      },
      supervisor: true,
    },
  });

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>مناسباتي</h1>
        {assignments.length === 0 ? (
          <p>لا تعيينات على حسابك بعد.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الخدمة</th>
                  <th>الزبون</th>
                  <th>من</th>
                  <th>إلى</th>
                  <th>الوظيفة</th>
                  <th>المشرف</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.eventService.service.name}</td>
                    <td>
                      {a.eventService.event.customer.firstName}{" "}
                      {a.eventService.event.customer.lastName}
                    </td>
                    <td className="cell-ltr">
                      {formatDateTimeAr(a.eventService.startsAt)}
                    </td>
                    <td className="cell-ltr">
                      {formatDateTimeAr(a.eventService.endsAt)}
                    </td>
                    <td>{a.jobTitle || "—"}</td>
                    <td>{a.supervisor?.name || "—"}</td>
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
