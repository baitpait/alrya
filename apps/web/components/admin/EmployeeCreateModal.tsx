"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { ActionIconButton } from "@/components/admin/AdminActionIcons";
import {
  EmployeeForm,
  type EmployeeRoleOption,
} from "@/components/admin/EmployeeForm";

type CreateProps = {
  mode: "create";
  action: (formData: FormData) => void | Promise<void>;
  roles: EmployeeRoleOption[];
};

type EditProps = {
  mode: "edit";
  action: (formData: FormData) => void | Promise<void>;
  roles: EmployeeRoleOption[];
  employee: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    roleId: number;
    active: boolean;
  };
};

type Props = CreateProps | EditProps;

function messageFromUnknown(err: unknown) {
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return "تعذّر الحفظ. راجعي البيانات وحاولي مرة أخرى.";
}

export function EmployeeFormModal(props: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const titleId = useId();
  const isCreate = props.mode === "create";

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
        await props.action(formData);
        setOpen(false);
      } catch (err) {
        const msg = messageFromUnknown(err);
        setFormError(msg);
        window.alert(msg);
      }
    });
  }

  return (
    <>
      {isCreate ? (
        <button type="button" className="btn-primary" onClick={openModal}>
          إضافة موظف
        </button>
      ) : (
        <ActionIconButton
          label={`تعديل ${props.employee.name}`}
          kind="edit"
          onClick={openModal}
        />
      )}

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
            <h2 id={titleId}>{isCreate ? "إضافة موظف" : "تعديل موظف"}</h2>
            {formError ? (
              <p className="modal-form-error" role="alert">
                {formError}
              </p>
            ) : null}
            {isCreate ? (
              <EmployeeForm
                mode="create"
                action={onSubmit}
                roles={props.roles}
                presentation="modal"
                pending={pending}
                onCancel={() => setOpen(false)}
              />
            ) : (
              <EmployeeForm
                mode="edit"
                action={onSubmit}
                roles={props.roles}
                employee={props.employee}
                presentation="modal"
                pending={pending}
                onCancel={() => setOpen(false)}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function EmployeeCreateModal({
  action,
  roles,
}: {
  action: (formData: FormData) => void | Promise<void>;
  roles: EmployeeRoleOption[];
}) {
  return <EmployeeFormModal mode="create" action={action} roles={roles} />;
}
