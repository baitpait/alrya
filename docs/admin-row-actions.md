# إجراءات صفوف الأدمن — أيقونات · رجوع · حذف

> قرار مدير المشروع: مصطفى البستنجي — **2026-08-17**  
> المكوّنات:  
> - `AdminActionIcons.tsx` — عرض / تعديل / فتح  
> - `ConfirmDelete.tsx` — حذف بأيقونة سلة (مع تأكيد)  
> - `AdminBackLink.tsx` — زر رجوع موحّد  
> الأنماط: `admin-shell.css` (`.btn-icon` · `.admin-back-btn` · `.detail-footer-actions`)

---

## 1) روابط الرجوع — أزرار وليس text-link

**ممنوع** في صفحات التفاصيل:

```tsx
<Link className="text-link" href="…">← رجوع للرسائل</Link>
```

**مطلوب:**

```tsx
import { AdminBackLink } from "@/components/admin/AdminBackLink";

<AdminBackLink href="/admin/messages" label="رجوع للرسائل" />
```

يطبق على كل صفحات `[id]`: رسائل · حجوزات · زبائن · مناسبات · موظفين · خدمات · معرض · FAQ.

---

## 2) عمود الإجراءات في الجداول — أيقونات

| الإجراء | المكوّن | الشكل |
|--------|---------|--------|
| عرض / تفاصيل | `ActionIconLink` `kind="view"` | عين |
| تعديل | `ActionIconLink` `kind="edit"` | قلم |
| فتح مرتبط | `ActionIconLink` `kind="open"` | مجلد |
| حذف | `ConfirmDelete` (افتراضي `variant="icon"`) | سلة حمراء |

كل أيقونة لها `title` + `aria-label` بالعربية.

```tsx
<ConfirmDelete
  action={deleteCustomer}
  id={c.id}
  fieldName="recordId"
  label={`حذف الزبون ${c.firstName}`}
/>
```

`variant="button"` فقط عندما يكون نص الحذف طويلاً وواضحاً في صفحة تفاصيل (مثال نادر).

---

## 3) لا تستخدم `name="id"` في النماذج

يسبّب في أدوات الفحص: `form#[object HTMLInputElement]`.

استخدم: `recordId` · `messageId` · `bookingId` · `eventServiceId` — والـ action يقرأها مع توافق خلفي لـ `id` إن لزم.

---

## 4) أزرار تفاصيل الصفحة (أرشفة / حفظ)

| المشكلة | الحل |
|---------|------|
| زر بلا صنف بجانب خطر | `btn-secondary` / `btn-primary` / `btn-danger` |
| ارتفاعات مختلفة | `.detail-footer-actions` أو `.modal-footer-actions` |

---

## 5) اختبار يدوي سريع

1. افتح رسالة → زر «رجوع للرسائل» يظهر كزر ثانوي وليس رابطاً تحتياً.  
2. في جدول الزبائن/الدفعات: عين + سلة · الحذف يطلب تأكيداً.  
3. لا كلمة «عرض» أو «حذف» كنص وحيد في عمود الإجراءات للجداول الجديدة.
