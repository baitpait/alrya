# إشعارات واتساب لمدير المشروع — استوديو الراية

> المزوّد: [WasenderAPI](https://wasenderapi.com/api-docs)  
> الجلسة: `baitpait`  
> المستلمون:
> - إدارة: `+970599814758` (`PM_WHATSAPP_TO_MGMT`)
> - مبرمج: `+970597987860` (`PM_WHATSAPP_TO_DEV`)


---

## الهدف

يصلك على واتساب تقرير بكل إنجاز برمجي مهم، وخصوصاً:

- إكمال مرحلة من `production-work-plan.md`
- نتيجة **الاختبار اليدوي** (تم / لم يتم / فشل)
- نجاح أو رسوب **بوابة المرحلة** (هل يُسمح بالانتقال؟)
- انتهاء جلسات عمل الوكيل (اختياري)

---

## الإعداد (مرة واحدة)

1. انسخ `.env.example` → `.env`
2. ضع مفتاح الجلسة في `WASENDER_API_KEY` (من لوحة Wasender — Session API Key)
3. عيّن الأرقام:
   - `PM_WHATSAPP_TO_MGMT=970599814758` (إدارة)
   - `PM_WHATSAPP_TO_DEV=970597987860` (مبرمج)
4. `WASENDER_SEND_GAP_MS=40000` — **شرط إلزامي في الكود:** انتظار لا يقل عن 40 ثانية بين كل رسالتين (حتى لو وضعت قيمة أقل يُرفع تلقائياً إلى 40ث).

### الأمان
- لا تشارك مفتاح الـ API في الشات أو التوثيق العام.
- إن تسرب المفتاح: أعد توليده من Wasender فوراً (`Regenerate API Key`).

### مرجع الإرسال

```http
POST https://www.wasenderapi.com/api/send-message
Authorization: Bearer <SESSION_API_KEY>
Content-Type: application/json

{ "to": "970599814754", "text": "..." }
```

التوثيق: [Send Text Message](https://wasenderapi.com/api-docs/messages/send-text-message)

---

## أداة المبرمج: `tools/pm-notify.mjs`

### أوامر إلزامية بعد كل مرحلة

```bash
# بعد إنجاز أعمال المرحلة (قبل/مع الاختبار)
node tools/pm-notify.mjs phase --id 5 --title "التقويم" --manual-test pass --notes "كل الحجوزات ظاهرة على FullCalendar"

# بعد بوابة الاختبار اليدوي
node tools/pm-notify.mjs gate --id 5 --pass true --manual-test pass --notes "بوابة 5 ناجحة"

# مهمة فرعية أثناء المرحلة
node tools/pm-notify.mjs task --title "ربط EventService بالتقويم" --status done --manual-test pass

# إذا لم يعمل اختبار يدوي
node tools/pm-notify.mjs gate --id 5 --pass false --manual-test fail --notes "الأحداث لا تظهر بعد Refresh"
```

### قاعدة الإنتاج
**لا تُعتبر المرحلة مكتملة** في خطة الإنتاج ما لم:
1. يكتمل الهيكل + الداتا فلو
2. ينجح الاختبار اليدوي
3. يُرسل إشعار `gate` على واتساب للمدير

---

## أسلوب الرسائل

| المستلم | الأسلوب |
|---------|---------|
| الإدارة | تقرير مختصر وواضح (حالة / بوابة / وقت) |
| المبرمج | خطاب هندسي راقٍ ومهذّب وتحفيزي — مخاطبة «زميلنا المهندس» |

### بداية / نهاية الجلسة
```bash
node tools/pm-notify.mjs session-start --focus "المرحلة 5 — التقويم وظهور الحجوزات"
node tools/pm-notify.mjs session-end --summary "أُنجز ربط التقويم؛ بانتظار التحقق اليدوي"
```

Hooks Cursor: `sessionStart` و `stop` ترسل تلقائياً (مع سليب 40ث بين الإدارة والمبرمج).

مثال بوابة ناجحة:

```
🏛 استوديو الراية — إشعار مدير المشروع
الجلسة: baitpait
النوع: بوابة اختبار مرحلة 5
...
بوابة المرحلة 5: ✅ ناجحة — مسموح الانتقال
✅ تم الاختبار اليدوي
ملاحظات: كل الحجوزات ظاهرة
➡️ يمكن فتح المرحلة التالية بعد التوقيع في الخطة.
```

مثال رسوب:

```
بوابة المرحلة 5: ❌ راسبة — ممنوع الانتقال
❌ لم يُنفَّذ / فشل الاختبار اليدوي
⛔ لا تنتقل للمرحلة التالية.
```

---

## ربط Cursor (اختياري)

- قاعدة: `.cursor/rules/pm-whatsapp-notify.mdc`
- Hook توقف وكيل: `.cursor/hooks.json` → يرسل `agent-stop` إن `PM_NOTIFY_ON_AGENT_STOP=1`

---

## اختبار سريع

```bash
node tools/pm-notify.mjs custom --text "اختبار قناة المدير — استوديو الراية"
```

يجب أن تصل الرسالة إلى **الإدارة ثم المبرمج** مع انتظار 40 ثانية بينهما.

> ملاحظة: الكود يفرض `sleep ≥ 40s` بين المستلمين. Wasender قد يفرض أيضاً حماية أقصر (~5ث) — شرط المشروع أوضح وأطول.
