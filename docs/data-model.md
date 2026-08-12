# نموذج البيانات — استوديو الراية

> مستخرج من تحليل وميض + متطلبات الحجز الأونلاين  
> المرجع الوظيفي التفصيلي: [wameed-system-analysis.md](./wameed-system-analysis.md)

---

## 1. نظرة علاقات

```
User (موظف)
Role

Customer 1──* Event
Event 1──* EventService
EventService *──* EmployeeAssignment (User + راتب/مكافأة)
Event 1──* Payment
Event 1──* Discount
Service 1──* Offer (باقة/نوع خدمة بسعر)
SubService (خدمات فردية بأسعار)

BookingRequest ──?→ Customer + Event   (بعد التحويل)
ContactMessage                         (رسائل /contact → أدمن)
SiteSocialSetting                      (روابط سوشيال + واتساب عائم)

ProductCategory 1──* ProductItem       (POS — مرحلة لاحقة)
Setting (key/value)
Lookup / LookupValue
```

---

## 2. الجداول المقترحة (MVP)

أسماء توضيحية — يمكن ضبطها في Prisma بنفس المعنى.

### User

| الحقل | النوع | ملاحظة |
|--------|------|--------|
| id | int / uuid | PK |
| name | string | |
| email | string | unique |
| phone | string? | |
| passwordHash | string | |
| roleId | FK | مدير / مصور… |
| active | boolean | |
| createdAt | datetime | |

### Role

| الحقل | النوع | أمثلة |
|--------|------|--------|
| id | | |
| name | string | مدير الأستوديو، مصور |
| description | string? | |

### Customer

| الحقل | النوع | من وميض |
|--------|------|---------|
| id | | |
| firstName | string | الإسم الأول |
| lastName | string | إسم العائلة |
| phone | string | رقم الهاتف (مفتاح تواصل) |
| altPhone | string? | |
| email | string? | |
| address | string? | العنوان |
| gender | enum? | MALE / FEMALE |
| createdAt | datetime | |

### Service

| الحقل | النوع | أمثلة |
|--------|------|--------|
| id | | |
| name | string | عرس، حنا، عقيقة… |
| kind | enum | EVENT / SESSION |
| active | boolean | |
| createdAt | datetime | |

### Offer (نوع/باقة الخدمة)

| الحقل | النوع | ملاحظة |
|--------|------|--------|
| id | | |
| serviceId | FK | |
| name | string | اسم العرض |
| audience | string? | نساء فقط / رجال / مختلط… |
| price | decimal | |
| description | text? | |

### SubService

| الحقل | النوع | أمثلة |
|--------|------|--------|
| id | | |
| name | string | كاميرا فوتو، برومو، طباعة |
| type | string | كاميرا / برومو / صور |
| price | decimal | |
| hasQuantity | boolean? | لديه عدد |

### Event (مناسبة)

| الحقل | النوع | ملاحظة |
|--------|------|--------|
| id | | رقم المناسبة |
| customerId | FK | |
| status | enum | انظر الحالات |
| totalPrice | decimal | سعر المناسبة |
| notes | text? | |
| createdAt | datetime | |
| branchId | FK? | لاحقاً إن تعدد الفروع |

**محسوب (ليس إلزامياً تخزينه):**  
`remaining = totalPrice - sum(discounts) - sum(payments)`

### EventService (خدمة داخل المناسبة = موعد التقويم)

| الحقل | النوع | ملاحظة |
|--------|------|--------|
| id | | |
| eventId | FK | |
| serviceId | FK | |
| offerId | FK? | الباقة المختارة |
| startsAt | datetime | **بداية الموعد** |
| endsAt | datetime | **نهاية الموعد** |
| city | string? | |
| venue | string? | اسم المكان |
| hall | string? | اسم القاعة |
| price | decimal | سعر هذه الخدمة |
| status | enum | حالة تنفيذ الخدمة |
| notes | text? | |

> هذا الجدول هو **مصدر أحداث FullCalendar**.

### EventServiceEmployee (تعيين **طاقم تغطية المناسبة**)

> **المعنى:** ليسوا زبائن. هم المصورون/المساعدون الذين يغطّون الموعد.  
> مثال: عرس الزبون **أحمد** ← يُعيَّن الطاقم **محمد** و **خليل** على نفس `EventService`.  
> مرجع اختبار حي: [wameed-demo-qa.md](./wameed-demo-qa.md)

| الحقل | النوع | ملاحظة |
|--------|------|--------|
| id | | |
| eventServiceId | FK | الخدمة/الموعد داخل المناسبة |
| userId | FK | الموظف من جدول User (الطاقم) |
| jobTitle | string? | مصور، مساعد، مشرف… |
| salary | decimal? | أجر هذا التكليف |
| bonus | decimal? | مكافأة |
| supervisorId | FK? | المشرف على الطاقم |

يمكن تأجيل بناء الشاشات الكاملة لما بعد MVP (مرحلة 10)، لكن المفهوم مطلوب من الآن في فهم النموذج.

### Payment

| الحقل | النوع |
|--------|------|
| id | |
| eventId | FK |
| amount | decimal |
| paidAt | datetime |
| method | string? |
| note | string? |

### Discount

| الحقل | النوع |
|--------|------|
| id | |
| eventId | FK |
| amount | decimal |
| reason | string? |
| createdAt | datetime |

### BookingRequest (جديد — من اللاندينغ)

| الحقل | النوع | ملاحظة |
|--------|------|--------|
| id | | |
| groomName | string | |
| brideName | string? | |
| phone | string | |
| altPhone | string? | |
| serviceId | FK? | نوع المناسبة المفضّل |
| preferredFrom | datetime? | |
| preferredTo | datetime? | |
| city | string? | |
| venue | string? | |
| hall | string? | |
| notes | text? | |
| status | enum | انظر الحالات |
| convertedEventId | FK? | بعد التحويل |
| convertedCustomerId | FK? | |
| createdAt | datetime | |

### ContactMessage (رسائل «تواصل معنا»)

| الحقل | النوع | ملاحظة |
|--------|------|--------|
| id | | |
| name | string | اسم المرسل |
| phone | string | للرد واتساب/اتصال |
| email | string? | |
| subject | string? | الموضوع |
| body | text | نص الرسالة |
| status | enum | NEW / READ / ARCHIVED |
| readAt | datetime? | |
| createdAt | datetime | |
| source | string? | افتراضي: `contact_page` |

**منفصل عن BookingRequest** — الحجز طلب عمل؛ التواصل استفسار عام.

### SiteSocialSetting (أو مفاتيح داخل Setting)

يُفضّل جدول واحد أو مفاتيح `Setting`:

| المفتاح | مثال | استخدام |
|---------|------|---------|
| whatsapp_number | 9705xxxxxxxx | زر عائم + فوتر (`wa.me`) |
| whatsapp_default_message | مرحبا، أريد الاستفسار عن… | نص مسبق عند فتح واتساب |
| phone_public | | رابط `tel:` |
| email_public | | فوتر / تواصل |
| social_instagram | URL | أيقونة |
| social_facebook | URL | |
| social_tiktok | URL | |
| social_youtube | URL | |
| social_snapchat | URL | |
| address_text | | صفحة تواصل |
| map_embed_url | | اختياري V2 |

الأيقونات التي بلا رابط تُخفى في الواجهة.

### Setting

| الحقل | أمثلة من وميض |
|--------|----------------|
| key / value | Currency=`₪`, pagination_no=`10`, Close_Events_Day=`4` |

### Lookup / LookupValue (اختياري MVP)

أكواد معروفة من وميض: `Gender`, `ServiceType`, `SubServiceType`, `SMSTemplate`

---

## 3. الحالات (Enums)

### Event.status

| القيمة المقترحة | المعنى | مقابل وميض |
|-----------------|--------|------------|
| PREPARING | قيد التحضير | 1 |
| IN_PROGRESS | قيد العمل | 4 |
| CANCELLED | ملغية | 6 |
| COMPLETED | منتهية | 7 |

### EventService.status

| القيمة المقترحة | المعنى |
|-----------------|--------|
| IN_PROGRESS | قيد العمل |
| UNDER_REVIEW | قيد المراجعة |
| COMPLETED | منتهية |
| CANCELLED | ملغية |

### BookingRequest.status

| القيمة | المعنى |
|--------|--------|
| PENDING | جديد من اللاندينغ |
| CONTACTED | تم التواصل |
| APPROVED | موافق عليه |
| CONVERTED | حُوّل لمناسبة |
| REJECTED | مرفوض |

### ContactMessage.status

| القيمة | المعنى |
|--------|--------|
| NEW | جديدة / غير مقروءة |
| READ | مقروءة |
| ARCHIVED | مؤرشفة |

---

## 4. معادلات

```
المتبقي = Event.totalPrice - Σ Discount.amount - Σ Payment.amount
```

عند إنشاء مناسبة من باقات:  
`totalPrice` ≈ مجموع أسعار `EventService` (± تعديلات يدوية).

---

## 5. تدفق التحويل من طلب أونلاين

```
1) BookingRequest.status = PENDING
2) الإدارة: CONTACTED (اختياري)
3) موافقة:
   a. إنشاء Customer من الأسماء/الهاتف/العنوان
   b. إنشاء Event (status = PREPARING)
   c. إنشاء EventService واحد أو أكثر من التواريخ/الخدمة
   d. BookingRequest.status = CONVERTED
   e. ربط convertedEventId / convertedCustomerId
4) رفض: status = REJECTED + ملاحظة
```

---

## 6. مثال Prisma تقريبي (للتوجيه فقط)

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum EventStatus {
  PREPARING
  IN_PROGRESS
  CANCELLED
  COMPLETED
}

enum BookingStatus {
  PENDING
  CONTACTED
  APPROVED
  CONVERTED
  REJECTED
}

model Customer {
  id        Int      @id @default(autoincrement())
  firstName String
  lastName  String
  phone     String
  altPhone  String?
  email     String?
  address   String?
  events    Event[]
  createdAt DateTime @default(now())
}

model Event {
  id          Int         @id @default(autoincrement())
  customerId  Int
  customer    Customer    @relation(fields: [customerId], references: [id])
  status      EventStatus @default(PREPARING)
  totalPrice  Decimal     @default(0) @db.Decimal(12, 2)
  services    EventService[]
  payments    Payment[]
  discounts   Discount[]
  createdAt   DateTime    @default(now())
}

model EventService {
  id        Int      @id @default(autoincrement())
  eventId   Int
  event     Event    @relation(fields: [eventId], references: [id])
  serviceId Int
  startsAt  DateTime
  endsAt    DateTime
  venue     String?
  hall      String?
  price     Decimal  @db.Decimal(12, 2)
  // ...
}

model BookingRequest {
  id          Int           @id @default(autoincrement())
  groomName   String
  brideName   String?
  phone       String
  status      BookingStatus @default(PENDING)
  preferredFrom DateTime?
  preferredTo   DateTime?
  notes       String?       @db.Text
  createdAt   DateTime      @default(now())
}
```

المبرمج يكمّل باقي النماذج وفق الجداول أعلاه.

---

## 7. بيانات بذر مقترحة للتجربة

- خدمات: عرس، حنا، عقيقة، جلسة عرسان خارجية
- عروض بأسعار تجريبية لكل خدمة
- مستخدم مدير: `admin@alray.studio`
- طلب تسجيل تجريبي واحد بحالة PENDING
- مناسبة واحدة مع EventService في تاريخ قريب لظهورها في التقويم

العملة الافتراضية في الإعدادات: `₪` (قابلة للتغيير).

---

## 8. خارج نطاق نموذج MVP

جداول يمكن تصميمها لاحقاً دون حجب الإطلاق:

- Product / ProductItem / PurchaseOrder / Sale / CashBox (POS)
- SmsMessage / SmsTemplate
- Expense
- Branch / Studio (تعدد)
