"use client";

import { AdminFormModal } from "@/components/admin/AdminFormModal";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
};

export function CustomerCreateModal({ action }: Props) {
  return (
    <AdminFormModal
      trigger="primary"
      buttonLabel="إضافة زبون"
      title="إضافة زبون"
      submitLabel="حفظ الزبون"
      action={action}
    >
      <CustomerFields />
    </AdminFormModal>
  );
}

export type CustomerEditValues = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  altPhone: string | null;
  email: string | null;
  address: string | null;
  nationalId: string | null;
  gender: string | null;
};

export function CustomerEditModal({
  action,
  customer,
}: {
  action: (formData: FormData) => void | Promise<void>;
  customer: CustomerEditValues;
}) {
  return (
    <AdminFormModal
      trigger="edit-icon"
      label={`تعديل الزبون ${customer.firstName} ${customer.lastName}`}
      title="تعديل زبون"
      submitLabel="حفظ التعديل"
      action={action}
    >
      <input type="hidden" name="recordId" value={customer.id} />
      <CustomerFields values={customer} />
    </AdminFormModal>
  );
}

function CustomerFields({ values }: { values?: CustomerEditValues }) {
  return (
    <>
      <label>
        الاسم الأول
        <input
          name="firstName"
          required
          autoFocus={!values}
          defaultValue={values?.firstName}
        />
      </label>
      <label>
        اسم العائلة
        <input name="lastName" required defaultValue={values?.lastName} />
      </label>
      <label>
        الهاتف
        <input name="phone" required defaultValue={values?.phone} />
      </label>
      <label>
        هاتف إضافي
        <input name="altPhone" defaultValue={values?.altPhone ?? ""} />
      </label>
      <label>
        البريد
        <input name="email" type="email" defaultValue={values?.email ?? ""} />
      </label>
      <label>
        العنوان
        <input name="address" defaultValue={values?.address ?? ""} />
      </label>
      <label>
        رقم الهوية
        <input
          className="input-ltr"
          name="nationalId"
          placeholder="اختياري"
          defaultValue={values?.nationalId ?? ""}
        />
      </label>
      <label>
        الجنس
        <select name="gender" defaultValue={values?.gender ?? ""}>
          <option value="">—</option>
          <option value="MALE">ذكر</option>
          <option value="FEMALE">أنثى</option>
        </select>
      </label>
    </>
  );
}
