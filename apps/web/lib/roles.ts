/** ثوابت الأدوار — آمنة للـ middleware (بدون Prisma) */

/** الدور الوحيد المسموح له دخول `/admin` (قرار المرحلة 15) */
export const MANAGER_ROLE_NAME = "مدير الأستوديو";

export function isManagerRole(roleName: string) {
  return roleName.trim() === MANAGER_ROLE_NAME;
}

/** دخول اللوحة = نفس شرط المسؤول — لا حقل canLogin منفصل */
export function roleCanLogin(roleName: string) {
  return isManagerRole(roleName);
}

/** مسارات الإدارة الحساسة — للمدير فقط (الطاقم لا يدخل أصلاً) */
export const MANAGER_ONLY_PREFIXES = [
  "/admin/employees",
  "/admin/settings",
  "/admin/reports",
  "/admin/gallery",
  "/admin/faq",
  "/admin/services",
  "/admin/bookings",
  "/admin/messages",
  "/admin/customers",
  "/admin/payments",
  "/admin/calendar",
  "/admin/events",
  "/admin/my-assignments",
] as const;

export function isManagerOnlyPath(pathname: string) {
  return MANAGER_ONLY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isManagerOnlyNavHref(href: string) {
  return isManagerOnlyPath(href);
}
