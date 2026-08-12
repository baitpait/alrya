"use client";

import { THEME_STORAGE_KEY } from "@/components/admin/nav";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* تجاهل قيود التخزين */
  }
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      className="theme-btn"
      aria-label="تبديل الوضع الفاتح والداكن"
      onClick={() => {
        const current =
          document.documentElement.getAttribute("data-theme") === "dark"
            ? "dark"
            : "light";
        applyTheme(current === "light" ? "dark" : "light");
      }}
    >
      <svg className="icon-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="icon-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
      </svg>
      <span>الثيم</span>
    </button>
  );
}
