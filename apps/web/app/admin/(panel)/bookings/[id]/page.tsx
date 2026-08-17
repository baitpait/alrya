import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingStatus } from "@prisma/client";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { prisma } from "@/lib/prisma";
import {
  convertBookingRequest,
  markBookingContacted,
  rejectBookingRequest,
} from "../actions";

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "جديد",
  CONTACTED: "تم التواصل",
  APPROVED: "موافق عليه",
  CONVERTED: "محوّل",
  REJECTED: "مرفوض",
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `طلب حجز #${id}` };
}

export const dynamic = "force-dynamic";

function toDateInput(d: Date | null | undefined) {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateTimeAr(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function AdminBookingDetailPage({ params }: Props) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const [booking, services] = await Promise.all([
    prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        service: true,
        convertedEvent: true,
        convertedCustomer: true,
      },
    }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { offers: { orderBy: { id: "asc" }, take: 1 } },
    }),
  ]);

  if (!booking) notFound();

  const canAct =
    booking.status !== BookingStatus.CONVERTED &&
    booking.status !== BookingStatus.REJECTED;

  const defaultStart = booking.preferredFrom ?? new Date();
  const defaultEnd =
    booking.preferredTo ??
    new Date(defaultStart.getTime() + 2 * 60 * 60 * 1000);

  const selectedService =
    services.find((s) => s.id === booking.serviceId) ?? services[0];
  const defaultPrice = selectedService?.offers[0]
    ? Number(selectedService.offers[0].price)
    : 0;

  return (
    <div className="stack-gap">
      <AdminBackLink href="/admin/bookings" label="رجوع للطلبات" />

      <section className="panel">
        <h1>طلب حجز #{booking.id}</h1>
        <p>
          الحالة: <strong>{STATUS_LABEL[booking.status]}</strong> · وُصل{" "}
          <span className="cell-ltr">{formatDateTimeAr(booking.createdAt)}</span>
        </p>

        <ul className="detail-list">
          <li>
            <strong>العريس / صاحب المناسبة:</strong> {booking.groomName}
          </li>
          <li>
            <strong>العروس:</strong> {booking.brideName || "—"}
          </li>
          <li>
            <strong>الهاتف:</strong>{" "}
            <span className="cell-ltr">{booking.phone}</span>
          </li>
          <li>
            <strong>هاتف إضافي:</strong>{" "}
            <span className="cell-ltr">{booking.altPhone || "—"}</span>
          </li>
          <li>
            <strong>الخدمة المطلوبة:</strong> {booking.service?.name || "—"}
          </li>
          <li>
            <strong>من:</strong>{" "}
            <span className="cell-ltr">{formatDateTimeAr(booking.preferredFrom)}</span>
          </li>
          <li>
            <strong>إلى:</strong>{" "}
            <span className="cell-ltr">{formatDateTimeAr(booking.preferredTo)}</span>
          </li>
          <li>
            <strong>المكان:</strong>{" "}
            {[booking.city, booking.venue, booking.hall].filter(Boolean).join(" · ") ||
              "—"}
          </li>
          <li>
            <strong>ملاحظات:</strong> {booking.notes || "—"}
          </li>
        </ul>

        {booking.status === BookingStatus.CONVERTED ? (
          <p>
            محوّل إلى{" "}
            {booking.convertedCustomerId ? (
              <Link
                className="text-link"
                href={`/admin/customers/${booking.convertedCustomerId}`}
              >
                الزبون
              </Link>
            ) : null}
            {booking.convertedEventId ? (
              <>
                {" · "}
                <Link
                  className="text-link"
                  href={`/admin/events/${booking.convertedEventId}`}
                >
                  المناسبة #{booking.convertedEventId}
                </Link>
                {" · "}
                <Link className="text-link" href="/admin/calendar">
                  التقويم
                </Link>
              </>
            ) : null}
          </p>
        ) : null}
      </section>

      {canAct ? (
        <>
          <section className="panel">
            <h2>تحويل إلى مناسبة + تقويم</h2>
            <p>
              يُنشأ زبون (أو يُربط بهاتف موجود) ومناسبة وموعد يظهر فوراً على التقويم.
            </p>
            <form action={convertBookingRequest} className="inline-form">
              <input type="hidden" name="bookingId" value={booking.id} />
              <label>
                الخدمة
                <select
                  name="serviceId"
                  required
                  defaultValue={booking.serviceId ?? selectedService?.id ?? ""}
                >
                  <option value="" disabled>
                    اختاري خدمة
                  </option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                تاريخ البداية
                <input
                  className="input-ltr"
                  type="date"
                  name="startsDate"
                  required
                  defaultValue={toDateInput(defaultStart)}
                />
              </label>
              <label>
                وقت البداية
                <input
                  className="input-ltr"
                  type="time"
                  name="startsTime"
                  required
                  defaultValue="18:00"
                />
              </label>
              <label>
                تاريخ النهاية
                <input
                  className="input-ltr"
                  type="date"
                  name="endsDate"
                  required
                  defaultValue={toDateInput(defaultEnd)}
                />
              </label>
              <label>
                وقت النهاية
                <input
                  className="input-ltr"
                  type="time"
                  name="endsTime"
                  required
                  defaultValue="20:00"
                />
              </label>
              <label>
                السعر (₪)
                <input
                  className="input-ltr"
                  name="price"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={defaultPrice}
                />
              </label>
              <label>
                المدينة
                <input name="city" defaultValue={booking.city ?? ""} />
              </label>
              <label>
                المكان
                <input name="venue" defaultValue={booking.venue ?? ""} />
              </label>
              <label>
                القاعة
                <input name="hall" defaultValue={booking.hall ?? ""} />
              </label>
              <button type="submit" className="btn-primary">
                تحويل وإظهار على التقويم
              </button>
            </form>
          </section>

          <section className="panel">
            <h2>إجراءات أخرى</h2>
            <div className="detail-footer-actions" style={{ marginTop: 0, marginBottom: "1rem" }}>
              <form action={markBookingContacted}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <button type="submit" className="btn-secondary">
                  تعليم: تم التواصل
                </button>
              </form>
            </div>
            <form action={rejectBookingRequest} className="inline-form">
              <input type="hidden" name="bookingId" value={booking.id} />
              <label>
                سبب الرفض
                <input name="reason" placeholder="اختياري" />
              </label>
              <button type="submit" className="btn-danger">
                رفض الطلب
              </button>
            </form>
          </section>
        </>
      ) : null}
    </div>
  );
}
