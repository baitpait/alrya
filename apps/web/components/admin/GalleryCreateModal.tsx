"use client";

import { AdminFormModal } from "@/components/admin/AdminFormModal";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
};

export function GalleryCreateModal({ action }: Props) {
  return (
    <AdminFormModal
      trigger="primary"
      buttonLabel="إضافة عمل"
      title="إضافة عمل"
      submitLabel="إضافة"
      action={action}
      encType="multipart/form-data"
    >
      <GalleryFields />
    </AdminFormModal>
  );
}

export type GalleryEditValues = {
  id: number;
  title: string;
  caption: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  sortOrder: number;
  published: boolean;
};

export function GalleryEditModal({
  action,
  item,
}: {
  action: (formData: FormData) => void | Promise<void>;
  item: GalleryEditValues;
}) {
  return (
    <AdminFormModal
      trigger="edit-icon"
      label={`تعديل العمل ${item.title}`}
      title="تعديل عمل"
      submitLabel="حفظ"
      action={action}
      encType="multipart/form-data"
    >
      <input type="hidden" name="recordId" value={item.id} />
      <GalleryFields values={item} />
    </AdminFormModal>
  );
}

function GalleryFields({ values }: { values?: GalleryEditValues }) {
  return (
    <>
      <label>
        العنوان
        <input
          name="title"
          required
          placeholder="مثال: عرس أحمد"
          autoFocus={!values}
          defaultValue={values?.title}
        />
      </label>
      <label>
        وصف قصير
        <input
          name="caption"
          placeholder="قاعة… / حنا…"
          defaultValue={values?.caption ?? ""}
        />
      </label>
      <label>
        {values ? "استبدال الصورة (رفع)" : "رفع صورة"}
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        />
      </label>
      <label>
        {values
          ? "رابط الصورة (http/https أو /مسار — بدون SVG)"
          : "أو رابط صورة (http/https أو /مسار — بدون SVG)"}
        <input
          className="input-ltr"
          name="imageUrl"
          placeholder="/portfolio/… أو https://…"
          defaultValue={values?.imageUrl ?? ""}
        />
      </label>
      <label>
        رابط فيديو https فقط (اختياري)
        <input
          className="input-ltr"
          name="videoUrl"
          placeholder="https://youtube.com/…"
          defaultValue={values?.videoUrl ?? ""}
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
        منشور على الموقع
      </label>
    </>
  );
}
