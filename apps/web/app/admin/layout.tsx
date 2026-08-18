import type { Metadata } from "next";
import "./admin-shell.css";

export const metadata: Metadata = {
  title: {
    default: "لوحة الإدارة | استوديو الراية",
    template: "%s | استوديو الراية",
  },
  description: "لوحة إدارة استوديو الراية",
};

/** خط Cairo من الـ layout الجذر — نفس الخط لكل الموقع والأدمن */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-font-root">{children}</div>;
}
