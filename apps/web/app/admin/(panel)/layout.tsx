import { AdminShell } from "@/components/admin/AdminShell";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ContactMessageStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const unreadMessages = await prisma.contactMessage.count({
    where: { status: ContactMessageStatus.NEW },
  });

  return (
    <AdminShell
      title="لوحة الإدارة"
      userName={session?.name ?? "مستخدم"}
      unreadMessages={unreadMessages}
    >
      {children}
    </AdminShell>
  );
}
