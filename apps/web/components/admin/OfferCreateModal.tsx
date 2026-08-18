"use client";

import { AdminFormModal } from "@/components/admin/AdminFormModal";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  serviceId: number;
};

export function OfferCreateModal({ action, serviceId }: Props) {
  return (
    <AdminFormModal
      trigger="primary"
      buttonLabel="إضافة عرض"
      title="إضافة عرض / باقة"
      submitLabel="حفظ العرض"
      action={action}
    >
      <input type="hidden" name="serviceId" value={serviceId} />
      <OfferFields />
    </AdminFormModal>
  );
}

export type OfferEditValues = {
  id: number;
  name: string;
  price: number;
  listPrice: number | null;
  audience: string | null;
  description: string | null;
};

export function OfferEditModal({
  action,
  serviceId,
  offer,
}: {
  action: (formData: FormData) => void | Promise<void>;
  serviceId: number;
  offer: OfferEditValues;
}) {
  return (
    <AdminFormModal
      trigger="edit-icon"
      label={`تعديل العرض ${offer.name}`}
      title="تعديل عرض / باقة"
      submitLabel="حفظ التعديل"
      action={action}
    >
      <input type="hidden" name="recordId" value={offer.id} />
      <input type="hidden" name="serviceId" value={serviceId} />
      <OfferFields values={offer} />
    </AdminFormModal>
  );
}

function OfferFields({ values }: { values?: OfferEditValues }) {
  return (
    <>
      <label>
        اسم العرض
        <input
          name="name"
          required
          placeholder="مثال: باقة ذهبية"
          autoFocus={!values}
          defaultValue={values?.name}
        />
      </label>
      <label>
        السعر / المبلغ (₪)
        <input
          className="input-ltr"
          name="price"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          required
          placeholder="0.00"
          defaultValue={values != null ? values.price : undefined}
        />
      </label>
      <label>
        بدل (اختياري)
        <input
          className="input-ltr"
          name="listPrice"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="سعر مرجعي قبل العرض"
          defaultValue={
            values?.listPrice != null ? values.listPrice : undefined
          }
        />
      </label>
      <p className="modal-field-hint">البدل = السعر المرجعي قبل الخصم/العرض.</p>
      <label>
        الجمهور / الطاقم (اختياري)
        <input
          name="audience"
          placeholder="شخص واحد / شخصين"
          defaultValue={values?.audience ?? undefined}
        />
      </label>
      <label>
        الوصف (اختياري)
        <textarea
          name="description"
          rows={2}
          defaultValue={values?.description ?? undefined}
        />
      </label>
    </>
  );
}
