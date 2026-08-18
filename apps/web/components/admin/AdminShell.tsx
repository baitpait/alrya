"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ADMIN_NAV,
  ADMIN_NAV_GROUP_LABELS,
  NAV_SECTIONS_OPEN_KEY,
  SIDEBAR_COLLAPSED_KEY,
} from "@/components/admin/nav";
import {
  AdminNavIconView,
  SidebarToggleIcon,
} from "@/components/admin/AdminNavIcons";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { logoutAction } from "@/app/admin/logout/actions";

type Props = {
  title: string;
  userName?: string;
  unreadMessages?: number;
  isManager?: boolean;
  children: ReactNode;
};

function NavChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`nav-chevron${open ? " is-open" : ""}`}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function readOpenSections(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(NAV_SECTIONS_OPEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, boolean>;
  } catch {
    return {};
  }
}

function writeOpenSections(map: Record<string, boolean>) {
  localStorage.setItem(NAV_SECTIONS_OPEN_KEY, JSON.stringify(map));
}

export function AdminShell({
  title,
  userName,
  unreadMessages = 0,
  isManager = false,
  children,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const items = ADMIN_NAV.filter((item) => isManager || !item.managerOnly);

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved === "1") setCollapsed(true);
    setOpenSections(readOpenSections());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const withChildren = ADMIN_NAV.filter((item) => item.children?.length);
    for (const item of withChildren) {
      const inSection =
        pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (!inSection) continue;
      setOpenSections((prev) => {
        if (prev[item.href]) return prev;
        const next = { ...prev, [item.href]: true };
        writeOpenSections(next);
        return next;
      });
    }
  }, [pathname, ready]);
  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  }

  function toggleSection(href: string) {
    setOpenSections((prev) => {
      const next = { ...prev, [href]: !prev[href] };
      writeOpenSections(next);
      return next;
    });
  }

  return (
    <div
      className={`page-layout admin-body${collapsed ? " sidebar-collapsed" : ""}${ready ? " sidebar-ready" : ""}`}
    >
      <aside className="admin-sidebar" aria-label="قائمة الإدارة">
        <div className="sidebar-top">
          <Link href="/admin" className="brand" title="استوديو الراية">
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
          <button
            type="button"
            className="sidebar-toggle sidebar-toggle--in-sidebar"
            onClick={toggleSidebar}
            title={collapsed ? "إظهار القائمة" : "إخفاء القائمة"}
            aria-label={collapsed ? "إظهار القائمة" : "إخفاء القائمة"}
            aria-expanded={!collapsed}
          >
            <SidebarToggleIcon collapsed={collapsed} />
          </button>
        </div>

        <ul className="nav-list">
          {items.map((item, index) => {
            const prev = items[index - 1];
            const showGroup =
              !collapsed && (!prev || prev.group !== item.group);
            const sectionActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const childItems = item.children ?? [];
            const hasChildren = childItems.length > 0;
            const childActive = childItems.some(
              (c) => pathname === c.href || pathname.startsWith(`${c.href}/`),
            );
            const sectionOpen = Boolean(openSections[item.href]);
            const showChildren = !collapsed && hasChildren && sectionOpen;
            const parentActive =
              (sectionActive && !childActive) ||
              (sectionActive && collapsed) ||
              (sectionActive && hasChildren && !sectionOpen);

            return (
              <li
                key={item.href}
                className={
                  hasChildren
                    ? `nav-item-has-children${sectionOpen ? " is-section-open" : ""}`
                    : undefined
                }
              >
                {showGroup ? (
                  <div className="nav-group-label" role="presentation">
                    {ADMIN_NAV_GROUP_LABELS[item.group]}
                  </div>
                ) : null}
                {hasChildren && !collapsed ? (
                  <button
                    type="button"
                    className={
                      parentActive
                        ? "is-active"
                        : sectionActive
                          ? "is-section-active"
                          : undefined
                    }
                    title={item.label}
                    aria-label={item.label}
                    aria-expanded={sectionOpen}
                    onClick={() => toggleSection(item.href)}
                  >
                    <span className="nav-link-main">
                      <AdminNavIconView icon={item.icon} />
                      <span className="nav-label">{item.label}</span>
                    </span>
                    <NavChevron open={sectionOpen} />
                  </button>
                ) : item.download || item.external ? (
                  <a
                    href={item.href}
                    title={item.label}
                    aria-label={item.label}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                  >
                    <span className="nav-link-main">
                      <AdminNavIconView icon={item.icon} />
                      <span className="nav-label">{item.label}</span>
                    </span>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className={parentActive || sectionActive ? "is-active" : undefined}
                    title={item.label}
                    aria-label={item.label}
                  >
                    <span className="nav-link-main">
                      <AdminNavIconView icon={item.icon} />
                      <span className="nav-label">{item.label}</span>
                    </span>
                    {item.href === "/admin/messages" && unreadMessages > 0 ? (
                      <span className="nav-badge">{unreadMessages}</span>
                    ) : null}
                  </Link>
                )}
                {showChildren ? (
                  <ul className="nav-sublist" aria-label={item.label}>
                    {childItems.map((child) => {
                      const active =
                        pathname === child.href ||
                        pathname.startsWith(`${child.href}/`);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={active ? "is-active" : undefined}
                            title={child.label}
                            aria-label={child.label}
                          >
                            <span className="nav-label">{child.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="admin-main-wrap">
        <header className="app-header">
          <div className="header-start">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={toggleSidebar}
              title={collapsed ? "إظهار القائمة" : "إخفاء القائمة"}
              aria-label={collapsed ? "إظهار القائمة" : "إخفاء القائمة"}
              aria-expanded={!collapsed}
            >
              <SidebarToggleIcon collapsed={collapsed} />
            </button>
            <div className="header-title">{title}</div>
          </div>
          <div className="header-actions">
            {userName ? <span className="header-user">{userName}</span> : null}
            <ThemeToggle />
            <form action={logoutAction}>
              <LogoutButton />
            </form>
          </div>
        </header>
        <main className="admin-content">{children}</main>
        <footer className="admin-app-footer">
          <a
            href="https://baitpait.com"
            target="_blank"
            rel="noopener noreferrer"
            title="بيت البرمجيات وتكنولوجيا المعلومات"
          >
            تطوير وبرمجة بيت البرمجيات وتكنولوجيا المعلومات
          </a>
        </footer>
      </div>
    </div>
  );
}
