import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./admin-shell.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "لوحة الإدارة | استوديو الراية",
    template: "%s | استوديو الراية",
  },
  description: "لوحة إدارة استوديو الراية",
};

/** Layout مشترك: خط Cairo — الثيم من كوكي الجذر بدون script */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${cairo.variable} admin-font-root`}
      style={{ fontFamily: "var(--font-cairo), Tahoma, sans-serif" }}
    >
      {children}
    </div>
  );
}

