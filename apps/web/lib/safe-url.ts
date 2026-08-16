/**
 * روابط آمنة للعرض العام — موجة A (quality-gaps-map)
 * نقبل مسارات محلية تبدأ بـ / أو روابط http(s) فقط.
 */

const SAFE_IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif"] as const;
const SAFE_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function isSafeHttpUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** مسار موقع محلي مثل /uploads/... أو /portfolio/... — بدون // أو javascript: */
export function isSafeLocalPath(raw: string): boolean {
  const s = raw.trim();
  if (!s.startsWith("/")) return false;
  if (s.startsWith("//")) return false;
  if (/[\s<>"']/.test(s)) return false;
  if (/javascript:/i.test(s)) return false;
  return true;
}

/** رابط صورة: مسار محلي أو http(s) — يرفض javascript: وdata: وsvg كنص رابط مشبوه */
export function sanitizePublicMediaUrl(
  raw: string | null | undefined,
  label = "الرابط",
): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  if (isSafeLocalPath(s)) {
    return s;
  }
  if (!isSafeHttpUrl(s)) {
    throw new Error(`${label}: يسمح فقط بروابط http أو https أو مسار يبدأ بـ /.`);
  }
  if (/\.svg(\?|#|$)/i.test(s)) {
    throw new Error(`${label}: روابط SVG عن بُعد غير مسموحة.`);
  }
  return s;
}

/** رابط فيديو/سوشيال: http(s) فقط */
export function sanitizeExternalHttpUrl(
  raw: string | null | undefined,
  label = "الرابط",
): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  if (!isSafeHttpUrl(s)) {
    throw new Error(`${label}: يسمح فقط بروابط تبدأ بـ http أو https.`);
  }
  return s;
}

export function assertSafeImageUpload(file: File) {
  if (file.size > 4 * 1024 * 1024) {
    throw new Error("الصورة أكبر من 4 ميغابايت.");
  }
  const name = file.name.toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1) : "";
  if (!(SAFE_IMAGE_EXTS as readonly string[]).includes(ext)) {
    throw new Error("الصيغة المسموحة: jpg · jpeg · png · webp · gif فقط (بدون SVG).");
  }
  const mime = (file.type || "").toLowerCase();
  if (mime && !SAFE_IMAGE_MIME.has(mime)) {
    throw new Error("نوع الملف غير مسموح. ارفعي صورة نقطية فقط.");
  }
  if (ext === "svg" || mime.includes("svg")) {
    throw new Error("رفع SVG ممنوع لأسباب أمنية.");
  }
  return ext as (typeof SAFE_IMAGE_EXTS)[number];
}
