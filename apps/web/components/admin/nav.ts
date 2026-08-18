export type AdminNavItem = {
  href: string;
  label: string;
  /** رقم المرحلة التي تُفعَّل فيها الوظيفة الكاملة */
  phase: number;
  /** يظهر للمدير فقط */
  managerOnly?: boolean;
};

/** قائمة MVP الظاهرة — كل رابط يفتح صفحة حقيقية (placeholder إن لزم) */
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "لوحة التحكم", phase: 1, managerOnly: true },
  { href: "/admin/calendar", label: "التقويم", phase: 5, managerOnly: true },
  { href: "/admin/bookings", label: "طلبات التسجيل", phase: 7, managerOnly: true },
  { href: "/admin/messages", label: "رسائل التواصل", phase: 8, managerOnly: true },
  { href: "/admin/customers", label: "الزبائن", phase: 4, managerOnly: true },
  { href: "/admin/services", label: "الخدمات", phase: 3, managerOnly: true },
  { href: "/admin/events", label: "المناسبات", phase: 4, managerOnly: true },
  { href: "/admin/employees", label: "الموظفين", phase: 10, managerOnly: true },
  { href: "/admin/my-assignments", label: "مناسباتي", phase: 10, managerOnly: true },
  { href: "/admin/payments", label: "الدفعات", phase: 6, managerOnly: true },
  { href: "/admin/reports", label: "التقارير", phase: 11, managerOnly: true },
  { href: "/admin/gallery", label: "المعرض", phase: 12, managerOnly: true },
  { href: "/admin/faq", label: "الأسئلة الشائعة", phase: 12, managerOnly: true },
  { href: "/admin/settings", label: "الإعدادات", phase: 8, managerOnly: true },
];

export const THEME_STORAGE_KEY = "alraya-admin-theme";
