# استوديو الراية — حزمة توثيق المبرمج

> الغرض: تمكين المبرمج من بدء العمل بدون جلسات شرح إضافية.  
> الحالة: **توثيق فقط** — لا يوجد سورس تطبيق بعد.

---

## ابدأ من هنا (بالترتيب)

1. [developer-handoff.md](./developer-handoff.md) — المواصفات الكاملة والقرارات المثبّتة
2. [team.md](./team.md) — أسماء الفريق (مصطفى / نهلة) والشركة
3. [production-work-plan.md](./production-work-plan.md) — **خطة الإنتاج المرحلية + بوابات الاختبار اليدوي**
3. [pm-quality-oversight.md](./pm-quality-oversight.md) — دليل مدير المشروع لمراقبة الجودة والمتابعة
4. [developer-growth-cursor.md](./developer-growth-cursor.md) — تقوية نهلة + مسار مبرمجة عالمية + شروط Cursor
5. [whatsapp-pm-notifications.md](./whatsapp-pm-notifications.md) — إشعارات واتساب (بداية/نهاية جلسة + بوابات)
4. [pages-inventory.md](./pages-inventory.md) — قائمة الصفحات (MVP / V2 / V3)
5. [ui-nexlink-spec.md](./ui-nexlink-spec.md) — ثيم NexLink، RTL، Dark، التقويم، الخطوط
6. [branding/brand-guidelines.md](./branding/brand-guidelines.md) — الشعار والألوان
7. [data-model.md](./data-model.md) — الجداول، الحالات، المعادلات، تدفق الحجز
8. [wameed-system-analysis.md](./wameed-system-analysis.md) — مرجع منطق نظام وميض (تحليل الديمو)

---

## ملخص القرار السريع

| البند | القرار |
|--------|--------|
| المنتج | منصة إدارة استوديو تصوير + لاندينغ حجز عرسان |
| العميل | استوديو الراية |
| الشعار | [`branding/alraya-studio-logo.png`](./branding/alraya-studio-logo.png) |
| الهوية | عنابي + ذهبي — «علامة الجودة والاحتراف» |
| المرجع الوظيفي | وميض (mostaqbalsoft) — منطق فقط |
| التقنية | Next.js + TypeScript + Prisma + **MySQL** |
| واجهة الإدارة | NexLink Bootstrap 5 — RTL + **Dark** افتراضي |
| العام | لاندينغ + تسجيل أونلاين + تواصل معنا + واتساب عائم + سوشيال |
| أهم شاشة أدمن | تقويم المواعيد + Inbox طلبات + رسائل تواصل |

---

## قواعد Cursor للمبرمج / الوكيل

المجلد: [`.cursor/rules/`](../.cursor/rules/)

| الملف | الوظيفة |
|--------|---------|
| `project-context.mdc` | اسم المشروع + Stack (Next.js / TS / Prisma / MySQL) — دائماً |
| `clean-code.mdc` | كود نظيف |
| `nextjs-typescript.mdc` | App Router + TypeScript |
| `prisma-mysql.mdc` | Prisma + MySQL |
| `admin-nexlink-ui.mdc` | لوحة NexLink RTL Dark + تقويم |
| `theme-setup.mdc` | تسهيل تثبيت الثيم (أصول، RTL، Dark، theme-btn، checklist) |
| `production-phases.mdc` | إلزام خطة الإنتاج المرحلية + بوابات الاختبار اليدوي |
| `pm-whatsapp-notify.mdc` | إلزام إشعار واتساب للمدير بعد المراحل/الاختبار |
| `session-lifecycle.mdc` | كشف بداية/نهاية الجلسة من الكلمات أو وكيل جديد |
| `developer-growth.mdc` | شروط Cursor + عقلية مبرمجة عالمية لنـهلة |
| `public-landing.mdc` | لاندينغ + واتساب/سوشيال |

---

## مراجع خارجية

- [NexLink RTL Dashboard](https://nexlink.layoutdrop.com/demo/index-rtl.html)
- [NexLink Calendar](https://nexlink.layoutdrop.com/demo/calendar.html)
- [وميض ديمو](https://wameed.mostaqbalsoft.com/ControlPanel)
