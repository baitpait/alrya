"use client";

import { AdminFormModal } from "@/components/admin/AdminFormModal";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
};

export function RoleCreateModal({ action }: Props) {
  return (
    <AdminFormModal
      trigger="primary"
      buttonLabel="إضافة دور"
      title="إضافة دور"
      submitLabel="حفظ الدور"
      action={action}
    >
      <label>
        اسم الدور
        <input name="name" required placeholder="مثال: مساعد" autoFocus />
      </label>
      <label>
        وصف
        <input name="description" placeholder="اختياري" />
      </label>
    </AdminFormModal>
  );
}
