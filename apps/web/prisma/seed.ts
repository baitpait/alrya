import { PrismaClient, ServiceKind } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** حساب تجريبي محلي فقط — لا تستخدمه في الإنتاج كما هو */
const SEED_EMAIL = "admin@alray.studio";
const SEED_PASSWORD = "Admin@123456";

/**
 * كتالوج عروض الراية موسم 2026 — المرجع: docs/alraya-client-catalog-2026.md
 * price = المبلغ · listPrice = بدل (إن وُجد)
 */
const ALRAYA_CATALOG: {
  name: string;
  kind: ServiceKind;
  offers: {
    name: string;
    price: number;
    listPrice?: number;
    description: string;
    audience?: string;
  }[];
}[] = [
  {
    name: "العرض الرئيسي",
    kind: ServiceKind.EVENT,
    offers: [
      {
        name: "باقة رئيسية — صالة",
        price: 800,
        description:
          "فيديو + فوتو داخل الصالة + مونتاج. هدية: ألبوم رقمي لكل عريس (50 صورة، قيمتها 300 شيكل). هدية: برومو عريس لكل عريس. عند إضافة حديقة يُضاف 20 صورة للألبوم الرقمي.",
      },
    ],
  },
  {
    name: "حديقة",
    kind: ServiceKind.EVENT,
    offers: [
      {
        name: "حديقة — أتعاب + دخول",
        price: 500,
        listPrice: 700,
        description: "أتعاب المصور + رسوم دخول الحديقة",
      },
    ],
  },
  {
    name: "زفة",
    kind: ServiceKind.EVENT,
    offers: [
      {
        name: "فيديو فقط / فوتو فقط",
        price: 200,
        listPrice: 300,
        description: "زفة — فيديو فقط أو فوتو فقط",
        audience: "شخص واحد",
      },
      {
        name: "فيديو + فوتو / شخص واحد",
        price: 400,
        listPrice: 500,
        description: "زفة — فيديو وفوتو",
        audience: "شخص واحد",
      },
      {
        name: "فيديو + فوتو / شخصين",
        price: 600,
        listPrice: 700,
        description: "زفة — فيديو وفوتو بشخصين",
        audience: "شخصين",
      },
    ],
  },
  {
    name: "رافعة للنساء",
    kind: ServiceKind.EVENT,
    offers: [
      {
        name: "رافعة — فيديو",
        price: 1000,
        listPrice: 2500,
        description: "رافعة فيديو لصالة النساء",
      },
    ],
  },
  {
    name: "إضافة — كاميرا صالة",
    kind: ServiceKind.EVENT,
    offers: [
      {
        name: "كاميرا فيديو داخل الصالة",
        price: 500,
        listPrice: 1500,
        description: "إضافة كاميرا فيديو داخل الصالة",
      },
    ],
  },
  {
    name: "سهرة شباب",
    kind: ServiceKind.EVENT,
    offers: [
      {
        name: "فيديو فقط / فوتو فقط",
        price: 400,
        listPrice: 500,
        description: "سهرة شباب — فيديو أو فوتو",
        audience: "شخص واحد",
      },
      {
        name: "فيديو + فوتو / شخص واحد",
        price: 500,
        listPrice: 700,
        description: "سهرة شباب — فيديو وفوتو",
        audience: "شخص واحد",
      },
      {
        name: "فيديو + فوتو / شخصين",
        price: 700,
        listPrice: 1000,
        description: "سهرة شباب — فيديو وفوتو بشخصين",
        audience: "شخصين",
      },
    ],
  },
  {
    name: "غداء",
    kind: ServiceKind.EVENT,
    offers: [
      {
        name: "فيديو فقط / فوتو فقط",
        price: 300,
        listPrice: 400,
        description: "غداء — فيديو أو فوتو",
        audience: "شخص واحد",
      },
      {
        name: "فيديو + فوتو / شخص واحد",
        price: 400,
        listPrice: 500,
        description: "غداء — فيديو وفوتو",
        audience: "شخص واحد",
      },
      {
        name: "فيديو + فوتو / شخصين",
        price: 600,
        listPrice: 800,
        description: "غداء — فيديو وفوتو بشخصين",
        audience: "شخصين",
      },
    ],
  },
  {
    name: "برومو صالون",
    kind: ServiceKind.SESSION,
    offers: [
      {
        name: "فيديو فقط",
        price: 300,
        listPrice: 500,
        description: "برومو صالون — فيديو",
      },
      {
        name: "فيديو + فوتو",
        price: 500,
        listPrice: 800,
        description: "برومو صالون — فيديو وفوتو",
      },
    ],
  },
  {
    name: "برومو حديقة",
    kind: ServiceKind.SESSION,
    offers: [
      {
        name: "فيديو فقط",
        price: 300,
        listPrice: 500,
        description: "برومو حديقة — فيديو",
      },
    ],
  },
];

async function seedAlrayaCatalog() {
  for (const item of ALRAYA_CATALOG) {
    let service = await prisma.service.findFirst({
      where: { name: item.name },
    });
    if (!service) {
      service = await prisma.service.create({
        data: { name: item.name, kind: item.kind, active: true },
      });
    } else {
      await prisma.service.update({
        where: { id: service.id },
        data: { kind: item.kind, active: true },
      });
    }

    for (const offer of item.offers) {
      const existing = await prisma.offer.findFirst({
        where: { serviceId: service.id, name: offer.name },
      });
      const data = {
        name: offer.name,
        price: offer.price,
        listPrice: offer.listPrice ?? null,
        description: offer.description,
        audience: offer.audience ?? null,
      };
      if (existing) {
        await prisma.offer.update({ where: { id: existing.id }, data });
      } else {
        await prisma.offer.create({
          data: { serviceId: service.id, ...data },
        });
      }
    }
  }
  console.log(`Catalog seed: ${ALRAYA_CATALOG.length} services (Alraya 2026)`);
}

async function seedSiteSettings() {
  const defaults: [string, string][] = [
    ["whatsapp_number", "970599000000"],
    ["whatsapp_default_message", "مرحبا، أريد الاستفسار عن تصوير مناسبة"],
    ["phone_public", ""],
    ["email_public", ""],
    ["social_instagram", ""],
    ["social_facebook", ""],
    ["social_tiktok", ""],
    ["social_youtube", ""],
    ["social_snapchat", ""],
    ["address_text", ""],
  ];

  for (const [key, value] of defaults) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
}

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

  await seedAlrayaCatalog();
  await seedSiteSettings();

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
