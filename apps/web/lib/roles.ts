/** ثوابت الأدوار — آمنة للـ middleware (بدون Prisma) */

export const MANAGER_ROLE_NAME = "مدير الأستوديو";

export function isManagerRole(roleName: string) {
  return roleName.trim() === MANAGER_ROLE_NAME;
}

/** مسارات الإدارة الحساسة — للمدير فقط */
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
] as const;

export function isManagerOnlyPath(pathname: string) {
  return MANAGER_ONLY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isManagerOnlyNavHref(href: string) {
  return isManagerOnlyPath(href);
}
