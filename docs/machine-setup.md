# تجهيز جهاز المبرمجة — استوديو الراية

> لجهاز **مُفرمَت / جديد**.  
> الهدف: تثبيت الأدوات + سحب الريبو + فتح المشروع في Cursor + جاهزية `.env`.  
> المهندسة: نهلة البستنجي · الريبو: https://github.com/baitpait/alrya

---

## أ) قبل Cursor (مرة واحدة على الجهاز)

### 1) حسابات
- حساب GitHub بصلاحية على `baitpait/alrya` (أو دعوة من مصطفى)
- حساب Cursor: https://cursor.com

### 2) أدوات النظام (macOS مثال)

افتح Terminal ونفّذي بالترتيب:

```bash
# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Git + Node LTS
brew install git node

# تحقق
git --version
node -v
npm -v
```

### 3) MySQL (للمرحلة 0 لاحقاً)
```bash
brew install mysql
brew services start mysql
```
أو استخدم MySQL من تثبيت آخر — المهم لاحقاً `DATABASE_URL` في `.env`.

### 4) تثبيت Cursor
1. نزّلي من https://cursor.com  
2. ثبّتي وافتحي التطبيق  
3. سجّلي الدخول  
4. فعّلي Agent / Hooks للمشروع عند أول فتح (إن طلب Cursor السماح)

---

## ب) سحب المشروع

```bash
cd ~
mkdir -p BAITPAIT/Projects
cd BAITPAIT/Projects
git clone https://github.com/baitpait/alrya.git
cd alrya
git checkout main
git pull origin main
```

إن ظهر طلب تسجيل GitHub: Personal Access Token أو GitHub CLI (`gh auth login`).

---

## ج) بيئة المشروع المحلية

```bash
cd ~/BAITPAIT/Projects/alrya   # أو مسار النسخ عندكِ
cp .env.example .env
```

افتحي `.env` واملئي على الأقل:
- `WASENDER_API_KEY` (من الإدارة إن لزم إشعارات واتساب)
- لاحقاً عند المرحلة 0: `DATABASE_URL=mysql://...`

تحقق سريع من Node على أدوات المشروع:
```bash
node --check tools/pm-notify.mjs
node --check tools/git-auto-push.mjs
```

---

## د) فتح المشروع في Cursor

1. Cursor → **Open Folder** → اختاري مجلد `alrya`  
2. تأكدي أن القواعد تظهر من `.cursor/rules/`  
3. الصقي **البرومبت الأول** (القسم هـ)

---

## هـ) البرومبت الأول (نسخ → لصق في Cursor)

```
المشروع: استوديو الراية
أنا: نهلة البستنجي — مهندسة تنفيذ تحت تدريب وتطوير
الجهاز: مُفرمَت جديد — أحتاج تهيئة بيئة العمل كاملة

الريبو: https://github.com/baitpait/alrya

المطلوب الآن (بدون تنفيذ كود منتج بعد):
1) تحقق أن المجلد الحالي هو ريبو alrya وعلى main ومحدَّث (git status / git pull إن لزم)
2) تحقق تثبيت: git, node, npm (واذكر إصداراتهم)
3) إن نقص شيء: أعطني أوامر التثبيت لجهازي (macOS أو Windows حسب ما تكتشف)
4) جهّز .env من .env.example إن لم يوجد — بدون كتابة أسرار وهمية؛ أخبرني ماذا أملأ يدوياً
5) اقرأ: docs/README.md ثم docs/machine-setup.md ثم docs/production-work-plan.md وقواعد .cursor/rules/
6) لخّص: حالة البيئة + المرحلة المقترحة للبدء (غالباً 0) + خطة التالية

قيود:
- أنت مساعد + معلّم
- لا تنفّذ تعديلات ملفات كبيرة أو scaffold للمرحلة 0 الآن
- اعرض خطة + درس قصير فقط
- بعد ما أقرأ وأفهم أكتب: تم
- ثم: نفّذ

قيود المنتج الثابتة:
- مرحلة واحدة فقط
- لا أزرار صامتة
- RTL للأدمن
- الثيم: Light افتراضي + Dark عبر theme-btn
- MySQL + Prisma
- الحجوزات على التقويم عند مراحلها
```

بعد ما تفهمي الرد اكتبي:
```
تم
نفّذ
```

---

## و) ماذا يوجد في الريبو الآن؟
- توثيق كامل + قواعد Cursor + أدوات واتساب/رفع GitHub  
- **لا يوجد بعد** تطبيق Next.js كامل (يُبنى في المرحلة 0)

لذلك «تثبيت بيئة العمل» الآن = أدوات الجهاز + الريبو + `.env` + Cursor.  
بناء التطبيق يبدأ بعد بوابة الفهم (**تم / نفّذ**) على المرحلة 0.

---

## ز) مساعدة سريعة إذا علق شيء

| المشكلة | الحل |
|---------|------|
| `git clone` مرفوض | صلاحية GitHub / توكن |
| `node` غير موجود | `brew install node` أو ثبّتي Node LTS من الموقع |
| Cursor لا يرى القواعد | تأكدي Open Folder على جذر `alrya` وليس مجلد أب |
| واتساب لا يرسل | `WASENDER_API_KEY` في `.env` + `node tools/pm-notify.mjs ...` |

مرجع الإدارة: `docs/team.md` · إشعارات: `docs/whatsapp-pm-notifications.md`
