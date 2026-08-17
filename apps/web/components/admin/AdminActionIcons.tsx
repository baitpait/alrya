import Link from "next/link";
import type { ReactNode } from "react";

/** أيقونات إجراءات الأدمن — SVG مضمّن · اختر kind المناسب للمصطلح */

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function FolderOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 7h5l2 2h11v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      <path d="M3 7V5a2 2 0 0 1 2-2h4l2 2" />
    </svg>
  );
}

/** تقويم — لفتح شاشة التقويم */
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

/** مناسبة — فتح تفاصيل المناسبة (عرس/حفل…) */
function EventIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 7V3m8 4V3M3 11h18" />
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  );
}

/** تقارير */
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 19V5M4 19h16" />
      <path d="M8 17V10M12 17V7M16 17v-4" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

const ICONS = {
  view: EyeIcon,
  edit: PencilIcon,
  open: FolderOpenIcon,
  calendar: CalendarIcon,
  event: EventIcon,
  reports: ChartIcon,
  delete: TrashIcon,
} as const;

export type ActionIconKind = keyof typeof ICONS;

type ActionIconLinkProps = {
  href: string;
  /** نص يظهر في title و aria-label — إلزامي لإمكانية الوصول */
  label: string;
  kind?: ActionIconKind;
  className?: string;
};

/** رابط إجراء: أيقونة تطابق معنى الإجراء — لا تستخدم عيناً لـ «تقويم» */
export function ActionIconLink({
  href,
  label,
  kind = "view",
  className = "",
}: ActionIconLinkProps) {
  const Icon = ICONS[kind];
  return (
    <Link
      href={href}
      className={`btn-icon btn-icon--${kind} ${className}`.trim()}
      title={label}
      aria-label={label}
    >
      <Icon />
    </Link>
  );
}

type ActionIconGroupProps = {
  children: ReactNode;
};

export function ActionIconGroup({ children }: ActionIconGroupProps) {
  return <div className="row-actions row-actions--icons">{children}</div>;
}
