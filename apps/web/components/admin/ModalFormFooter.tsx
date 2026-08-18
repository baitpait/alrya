"use client";

import type { ReactNode } from "react";

/** تذييل مودال: إلغاء (أحمر) ثم حفظ — متجاوران بدون فراغ واسع */
export function ModalFormFooter({
  pending = false,
  submitLabel,
  onCancel,
  beforeSave,
}: {
  pending?: boolean;
  submitLabel: string;
  onCancel: () => void;
  beforeSave?: ReactNode;
}) {
  return (
    <div className="modal-footer-actions modal-footer-actions--icons" dir="ltr">
      <button
        type="button"
        className="btn-icon btn-icon--modal-cancel"
        disabled={pending}
        onClick={onCancel}
        title="إلغاء"
        aria-label="إلغاء"
      >
        <CancelIcon />
      </button>
      <div className="modal-footer-actions__end">
        {beforeSave}
        <button
          type="submit"
          className="btn-icon btn-icon--modal-save"
          disabled={pending}
          title={pending ? "جاري الحفظ…" : submitLabel}
          aria-label={pending ? "جاري الحفظ…" : submitLabel}
        >
          {pending ? <SpinnerIcon /> : <SaveIcon />}
        </button>
      </div>
    </div>
  );
}

function CancelIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}
