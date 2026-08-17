import Link from "next/link";
import type { ReactNode } from "react";

/** أيقونات إجراءات الجدول — SVG مضمّن (بدون حزمة جديدة) */

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

const ICONS = {
  view: EyeIcon,
  edit: PencilIcon,
  open: FolderOpenIcon,
} as const;

export type ActionIconKind = keyof typeof ICONS;

type ActionIconLinkProps = {
  href: string;
  /** نص يظهر في title و aria-label — إلزامي لإمكانية الوصول */
  label: string;
  kind?: ActionIconKind;
  className?: string;
};

/** رابط إجراء صف جدول: أيقونة بدل كلمة «عرض» */
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
