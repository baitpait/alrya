import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(resolve(root, ".env"), "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 0) continue;
  const k = t.slice(0, i).trim();
  let v = t.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (process.env[k] === undefined) process.env[k] = v;
}

const prisma = new PrismaClient();

async function mint(email) {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user) throw new Error("missing " + email);
  console.log(email, { id: user.id, role: user.role.name, active: user.active });
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
  const token = await new SignJWT({
    email: user.email,
    name: user.name,
    roleId: user.roleId,
    roleName: user.role.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  return token;
}

async function hit(label, token, path) {
  const r = await fetch("http://localhost:3000" + path, {
    headers: { Cookie: `alraya_admin_session=${token}` },
    redirect: "manual",
  });
  console.log(label, path, r.status, r.headers.get("location") || "");
}

const photo = await mint("photographer@alray.studio");
console.log("--- photographer ---");
await hit("photo", photo, "/admin");
await hit("photo", photo, "/admin/employees");
await hit("photo", photo, "/admin/settings");
await hit("photo", photo, "/admin/services");
await hit("photo", photo, "/admin/my-assignments");
await hit("photo", photo, "/admin/calendar");
await hit("photo", photo, "/admin/events");
await hit("photo", photo, "/api/admin/calendar/events");
await hit("photo", photo, "/api/admin/reports/events");

const admin = await mint("admin@alray.studio");
console.log("--- admin ---");
await hit("admin", admin, "/admin/employees");
await hit("admin", admin, "/api/admin/reports/events");

await prisma.$disconnect();
