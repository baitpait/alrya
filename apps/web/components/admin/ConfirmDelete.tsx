"use client";

import { TrashIcon } from "./AdminActionIcons";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  id: number;
  /** تجنّب name="id" — يظلل form.id في أدوات المتصفح */
  fieldName?: string;
  /** حقول مخفية إضافية (مثال: eventId للدفعات) */
  hiddenFields?: Record<string, string | number>;
  /** للوصول — يظهر في title و aria-label */
  label?: string;
  message?: string;
  /** icon = جداول؛ button = صفحات تفاصيل بعبارات طويلة إن لزم */
  variant?: "icon" | "button";
};

export function ConfirmDelete({
  action,
  id,
  fieldName = "recordId",
  hiddenFields,
  label = "حذف",
  message = "تأكيد الحذف؟ لا يمكن التراجع.",
  variant = "icon",
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={variant === "icon" ? "confirm-delete-form" : undefined}
    >
      <input type="hidden" name={fieldName} value={id} />
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={String(value)} />
          ))
        : null}
      {variant === "icon" ? (
        <button
          type="submit"
          className="btn-icon btn-icon--delete"
          title={label}
          aria-label={label}
        >
          <TrashIcon />
        </button>
      ) : (
        <button type="submit" className="btn-danger">
          {label}
        </button>
      )}
    </form>
  );
}
