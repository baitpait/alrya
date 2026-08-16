import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getVerifiedSession } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { ContactMessageStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getVerifiedSession();
  if (!session) redirect("/admin/login");

  const unreadMessages = session.isManager
    ? await prisma.contactMessage.count({
        where: { status: ContactMessageStatus.NEW },
      })
    : 0;

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
