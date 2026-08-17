"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  assertSafeImageUpload,
  sanitizeExternalHttpUrl,
  sanitizePublicMediaUrl,
} from "@/lib/safe-url";

function requireText(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} مطلوب.`);
  return text;
}

function parsePublished(raw: FormDataEntryValue | null) {
  const v = String(raw ?? "");
  return v === "1" || v === "true" || v === "on";
}

function parseSort(raw: FormDataEntryValue | null) {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

async function saveGalleryUpload(file: File | null) {
  if (!file || file.size === 0) return null;
  const ext = assertSafeImageUpload(file);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "gallery");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/gallery/${fileName}`;
}

function revalidatePublic() {
  revalidatePath("/admin/gallery");
  revalidatePath("/portfolio");
  revalidatePath("/");
}

export async function createGalleryItem(formData: FormData) {
  const title = requireText(formData.get("title"), "العنوان");
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const uploaded = await saveGalleryUpload(formData.get("image") as File | null);
  const imageUrl =
    uploaded ?? sanitizePublicMediaUrl(String(formData.get("imageUrl") ?? ""), "رابط الصورة");
  const videoUrl = sanitizeExternalHttpUrl(
    String(formData.get("videoUrl") ?? ""),
    "رابط الفيديو",
  );
  if (!imageUrl && !videoUrl) {
    throw new Error("أضيفي صورة أو رابط فيديو.");
  }

  await prisma.galleryItem.create({
    data: {
      title,
      caption,
      imageUrl,
      videoUrl,
      sortOrder: parseSort(formData.get("sortOrder")),
      published: parsePublished(formData.get("published")),
    },
  });
  revalidatePublic();
}

export async function updateGalleryItem(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");

  const title = requireText(formData.get("title"), "العنوان");
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const uploaded = await saveGalleryUpload(formData.get("image") as File | null);
  const imageUrl =
    uploaded ?? sanitizePublicMediaUrl(String(formData.get("imageUrl") ?? ""), "رابط الصورة");
  const videoUrl = sanitizeExternalHttpUrl(
    String(formData.get("videoUrl") ?? ""),
    "رابط الفيديو",
  );
  if (!imageUrl && !videoUrl) {
    throw new Error("أضيفي صورة أو رابط فيديو.");
  }

  await prisma.galleryItem.update({
    where: { id },
    data: {
      title,
      caption,
      imageUrl,
      videoUrl,
      sortOrder: parseSort(formData.get("sortOrder")),
      published: parsePublished(formData.get("published")),
    },
  });
  revalidatePublic();
  revalidatePath(`/admin/gallery/${id}`);
  redirect("/admin/gallery");
}

export async function deleteGalleryItem(formData: FormData) {
  const id = Number(formData.get("recordId") ?? formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("معرّف غير صالح.");
  await prisma.galleryItem.delete({ where: { id } });
  revalidatePublic();
  redirect("/admin/gallery");
}
