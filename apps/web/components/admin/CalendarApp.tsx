"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type {
  DateSelectArg,
  EventClickArg,
  LocaleInput,
  PluginDef,
} from "@fullcalendar/core";
import type FullCalendarType from "@fullcalendar/react";
import {
  createCalendarAppointment,
  updateCalendarAppointment,
} from "@/app/admin/(panel)/calendar/actions";
import type { CalendarEventDto } from "@/lib/calendar-events";

type FullCalendarComponent = typeof FullCalendarType;

type Option = { id: number; label: string };
type OfferOption = { id: number; serviceId: number; label: string; price: number };
type EventOption = { id: number; customerId: number; label: string };

type Props = {
  initialEvents: CalendarEventDto[];
  customers: Option[];
  services: Option[];
  offers: OfferOption[];
  events: EventOption[];
  /** المدير يعدّل المواعيد — الطاقم يشاهد فقط */
  canEdit?: boolean;
};

type ModalMode = "closed" | "create" | "detail";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateInput(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInput(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatAr(iso: string) {
  return new Date(iso).toLocaleString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function CalendarApp({
  initialEvents,
  customers,
  services,
  offers,
  events,
  canEdit = true,
}: Props) {
  const [eventsState, setEventsState] = useState(initialEvents);
  const [mode, setMode] = useState<ModalMode>("closed");
  const [selected, setSelected] = useState<CalendarEventDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [customerId, setCustomerId] = useState("");
  const [eventId, setEventId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [startsDate, setStartsDate] = useState(toDateInput(new Date()));
  const [startsTime, setStartsTime] = useState("18:00");
  const [endsDate, setEndsDate] = useState(toDateInput(new Date()));
  const [endsTime, setEndsTime] = useState("20:00");
  const [FullCalendar, setFullCalendar] = useState<FullCalendarComponent | null>(
    null,
  );
  const [plugins, setPlugins] = useState<PluginDef[]>([]);
  const [arLocale, setArLocale] = useState<LocaleInput | null>(null);

  const reload = useCallback(async () => {
    const res = await fetch("/api/admin/calendar/events", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { events: CalendarEventDto[] };
    setEventsState(data.events);
  }, []);

  useEffect(() => {
    setEventsState(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [
        { default: Calendar },
        { default: dayGridPlugin },
        { default: timeGridPlugin },
        { default: interactionPlugin },
        { default: listPlugin },
        localeMod,
      ] = await Promise.all([
        import("@fullcalendar/react"),
        import("@fullcalendar/daygrid"),
        import("@fullcalendar/timegrid"),
        import("@fullcalendar/interaction"),
        import("@fullcalendar/list"),
        import("@fullcalendar/core/locales/ar"),
      ]);
      if (cancelled) return;
      setFullCalendar(() => Calendar);
      setPlugins([dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]);
      setArLocale(localeMod.default);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    if (!customerId) return events;
    return events.filter((e) => String(e.customerId) === customerId);
  }, [events, customerId]);

  const filteredOffers = useMemo(() => {
    if (!serviceId) return offers;
    return offers.filter((o) => String(o.serviceId) === serviceId);
  }, [offers, serviceId]);

  function openCreate(prefillStart?: Date, prefillEnd?: Date) {
    setError(null);
    setSelected(null);
    const start = prefillStart ?? new Date();
    const end = prefillEnd ?? new Date(start.getTime() + 2 * 60 * 60 * 1000);
    setStartsDate(toDateInput(start));
    setStartsTime(toTimeInput(start));
    setEndsDate(toDateInput(end));
    setEndsTime(toTimeInput(end));
    setMode("create");
  }

  function onSelect(arg: DateSelectArg) {
    if (!canEdit) return;
    openCreate(arg.start, arg.end);
  }

  function onEventClick(arg: EventClickArg) {
    const found = eventsState.find((e) => e.id === arg.event.id);
    if (!found) return;
    setSelected(found);
    setMode("detail");
    setError(null);
  }

  function onCreateSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createCalendarAppointment(formData);
        await reload();
        setMode("closed");
      } catch (e) {
        setError(e instanceof Error ? e.message : "تعذر الحفظ");
      }
    });
  }

  function onUpdateSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await updateCalendarAppointment(formData);
        await reload();
        setMode("closed");
      } catch (e) {
        setError(e instanceof Error ? e.message : "تعذر التحديث");
      }
    });
  }

  return (
    <div className="stack-gap calendar-page">
      <section className="panel">
        <div className="calendar-toolbar">
          <div>
            <h1>التقويم</h1>
            <p>
              {canEdit
                ? "كل المواعيد من سجل الاستوديو — مواعيد حقيقية فقط، بدون تجريب وهمي."
                : "عرض المواعيد فقط — إضافة وتعديل الموعد للمدير."}
            </p>
          </div>
          {canEdit ? (
            <button type="button" className="btn-primary" onClick={() => openCreate()}>
              إضافة موعد
            </button>
          ) : null}
        </div>

        <div className="calendar-wrap">
          {FullCalendar && arLocale ? (
            <FullCalendar
              plugins={plugins}
              locale={arLocale}
              direction="rtl"
              initialView="dayGridMonth"
              headerToolbar={{
                start: "prev,next today",
                center: "title",
                end: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
              }}
              buttonText={{
                today: "اليوم",
                month: "شهر",
                week: "أسبوع",
                day: "يوم",
                list: "قائمة",
              }}
              height="auto"
              selectable={canEdit}
              selectMirror={canEdit}
              dayMaxEvents={3}
              moreLinkText="المزيد"
              eventDisplay="block"
              fixedWeekCount={false}
              events={eventsState}
              select={onSelect}
              eventClick={onEventClick}
            />
          ) : (
            <p>جاري تحميل التقويم…</p>
          )}
        </div>
      </section>

      {mode !== "closed" ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setMode("closed")}>
          <div
            className="modal-panel panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {mode === "create" && canEdit ? (
              <>
                <h2>إضافة موعد</h2>
                <p>يُحفظ الموعد ويظهر فوراً على التقويم.</p>
                <form action={onCreateSubmit} className="inline-form">
                  <label>
                    الزبون
                    <select
                      name="customerId"
                      required
                      value={customerId}
                      onChange={(e) => {
                        setCustomerId(e.target.value);
                        setEventId("");
                      }}
                    >
                      <option value="" disabled>
                        اختاري زبوناً
                      </option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    مناسبة موجودة (اختياري)
                    <select
                      name="eventId"
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                    >
                      <option value="">— إنشاء مناسبة جديدة —</option>
                      {filteredEvents.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    الخدمة
                    <select
                      name="serviceId"
                      required
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                    >
                      <option value="" disabled>
                        اختاري خدمة
                      </option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    العرض (اختياري)
                    <select name="offerId" defaultValue="">
                      <option value="">—</option>
                      {filteredOffers.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
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
                      value={startsDate}
                      onChange={(e) => setStartsDate(e.target.value)}
                    />
                  </label>
                  <label>
                    وقت البداية
                    <input
                      className="input-ltr"
                      type="time"
                      name="startsTime"
                      required
                      value={startsTime}
                      onChange={(e) => setStartsTime(e.target.value)}
                    />
                  </label>
                  <label>
                    تاريخ النهاية
                    <input
                      className="input-ltr"
                      type="date"
                      name="endsDate"
                      required
                      value={endsDate}
                      onChange={(e) => setEndsDate(e.target.value)}
                    />
                  </label>
                  <label>
                    وقت النهاية
                    <input
                      className="input-ltr"
                      type="time"
                      name="endsTime"
                      required
                      value={endsTime}
                      onChange={(e) => setEndsTime(e.target.value)}
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
                  {error ? <p className="login-error">{error}</p> : null}
                  <div className="modal-footer-actions">
                    <button type="submit" className="btn-primary" disabled={pending}>
                      {pending ? "جاري الحفظ…" : "حفظ الموعد"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setMode("closed")}
                    >
                      إغلاق
                    </button>
                  </div>
                </form>
              </>
            ) : null}

            {mode === "detail" && selected ? (
              <>
                <h2>{selected.title}</h2>
                <ul className="detail-list">
                  <li>
                    <strong>من:</strong>{" "}
                    <span className="cell-ltr">{formatAr(selected.start)}</span>
                  </li>
                  <li>
                    <strong>إلى:</strong>{" "}
                    <span className="cell-ltr">{formatAr(selected.end)}</span>
                  </li>
                  <li>
                    <strong>الزبون:</strong> {selected.extendedProps.customerName}
                  </li>
                  <li>
                    <strong>الخدمة:</strong> {selected.extendedProps.serviceName}
                  </li>
                  <li>
                    <strong>المكان:</strong>{" "}
                    {[
                      selected.extendedProps.city,
                      selected.extendedProps.venue,
                      selected.extendedProps.hall,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </li>
                  <li>
                    <strong>السعر:</strong>{" "}
                    <span className="cell-ltr">
                      {selected.extendedProps.price.toFixed(2)} ₪
                    </span>
                  </li>
                </ul>

                {canEdit ? (
                <form action={onUpdateSubmit} className="inline-form">
                  <h3>تعديل الموعد</h3>
                  {/* eventServiceId وليس name=id — name=id يظلل form.id في المتصفح */}
                  <input
                    type="hidden"
                    name="eventServiceId"
                    value={selected.extendedProps.eventServiceId}
                  />
                  <label>
                    تاريخ البداية
                    <input
                      className="input-ltr"
                      type="date"
                      name="startsDate"
                      required
                      defaultValue={toDateInput(new Date(selected.start))}
                    />
                  </label>
                  <label>
                    وقت البداية
                    <input
                      className="input-ltr"
                      type="time"
                      name="startsTime"
                      required
                      defaultValue={toTimeInput(new Date(selected.start))}
                    />
                  </label>
                  <label>
                    تاريخ النهاية
                    <input
                      className="input-ltr"
                      type="date"
                      name="endsDate"
                      required
                      defaultValue={toDateInput(new Date(selected.end))}
                    />
                  </label>
                  <label>
                    وقت النهاية
                    <input
                      className="input-ltr"
                      type="time"
                      name="endsTime"
                      required
                      defaultValue={toTimeInput(new Date(selected.end))}
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
                      defaultValue={selected.extendedProps.price}
                    />
                  </label>
                  <label>
                    المدينة
                    <input name="city" defaultValue={selected.extendedProps.city ?? ""} />
                  </label>
                  <label>
                    المكان
                    <input name="venue" defaultValue={selected.extendedProps.venue ?? ""} />
                  </label>
                  <label>
                    القاعة
                    <input name="hall" defaultValue={selected.extendedProps.hall ?? ""} />
                  </label>
                  <label>
                    ملاحظات
                    <textarea name="notes" rows={2} />
                  </label>
                  {error ? <p className="login-error">{error}</p> : null}
                  <div className="modal-footer-actions">
                    <button type="submit" className="btn-primary" disabled={pending}>
                      {pending ? "جاري الحفظ…" : "حفظ التعديل"}
                    </button>
                    <Link
                      className="btn-secondary"
                      href={`/admin/events/${selected.extendedProps.eventId}`}
                    >
                      فتح المناسبة
                    </Link>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setMode("closed")}
                    >
                      إغلاق
                    </button>
                  </div>
                </form>
                ) : (
                  <div className="row-actions">
                    <Link
                      className="text-link"
                      href={`/admin/events/${selected.extendedProps.eventId}`}
                    >
                      فتح المناسبة
                    </Link>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setMode("closed")}
                    >
                      إغلاق
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
