import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
  type SessionPayload,
} from "@/lib/session";

export type LoginResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; error: string };

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<LoginResult> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return { ok: false, error: "أدخلي البريد وكلمة المرور." };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    include: { role: true },
  });

  if (!user || !user.active) {
    return { ok: false, error: "بيانات الدخول غير صحيحة." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "بيانات الدخول غير صحيحة." };
  }

  const session: SessionPayload = {
    sub: String(user.id),
    email: user.email,
    name: user.name,
    roleId: user.roleId,
    roleName: user.role.name,
  };
  const token = await createSessionToken(session);
  await setSessionCookie(token);
  return { ok: true, session };
}

export async function logout() {
  await clearSessionCookie();
}
