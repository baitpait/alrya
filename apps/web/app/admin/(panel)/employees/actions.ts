"use server";

import { requireManager } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { isManagerRole } from "@/lib/roles";

function requireText(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} مطلوب.`);
  return text;
}

function parseActive(raw: FormDataEntryValue | null) {
  const v = String(raw ?? "");
  return v === "1" || v === "true" || v === "on";
}

export async function createRole(formData: FormData) {
  await requireManager();
  const name = requireText(formData.get("name"), "اسم الدور");
  if (isManagerRole(name)) {
    throw new Error("دور المسؤول موجود مسبقاً ولا يُنشأ من هنا.");
  }
  const description = String(formData.get("description") ?? "").trim() || null;
  const exists = await prisma.role.findFirst({ where: { name } });
  if (exists) throw new Error("هذا الدور موجود مسبقاً.");
  await prisma.role.create({ data: { name, description } });
  revalidatePath("/admin/employees");
}

export async function deleteRole(formData: FormData) {
  await requireManager();
  const id = Number(formData.get("recordId") ?? formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");
  const users = await prisma.user.count({ where: { roleId: id } });
  if (users > 0) throw new Error("لا يمكن حذف دور مرتبط بموظفين.");
  await prisma.role.delete({ where: { id } });
  revalidatePath("/admin/employees");
}

async function roleAllowsLogin(roleId: number) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new Error("الدور غير موجود.");
  return isManagerRole(role.name);
}

export async function createEmployee(formData: FormData) {
  await requireManager();
  const name = requireText(formData.get("name"), "الاسم");
  const email = requireText(formData.get("email"), "البريد").toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const roleId = Number(formData.get("roleId"));
  if (!Number.isFinite(roleId) || roleId <= 0) throw new Error("اختاري دوراً.");

  const canLogin = await roleAllowsLogin(roleId);
  const password = String(formData.get("password") ?? "").trim();
  if (canLogin) {
    if (!password) throw new Error("كلمة المرور مطلوبة لحساب المسؤول.");
    if (password.length < 8) throw new Error("كلمة المرور 8 أحرف على الأقل.");
  }

  const dup = await prisma.user.findUnique({ where: { email } });
  if (dup) throw new Error("البريد مستخدم مسبقاً.");

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      roleId,
      passwordHash: canLogin ? await hashPassword(password) : null,
      active: true,
    },
  });

  revalidatePath("/admin/employees");
}

export async function updateEmployee(formData: FormData) {
  const session = await requireManager();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  const name = requireText(formData.get("name"), "الاسم");
  const email = requireText(formData.get("email"), "البريد").toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const roleId = Number(formData.get("roleId"));
  const active = parseActive(formData.get("active"));
  const password = String(formData.get("password") ?? "").trim();

  if (!Number.isFinite(roleId) || roleId <= 0) throw new Error("اختاري دوراً.");

  if (String(id) === session.sub && !active) {
    throw new Error("لا يمكن تعطيل حسابك الحالي.");
  }

  const canLogin = await roleAllowsLogin(roleId);
  if (String(id) === session.sub && !canLogin) {
    throw new Error("لا يمكن إزالة صلاحية الدخول عن حسابك الحالي.");
  }

  const dup = await prisma.user.findFirst({
    where: { email, NOT: { id } },
  });
  if (dup) throw new Error("البريد مستخدم مسبقاً.");

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error("الموظف غير موجود.");

  const data: {
    name: string;
    email: string;
    phone: string | null;
    roleId: number;
    active: boolean;
    passwordHash?: string | null;
  } = { name, email, phone, roleId, active };

  if (!canLogin) {
    data.passwordHash = null;
  } else if (password) {
    if (password.length < 8) throw new Error("كلمة المرور 8 أحرف على الأقل.");
    data.passwordHash = await hashPassword(password);
  } else if (!existing.passwordHash) {
    throw new Error("كلمة المرور مطلوبة لحساب المسؤول.");
  }

  await prisma.user.update({ where: { id }, data });
  revalidatePath("/admin/employees");
  revalidatePath(`/admin/employees/${id}`);
}

export async function deleteEmployee(formData: FormData) {
  const session = await requireManager();
  const id = Number(formData.get("recordId") ?? formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  if (String(id) === session.sub) {
    throw new Error("لا يمكن حذف حسابك الحالي.");
  }

  const assigned = await prisma.eventServiceEmployee.count({
    where: { OR: [{ userId: id }, { supervisorId: id }] },
  });
  if (assigned > 0) {
    await prisma.user.update({ where: { id }, data: { active: false } });
  } else {
    await prisma.user.delete({ where: { id } });
  }

  revalidatePath("/admin/employees");
}
