"use client";

import { useEffect, useId, useState, useTransition, type ReactNode } from "react";
import { ActionIconButton } from "@/components/admin/AdminActionIcons";
import { ModalFormFooter } from "@/components/admin/ModalFormFooter";

type Props = {
  title: string;
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  openDisabled?: boolean;
  hint?: ReactNode;
  encType?: "multipart/form-data" | "application/x-www-form-urlencoded";
  children: ReactNode;
} & (
  | {
      trigger: "primary";
      buttonLabel: string;
    }
  | {
      trigger: "edit-icon";
      label: string;
    }
);

function messageFromUnknown(err: unknown) {
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return "تعذّر الحفظ. راجعي البيانات وحاولي مرة أخرى.";
}

function isNextRedirect(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: unknown }).digest === "string" &&
    String((err as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export function AdminFormModal(props: Props) {
  const {
    title,
    submitLabel,
    action,
    openDisabled = false,
    hint,
    encType,
    children,
  } = props;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  function openModal() {
    setFormError(null);
    setOpen(true);
  }

  function onSubmit(formData: FormData) {
    setFormError(null);
    startTransition(async () => {
      try {
        await action(formData);
        setOpen(false);
      } catch (err) {
        if (isNextRedirect(err)) throw err;
        const msg = messageFromUnknown(err);
        setFormError(msg);
        window.alert(msg);
      }
    });
  }

  return (
    <>
      {props.trigger === "primary" ? (
        <button
          type="button"
          className="btn-primary"
          disabled={openDisabled}
          onClick={openModal}
        >
          {props.buttonLabel}
        </button>
      ) : (
        <ActionIconButton
          label={props.label}
          kind="edit"
          disabled={openDisabled}
          onClick={openModal}
        />
      )}
      {hint && !open && props.trigger === "primary" && openDisabled ? (
        <div className="modal-open-hint">{hint}</div>
      ) : null}

      {open ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="modal-panel panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={titleId}>{title}</h2>
            {hint ? <div className="modal-open-hint">{hint}</div> : null}
            {formError ? (
              <p className="modal-form-error" role="alert">
                {formError}
              </p>
            ) : null}
            <form action={onSubmit} className="inline-form" encType={encType}>
              <fieldset disabled={pending} className="modal-form-fields">
                {children}
              </fieldset>
              <ModalFormFooter
                pending={pending}
                submitLabel={submitLabel}
                onCancel={() => setOpen(false)}
              />
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
