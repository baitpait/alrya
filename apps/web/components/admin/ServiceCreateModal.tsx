"use client";

import { AdminFormModal } from "@/components/admin/AdminFormModal";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
};

export function ServiceCreateModal({ action }: Props) {
  return (
    <AdminFormModal
      trigger="primary"
      buttonLabel="إضافة خدمة"
      title="إضافة خدمة"
      submitLabel="حفظ الخدمة"
      action={action}
    >
      <ServiceFields />
    </AdminFormModal>
  );
}

export type ServiceEditValues = {
  id: number;
  name: string;
  kind: string;
  active: boolean;
};

export function ServiceEditModal({
  action,
  service,
}: {
  action: (formData: FormData) => void | Promise<void>;
  service: ServiceEditValues;
}) {
  return (
    <AdminFormModal
      trigger="edit-icon"
      label={`تعديل الخدمة ${service.name}`}
      title="تعديل خدمة"
      submitLabel="حفظ التعديل"
      action={action}
    >
      <input type="hidden" name="recordId" value={service.id} />
      <ServiceFields values={service} />
    </AdminFormModal>
  );
}

function ServiceFields({ values }: { values?: ServiceEditValues }) {
  return (
    <>
      <label>
        الاسم
        <input
          name="name"
          required
          placeholder="مثال: عرس"
          autoFocus={!values}
          defaultValue={values?.name}
        />
      </label>
      <label>
        النوع
        <select name="kind" defaultValue={values?.kind ?? "EVENT"}>
          <option value="EVENT">مناسبة</option>
          <option value="SESSION">جلسة</option>
        </select>
      </label>
      {values ? (
        <label className="check-row">
          <input type="checkbox" name="active" defaultChecked={values.active} />
          نشطة
        </label>
      ) : null}
    </>
  );
}
