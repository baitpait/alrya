import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ThemeToggle } from "@/components/admin/ThemeToggle";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function AdminShell({ title, children }: Props) {
  return (
    <div className="page-layout admin-body">
      <AdminSidebar />
      <div className="admin-main-wrap">
        <header className="app-header">
          <div className="header-title">{title}</div>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
