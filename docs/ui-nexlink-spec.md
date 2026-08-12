# مواصفات واجهة NexLink — استوديو الراية (Admin)

> مرجع الديمو: [index-rtl.html](https://nexlink.layoutdrop.com/demo/index-rtl.html)  
> أهم صفحة: [calendar.html](https://nexlink.layoutdrop.com/demo/calendar.html)  
> الاستخدام: سيكل/أساس لوحة الإدارة فقط — اللاندينغ العام تصميم منفصل

---

## 1. هوية الثيم التقنية

| البند | القيمة المثبّتة |
|--------|------------------|
| المنتج | NexLink — CRM Admin Dashboard (LayoutDrop) |
| الأساس | Bootstrap 5 |
| الاتجاه | **RTL إلزامي** |
| الوضع الافتراضي | **Dark** (`data-theme="dark"`) |
| اللون الأساسي | `#5955D1` |
| خط الواجهة | `"Instrument Sans", sans-serif` (400–700) |
| أيقونات | Lucide + Font Awesome 6 + Flaticon (uicons) |
| جداول | DataTables |
| رسوم | ApexCharts + Chart.js |
| تواريخ نماذج | Flatpickr |
| تقويم | **FullCalendar** |
| مساعدة | Simplebar, Waves, Bootstrap-select, Sortable |

---

## 2. قواعد HTML الجذر (إلزامية)

```html
<html lang="ar" dir="rtl" data-theme="dark">
```

تحميل الخط و CSS:

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">
<!-- أصول محلية من الثيم المرخّص — لا تعتمد على CDN الديمو في الإنتاج -->
<link href="/theme/nexlink/assets/css/styles-rtl.css" rel="stylesheet">
```

CSS أساس:

```css
body {
  font-family: "Instrument Sans", sans-serif;
}
:root {
  --bs-primary: #5955D1;
}
```

`meta theme-color`: `#5955D1`

---

## 3. زر تبديل الثيم `theme-btn`

**الموقع في الديمو:**  
`div.page-layout > header.app-header > … > a.theme-btn`

| الخاصية | القيمة |
|----------|--------|
| العنصر | `<a href="javascript:void(0);" class="theme-btn">` |
| الوظيفة | تبديل Light ↔ Dark |
| الأيقونات | SVG `.icon-light` / `.icon-dark` |
| الحجم التقريبي | 74×40px |
| العرض | `display: flex` |
| خلفية (في Light) | تقريباً `rgb(242, 242, 246)` |

### سلوك مطلوب

1. الافتراضي عند أول زيارة: **Dark**
2. النقر يبدّل `data-theme` على `<html>` بين `dark` و `light`
3. يُفضّل حفظ الاختيار في `localStorage`
4. يعمل بشكل صحيح مع RTL (لا انعكاس خاطئ للأيقونة)
5. منطق مشابه لـ `appSettings.js` / `main.js` في الثيم

---

## 4. هيكل الـ Shell

اعتمد نفس طبقات NexLink:

```
.page-layout
  ├── header.app-header
  │     ├── app toggler (فتح/إغلاق السايدبار)
  │     ├── بحث
  │     ├── theme-btn
  │     ├── إشعارات
  │     └── قائمة المستخدم
  ├── aside / sidebar (قائمة)
  └── main
        ├── breadcrumb
        └── محتوى الصفحة
```

### براند

- استبدال شعار واسم **NexLink** بـ **استوديو الراية**
- الإبقاء على البنية البصرية للثيم

---

## 5. الصفحة الأهم: التقويم (Calendar)

المرجع: https://nexlink.layoutdrop.com/demo/calendar.html

### مكتبات الديمو

- `assets/libs/fullcalendar/index.global.min.js`
- `assets/js/plugins/fullcalendar.js`

### ملاحظة RTL

صفحة `calendar.html` في الديمو قد تكون LTR؛ في مشروعنا:

- فرض `dir="rtl"` + `styles-rtl.css`
- الإبقاء على `data-theme="dark"`
- ضبط اتجاه FullCalendar للعربية إن لزم (`direction: 'rtl'`, `locale: 'ar'`)

### مكوّنات الصفحة

| عنصر | الوظيفة عندنا |
|------|----------------|
| زر Add Event | إضافة موعد / خدمة مناسبة |
| Month / Week / Day | عروض التقويم |
| Today / Prev / Next | تنقل |
| Draggable Events (اختياري) | أنواع خدمات سريعة أو قوالب |
| Modal Add Event | إنشاء/تعديل موعد |
| Modal Event Title | عرض تفاصيل الموعد |

### حقول Modal → بيانات النظام

| حقل NexLink | حقل النظام |
|-------------|------------|
| Title | اسم العرض (زبون + خدمة) أو عنوان مخصص |
| Label (Primary/Success/…) | نوع الخدمة / لون الحالة |
| Start Date | `startsAt` لـ EventService |
| End Date | `endsAt` |
| Location | القاعة / المكان |
| Description | ملاحظات |
| Event URL | اختياري — رابط تفاصيل المناسبة في الأدمن |

### مصدر الأحداث

كل `EventService` (خدمة داخل مناسبة) = حدث في التقويم:

```json
{
  "id": "eventServiceId",
  "title": "عرس — ليث حسون",
  "start": "2026-08-20T18:00:00",
  "end": "2026-08-20T22:00:00",
  "extendedProps": {
    "eventId": 13,
    "customerName": "ليث حسون",
    "venue": "قاعة الماسة",
    "status": "IN_PROGRESS"
  }
}
```

### مكان الصفحة في التنقل

- عنصر رئيسي مبكر في السايدبار: **التقويم**
- يُفضّل أن تكون من أول الشاشات بعد تسجيل الدخول

---

## 6. إسقاط شاشات NexLink → استوديو الراية

| شاشة / مفهوم NexLink | شاشة استوديو الراية |
|----------------------|---------------------|
| Calendar | تقويم المواعيد (**أولوية**) |
| Dashboard KPIs | مؤشرات مناسبات / طلبات / تحصيلات |
| Leads / New Leads | طلبات تسجيل العرسان |
| Customers | الزبائن |
| Deals | المناسبات |
| Employees | الموظفين / المصورين |
| Revenue | التحصيلات والدفعات |
| Login pages | دخول الإدارة |
| DataTable | قوائم الزبائن/المناسبات/الطلبات |
| Modals (New Customer…) | نماذج إضافة/تعديل |

---

## 7. أصول يجب نسخها محلياً

من حزمة NexLink المرخّصة إلى `public/theme/nexlink/`:

```
assets/css/styles-rtl.css
assets/css/styles.css          (إن لزم)
assets/libs/...                (bootstrap deps, fullcalendar, apexcharts, …)
assets/js/main.js
assets/js/appSettings.js
assets/js/plugins/fullcalendar.js
assets/images/...
```

لا تستخدم روابط `https://nexlink.layoutdrop.com/demo/...` في الإنتاج.

---

## 8. قائمة تحقق UI للمبرمج

- [ ] `dir=rtl` و `lang=ar` على كل صفحات الأدمن
- [ ] `data-theme=dark` افتراضي
- [ ] `theme-btn` يبدّل ويحفظ التفضيل
- [ ] Instrument Sans محمّل ويُطبَّق على `body`
- [ ] Primary = `#5955D1`
- [ ] التقويم FullCalendar يعرض بيانات حقيقية
- [ ] Modal إضافة موعد يغذّي قاعدة البيانات
- [ ] الشعار والنصوص: استوديو الراية
- [ ] اللاندينغ العام **لا** يستخدم شكل سايدبار NexLink
