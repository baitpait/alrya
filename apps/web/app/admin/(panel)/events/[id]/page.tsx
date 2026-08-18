import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventStatus } from "@prisma/client";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
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

function FinanceSummary({
  finance,
}: {
  finance: {
    totalPrice: number;
    discountsTotal: number;
    paymentsTotal: number;
    remaining: number;
  };
}) {
  const remainingTone =
    finance.remaining < 0 ? "is-negative" : "is-positive";
  return (
    <div className="finance-grid" aria-label="ملخص مالي">
      <div className="finance-card">
        <span>الإجمالي</span>
        <strong className="cell-ltr">{formatMoney(finance.totalPrice)}</strong>
      </div>
      <div className="finance-card">
        <span>المدفوع</span>
        <strong className="cell-ltr">{formatMoney(finance.paymentsTotal)}</strong>
      </div>
      <div className="finance-card">
        <span>الخصومات</span>
        <strong className="cell-ltr">{formatMoney(finance.discountsTotal)}</strong>
      </div>
      <div className={`finance-card ${remainingTone}`}>
        <span>المتبقي</span>
        <strong className="cell-ltr">{formatMoney(finance.remaining)}</strong>
      </div>
    </div>
  );
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
      <AdminBackLink href="/admin/events" label="رجوع للمناسبات" />
      <h1 className="event-page-title">مناسبة #{event.id}</h1>

      <section className="panel">
        <h2>بيانات الزبون</h2>
        <dl className="event-dl">
          <div>
            <dt>الاسم</dt>
            <dd>
              <Link className="text-link" href={`/admin/customers/${event.customerId}`}>
                {event.customer.firstName} {event.customer.lastName}
              </Link>
            </dd>
          </div>
          <div>
            <dt>الجوال</dt>
            <dd className="cell-ltr">{event.customer.phone}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>الملخص المالي</h2>
        <FinanceSummary finance={finance} />
      </section>

      <section className="panel">
        <h2>الحالة والاتفاقية</h2>
        <form action={updateEventStatus} className="stacked-form">
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
          <button type="submit" className="btn-primary">
            حفظ
          </button>
        </form>
        <div className="detail-footer-actions">
          <ConfirmDelete
            action={deleteEvent}
            id={event.id}
            fieldName="recordId"
            label="حذف المناسبة"
            message="تأكيد حذف المناسبة وكل مواعيدها ودفعاتها؟ لا يمكن التراجع."
          />
        </div>
      </section>

      <section className="panel">
        <h2>سجل الدفعات</h2>
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
                    <td className="row-actions row-actions--icons">
                      <ConfirmDelete
                        action={deletePayment}
                        id={p.id}
                        fieldName="recordId"
                        hiddenFields={{ eventId: event.id }}
                        label={`حذف دفعة ${Number(p.amount).toFixed(2)}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h3 className="event-subhead">إضافة دفعة</h3>
        <form action={addPayment} className="stacked-form">
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
          <button type="submit" className="btn-primary">
            حفظ الدفعة
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>الخصومات</h2>
        <form action={addDiscount} className="stacked-form">
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
          <button type="submit" className="btn-primary">
            حفظ الخصم
          </button>
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
                    <td className="row-actions row-actions--icons">
                      <ConfirmDelete
                        action={deleteDiscount}
                        id={d.id}
                        fieldName="recordId"
                        hiddenFields={{ eventId: event.id }}
                        label={`حذف خصم ${Number(d.amount).toFixed(2)}`}
                      />
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
          <form action={addEventService} className="stacked-form">
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
            <button type="submit" className="btn-primary">
              حفظ الموعد
            </button>
          </form>
        )}
      </section>

      <section className="panel">
        <h2>خدمات هذه المناسبة ({event.services.length})</h2>
        {event.services.length === 0 ? (
            <p>لا مواعيد بعد.</p>
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
                    <td className="row-actions row-actions--icons">
                      <ConfirmDelete
                        action={deleteEventService}
                        id={es.id}
                        fieldName="recordId"
                        hiddenFields={{ eventId: event.id }}
                        label={`حذف موعد ${es.service.name}`}
                        message={`تأكيد حذف الموعد «${es.service.name}»؟`}
                      />
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
              <form action={assignEmployeeToService} className="stacked-form">
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
                <button type="submit" className="btn-primary">
                  حفظ التعيين
                </button>
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
                          <td className="row-actions row-actions--icons">
                            <ConfirmDelete
                              action={unassignEmployee}
                              id={asg.id}
                              fieldName="recordId"
                              hiddenFields={{ eventId: event.id }}
                              label={`إزالة ${asg.user.name} من الطاقم`}
                              message={`إزالة ${asg.user.name} من هذا الموعد؟`}
                            />
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
