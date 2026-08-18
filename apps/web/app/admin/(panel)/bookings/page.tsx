import type { Metadata } from "next";
import Link from "next/link";
import { BookingStatus } from "@prisma/client";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { FilterChips, filterHref } from "@/components/admin/FilterChips";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "طلبات أونلاين" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "جديد",
  CONTACTED: "تم التواصل",
  APPROVED: "موافق عليه",
  CONVERTED: "محوّل",
  REJECTED: "مرفوض",
};

type Props = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

function formatDateAr(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function AdminBookingsPage({ searchParams }: Props) {
  const { q: qRaw, status: statusRaw } = await searchParams;
  const q = (qRaw ?? "").trim();
  const statusFilter = (statusRaw ?? "").trim();
  const status =
    statusFilter && statusFilter in STATUS_LABEL
      ? (statusFilter as BookingStatus)
      : undefined;

  const bookings = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { service: true, convertedEvent: true, convertedCustomer: true },
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { groomName: { contains: q } },
              { brideName: { contains: q } },
              { phone: { contains: q } },
              { city: { contains: q } },
            ],
          }
        : {}),
    },
  });

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>طلبات أونلاين</h1>

        <FilterChips
          items={[
            {
              href: filterHref("/admin/bookings", { q }),
              label: "الكل",
              active: !statusFilter,
            },
            ...(Object.keys(STATUS_LABEL) as BookingStatus[]).map((s) => ({
              href: filterHref("/admin/bookings", { q, status: s }),
              label: STATUS_LABEL[s],
              active: statusFilter === s,
            })),
          ]}
        />

        <form method="get" className="inline-form" style={{ marginBottom: "1rem" }}>
          {statusFilter ? <input type="hidden" name="status" value={statusFilter} /> : null}
          <label>
            بحث (اسم / هاتف / مدينة)
            <input name="q" defaultValue={q} placeholder="مثال: أحمد" />
          </label>
          <button type="submit" className="btn-primary">
            بحث
          </button>
          {q ? (
            <Link className="btn-secondary" href={filterHref("/admin/bookings", { status: statusFilter })}>
              مسح البحث
            </Link>
          ) : null}
        </form>

        {bookings.length === 0 ? (
          <p className="empty-hint">
            {q || statusFilter
              ? "لا نتائج لهذا الفلتر."
              : "لا طلبات أونلاين بعد. تصل من نموذج الحجز على الموقع."}
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>الهاتف</th>
                  <th>الخدمة</th>
                  <th>من</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>
                      {b.groomName}
                      {b.brideName ? ` / ${b.brideName}` : ""}
                    </td>
                    <td className="cell-ltr">{b.phone}</td>
                    <td>{b.service?.name ?? "—"}</td>
                    <td className="cell-ltr">{formatDateAr(b.preferredFrom)}</td>
                    <td>{STATUS_LABEL[b.status]}</td>
                    <td>
                      <ActionIconLink
                        href={`/admin/bookings/${b.id}`}
                        label={`عرض طلب ${b.groomName}`}
                        kind="view"
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
