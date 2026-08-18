"use client";

import { AdminFormModal } from "@/components/admin/AdminFormModal";

export type EventCustomerOption = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
};

export type EventStatusOption = {
  value: string;
  label: string;
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  customers: EventCustomerOption[];
  statuses: EventStatusOption[];
};

export function EventCreateModal({ action, customers, statuses }: Props) {
  const noCustomers = customers.length === 0;

  return (
    <AdminFormModal
      trigger="primary"
      buttonLabel="إنشاء مناسبة"
      title="إنشاء مناسبة"
      submitLabel="حفظ المناسبة"
      action={action}
      openDisabled={noCustomers}
      hint={noCustomers ? <p>أضيفي زبوناً أولاً من صفحة الزبائن.</p> : null}
    >
      <label>
        الزبون
        <select name="customerId" required defaultValue="">
          <option value="" disabled>
            اختاري زبوناً
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName} — {c.phone}
            </option>
          ))}
        </select>
      </label>
      <label>
        الحالة
        <select name="status" defaultValue={statuses[0]?.value ?? "PREPARING"}>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        ملاحظات
        <textarea name="notes" rows={2} />
      </label>
    </AdminFormModal>
  );
}
