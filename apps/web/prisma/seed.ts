import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** حساب تجريبي محلي فقط — لا تستخدمه في الإنتاج كما هو */
const SEED_EMAIL = "admin@alray.studio";
const SEED_PASSWORD = "Admin@123456";

async function main() {
  let role = await prisma.role.findFirst({
    where: { name: "مدير الأستوديو" },
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        name: "مدير الأستوديو",
        description: "صلاحيات كاملة",
      },
    });
  }

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: SEED_EMAIL },
    update: {
      name: "مدير النظام",
      passwordHash,
      roleId: role.id,
      active: true,
    },
    create: {
      name: "مدير النظام",
      email: SEED_EMAIL,
      passwordHash,
      roleId: role.id,
      active: true,
    },
  });

  console.log("Seed OK");
  console.log(`email=${SEED_EMAIL}`);
  console.log(`password=${SEED_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
