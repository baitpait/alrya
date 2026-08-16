import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../apps/web/.env") });

const prisma = new PrismaClient();
const user = await prisma.user.findUnique({
  where: { email: "photographer@alray.studio" },
  include: { role: true },
});
console.log("user", user ? { id: user.id, role: user.role.name, active: user.active } : null);
if (!user) process.exit(1);

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

const jar = `alraya_admin_session=${token}`;

async function hit(path) {
  const r = await fetch("http://localhost:3000" + path, {
    headers: { Cookie: jar },
    redirect: "manual",
  });
  console.log(path, r.status, r.headers.get("location") || "");
}

await hit("/admin");
await hit("/admin/employees");
await hit("/admin/settings");
await hit("/admin/my-assignments");
await hit("/admin/calendar");
await hit("/admin/events");
await hit("/api/admin/calendar/events");
await hit("/api/admin/reports/events");

// admin token
const admin = await prisma.user.findUnique({
  where: { email: "admin@alray.studio" },
  include: { role: true },
});
const adminToken = await new SignJWT({
  email: admin.email,
  name: admin.name,
  roleId: admin.roleId,
  roleName: admin.role.name,
})
  .setProtectedHeader({ alg: "HS256" })
  .setSubject(String(admin.id))
  .setIssuedAt()
  .setExpirationTime("7d")
  .sign(secret);
const ajar = `alraya_admin_session=${adminToken}`;
console.log("--- admin ---");
const er = await fetch("http://localhost:3000/admin/employees", {
  headers: { Cookie: ajar },
  redirect: "manual",
});
console.log("/admin/employees", er.status, er.headers.get("location") || "");

await prisma.$disconnect();
