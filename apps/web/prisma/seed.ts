import { PrismaClient, ServiceKind } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** حساب تجريبي محلي فقط — لا تستخدمه في الإنتاج كما هو */
const SEED_EMAIL = "admin@alray.studio";
/** معروف للتطوير المحلي — غيّريه فوراً على أي سيرفر مشترك؛ لا تشغّلي seed على الإنتاج */
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

async function seedStaffRoles() {
  const roles = [
    { name: "مدير الأستوديو", description: "صلاحيات كاملة" },
    { name: "مصور", description: "طاقم تصوير المناسبات" },
    { name: "مساعد", description: "مساعد تغطية" },
  ];
  for (const r of roles) {
    const existing = await prisma.role.findFirst({ where: { name: r.name } });
    if (!existing) await prisma.role.create({ data: r });
  }
}

async function seedGalleryAndFaq() {
  if ((await prisma.galleryItem.count()) === 0) {
    await prisma.galleryItem.createMany({
      data: [
        {
          title: "ليلة العرس",
          caption: "تصوير داخل الصالة — فيديو وفوتو",
          imageUrl: "/portfolio/sample-wedding.svg",
          sortOrder: 1,
          published: true,
        },
        {
          title: "ليلة الحنا",
          caption: "توثيق لحظات الحنا قبل ليلة العرس",
          imageUrl: "/portfolio/sample-henna.svg",
          sortOrder: 2,
          published: true,
        },
        {
          title: "جلسة تصوير",
          caption: "جلسات خارجية وداخل الاستوديو",
          imageUrl: "/portfolio/sample-session.svg",
          sortOrder: 3,
          published: true,
        },
      ],
    });
  }

  if ((await prisma.faqItem.count()) === 0) {
    await prisma.faqItem.createMany({
      data: [
        {
          question: "كيف أحجز تصوير مناسبة؟",
          answer:
            "من صفحة «احجز الآن» اترك اسم العريس والجوال والتاريخ المفضّل. الطلب يصل للإدارة ونتواصل لتأكيد الموعد — لا يُنشأ عقد تلقائياً.",
          sortOrder: 1,
          published: true,
        },
        {
          question: "هل يلزم دفع كامل المبلغ قبل التصوير؟",
          answer:
            "نعم حسب اتفاقية الاستوديو: يُدفع المبلغ المتفق عليه قبل بدء العمل، ولا يُسلَّم العمل قبل السداد الكامل.",
          sortOrder: 2,
          published: true,
        },
        {
          question: "متى أستلم الصور والفيديو؟",
          answer:
            "موعد التسليم يُتفق عليه في العقد (آخر موعد للاستلام). بعد التصوير يُحفظ العمل مدة محدودة — راجعي الإدارة للتفاصيل.",
          sortOrder: 3,
          published: true,
        },
        {
          question: "أقدر أضيف حديقة أو زفة على الباقة؟",
          answer:
            "نعم. الباقة الرئيسية داخل الصالة، والإضافات (حديقة، زفة، سهرة، غداء، برومو…) تُختار حسب مناسبتكم بأسعار منفصلة.",
          sortOrder: 4,
          published: true,
        },
        {
          question: "وين الاستوديو؟",
          answer:
            "استوديو الراية في دورا. العنوان ورقم واتساب يظهران في تذييل الموقع من الإعدادات. للحجز أو الاستفسار استخدمي «احجز الآن» أو «تواصل معنا».",
          sortOrder: 5,
          published: true,
        },
      ],
    });
  }
}

async function seedPhotographerDemo() {
  const role = await prisma.role.findFirst({ where: { name: "مصور" } });
  if (!role) return;
  const email = "photographer@alray.studio";
  await prisma.user.upsert({
    where: { email },
    update: {
      name: "محمد المصور",
      passwordHash: null,
      roleId: role.id,
      active: true,
    },
    create: {
      name: "محمد المصور",
      email,
      passwordHash: null,
      roleId: role.id,
      active: true,
    },
  });

  await prisma.user.updateMany({
    where: { role: { name: { not: "مدير الأستوديو" } } },
    data: { passwordHash: null },
  });
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
    ["about_headline", "استوديو الراية"],
    [
      "about_body",
      "استوديو الراية في دورا يوثّق أعراسكم وجلساتكم باحتراف: من ليلة الحنا إلى ليلة العرس. شعارنا علامة الجودة والاحتراف — فريق قريب منكم خطوة بخطوة حتى تسليم الصور والفيديو.",
    ],
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

  await seedStaffRoles();
  await seedAlrayaCatalog();
  await seedSiteSettings();
  await seedGalleryAndFaq();
  await seedPhotographerDemo();

  console.log("Seed OK (محلي فقط — غيّري كلمة الأدمن على أي بيئة مشتركة)");
  console.log(`email=${SEED_EMAIL}`);
  console.log(`password=${SEED_PASSWORD}`);
  console.log("طاقم تجريبي: photographer@alray.studio — بلا دخول للوحة");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
