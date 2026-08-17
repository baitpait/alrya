import Link from "next/link";

type Props = {
  href: string;
  /** مثال: رجوع للرسائل */
  label: string;
};

/**
 * زر رجوع موحّد لصفحات التفاصيل — ليس text-link تحتي.
 * قرار الإدارة 2026-08-17: روابط الرجوع = أزرار.
 */
export function AdminBackLink({ href, label }: Props) {
  return (
    <p className="admin-back-wrap">
      <Link href={href} className="btn-secondary admin-back-btn">
        ← {label}
      </Link>
    </p>
  );
}
