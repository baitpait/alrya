import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingStatus } from "@prisma/client";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { BookingConvertModal } from "@/components/admin/BookingConvertModal";
import { RejectBookingForm } from "@/components/admin/RejectBookingForm";
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

      <section className="panel event-hero-panel">
        <div className="calendar-toolbar">
          <div>
            <h1 className="event-page-title">
              {booking.groomName}
              <span className="event-page-id">طلب #{booking.id}</span>
            </h1>
            <p className="event-hero-meta">
              <span className="event-status-pill">{STATUS_LABEL[booking.status]}</span>
              <span className="cell-ltr">{booking.phone}</span>
              <span>
                وُصل{" "}
                <span className="cell-ltr">{formatDateTimeAr(booking.createdAt)}</span>
              </span>
            </p>
          </div>
          <div className="calendar-toolbar-actions">
            {booking.status === BookingStatus.CONVERTED ? (
              <>
                {booking.convertedCustomerId ? (
                  <ActionIconLink
                    href={`/admin/customers/${booking.convertedCustomerId}`}
                    label="فتح الزبون"
                    kind="view"
                  />
                ) : null}
                {booking.convertedEventId ? (
                  <ActionIconLink
                    href={`/admin/events/${booking.convertedEventId}`}
                    label={`فتح المناسبة #${booking.convertedEventId}`}
                    kind="event"
                  />
                ) : null}
                <ActionIconLink
                  href="/admin/calendar"
                  label="فتح التقويم"
                  kind="calendar"
                />
              </>
            ) : null}
            {canAct ? (
              <BookingConvertModal
                action={convertBookingRequest}
                bookingId={booking.id}
                services={services.map((s) => ({ id: s.id, name: s.name }))}
                defaultServiceId={booking.serviceId ?? selectedService?.id ?? ""}
                defaultStartsDate={toDateInput(defaultStart)}
                defaultEndsDate={toDateInput(defaultEnd)}
                defaultPrice={defaultPrice}
                defaultCity={booking.city ?? ""}
                defaultVenue={booking.venue ?? ""}
                defaultHall={booking.hall ?? ""}
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>تفاصيل الطلب</h2>
        <dl className="event-dl">
          <div>
            <dt>العريس / صاحب المناسبة</dt>
            <dd>{booking.groomName}</dd>
          </div>
          <div>
            <dt>العروس</dt>
            <dd>{booking.brideName || "—"}</dd>
          </div>
          <div>
            <dt>الهاتف</dt>
            <dd className="cell-ltr">{booking.phone}</dd>
          </div>
          <div>
            <dt>هاتف إضافي</dt>
            <dd className="cell-ltr">{booking.altPhone || "—"}</dd>
          </div>
          <div>
            <dt>الخدمة المطلوبة</dt>
            <dd>{booking.service?.name || "—"}</dd>
          </div>
          <div>
            <dt>من</dt>
            <dd className="cell-ltr">{formatDateTimeAr(booking.preferredFrom)}</dd>
          </div>
          <div>
            <dt>إلى</dt>
            <dd className="cell-ltr">{formatDateTimeAr(booking.preferredTo)}</dd>
          </div>
          <div>
            <dt>المكان</dt>
            <dd>
              {[booking.city, booking.venue, booking.hall].filter(Boolean).join(" · ") ||
                "—"}
            </dd>
          </div>
          <div>
            <dt>ملاحظات</dt>
            <dd>{booking.notes || "—"}</dd>
          </div>
        </dl>
      </section>

      {canAct ? (
        <section className="panel">
          <h2>إجراءات</h2>
          <div className="detail-footer-actions" style={{ marginTop: 0, marginBottom: "1rem" }}>
            <form action={markBookingContacted}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <button type="submit" className="btn-secondary">
                تعليم: تم التواصل
              </button>
            </form>
          </div>
          <RejectBookingForm
            action={rejectBookingRequest}
            bookingId={booking.id}
          />
        </section>
      ) : null}
    </div>
  );
}
