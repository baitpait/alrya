import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  addEventService,
  deleteEvent,
  deleteEventService,
  updateEventStatus,
} from "../actions";

const STATUS_LABEL: Record<EventStatus, string> = {
  PREPARING: "قيد التحضير",
  IN_PROGRESS: "قيد العمل",
  COMPLETED: "منتهية",
  CANCELLED: "ملغية",
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `مناسبة #${id}` };
}

export const dynamic = "force-dynamic";

function toDateInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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

export default async function AdminEventDetailPage({ params }: Props) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const [event, services] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: {
        customer: true,
        services: {
          orderBy: { startsAt: "asc" },
          include: { service: true, offer: true },
        },
      },
    }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { offers: { orderBy: { name: "asc" } } },
    }),
  ]);

  if (!event) notFound();

  const defaultStart = new Date();
  defaultStart.setMinutes(0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(defaultEnd.getHours() + 2);

  return (
    <div className="stack-gap">
      <p>
        <Link className="text-link" href="/admin/events">
          ← رجوع للمناسبات
        </Link>
      </p>

      <section className="panel">
        <h1>مناسبة #{event.id}</h1>
        <p>
          الزبون:{" "}
          <Link className="text-link" href={`/admin/customers/${event.customerId}`}>
            {event.customer.firstName} {event.customer.lastName}
          </Link>{" "}
          — {event.customer.phone}
        </p>
        <p>الإجمالي المحسوب من الخدمات: {Number(event.totalPrice).toFixed(2)}</p>

        <form action={updateEventStatus} className="inline-form">
          <h2>الحالة والملاحظات</h2>
          <input type="hidden" name="id" value={event.id} />
          <label>
            الحالة
            <select name="status" defaultValue={event.status}>
              {(Object.keys(STATUS_LABEL) as EventStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            ملاحظات
            <textarea name="notes" rows={2} defaultValue={event.notes ?? ""} />
          </label>
          <button type="submit">حفظ الحالة</button>
        </form>

        <form action={deleteEvent} style={{ marginTop: "0.75rem" }}>
          <input type="hidden" name="id" value={event.id} />
          <button type="submit" className="btn-danger">
            حذف المناسبة
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>إضافة خدمة مناسبة (موعد)</h2>
        {services.length === 0 ? (
          <p>
            لا خدمات نشطة — أضيفي من{" "}
            <Link className="text-link" href="/admin/services">
              الكتالوج
            </Link>
            .
          </p>
        ) : (
          <form action={addEventService} className="inline-form">
            <input type="hidden" name="eventId" value={event.id} />
            <label>
              الخدمة
              <select name="serviceId" required defaultValue="">
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
              العرض (اختياري)
              <select name="offerId" defaultValue="">
                <option value="">— بدون عرض —</option>
                {services.flatMap((s) =>
                  s.offers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {s.name} / {o.name} ({Number(o.price).toFixed(2)})
                    </option>
                  )),
                )}
              </select>
            </label>
            <label>
              تاريخ البداية (يوم / شهر / سنة)
              <input
                className="input-ltr"
                type="date"
                name="startsDate"
                required
                defaultValue={toDateInputValue(defaultStart)}
              />
            </label>
            <label>
              وقت البداية (ساعة : دقيقة)
              <input
                className="input-ltr"
                type="time"
                name="startsTime"
                required
                defaultValue={toTimeInputValue(defaultStart)}
              />
            </label>
            <label>
              تاريخ النهاية (يوم / شهر / سنة)
              <input
                className="input-ltr"
                type="date"
                name="endsDate"
                required
                defaultValue={toDateInputValue(defaultEnd)}
              />
            </label>
            <label>
              وقت النهاية (ساعة : دقيقة)
              <input
                className="input-ltr"
                type="time"
                name="endsTime"
                required
                defaultValue={toTimeInputValue(defaultEnd)}
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
                placeholder="0.00"
                defaultValue=""
              />
            </label>
            <label>
              المدينة
              <input name="city" />
            </label>
            <label>
              المكان
              <input name="venue" />
            </label>
            <label>
              القاعة
              <input name="hall" />
            </label>
            <label>
              ملاحظات
              <textarea name="notes" rows={2} />
            </label>
            <button type="submit">إضافة الخدمة</button>
          </form>
        )}
      </section>

      <section className="panel">
        <h2>خدمات هذه المناسبة ({event.services.length})</h2>
        {event.services.length === 0 ? (
          <p>لا خدمات بعد — أضيفي خدمتين بتواريخ مختلفة للاختبار.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الخدمة</th>
                  <th>من</th>
                  <th>إلى</th>
                  <th>المكان</th>
                  <th>السعر</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {event.services.map((es) => (
                  <tr key={es.id}>
                    <td>
                      {es.service.name}
                      {es.offer ? ` / ${es.offer.name}` : ""}
                    </td>
                    <td className="cell-ltr">{formatDateTimeAr(es.startsAt)}</td>
                    <td className="cell-ltr">{formatDateTimeAr(es.endsAt)}</td>
                    <td>
                      {[es.city, es.venue, es.hall].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td>{Number(es.price).toFixed(2)}</td>
                    <td>
                      <form action={deleteEventService}>
                        <input type="hidden" name="id" value={es.id} />
                        <input type="hidden" name="eventId" value={event.id} />
                        <button type="submit" className="btn-danger">
                          حذف
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
