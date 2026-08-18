"use client";

import { AdminFormModal } from "@/components/admin/AdminFormModal";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  eventId: number;
  today: string;
};

export function EventPaymentCreateModal({ action, eventId, today }: Props) {
  return (
    <AdminFormModal
      trigger="primary"
      buttonLabel="إضافة دفعة"
      title="إضافة دفعة"
      submitLabel="حفظ الدفعة"
      action={action}
    >
      <input type="hidden" name="eventId" value={eventId} />
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

export function EventDiscountCreateModal({
  action,
  eventId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  eventId: number;
}) {
  return (
    <AdminFormModal
      trigger="primary"
      buttonLabel="إضافة خصم"
      title="إضافة خصم"
      submitLabel="حفظ الخصم"
      action={action}
    >
      <input type="hidden" name="eventId" value={eventId} />
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
        السبب
        <input name="reason" placeholder="مثال: خصم عرسان" />
      </label>
    </AdminFormModal>
  );
}
