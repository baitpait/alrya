"use client";

import { AdminFormModal } from "@/components/admin/AdminFormModal";

export type PaymentEventOption = {
  id: number;
  label: string;
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  events: PaymentEventOption[];
  today: string;
};

/** إضافة دفعة من قائمة الدفعات — يلزم اختيار المناسبة */
export function PaymentCreateModal({ action, events, today }: Props) {
  const disabled = events.length === 0;

  return (
    <AdminFormModal
      trigger="primary"
      buttonLabel="إضافة دفعة"
      title="إضافة دفعة"
      submitLabel="حفظ الدفعة"
      action={action}
      openDisabled={disabled}
      hint={
        disabled ? (
          <p>لا مناسبات بعد — أنشئي مناسبة أولاً ثم سجّلي الدفعة.</p>
        ) : undefined
      }
    >
      <label>
        المناسبة
        <select name="eventId" required defaultValue="">
          <option value="" disabled>
            اختاري مناسبة
          </option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </select>
      </label>
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
          autoFocus
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
        <input className="input-ltr" type="time" name="paidTime" defaultValue="12:00" />
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
    </AdminFormModal>
  );
}
