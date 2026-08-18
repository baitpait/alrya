"use client";

import { useEffect, useId, useState, useTransition } from "react";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  bookingId: number;
};

/** رفض طلب حجز — بوب أب نعم/لا قبل التنفيذ */
export function RejectBookingForm({ action, bookingId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  function openDialog() {
    setError(null);
    setOpen(true);
  }

  function confirmReject() {
    setError(null);
    const fd = new FormData();
    fd.set("bookingId", String(bookingId));
    if (reason.trim()) fd.set("reason", reason.trim());
    startTransition(async () => {
      try {
        await action(fd);
        setOpen(false);
      } catch (err) {
        const msg =
          err instanceof Error && err.message.trim()
            ? err.message.trim()
            : "تعذّر رفض الطلب.";
        setError(msg);
      }
    });
  }

  return (
    <>
      <div className="inline-form">
        <label>
          سبب الرفض
          <input
            name="reason"
            placeholder="اختياري"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <button type="button" className="btn-danger" onClick={openDialog}>
          رفض الطلب
        </button>
      </div>

      {open ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="modal-panel panel confirm-dialog-panel"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={titleId}>تأكيد الرفض</h2>
            <p className="confirm-dialog-message">
              رفض هذا الطلب؟ لن يظهر على التقويم ولن يُحوَّل لمناسبة.
              {reason.trim() ? (
                <>
                  <br />
                  السبب: {reason.trim()}
                </>
              ) : null}
            </p>
            {error ? (
              <p className="modal-form-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="btn-secondary"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                لا
              </button>
              <button
                type="button"
                className="btn-danger"
                disabled={pending}
                onClick={confirmReject}
              >
                {pending ? "جاري الرفض…" : "نعم"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
