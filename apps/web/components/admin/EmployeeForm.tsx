"use client";

import { useState } from "react";
import { MANAGER_ROLE_NAME } from "@/lib/roles";
import { ModalFormFooter } from "@/components/admin/ModalFormFooter";

export type EmployeeRoleOption = { id: number; name: string };

type SharedModal = {
  presentation?: "inline" | "modal";
  pending?: boolean;
  onCancel?: () => void;
};

type CreateProps = SharedModal & {
  mode: "create";
  roles: EmployeeRoleOption[];
  action: (formData: FormData) => void | Promise<void>;
};

type EditProps = SharedModal & {
  mode: "edit";
  roles: EmployeeRoleOption[];
  action: (formData: FormData) => void | Promise<void>;
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

function needsLoginPassword(roles: EmployeeRoleOption[], roleId: string) {
  const role = roles.find((r) => String(r.id) === roleId);
  return Boolean(role && role.name.trim() === MANAGER_ROLE_NAME);
}

export function EmployeeForm(props: Props) {
  const defaultRoleId =
    props.mode === "edit"
      ? String(props.employee.roleId)
      : String(
          props.roles.find((r) => r.name.trim() !== MANAGER_ROLE_NAME)?.id ??
            props.roles[0]?.id ??
            "",
        );
  const [roleId, setRoleId] = useState(defaultRoleId);
  const loginFields = needsLoginPassword(props.roles, roleId);
  const isModal = props.presentation === "modal";
  const pending = Boolean(props.pending);

  return (
    <form action={props.action} className="inline-form">
      {props.mode === "create" && !isModal ? <h2>إضافة موظف</h2> : null}
      {props.mode === "edit" ? (
        <input type="hidden" name="recordId" value={props.employee.id} />
      ) : null}

      <fieldset disabled={pending} className="modal-form-fields">
        <label>
          الاسم
          <input
            name="name"
            required
            autoFocus={isModal}
            defaultValue={props.mode === "edit" ? props.employee.name : undefined}
          />
        </label>
        <label>
          البريد {loginFields ? "(لدخول اللوحة)" : "(للتواصل — ليس لدخول اللوحة)"}
          <input
            className="input-ltr"
            name="email"
            type="email"
            required
            defaultValue={props.mode === "edit" ? props.employee.email : undefined}
          />
        </label>
        <label>
          الهاتف
          <input
            className="input-ltr"
            name="phone"
            defaultValue={props.mode === "edit" ? (props.employee.phone ?? "") : undefined}
          />
        </label>
        <label>
          الدور
          <select
            name="roleId"
            required
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            {props.roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        {props.mode === "edit" ? (
          <label>
            الحالة
            <select name="active" defaultValue={props.employee.active ? "1" : "0"}>
              <option value="1">نشط</option>
              <option value="0">معطّل</option>
            </select>
          </label>
        ) : null}
        {loginFields ? (
          <label>
            {props.mode === "create"
              ? "كلمة المرور"
              : "كلمة مرور جديدة (اختياري — اتركيها فارغة للإبقاء على الحالية)"}
            <input
              className="input-ltr"
              name="password"
              type="password"
              minLength={8}
              required={props.mode === "create"}
              autoComplete="new-password"
            />
          </label>
        ) : null}
      </fieldset>

      {isModal ? (
        <ModalFormFooter
          pending={pending}
          submitLabel={props.mode === "create" ? "حفظ الموظف" : "حفظ"}
          onCancel={() => props.onCancel?.()}
        />
      ) : (
        <button type="submit" className="btn-primary">
          {props.mode === "create" ? "حفظ الموظف" : "حفظ"}
        </button>
      )}
    </form>
  );
}
