import { AdminShell } from "@/components/admin/AdminShell";
import { requireManagerPage } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { ContactMessageStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireManagerPage();

  const unreadMessages = await prisma.contactMessage.count({
    where: { status: ContactMessageStatus.NEW },
  });

  return (
    <AdminShell
      title="لوحة الإدارة"
      userName={session.name}
      unreadMessages={unreadMessages}
      isManager={session.isManager}
    >
      {children}
    </AdminShell>
  );
}
