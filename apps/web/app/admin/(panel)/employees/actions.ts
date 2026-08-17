"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getSession } from "@/lib/session";

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
  const name = requireText(formData.get("name"), "اسم الدور");
  const description = String(formData.get("description") ?? "").trim() || null;
  const exists = await prisma.role.findFirst({ where: { name } });
  if (exists) throw new Error("هذا الدور موجود مسبقاً.");
  await prisma.role.create({ data: { name, description } });
  revalidatePath("/admin/employees");
}

export async function deleteRole(formData: FormData) {
  const id = Number(formData.get("recordId") ?? formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");
  const users = await prisma.user.count({ where: { roleId: id } });
  if (users > 0) throw new Error("لا يمكن حذف دور مرتبط بموظفين.");
  await prisma.role.delete({ where: { id } });
  revalidatePath("/admin/employees");
}

export async function createEmployee(formData: FormData) {
  const name = requireText(formData.get("name"), "الاسم");
  const email = requireText(formData.get("email"), "البريد").toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const roleId = Number(formData.get("roleId"));
  const password = requireText(formData.get("password"), "كلمة المرور");
  if (password.length < 8) throw new Error("كلمة المرور 8 أحرف على الأقل.");
  if (!Number.isFinite(roleId) || roleId <= 0) throw new Error("اختاري دوراً.");

  const dup = await prisma.user.findUnique({ where: { email } });
  if (dup) throw new Error("البريد مستخدم مسبقاً.");

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      roleId,
      passwordHash: await hashPassword(password),
      active: true,
    },
  });

  revalidatePath("/admin/employees");
}

export async function updateEmployee(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  const name = requireText(formData.get("name"), "الاسم");
  const email = requireText(formData.get("email"), "البريد").toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const roleId = Number(formData.get("roleId"));
  const active = parseActive(formData.get("active"));
  const password = String(formData.get("password") ?? "").trim();

  if (!Number.isFinite(roleId) || roleId <= 0) throw new Error("اختاري دوراً.");

  const session = await getSession();
  if (session && String(id) === session.sub && !active) {
    throw new Error("لا يمكن تعطيل حسابك الحالي.");
  }

  const dup = await prisma.user.findFirst({
    where: { email, NOT: { id } },
  });
  if (dup) throw new Error("البريد مستخدم مسبقاً.");

  const data: {
    name: string;
    email: string;
    phone: string | null;
    roleId: number;
    active: boolean;
    passwordHash?: string;
  } = { name, email, phone, roleId, active };

  if (password) {
    if (password.length < 8) throw new Error("كلمة المرور 8 أحرف على الأقل.");
    data.passwordHash = await hashPassword(password);
  }

  await prisma.user.update({ where: { id }, data });
  revalidatePath("/admin/employees");
  revalidatePath(`/admin/employees/${id}`);
}

export async function deleteEmployee(formData: FormData) {
  const id = Number(formData.get("recordId") ?? formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  const session = await getSession();
  if (session && String(id) === session.sub) {
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
