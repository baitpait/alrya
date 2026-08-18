"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/components/admin/nav";

export function AdminSidebar({
  unreadMessages = 0,
  isManager = false,
}: {
  unreadMessages?: number;
  isManager?: boolean;
}) {
  const pathname = usePathname();
  const items = ADMIN_NAV.filter((item) => isManager || !item.managerOnly);

  return (
    <aside className="admin-sidebar" aria-label="قائمة الإدارة">
      <Link href="/admin" className="brand">
        <img
          src="/branding/alraya-studio-logo.png"
          alt="استوديو الراية — علامة الجودة والاحتراف"
          width={56}
          height={56}
        />
        <div className="brand-text">
          <strong>استوديو الراية</strong>
          <span>ALRAYA STUDIO</span>
        </div>
      </Link>

      <ul className="nav-list">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link href={item.href} className={active ? "is-active" : undefined}>
                {item.label}
                {item.href === "/admin/messages" && unreadMessages > 0 ? (
                  <span className="nav-badge">{unreadMessages}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
