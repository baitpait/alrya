import { AdminShell } from "@/components/admin/AdminShell";
import { getSession } from "@/lib/session";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <AdminShell
      title="لوحة الإدارة"
      userName={session?.name ?? "مستخدم"}
    >
      {children}
    </AdminShell>
  );
}
