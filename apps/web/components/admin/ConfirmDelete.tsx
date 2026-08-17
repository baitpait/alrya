"use client";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  id: number;
  /** تجنّب name="id" — يظلل form.id في أدوات المتصفح */
  fieldName?: string;
  label?: string;
  message?: string;
};

export function ConfirmDelete({
  action,
  id,
  fieldName = "recordId",
  label = "حذف",
  message = "تأكيد الحذف؟ لا يمكن التراجع.",
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      <input type="hidden" name={fieldName} value={id} />
      <button type="submit" className="btn-danger">
        {label}
      </button>
    </form>
  );
}
