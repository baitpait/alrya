# هوية الأزرار + السايدبار — للمبرمج

> قرار مدير المشروع: مصطفى البستنجي — **2026-08-17**  
> الأنماط: `apps/web/app/admin/admin-shell.css`  
> شريط التقارير: `components/admin/ReportToolbar.tsx`

---

## 1) هوية بصرية موحّدة للأزرار

**ممنوع** خلط تصميمات مختلفة في نفس الشريط (مثال: زر ثانوي + رابط تحتي `text-link`).

| الصنف | الاستخدام |
|--------|-----------|
| `btn-primary` | الإجراء الرئيسي (حفظ · إضافة) |
| `btn-secondary` | إجراءات مساعدة متساوية (تصدير · طباعة · كل التقارير · إغلاق) |
| `btn-danger` / سلة | حذف فقط |

متغيرات موحّدة (لا تغيّري الارتفاع يدوياً لكل زر):

```css
--admin-btn-min-height
--admin-btn-radius
--admin-btn-pad-x / --admin-btn-pad-y
--admin-btn-weight
--admin-btn-font-size
```

### شريط التقارير (مثال معتمد)

```tsx
<a className="btn-secondary" href="…">تصدير Excel</a>
<button className="btn-secondary">طباعة / PDF</button>
<Link className="btn-secondary" href="/admin/reports">كل التقارير</Link>
```

**ليس:** زرين + `text-link` لـ «كل التقارير».

---

## 2) السايدبار — عرض ثابت + خط مناسب

| القاعدة | التفاصيل |
|---------|----------|
| العرض | ثابت `--admin-sidebar-width: 260px` — `min/max/width` نفسها على سطح المكتب |
| لا تصغير/تكبير | ممنوع ترك العمود يتمدد مع المحتوى؛ المحتوى `minmax(0, 1fr)` |
| الخط | Cairo صريح على `.admin-sidebar` · روابط القائمة `0.95rem` / وزن `500` · النشط `600` |
| الموبايل (&lt;900px) | السايدبار بعرض كامل الصفحة فقط — ليس عموداً ضيقاً يتقلص |

```css
.page-layout {
  grid-template-columns: var(--admin-sidebar-width) minmax(0, 1fr);
}
.admin-sidebar {
  width: var(--admin-sidebar-width);
  min-width: var(--admin-sidebar-width);
  max-width: var(--admin-sidebar-width);
}
```

---

## 3) اختبار يدوي

1. تقرير مناسبات: الأزرار الثلاثة بنفس الارتفاع والشكل.  
2. غيّري عرض نافذة المتصفح على سطح المكتب: السايدبار يبقى 260px ولا يضيق.  
3. خط عناصر القائمة Cairo واضح ومقروء (ليس أصغر من المحتوى بشكل مزعج).
