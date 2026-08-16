import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  clearSessionCookie,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";
import { isManagerRole, MANAGER_ROLE_NAME } from "@/lib/roles";

export { MANAGER_ROLE_NAME, isManagerRole, isManagerOnlyPath } from "@/lib/roles";

export type VerifiedSession = SessionPayload & {
  isManager: boolean;
};

/**
 * جلسة حية: JWT + تحقق active والدور من MySQL.
 * معطّل → يُمسح الكوكي ويُعتبر غير مسجّل.
 */
export async function getVerifiedSession(): Promise<VerifiedSession | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const base = await verifySessionToken(token);
  if (!base) return null;

  const id = Number(base.sub);
  if (!Number.isFinite(id) || id <= 0) return null;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });

  if (!user || !user.active) {
    await clearSessionCookie();
    return null;
  }

  return {
    sub: String(user.id),
    email: user.email,
    name: user.name,
    roleId: user.roleId,
    roleName: user.role.name,
    isManager: isManagerRole(user.role.name),
  };
}

export async function requireSession(): Promise<VerifiedSession> {
  const session = await getVerifiedSession();
  if (!session) {
    throw new Error("غير مصرح — سجّلي الدخول أولاً.");
  }
  return session;
}

export async function requireManager(): Promise<VerifiedSession> {
  const session = await requireSession();
  if (!session.isManager) {
    throw new Error("صلاحية مدير الأستوديو مطلوبة.");
  }
  return session;
}

export async function requireSessionPage(): Promise<VerifiedSession> {
  const session = await getVerifiedSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requireManagerPage(): Promise<VerifiedSession> {
  const session = await requireSessionPage();
  if (!session.isManager) redirect("/admin/my-assignments");
  return session;
}
