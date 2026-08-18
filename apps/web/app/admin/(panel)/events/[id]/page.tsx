import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventStatus } from "@prisma/client";
import { ActionIconLink } from "@/components/admin/AdminActionIcons";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { EventAppointmentCreateModal } from "@/components/admin/EventAppointmentCreateModal";
import { EventAssignStaffModal } from "@/components/admin/EventAssignStaffModal";
import { EventDetailTabs } from "@/components/admin/EventDetailTabs";
import {
  EventDiscountCreateModal,
  EventPaymentCreateModal,
} from "@/components/admin/EventFinanceModals";
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
  const remainingTone = finance.remaining < 0 ? "is-negative" : "is-positive";
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
  const customerName = `${event.customer.firstName} ${event.customer.lastName}`;
  const staffOptions = staff.map((u) => ({
    id: u.id,
    name: u.name,
    roleName: u.role.name,
  }));
  const catalogServices = services.map((s) => ({
    id: s.id,
    name: s.name,
    offers: s.offers.map((o) => ({
      id: o.id,
      name: o.name,
      price: Number(o.price),
    })),
  }));

  return (
    <div className="stack-gap">
      <AdminBackLink href="/admin/events" label="رجوع للمناسبات" />

      <section className="panel event-hero-panel">
        <div className="calendar-toolbar">
          <div>
            <h1 className="event-page-title">
              {customerName}
              <span className="event-page-id">مناسبة #{event.id}</span>
            </h1>
            <p className="event-hero-meta">
              <span className="event-status-pill">{STATUS_LABEL[event.status]}</span>
              <span className="cell-ltr">{event.customer.phone}</span>
            </p>
          </div>
          <div className="calendar-toolbar-actions">
            <ActionIconLink
              href="/admin/calendar"
              label="فتح التقويم"
              kind="calendar"
            />
            <ActionIconLink
              href={`/admin/customers/${event.customerId}`}
              label={`صفحة الزبون ${customerName}`}
              kind="view"
            />
          </div>
        </div>
        <h2 className="event-subhead">الملخص المالي</h2>
        <FinanceSummary finance={finance} />
      </section>

      <EventDetailTabs
        overview={
          <section className="panel">
            <h2>الزبون والحالة</h2>
            <dl className="event-dl">
              <div>
                <dt>الاسم</dt>
                <dd>
                  <Link
                    className="text-link"
                    href={`/admin/customers/${event.customerId}`}
                  >
                    {customerName}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>الجوال</dt>
                <dd className="cell-ltr">{event.customer.phone}</dd>
              </div>
            </dl>

            <h3 className="event-subhead">الحالة والاتفاقية</h3>
            <form action={updateEventStatus} className="stacked-form">
              <input type="hidden" name="recordId" value={event.id} />
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

            <div className="detail-footer-actions event-danger-zone">
              <ConfirmDelete
                action={deleteEvent}
                id={event.id}
                fieldName="recordId"
                label="حذف المناسبة"
                message="تأكيد حذف المناسبة وكل مواعيدها ودفعاتها؟ لا يمكن التراجع."
              />
            </div>
          </section>
        }
        appointments={
          <section className="panel">
            <div className="calendar-toolbar">
              <h2>المواعيد ({event.services.length})</h2>
              <EventAppointmentCreateModal
                action={addEventService}
                eventId={event.id}
                services={catalogServices}
                defaultStartsDate={toDateInputValue(defaultStart)}
                defaultStartsTime={toTimeInputValue(defaultStart)}
                defaultEndsDate={toDateInputValue(defaultEnd)}
                defaultEndsTime={toTimeInputValue(defaultEnd)}
              />
            </div>
            {event.services.length === 0 ? (
              <p>لا مواعيد بعد — أضيفي موعداً من الزر أعلاه ليظهر على التقويم.</p>
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
                      <th>إجراءات</th>
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
                          <ActionIconLink
                            href="/admin/calendar"
                            label={`التقويم — ${es.service.name}`}
                            kind="calendar"
                          />
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
        }
        finance={
          <div className="stack-gap">
            <section className="panel">
              <div className="calendar-toolbar">
                <h2>الدفعات ({event.payments.length})</h2>
                <EventPaymentCreateModal
                  action={addPayment}
                  eventId={event.id}
                  today={today}
                />
              </div>
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
            </section>

            <section className="panel">
              <div className="calendar-toolbar">
                <h2>الخصومات ({event.discounts.length})</h2>
                <EventDiscountCreateModal action={addDiscount} eventId={event.id} />
              </div>
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
          </div>
        }
        crew={
          <section className="panel">
            <h2>طاقم التغطية</h2>
            {event.services.length === 0 ? (
              <p>أضيفي موعداً من تبويب المواعيد أولاً ثم عيّني الطاقم.</p>
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
                  <div className="calendar-toolbar">
                    <h3>
                      {es.service.name}{" "}
                      <span className="cell-ltr">{formatDateTimeAr(es.startsAt)}</span>
                    </h3>
                    <EventAssignStaffModal
                      action={assignEmployeeToService}
                      eventId={event.id}
                      eventServiceId={es.id}
                      appointmentLabel={es.service.name}
                      staff={staffOptions}
                    />
                  </div>
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
                                {asg.salary != null
                                  ? Number(asg.salary).toFixed(2)
                                  : "—"}
                              </td>
                              <td className="cell-ltr">
                                {asg.bonus != null
                                  ? Number(asg.bonus).toFixed(2)
                                  : "—"}
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
        }
      />
    </div>
  );
}
