"use server";

import { requireManager } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isManagerRole } from "@/lib/roles";

function requireText(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} مطلوب.`);
  return text;
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
  revalidatePath("/admin/roles");
  revalidatePath("/admin/employees");
}

export async function deleteRole(formData: FormData) {
  await requireManager();
  const id = Number(formData.get("recordId") ?? formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");
  const users = await prisma.user.count({ where: { roleId: id } });
  if (users > 0) throw new Error("لا يمكن حذف دور مرتبط بموظفين.");
  await prisma.role.delete({ where: { id } });
  revalidatePath("/admin/roles");
  revalidatePath("/admin/employees");
}
