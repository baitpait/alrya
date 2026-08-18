import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { logoutAction } from "@/app/admin/logout/actions";

type Props = {
  title: string;
  userName?: string;
  unreadMessages?: number;
  isManager?: boolean;
  children: React.ReactNode;
};

export function AdminShell({
  title,
  userName,
  unreadMessages = 0,
  isManager = false,
  children,
}: Props) {
  return (
    <div className="page-layout admin-body">
      <AdminSidebar unreadMessages={unreadMessages} isManager={isManager} />
      <div className="admin-main-wrap">
        <header className="app-header">
          <div className="header-title">{title}</div>
          <div className="header-actions">
            {userName ? <span className="header-user">{userName}</span> : null}
            <ThemeToggle />
            <form action={logoutAction}>
              <LogoutButton />
            </form>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
