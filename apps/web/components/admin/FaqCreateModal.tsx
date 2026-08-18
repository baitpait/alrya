"use client";

import { AdminFormModal } from "@/components/admin/AdminFormModal";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
};

export function FaqCreateModal({ action }: Props) {
  return (
    <AdminFormModal
      trigger="primary"
      buttonLabel="إضافة سؤال"
      title="إضافة سؤال"
      submitLabel="إضافة"
      action={action}
    >
      <FaqFields />
    </AdminFormModal>
  );
}

export type FaqEditValues = {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
};

export function FaqEditModal({
  action,
  item,
}: {
  action: (formData: FormData) => void | Promise<void>;
  item: FaqEditValues;
}) {
  return (
    <AdminFormModal
      trigger="edit-icon"
      label={`تعديل سؤال #${item.id}`}
      title="تعديل سؤال"
      submitLabel="حفظ"
      action={action}
    >
      <input type="hidden" name="recordId" value={item.id} />
      <FaqFields values={item} />
    </AdminFormModal>
  );
}

function FaqFields({ values }: { values?: FaqEditValues }) {
  return (
    <>
      <label>
        السؤال
        <input
          name="question"
          required
          placeholder="كيف أحجز؟"
          autoFocus={!values}
          defaultValue={values?.question}
        />
      </label>
      <label>
        الجواب
        <textarea
          name="answer"
          required
          rows={values ? 5 : 3}
          defaultValue={values?.answer}
        />
      </label>
      <label>
        الترتيب
        <input
          className="input-ltr"
          name="sortOrder"
          type="number"
          defaultValue={values?.sortOrder ?? 0}
        />
      </label>
      <label className="check-row">
        <input
          name="published"
          type="checkbox"
          value="1"
          defaultChecked={values ? values.published : true}
        />
        منشور
      </label>
    </>
  );
}
