"use client";

import { AdminFormModal } from "@/components/admin/AdminFormModal";

export type CatalogServiceOption = {
  id: number;
  name: string;
  offers: { id: number; name: string; price: number }[];
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  eventId: number;
  services: CatalogServiceOption[];
  defaultStartsDate: string;
  defaultStartsTime: string;
  defaultEndsDate: string;
  defaultEndsTime: string;
};

export function EventAppointmentCreateModal({
  action,
  eventId,
  services,
  defaultStartsDate,
  defaultStartsTime,
  defaultEndsDate,
  defaultEndsTime,
}: Props) {
  const disabled = services.length === 0;

  return (
    <AdminFormModal
      trigger="primary"
      buttonLabel="إضافة موعد"
      title="إضافة موعد"
      submitLabel="حفظ الموعد"
      action={action}
      openDisabled={disabled}
      hint={
        disabled ? (
          <p>
            لا خدمات نشطة — أضيفي من صفحة الخدمات أولاً.
          </p>
        ) : null
      }
    >
      <input type="hidden" name="eventId" value={eventId} />
      <label>
        الخدمة
        <select name="serviceId" required defaultValue="" autoFocus>
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
                {s.name} / {o.name} ({o.price.toFixed(2)})
              </option>
            )),
          )}
        </select>
      </label>
      <label>
        تاريخ البداية
        <input
          className="input-ltr"
          type="date"
          name="startsDate"
          required
          defaultValue={defaultStartsDate}
        />
      </label>
      <label>
        وقت البداية
        <input
          className="input-ltr"
          type="time"
          name="startsTime"
          required
          defaultValue={defaultStartsTime}
        />
      </label>
      <label>
        تاريخ النهاية
        <input
          className="input-ltr"
          type="date"
          name="endsDate"
          required
          defaultValue={defaultEndsDate}
        />
      </label>
      <label>
        وقت النهاية
        <input
          className="input-ltr"
          type="time"
          name="endsTime"
          required
          defaultValue={defaultEndsTime}
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
    </AdminFormModal>
  );
}
