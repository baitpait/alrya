export type AdminNavItem = {
  href: string;
  label: string;
  /** رقم المرحلة التي تُفعَّل فيها الوظيفة الكاملة */
  phase: number;
};

/** قائمة MVP الظاهرة — كل رابط يفتح صفحة حقيقية (placeholder إن لزم) */
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "لوحة التحكم", phase: 1 },
  { href: "/admin/calendar", label: "التقويم", phase: 5 },
  { href: "/admin/bookings", label: "طلبات التسجيل", phase: 7 },
  { href: "/admin/messages", label: "رسائل التواصل", phase: 8 },
  { href: "/admin/customers", label: "الزبائن", phase: 4 },
  { href: "/admin/services", label: "الخدمات", phase: 3 },
  { href: "/admin/events", label: "المناسبات", phase: 4 },
  { href: "/admin/payments", label: "الدفعات", phase: 6 },
  { href: "/admin/settings", label: "الإعدادات", phase: 8 },
];

export const THEME_STORAGE_KEY = "alraya-admin-theme";
