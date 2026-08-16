"use client";

import { useLayoutEffect } from "react";
import { THEME_STORAGE_KEY } from "@/components/admin/nav";

function persistCookie(theme: "light" | "dark") {
  document.cookie = `${THEME_STORAGE_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}

/** ينقل تفضيل localStorage إلى كوكي مرة واحدة — بدون وسم script */
export function ThemeSync() {
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved !== "dark" && saved !== "light") return;
      document.documentElement.setAttribute("data-theme", saved);
      persistCookie(saved);
    } catch {
      /* تجاهل قيود التخزين */
    }
  }, []);
  return null;
}
