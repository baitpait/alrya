# سجل إنجاز المرحلة 0 — استوديو الراية

> التاريخ: 2026-08-12  
> المهندسة: نهلة البستنجي  
> مدير المشروع: مصطفى البستنجي  
> الفرع: `main`

---

## الخلاصة

أُنشئ تطبيق Next.js تحت `apps/web`، وربطه بـ MySQL عبر Prisma، مع جداول MVP حسب `docs/data-model.md`.  
الواجهة الإدارية (NexLink) **لم تُبنَ بعد** — هذه المرحلة 1.

---

## ما أُنجز

| البند | التفاصيل |
|--------|----------|
| أدوات الجهاز | تثبيت Git + Node.js LTS عبر winget |
| الريبو | سحب `baitpait/alrya` على `main` |
| التطبيق | `apps/web` — Next.js App Router + TypeScript |
| ORM | Prisma 6 + `prisma/schema.prisma` |
| قاعدة البيانات | MySQL 8.4 محلي · قاعدة `alraya` |
| Migrate | `20260812160953_init_mvp` |
| صفحة تحقق | `/` تعرض حالة الاتصال بـ MySQL (RTL) |
| أمان | إخراج `.env` من تتبع Git · إضافة `.mysql/` للتجاهل |

### جداول أُنشئت (MVP)

Role, User, Customer, Service, Offer, SubService, Event, **EventService**, EventServiceEmployee, Payment, Discount, BookingRequest, ContactMessage, Setting  
(+ `_prisma_migrations`)

> **EventService** يحمل `startsAt` / `endsAt` — مصدر التقويم في المراحل اللاحقة.

---

## تشغيل محلي (Windows)

1. تشغيل mysqld (إن لم يكن يعمل):
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --defaults-file=D:/project/alraya/.mysql/my.ini --console
   ```
   البيانات المحلية في `.mysql/` (غير مرفوعة).

2. التطبيق:
   ```powershell
   cd D:\project\alraya\apps\web
   npm run dev
   ```
   افتحي: http://localhost:3000

3. Prisma Studio (اختياري):
   ```powershell
   npx prisma studio
   ```

`DATABASE_URL` موجود في `apps/web/.env` (محلي فقط). القالب بلا أسرار في `.env.example`.

---

## بوابة الاختبار 0

| # | الاختبار | نتيجة |
|---|----------|--------|
| 0.1 | فتح localhost | ✓ (HTTP 200) |
| 0.2 | اتصال Prisma ↔ MySQL | ✓ (صفحة «متصل») |
| 0.3 | الجداول موجودة | ✓ (15 بما فيها migrations) |

**توقيع المهندسة:** نهلة البستنجي  
**التاريخ:** 2026-08-12  
**الانتقال للمرحلة 1:** مسموح بعد إشعار `gate`

---

## قرارات تقنية سجّلت للتدريب

1. **Prisma قبل الواجهة:** الجداول مصدر الحقيقة؛ الشاشات تُبنى عليها لاحقاً.
2. **Prisma 6 وليس 7:** أوضح للتعلم ومتوافق مع أسلوب `url = env("DATABASE_URL")` في التوثيق.
3. **مسار `.mysql` بلا مسافات:** تجنّب مشاكل مسارات Windows مع `ProgramData\MySQL Server...`.

---

## التالي (مرحلة 1 فقط — بعد تم/نفّذ)

شِل الأدمن NexLink: RTL · Light افتراضي · `theme-btn` · شعار الراية · روابط قائمة بلا أزرار صامتة.
