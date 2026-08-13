# مواصفات تسليم المبرمج — منصة استوديو الراية

> تاريخ التوثيق: 2026-08-12  
> النوع: مواصفات تنفيذ (Specification) — **ليس كوداً جاهزاً**  
> اقرأ أيضاً: [production-work-plan.md](./production-work-plan.md) · [pages-inventory.md](./pages-inventory.md) · [ui-nexlink-spec.md](./ui-nexlink-spec.md) · [branding/brand-guidelines.md](./branding/brand-guidelines.md) · [data-model.md](./data-model.md) · [wameed-system-analysis.md](./wameed-system-analysis.md)

**الشعار:** [`branding/alraya-studio-logo.png`](./branding/alraya-studio-logo.png) — الراية / ALRAYA STUDIO / علامة الجودة والاحتراف. ألوان اللاندينغ: عنابي + ذهبي (انظر brand-guidelines).

---

## 1. الهدف

بناء **منصة جديدة** لاستوديو تصوير (استوديو الراية) تشمل:

1. **لوحة إدارة** لفريق الاستوديو (مناسبات، مواعيد، زبائن، دفعات…)
2. **موقع عام (لاندينغ)** لتسجيل/حجز العرسان أونلاين

المرجع الوظيفي: نظام **وميض** — ننقل المنطق والمتطلبات، **لا ننسخ السورس** ولا نعتمد عليه كمشروع أساس.

---

## 2. قرارات مثبّتة (غير اختيارية)

| # | القرار | التفاصيل |
|---|--------|----------|
| 1 | منصة جديدة | لا ترخيص سورس وميض؛ منطق وميض كمرجع |
| 2 | Stack | Next.js (App Router) + TypeScript |
| 3 | قاعدة البيانات | **MySQL** |
| 4 | ORM | **Prisma** = طبقة تربط TypeScript بـ MySQL (تعريف جداول + استعلامات بدون SQL يدوي في كل شاشة) |
| 5 | Admin UI | ثيم **NexLink** (Bootstrap 5 CRM) |
| 6 | الاتجاه | عربي RTL إلزامي |
| 7 | الوضع | **Light افتراضي** + زر تبديل Light/Dark |
| 8 | أولوية الشاشات | **التقويم يعرض كل الحجوزات/المواعيد** — أهم شاشة تشغيل |
| 9 | الهوية | استوديو الراية (بدل NexLink / وميض) |

---

## 3. سطحان للمنتج

| السطح | المسار المقترح | الجمهور | المرجع البصري |
|--------|----------------|---------|----------------|
| Public | `/` و `/book` | العرسان / الزبائن | لاندينغ مخصص لهوية الاستوديو (ليس شكل CRM) |
| Admin | `/admin/*` | موظفون ومدير | [NexLink RTL](https://nexlink.layoutdrop.com/demo/index-rtl.html) + Light افتراضي |

### تدفق الحجز الأونلاين

```
لاندينغ → نموذج تسجيل عرسان → BookingRequest (pending)
    → الإدارة تراجع في Inbox
    → موافقة → إنشاء Customer + Event (+ EventServices)
    → يظهر الموعد في التقويم
```

### تدفق تواصل معنا

```
/contact → ContactMessage (NEW)
    → /admin/messages (+ بادج غير مقروء)
    → الموظف يقرأ → READ
    → يرد واتساب/هاتف (من رقم الرسالة) أو يؤرشف
```

### تواصل اجتماعي وواتساب عائم

- روابط السوشيال + رقم واتساب تُدار من `/admin/settings/site`
- مكوّن عائم على كل الصفحات العامة: زر واتساب → `wa.me`
- فوتر: أيقونات القنوات المفعّلة فقط
- التفاصيل: [pages-inventory.md](./pages-inventory.md) · [data-model.md](./data-model.md)
---

## 4. Stack والمسؤوليات

| الطبقة | الاختيار | ملاحظة للمبرمج |
|--------|----------|----------------|
| App | Next.js App Router + TS | مشروع واحد: public + admin |
| Data | Prisma + MySQL | `schema.prisma` مصدر الحقيقة للجداول |
| Admin shell | NexLink assets | تُنسخ من الحزمة المرخّصة إلى `public/theme/nexlink` |
| Charts | ApexCharts / Chart.js | موجودة في الثيم |
| Calendar | FullCalendar | صفحة [calendar](https://nexlink.layoutdrop.com/demo/calendar.html) |
| Auth | جلسة Admin فقط | اللاندينغ عام بدون تسجيل دخول زبون في MVP |

### ما هو Prisma؟ (للمطور غير المعتاد)

- ملف `schema.prisma` يعرّف الجداول والعلاقات
- `prisma migrate` ينشئ/يحدّث جداول MySQL
- من الكود: `prisma.customer.findMany()` بدل كتابة SQL في كل مكان

---

## 5. هيكل المجلدات المقترح

```
Alray Studio/
  docs/                          ← التوثيق (هنا الآن)
  vendor/nexlink/                ← ضع هنا ملفات الثيم الأصلية (مرخّصة)
  apps/web/                      ← تطبيق Next.js
    public/theme/nexlink/        ← أصول CSS/JS/صور الثيم المستخدمة
    app/
      (public)/                  ← لاندينغ + /book
      (admin)/admin/
        layout.tsx               ← shell: RTL + dark + NexLink
        page.tsx                 ← داشبورد
        calendar/                ← أهم صفحة
        bookings/                ← طلبات التسجيل
        customers/
        events/
        payments/
        services/
    components/admin/
    lib/prisma.ts
  prisma/
    schema.prisma
```

**شرط قبل البرمجة البصرية للـ Admin:** توفير ملفات NexLink المرخّصة (ليس الاعتماد على CDN الديمو في الإنتاج).

---

## 6. شاشات MVP — ترتيب التنفيذ للمبرمج

### أولوية 1 — أساس

1. Scaffold Next.js + Prisma + اتصال MySQL
2. Layout Admin: `lang=ar` `dir=rtl` `data-theme=light` + تحميل `styles-rtl.css`
3. زر `theme-btn` يعمل (Light/Dark)
4. Login بسيط لموظفي الاستوديو

### أولوية 2 — التقويم (الأهم عملياً)

5. صفحة `/admin/calendar` على نمط NexLink Calendar
6. ربط الأحداث من `EventService` (أو Event)
7. Modal إضافة/تعديل موعد
8. عروض: شهر / أسبوع / يوم

### أولوية 3 — دورة الحجز والتواصل

9. نموذج لاندينغ → `BookingRequest`
10. Inbox طلبات في الأدمن (قبول / رفض / تحويل)
11. عند التحويل: Customer + Event + خدمات
12. صفحة `/contact` → `ContactMessage` → `/admin/messages`
13. إعدادات الموقع: واتساب عائم + روابط سوشيال + فوتر

### أولوية 4 — تشغيل الاستوديو

14. زبائن CRUD
15. خدمات + باقات/عروض
16. مناسبات قائمة + حالات
17. دفعات + خصومات + المتبقي
18. داشبورد KPI (+ عدّاد رسائل/طلبات جديدة)

### خارج MVP (لاحقاً)

- تعيين مصورين على الخدمات
- تقارير متقدمة
- SMS جماعي / بوابات دفع
- POS
- دفع عربون أونلاين
- تعدد فروع SaaS

---

## 7. قائمة تنقل Admin المقترحة

```
لوحة التحكم
التقويم          ← الأهم / مواعيد
طلبات التسجيل    ← Leads من اللاندينغ
رسائل التواصل    ← من /contact
الزبائن
الخدمات
المناسبات
الدفعات
الموظفين         ← يمكن تأجيله بعد MVP
الإعدادات        ← عامة + موقع/سوشيال/واتساب
```

---

## 8. قواعد اللاندينغ (Public)

- هوية **استوديو الراية** واضحة في أول شاشة (براند قوي)
- Hero: براند + جملة واحدة + CTA «سجّل / احجز الآن» + صورة استوديو كاملة العرض
- لا تكدّس إحصائيات أو كروت كثيرة فوق الطية
- أسفل الصفحة: خدمات مختصرة + نموذج التسجيل + تواصل
- النموذج ينشئ `BookingRequest` فقط (لا ينشئ مناسبة مباشرة)

حقول النموذج المقترحة: اسم العريس، اسم العروس، هاتف، هاتف إضافي، نوع المناسبة/خدمة، تاريخ مفضّل من/إلى، مدينة، مكان/قاعة، ملاحظات.

---

## 9. معادلات وقواعد عمل

```
المتبقي = سعر_المناسبة - مجموع_الخصومات - مجموع_المدفوع
```

حالات المناسبة (من وميض): قيد التحضير → قيد العمل → منتهية | ملغية  
حالات طلب التسجيل: pending → contacted → approved/converted | rejected

تفاصيل الجداول والحالات: [data-model.md](./data-model.md)

---

## 10. معايير قبول MVP (Definition of Done)

- [ ] Admin يعمل RTL + Light افتراضي + تبديل ثيم (theme-btn)
- [ ] الخط **Cairo** واللون الأساسي `#5955D1`
- [ ] التقويم يعرض مواعيد حقيقية من قاعدة البيانات
- [ ] يمكن إضافة موعد/مناسبة من التقويم أو من شاشة المناسبات
- [ ] نموذج اللاندينغ يخزّن طلب تسجيل
- [ ] الإدارة تحوّل الطلب إلى زبون + مناسبة
- [ ] `/contact` يخزّن رسالة وتظهر في `/admin/messages`
- [ ] زر واتساب عائم + روابط سوشيال من الإعدادات
- [ ] دفعات وخصومات تحدّث المتبقي بشكل صحيح
- [ ] لا اعتماد على روابط CDN لديمو NexLink في الإنتاج

---

## 11. مراجع

| المصدر | الرابط |
|--------|--------|
| NexLink RTL | https://nexlink.layoutdrop.com/demo/index-rtl.html |
| NexLink Calendar | https://nexlink.layoutdrop.com/demo/calendar.html |
| وميض ديمو | https://wameed.mostaqbalsoft.com/ControlPanel |
| دخول الديمو للاختبار | [wameed-demo-qa.md](./wameed-demo-qa.md) — `studio-manage@wameed.com` / `Test@123` |
| تحليل وميض | [wameed-system-analysis.md](./wameed-system-analysis.md) |
| **كتالوج + اتفاقية الراية 2026** | [alraya-client-catalog-2026.md](./alraya-client-catalog-2026.md) — أسعار العميل الحقيقية |
| UI تفصيلي | [ui-nexlink-spec.md](./ui-nexlink-spec.md) |
| البيانات | [data-model.md](./data-model.md) |
