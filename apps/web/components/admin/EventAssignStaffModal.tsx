"use client";

import { useMemo, useState } from "react";
import { AdminFormModal } from "@/components/admin/AdminFormModal";

export type StaffOption = {
  id: number;
  name: string;
  roleName: string;
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  eventId: number;
  eventServiceId: number;
  appointmentLabel: string;
  staff: StaffOption[];
};

/**
 * المشرف قد يكون ضمن فريق العمل على الموعد (صف آخر)،
 * لكن في نفس صف التعيين: المشرف ≠ الموظف المعيَّن.
 */
export function EventAssignStaffModal({
  action,
  eventId,
  eventServiceId,
  appointmentLabel,
  staff,
}: Props) {
  const disabled = staff.length === 0;
  const [userId, setUserId] = useState("");

  const supervisorOptions = useMemo(
    () => staff.filter((u) => String(u.id) !== userId),
    [staff, userId],
  );

  return (
    <AdminFormModal
      trigger="primary"
      buttonLabel="تعيين"
      title={`تعيين طاقم — ${appointmentLabel}`}
      submitLabel="حفظ التعيين"
      action={action}
      openDisabled={disabled}
    >
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="eventServiceId" value={eventServiceId} />
      <label>
        الموظف
        <select
          name="userId"
          required
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          autoFocus
        >
          <option value="" disabled>
            اختاري موظفاً
          </option>
          {staff.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} — {u.roleName}
            </option>
          ))}
        </select>
      </label>
      <label>
        الوظيفة في هذا الموعد
        <input name="jobTitle" placeholder="مصور / مساعد / مشرف" />
      </label>
      <label>
        الراتب (₪)
        <input className="input-ltr" name="salary" type="number" step="0.01" min="0" />
      </label>
      <label>
        المكافأة (₪)
        <input className="input-ltr" name="bonus" type="number" step="0.01" min="0" />
      </label>
      <label>
        المشرف (اختياري — يمكن أن يكون ضمن الفريق في تعيين آخر)
        <select name="supervisorId" defaultValue="" key={userId || "none"}>
          <option value="">— بدون مشرف —</option>
          {supervisorOptions.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
    </AdminFormModal>
  );
}
