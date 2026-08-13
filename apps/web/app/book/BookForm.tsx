"use client";

import { useActionState } from "react";
import { submitBookingRequest, type BookState } from "./actions";

type ServiceOption = { id: number; name: string };

const initial: BookState = {};

const MONTHS_AR = [
  { value: "01", label: "يناير" },
  { value: "02", label: "فبراير" },
  { value: "03", label: "مارس" },
  { value: "04", label: "أبريل" },
  { value: "05", label: "مايو" },
  { value: "06", label: "يونيو" },
  { value: "07", label: "يوليو" },
  { value: "08", label: "أغسطس" },
  { value: "09", label: "سبتمبر" },
  { value: "10", label: "أكتوبر" },
  { value: "11", label: "نوفمبر" },
  { value: "12", label: "ديسمبر" },
];

const DAYS = Array.from({ length: 31 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return n;
});

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => String(currentYear + i));

function ArabicDateFields({ prefix, title }: { prefix: string; title: string }) {
  return (
    <fieldset className="book-date-fieldset">
      <legend>{title}</legend>
      <div className="book-date-row">
        <label>
          اليوم
          <select name={`${prefix}Day`} defaultValue="">
            <option value="">—</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {Number(d)}
              </option>
            ))}
          </select>
        </label>
        <label>
          الشهر
          <select name={`${prefix}Month`} defaultValue="">
            <option value="">—</option>
            {MONTHS_AR.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          السنة
          <select name={`${prefix}Year`} defaultValue="">
            <option value="">—</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}

export function BookForm({ services }: { services: ServiceOption[] }) {
  const [state, formAction, pending] = useActionState(submitBookingRequest, initial);

  return (
    <form action={formAction} className="book-form">
      <label>
        اسم العريس / صاحب المناسبة
        <input name="groomName" required autoComplete="name" />
      </label>
      <label>
        اسم العروس (اختياري)
        <input name="brideName" />
      </label>
      <label>
        الهاتف
        <input className="input-ltr" name="phone" required inputMode="tel" autoComplete="tel" />
      </label>
      <label>
        هاتف إضافي
        <input className="input-ltr" name="altPhone" inputMode="tel" />
      </label>
      <label>
        نوع الخدمة / المناسبة
        <select name="serviceId" defaultValue="">
          <option value="">— اختياري —</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <ArabicDateFields prefix="preferredFrom" title="التاريخ المفضّل من (اختياري)" />
      <ArabicDateFields prefix="preferredTo" title="التاريخ المفضّل إلى (اختياري)" />

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
        <textarea name="notes" rows={3} />
      </label>
      {state.error ? <p className="book-error">{state.error}</p> : null}
      <button type="submit" disabled={pending}>
        {pending ? "جاري الإرسال…" : "إرسال طلب الحجز"}
      </button>
    </form>
  );
}
