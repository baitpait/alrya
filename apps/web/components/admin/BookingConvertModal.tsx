"use client";

import { AdminFormModal } from "@/components/admin/AdminFormModal";

export type BookingServiceOption = {
  id: number;
  name: string;
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  bookingId: number;
  services: BookingServiceOption[];
  defaultServiceId: number | "";
  defaultStartsDate: string;
  defaultEndsDate: string;
  defaultPrice: number;
  defaultCity: string;
  defaultVenue: string;
  defaultHall: string;
};

export function BookingConvertModal({
  action,
  bookingId,
  services,
  defaultServiceId,
  defaultStartsDate,
  defaultEndsDate,
  defaultPrice,
  defaultCity,
  defaultVenue,
  defaultHall,
}: Props) {
  const disabled = services.length === 0;

  return (
    <AdminFormModal
      trigger="primary"
      buttonLabel="تحويل للتقويم"
      title="تحويل إلى مناسبة + تقويم"
      submitLabel="تحويل"
      action={action}
      openDisabled={disabled}
      hint={
        disabled ? (
          <p>لا خدمات نشطة — أضيفي خدمة من صفحة الخدمات أولاً.</p>
        ) : undefined
      }
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <label>
        الخدمة
        <select name="serviceId" required defaultValue={defaultServiceId || ""}>
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
          defaultValue="18:00"
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
          defaultValue="20:00"
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
          defaultValue={defaultPrice}
        />
      </label>
      <label>
        المدينة
        <input name="city" defaultValue={defaultCity} />
      </label>
      <label>
        المكان
        <input name="venue" defaultValue={defaultVenue} />
      </label>
      <label>
        القاعة
        <input name="hall" defaultValue={defaultHall} />
      </label>
    </AdminFormModal>
  );
}
