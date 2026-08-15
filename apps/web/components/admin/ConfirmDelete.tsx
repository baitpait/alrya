"use client";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  id: number;
  label?: string;
  message?: string;
};

export function ConfirmDelete({
  action,
  id,
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
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn-danger">
        {label}
      </button>
    </form>
  );
}
