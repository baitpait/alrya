import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "alraya_admin_session";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  roleId: number;
  roleName: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET مفقود أو قصير — ضعيه في apps/web/.env");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    roleId: payload.roleId,
    roleName: payload.roleName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    const roleId = typeof payload.roleId === "number" ? payload.roleId : Number(payload.roleId);
    const roleName = typeof payload.roleName === "string" ? payload.roleName : "";
    if (!Number.isFinite(roleId) || roleId <= 0 || !roleName) {
      // جلسة قديمة بلا دور — أبطليها لإعادة الدخول
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      roleId,
      roleName,
    };
  } catch {
    return null;
  }
}
