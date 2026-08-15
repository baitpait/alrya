import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatMoney, getEventFinance } from "@/lib/event-finance";
import {
  addDiscount,
  addEventService,
  addPayment,
  assignEmployeeToService,
  deleteDiscount,
  deleteEvent,
  deleteEventService,
  deletePayment,
  unassignEmployee,
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

  const [event, services, staff] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: {
        customer: true,
        services: {
          orderBy: { startsAt: "asc" },
          include: {
            service: true,
            offer: true,
            employees: {
              include: { user: true, supervisor: true },
            },
          },
        },
        payments: { orderBy: { paidAt: "desc" } },
        discounts: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { offers: { orderBy: { name: "asc" } } },
    }),
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { role: true },
    }),
  ]);
  const finance = await getEventFinance(id);

  if (!event) notFound();

  const defaultStart = new Date();
  defaultStart.setMinutes(0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(defaultEnd.getHours() + 2);
  const today = toDateInputValue(new Date());

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

        <div className="finance-grid" aria-label="ملخص مالي">
          <div className="finance-card">
            <span>الإجمالي</span>
            <strong className="cell-ltr">{formatMoney(finance.totalPrice)}</strong>
          </div>
          <div className="finance-card">
            <span>الخصومات</span>
            <strong className="cell-ltr">{formatMoney(finance.discountsTotal)}</strong>
          </div>
          <div className="finance-card">
            <span>المدفوع</span>
            <strong className="cell-ltr">{formatMoney(finance.paymentsTotal)}</strong>
          </div>
          <div
            className={`finance-card finance-card-remaining${
              finance.remaining <= 0 ? " is-zero" : ""
            }`}
          >
            <span>المتبقي</span>
            <strong className="cell-ltr">{formatMoney(finance.remaining)}</strong>
          </div>
        </div>

        <form action={updateEventStatus} className="inline-form">
          <h2>الحالة · الاتفاقية · الملاحظات</h2>
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
            رقم الاتفاقية
            <input
              className="input-ltr"
              name="agreementNo"
              placeholder="000020"
              defaultValue={event.agreementNo ?? ""}
            />
          </label>
          <label>
            آخر موعد للاستلام
            <input
              className="input-ltr"
              name="deliveryDueAt"
              type="date"
              defaultValue={
                event.deliveryDueAt ? toDateInputValue(event.deliveryDueAt) : ""
              }
            />
          </label>
          <label>
            ملاحظات
            <textarea name="notes" rows={2} defaultValue={event.notes ?? ""} />
          </label>
          <button type="submit">حفظ</button>
        </form>

        <form action={deleteEvent} style={{ marginTop: "0.75rem" }}>
          <input type="hidden" name="id" value={event.id} />
          <button type="submit" className="btn-danger">
            حذف المناسبة
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>الدفعات</h2>
        <form action={addPayment} className="inline-form">
          <input type="hidden" name="eventId" value={event.id} />
          <label>
            المبلغ (₪)
            <input
              className="input-ltr"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
            />
          </label>
          <label>
            تاريخ الدفع
            <input
              className="input-ltr"
              type="date"
              name="paidDate"
              defaultValue={today}
              required
            />
          </label>
          <label>
            الوقت
            <input
              className="input-ltr"
              type="time"
              name="paidTime"
              defaultValue="12:00"
            />
          </label>
          <label>
            طريقة الدفع
            <select name="method" defaultValue="">
              <option value="">—</option>
              <option value="نقدي">نقدي</option>
              <option value="تحويل">تحويل</option>
              <option value="بطاقة">بطاقة</option>
              <option value="شيك">شيك</option>
            </select>
          </label>
          <label>
            ملاحظة
            <input name="note" />
          </label>
          <button type="submit">إضافة دفعة</button>
        </form>

        {event.payments.length === 0 ? (
          <p>لا دفعات بعد.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>المبلغ</th>
                  <th>الطريقة</th>
                  <th>ملاحظة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {event.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-ltr">{formatDateTimeAr(p.paidAt)}</td>
                    <td className="cell-ltr">{Number(p.amount).toFixed(2)}</td>
                    <td>{p.method || "—"}</td>
                    <td>{p.note || "—"}</td>
                    <td>
                      <form action={deletePayment}>
                        <input type="hidden" name="id" value={p.id} />
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

      <section className="panel">
        <h2>الخصومات</h2>
        <form action={addDiscount} className="inline-form">
          <input type="hidden" name="eventId" value={event.id} />
          <label>
            المبلغ (₪)
            <input
              className="input-ltr"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
            />
          </label>
          <label>
            السبب
            <input name="reason" placeholder="مثال: خصم عرسان" />
          </label>
          <button type="submit">إضافة خصم</button>
        </form>

        {event.discounts.length === 0 ? (
          <p>لا خصومات بعد.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>المبلغ</th>
                  <th>السبب</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {event.discounts.map((d) => (
                  <tr key={d.id}>
                    <td className="cell-ltr">{formatDateTimeAr(d.createdAt)}</td>
                    <td className="cell-ltr">{Number(d.amount).toFixed(2)}</td>
                    <td>{d.reason || "—"}</td>
                    <td>
                      <form action={deleteDiscount}>
                        <input type="hidden" name="id" value={d.id} />
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
                  <th>الطاقم</th>
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
                      {[es.city, es.venue, es.hall].filter(Boolean).join(" · ") ||
                        "—"}
                    </td>
                    <td className="cell-ltr">{Number(es.price).toFixed(2)}</td>
                    <td>
                      {es.employees.length === 0
                        ? "—"
                        : es.employees.map((e) => e.user.name).join("، ")}
                    </td>
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

      <section className="panel">
        <h2>طاقم التغطية</h2>
        <p>التعيين على خدمة بتاريخ (مثال: محمد على حنا أحمد الخميس — مش على العرس كله).</p>
        {event.services.length === 0 ? (
          <p>أضيفي خدمة مناسبة أولاً ثم عيّني الطاقم.</p>
        ) : staff.length === 0 ? (
          <p>
            لا موظفين نشطين — أضيفي من{" "}
            <Link className="text-link" href="/admin/employees">
              الموظفين
            </Link>
            .
          </p>
        ) : (
          event.services.map((es) => (
            <div key={es.id} className="crew-block">
              <h3>
                {es.service.name}{" "}
                <span className="cell-ltr">{formatDateTimeAr(es.startsAt)}</span>
              </h3>
              <form action={assignEmployeeToService} className="inline-form">
                <input type="hidden" name="eventId" value={event.id} />
                <input type="hidden" name="eventServiceId" value={es.id} />
                <label>
                  الموظف
                  <select name="userId" required defaultValue="">
                    <option value="" disabled>
                      اختاري موظفاً
                    </option>
                    {staff.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.role.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  الوظيفة في هذا الموعد
                  <input name="jobTitle" placeholder="مصور / مساعد / مشرف" />
                </label>
                <label>
                  الراتب (₪)
                  <input
                    className="input-ltr"
                    name="salary"
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </label>
                <label>
                  المكافأة (₪)
                  <input
                    className="input-ltr"
                    name="bonus"
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </label>
                <label>
                  المشرف (اختياري)
                  <select name="supervisorId" defaultValue="">
                    <option value="">—</option>
                    {staff.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit">تعيين</button>
              </form>
              {es.employees.length === 0 ? (
                <p>لا طاقم على هذا الموعد بعد.</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>الموظف</th>
                        <th>الوظيفة</th>
                        <th>راتب</th>
                        <th>مكافأة</th>
                        <th>مشرف</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {es.employees.map((asg) => (
                        <tr key={asg.id}>
                          <td>
                            <Link
                              className="text-link"
                              href={`/admin/employees/${asg.userId}`}
                            >
                              {asg.user.name}
                            </Link>
                          </td>
                          <td>{asg.jobTitle || "—"}</td>
                          <td className="cell-ltr">
                            {asg.salary != null ? Number(asg.salary).toFixed(2) : "—"}
                          </td>
                          <td className="cell-ltr">
                            {asg.bonus != null ? Number(asg.bonus).toFixed(2) : "—"}
                          </td>
                          <td>{asg.supervisor?.name || "—"}</td>
                          <td>
                            <form action={unassignEmployee}>
                              <input type="hidden" name="id" value={asg.id} />
                              <input type="hidden" name="eventId" value={event.id} />
                              <button type="submit" className="btn-danger">
                                إزالة
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
