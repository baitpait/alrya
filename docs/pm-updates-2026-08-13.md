# تحديثات مدير المشروع — 2026-08-13

> المعتمد: مصطفى البستنجي  
> للمستلم: نهلة البستنجي — **اسحبي الريبو قبل أي جلسة**  
> الفرع: `main` · الريبو: https://github.com/baitpait/alrya

---

## 1) كتالوج الراية + سد فجوات الهيكل

| البند | التفاصيل |
|--------|----------|
| المرجع | [alraya-client-catalog-2026.md](./alraya-client-catalog-2026.md) + صور في `docs/client/` |
| المحتوى | عروض موسم 2026 + بنود اتفاقية التصوير + ربط بـ data model |
| Schema | `Offer.listPrice` (بدل) · `Customer.nationalId` · `Event.agreementNo` · `Event.deliveryDueAt` |
| Seed | `apps/web/prisma/seed.ts` — 9 خدمات بعروض الراية |
| واجهات | حقول العروض/الزبون/المناسبة في الأدمن |
| Commit مرجعي | `3caa191` |

بعد السحب:
```bash
cd apps/web && npx prisma migrate deploy && npm run db:seed
```

---

## 2) الشعار الرسمي في الواجهات

| البند | التفاصيل |
|--------|----------|
| الملف | `docs/branding/alraya-studio-logo.png` و `apps/web/public/branding/alraya-studio-logo.png` |
| أين يظهر | سايدبار الأدمن · `/admin/login` · الصفحة الرئيسية `/` |
| دليل الهوية | [branding/brand-guidelines.md](./branding/brand-guidelines.md) |
| Commit مرجعي | `f0cd7d3` |
| ملاحظة | لا تستخدمي `alraya-mark.svg` كشعار أساسي بعد الآن |

---

## 3) واتساب — رسائل وجلسات

| البند | التفاصيل |
|--------|----------|
| بداية/نهاية الجلسة | إدارة = تقرير عمل · نهلة = رسالة ودّية (`--to both`) |
| أداة | `tools/pm-notify.mjs` · قواعد `session-lifecycle.mdc` |
| تنبيه 13/8 مساءً | أُرسل لنـهلة: **اسحبي التحديث من الريبو قبل بداية الجلسة** |
| صباح الشركة | رسائل تحفيز من اسم الشركة (بيت البرمجيات) وليس باسم المشروع عند الطلب |

تفاصيل الأوامر: [whatsapp-pm-notifications.md](./whatsapp-pm-notifications.md)

---

## 4) إلزام قبل كل جلسة عمل (نهلة)

```bash
git checkout main
git pull origin main
```

ثم افتحي وكيل/محادثة جديدة حتى تتحمّل قواعد `.cursor/rules` والتحديثات.

---

## 5) اختبار يدوي مقترح بعد السحب

| # | التحقق |
|---|--------|
| 1 | `/admin/login` يظهر شعار الراية الرسمي |
| 2 | `/admin/services` فيها خدمات الراية بعد `db:seed` |
| 3 | عرض فيه حقل «بدل» · زبون فيه «رقم هوية» · مناسبة فيها رقم اتفاقية |
