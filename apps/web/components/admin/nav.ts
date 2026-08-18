export type AdminNavIcon =
  | "dashboard"
  | "calendar"
  | "bookings"
  | "messages"
  | "customers"
  | "services"
  | "events"
  | "employees"
  | "roles"
  | "payments"
  | "reports"
  | "gallery"
  | "faq"
  | "settings"
  | "backup"
  | "support";

export type AdminNavGroupId =
  | "ops"
  | "inbox"
  | "finance"
  | "catalog"
  | "team"
  | "insights"
  | "system";

export const ADMIN_NAV_GROUP_LABELS: Record<AdminNavGroupId, string> = {
  ops: "التشغيل اليومي",
  inbox: "التواصل",
  finance: "المالية والزبائن",
  catalog: "الباقات",
  team: "الفريق",
  insights: "المتابعة",
  system: "الموقع والنظام",
};

export type AdminNavChild = {
  href: string;
  label: string;
};

export type AdminNavItem = {
  href: string;
  label: string;
  icon: AdminNavIcon;
  /** مجموعة العرض في السايدبار */
  group: AdminNavGroupId;
  /** رقم المرحلة التي تُفعَّل فيها الوظيفة الكاملة */
  phase: number;
  /** يظهر للمدير فقط */
  managerOnly?: boolean;
  /** روابط فرعية تظهر تحت العنصر في الشريط الجانبي */
  children?: AdminNavChild[];
  /** تنزيل ملف (مثل النسخة الاحتياطية) — يستخدم <a> بدل Next Link */
  download?: boolean;
  /** رابط خارجي (واتساب…) — تبويب جديد */
  external?: boolean;
};

/** تقارير المرحلة 11 — تظهر كمنيو فرعية تحت «التقارير» */
export const REPORTS_NAV: AdminNavChild[] = [
  { href: "/admin/reports/events", label: "المناسبات" },
  { href: "/admin/reports/payments", label: "الدفعات / التحصيل" },
  { href: "/admin/reports/discounts", label: "الخصومات" },
  { href: "/admin/reports/staff", label: "خدمات الموظفين" },
];

/**
 * قائمة الأدمن — مرتّبة حسب أولوية التشغيل اليومي + مجموعات.
 * الترتيب في المصفوفة = ترتيب الظهور.
 */
export const ADMIN_NAV: AdminNavItem[] = [
  // التشغيل اليومي
  { href: "/admin", label: "لوحة التحكم", icon: "dashboard", group: "ops", phase: 1, managerOnly: true },
  { href: "/admin/calendar", label: "التقويم", icon: "calendar", group: "ops", phase: 5, managerOnly: true },
  { href: "/admin/events", label: "المناسبات", icon: "events", group: "ops", phase: 4, managerOnly: true },
  { href: "/admin/bookings", label: "طلبات أونلاين", icon: "bookings", group: "ops", phase: 7, managerOnly: true },

  // رسائل التواصل
  { href: "/admin/messages", label: "صندوق الرسائل", icon: "messages", group: "inbox", phase: 8, managerOnly: true },

  // المالية والزبائن
  { href: "/admin/customers", label: "الزبائن", icon: "customers", group: "finance", phase: 4, managerOnly: true },
  { href: "/admin/payments", label: "الدفعات", icon: "payments", group: "finance", phase: 6, managerOnly: true },

  // الخدمات
  { href: "/admin/services", label: "الخدمات", icon: "services", group: "catalog", phase: 3, managerOnly: true },

  // الفريق
  { href: "/admin/employees", label: "الموظفين", icon: "employees", group: "team", phase: 10, managerOnly: true },
  { href: "/admin/roles", label: "الأدوار", icon: "roles", group: "team", phase: 10, managerOnly: true },

  // المتابعة
  {
    href: "/admin/reports",
    label: "التقارير",
    icon: "reports",
    group: "insights",
    phase: 11,
    managerOnly: true,
    children: REPORTS_NAV,
  },

  // الموقع والنظام
  { href: "/admin/settings", label: "الإعدادات", icon: "settings", group: "system", phase: 8, managerOnly: true },
  {
    href: "/api/admin/backup",
    label: "نسخة احتياطية",
    icon: "backup",
    group: "system",
    phase: 18,
    managerOnly: true,
    download: true,
  },
  {
    href: "https://wa.me/970599814758",
    label: "الدعم الفني",
    icon: "support",
    group: "system",
    phase: 8,
    managerOnly: true,
    external: true,
  },
];

export const THEME_STORAGE_KEY = "alraya-admin-theme";
export const SIDEBAR_COLLAPSED_KEY = "alraya-admin-sidebar-collapsed";
/** أقسام السايدبار المفتوحة (منيو فرعية) — JSON مثل {"/admin/reports":true} */
export const NAV_SECTIONS_OPEN_KEY = "alraya-admin-nav-sections-open";
