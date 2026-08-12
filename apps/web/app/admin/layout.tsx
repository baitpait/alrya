import type { Metadata } from "next";
import Script from "next/script";
import { Instrument_Sans } from "next/font/google";
import { AdminShell } from "@/components/admin/AdminShell";
import { THEME_STORAGE_KEY } from "@/components/admin/nav";
import "./admin-shell.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "لوحة الإدارة | استوديو الراية",
    template: "%s | استوديو الراية",
  },
  description: "لوحة إدارة استوديو الراية — المرحلة 1",
};

const themeBootScript = `
(function () {
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var saved = localStorage.getItem(key);
    var theme = saved === "dark" || saved === "light" ? saved : "light";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${instrumentSans.variable} admin-font-root`}
      style={{ fontFamily: "var(--font-instrument-sans), Tahoma, sans-serif" }}
    >
      <Script
        id="alraya-theme-boot"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: themeBootScript }}
      />
      <AdminShell title="لوحة الإدارة">{children}</AdminShell>
    </div>
  );
}
