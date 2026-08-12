# استوديو الراية — حزمة توثيق المبرمج

> الغرض: تمكين المبرمج من بدء العمل بدون جلسات شرح إضافية.  
> الحالة: **توثيق فقط** — لا يوجد سورس تطبيق بعد.

---

## ابدأ من هنا (بالترتيب)

1. [machine-setup.md](./machine-setup.md) — **جهاز جديد/مُفرمَت:** Cursor + Git + Node + سحب الريبو
1b. [phase-0-completion.md](./phase-0-completion.md) — **سجل إنجاز المرحلة 0** (Next.js + Prisma + MySQL)
1c. [phase-1-completion.md](./phase-1-completion.md) — **سجل إنجاز المرحلة 1** (شِل الأدمن + الثيم)
1d. [phase-2-completion.md](./phase-2-completion.md) — **سجل إنجاز المرحلة 2** (المصادقة)
1e. [dev-credentials.md](./dev-credentials.md) — بيانات دخول تجريبية (محلي)
1f. [phase-3-completion.md](./phase-3-completion.md) — **سجل إنجاز المرحلة 3** (الخدمات والباقات)
2. [workflow-map.html](./workflow-map.html) — **خريطة HTML:** هيكل النظام + المراحل 0→9 + صيانة (افتح في المتصفح)
3. [developer-handoff.md](./developer-handoff.md) — المواصفات الكاملة والقرارات المثبّتة
3. [team.md](./team.md) — أسماء الفريق (مصطفى / نهلة) والشركة
4. [production-work-plan.md](./production-work-plan.md) — **خطة الإنتاج المرحلية + بوابات الاختبار اليدوي**
5. [pm-quality-oversight.md](./pm-quality-oversight.md) — دليل مدير المشروع لمراقبة الجودة والمتابعة
6. [developer-growth-cursor.md](./developer-growth-cursor.md) — تقوية نهلة + مسار مبرمجة عالمية + شروط Cursor
7. [whatsapp-pm-notifications.md](./whatsapp-pm-notifications.md) — إشعارات واتساب (بداية/نهاية جلسة + بوابات)
4. [pages-inventory.md](./pages-inventory.md) — قائمة الصفحات (MVP / V2 / V3)
5. [ui-nexlink-spec.md](./ui-nexlink-spec.md) — ثيم NexLink، RTL، Dark، التقويم، الخطوط
6. [branding/brand-guidelines.md](./branding/brand-guidelines.md) — الشعار والألوان
7. [data-model.md](./data-model.md) — الجداول، الحالات، المعادلات، تدفق الحجز
8. [wameed-system-analysis.md](./wameed-system-analysis.md) — مرجع منطق نظام وميض (تحليل الديمو)
9. [wameed-full-architecture.md](./wameed-full-architecture.md) — **هيكل وميض الكامل** (قوائم + طاقم + SMS/OTP)
10. [wameed-demo-qa.md](./wameed-demo-qa.md) — دخول ديمو وميض + اختبار طاقم المناسبة

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
| واجهة الإدارة | NexLink Bootstrap 5 — RTL · Light افتراضي · Dark عبر **theme-btn** |
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
| `developer-growth.mdc` | شروط Cursor + تدريب نهلة + تم/نفّذ |
| `confirm-before-execute.mdc` | ممنوع التنفيذ قبل تم+نفّذ — الوكيل معلّم مساعد |
| `public-landing.mdc` | لاندينغ + واتساب/سوشيال |

---

## مراجع خارجية

- [NexLink RTL Dashboard](https://nexlink.layoutdrop.com/demo/index-rtl.html)
- [NexLink Calendar](https://nexlink.layoutdrop.com/demo/calendar.html)
- [وميض ديمو](https://wameed.mostaqbalsoft.com/ControlPanel)
