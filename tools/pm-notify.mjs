#!/usr/bin/env node
/**
 * إشعارات واتساب — استوديو الراية
 * إدارة (مصطفى): تقرير مختصر
 * مهندسة (نهلة): ودّي · بشري · مرح · تحفيزي — مو روبوت ولا «الفاضلة» كل مرة
 * التوقيع: نيابة عن بيت البرمجيات وتكنولوجيا المعلومات
 *
 * شرط: ≥ 40 ثانية بين كل رسالتين (WASENDER_SEND_GAP_MS)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MIN_GAP_MS = 40_000;

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      val = val.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnv(path.join(ROOT, ".env"));

const API_URL =
  process.env.WASENDER_API_URL || "https://www.wasenderapi.com/api/send-message";
const API_KEY = process.env.WASENDER_API_KEY;
const SESSION = process.env.WASENDER_SESSION_NAME || "baitpait";
const STATE_PATH = path.join(ROOT, ".cursor", "pm-session-state.json");
/** منع تكرار بداية/نهاية خلال نافذة زمنية (افتراضي 25 دقيقة) */
const DEDUPE_MS = Math.max(
  60_000,
  Number(process.env.SESSION_DEDUPE_MS || 25 * 60_1000) || 25 * 60_1000
);

function readSessionState() {
  try {
    if (!fs.existsSync(STATE_PATH)) return {};
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function writeSessionState(patch) {
  const dir = path.dirname(STATE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const next = { ...readSessionState(), ...patch };
  fs.writeFileSync(STATE_PATH, JSON.stringify(next, null, 2) + "\n");
}

/** true = يجب تخطي الإرسال (تكرار قريب) */
function shouldDedupeSession(kind) {
  const st = readSessionState();
  const key = kind === "start" ? "lastStartAt" : "lastEndAt";
  const last = Number(st[key] || 0);
  if (!last) return false;
  return Date.now() - last < DEDUPE_MS;
}

function markSession(kind) {
  const patch =
    kind === "start"
      ? { lastStartAt: Date.now(), lastStartIso: new Date().toISOString() }
      : { lastEndAt: Date.now(), lastEndIso: new Date().toISOString() };
  writeSessionState(patch);
}

/** هوية الفريق — ثابتة في المراسلات */
const ORG = {
  company: process.env.ORG_COMPANY_NAME || "بيت البرمجيات وتكنولوجيا المعلومات",
  companyShort: process.env.ORG_COMPANY_SHORT || "البستنجي للحلول البرمجية والتدريب",
  managerName: process.env.ORG_MANAGER_NAME || "مصطفى البستنجي",
  managerTitle: process.env.ORG_MANAGER_TITLE || "مدير الشركة ومدير المشروع",
  engineerName: process.env.ORG_ENGINEER_NAME || "نهلة البستنجي",
  engineerTitle: process.env.ORG_ENGINEER_TITLE || "المهندسة المسؤولة عن تنفيذ المشروع",
  projectName: process.env.ORG_PROJECT_NAME || "استوديو الراية",
};

function signOff() {
  return [
    `مع التحية،`,
    `${ORG.managerName}`,
    `${ORG.company}`,
  ].join("\n");
}

function engineerFirstName() {
  return String(ORG.engineerName || "نهلة").trim().split(/\s+/)[0] || "نهلة";
}

/** مخاطبات ودّية متنوعة — ممنوع تكرار نفس الصيغة روبوتياً */
function greetEngineer() {
  const n = engineerFirstName();
  const options = [
    `${n}،`,
    `يا ${n}،`,
    `${n} الغالية،`,
    `هلا ${n}،`,
    `أهلين ${n}،`,
    `مرحبا ${n}،`,
  ];
  const st = readSessionState();
  let idx = Number(st.lastGreetIdx);
  if (!Number.isFinite(idx)) idx = -1;
  idx = (idx + 1) % options.length;
  writeSessionState({ lastGreetIdx: idx });
  return options[idx];
}

/** جزء اليوم حسب Asia/Jerusalem */
function dayPart() {
  const hourStr = new Date().toLocaleString("en-GB", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit",
    hour12: false,
  });
  const h = Number(String(hourStr).slice(0, 2));
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

/**
 * تحية حسب الوقت + تنويع لتجنّب الجمود.
 * الوكيل يقدر يمرّر --greeting "..." لجملة مولَّدة بشرية.
 */
function openLine() {
  const custom = argValue("--greeting");
  if (custom && String(custom).trim()) return String(custom).trim().replace(/[،,]*$/, "") + "،";

  const n = engineerFirstName();
  const part = dayPart();
  const pools = {
    morning: [
      "صباح الخير،",
      `صباح الخير يا ${n}،`,
      "صباح النور،",
      `صباح الخير ${n}، يعطيكِ العافية،`,
    ],
    afternoon: [
      "يعطيكم العافية،",
      `أهلا ${n}،`,
      "مرحبا،",
      `هلا ${n}، تمام؟`,
    ],
    evening: [
      "مساء الخير،",
      `مساء الخير يا ${n}،`,
      "مساء النور،",
      `مساء الخير ${n}،`,
    ],
    night: [
      "أهلا،",
      `مرحبا ${n}،`,
      "يعطيكم العافية على السهر،",
      `أهلا ${n}،`,
    ],
  };
  const options = pools[part] || pools.afternoon;
  const st = readSessionState();
  const key = `lastOpenIdx_${part}`;
  let idx = Number(st[key]);
  if (!Number.isFinite(idx)) idx = -1;
  idx = (idx + 1) % options.length;
  writeSessionState({ [key]: idx, lastDayPart: part });
  return options[idx];
}

function parseGapMs() {
  const raw = Number(process.env.WASENDER_SEND_GAP_MS || MIN_GAP_MS);
  const gap = Number.isFinite(raw) ? raw : MIN_GAP_MS;
  return Math.max(gap, MIN_GAP_MS);
}

function normalizePhone(raw) {
  return String(raw || "").replace(/\D/g, "");
}

function resolveRecipients() {
  const list = [];
  const push = (raw, role) => {
    const n = normalizePhone(raw);
    if (!n || list.some((x) => x.to === n)) return;
    list.push({ to: n, role });
  };
  push(process.env.PM_WHATSAPP_TO_MGMT, "إدارة");
  push(process.env.PM_WHATSAPP_TO_DEV, "مهندسة");
  for (const part of String(process.env.PM_WHATSAPP_TO || "").split(/[,;\s]+/)) {
    push(part, "مستلم");
  }

  const to = String(argValue("--to") || "both").toLowerCase();
  if (["dev", "engineer", "مهندسة", "programmer"].includes(to)) {
    return list.filter((x) => x.role === "مهندسة");
  }
  if (["mgmt", "admin", "إدارة", "manager"].includes(to)) {
    return list.filter((x) => x.role === "إدارة");
  }
  return list;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i < 0 ? undefined : process.argv[i + 1];
}

function boolish(v) {
  if (v === undefined) return null;
  const s = String(v).toLowerCase();
  if (["1", "true", "yes", "pass", "passed", "ok"].includes(s)) return true;
  if (["0", "false", "no", "fail", "failed"].includes(s)) return false;
  return null;
}

function stamp() {
  return new Date().toLocaleString("ar-PS", { timeZone: "Asia/Jerusalem" });
}

function manualMgmt(v) {
  if (v === true) return "الاختبار اليدوي: منجز بنجاح";
  if (v === false) return "الاختبار اليدوي: لم يُنجز أو لم ينجح";
  return "الاختبار اليدوي: غير موضّح";
}

function manualDev(v) {
  if (v === true)
    return "حلو إنكِ خلّصتي الاختبار اليدوي — هالشي بيفرق بالجودة.";
  if (v === false)
    return "لما تلحقي، كمّلي التحقق اليدوي قبل ما ننتقل — أحسن لنا ولكِ.";
  return "بس أكّدي لي نتيجة الاختبار اليدوي لما تخلصي.";
}

/** رسائل مزدوجة: إدارة (تقرير) + مهندسة (ودّي بشري) */
function dual(mgmtBody, devBody) {
  return { mgmt: mgmtBody.trim(), dev: devBody.trim() };
}

function buildMessages(cmd) {
  const notes = argValue("--notes") || "";
  const manual = boolish(argValue("--manual-test"));
  const t = stamp();
  const n = engineerFirstName();

  if (cmd === "session-start" || cmd === "agent-start") {
    const focus =
      argValue("--focus") ||
      argValue("--summary") ||
      "متابعة خطة الإنتاج المعتمدة";
    return dual(
      [
        `${ORG.projectName} — بدء جلسة عمل`,
        `الشركة: ${ORG.company}`,
        `المدير: ${ORG.managerName}`,
        `المهندسة المنفّذة: ${ORG.engineerName}`,
        `الجلسة: ${SESSION}`,
        `الوقت: ${t}`,
        `التركيز: ${focus}`,
      ].join("\n"),
      [
        openLine(),
        ``,
        greetEngineer(),
        ``,
        `يلا نبلش جلسة على «${ORG.projectName}» — واثقين فيكِ وفي شغلكِ.`,
        `محور اليوم: ${focus}`,
        ``,
        `تذكير خفيف: قبل ما نسكّر أي مرحلة، اختبار يدوي سريع. والأهم عندنا: الحجوزات تبين على التقويم.`,
        `ابدئي براحتكِ… إحنا معكِ 💪`,
        ``,
        signOff(),
        t,
      ].join("\n")
    );
  }

  if (cmd === "session-end" || cmd === "agent-stop") {
    if (cmd === "agent-stop" && process.env.PM_NOTIFY_ON_AGENT_STOP === "0") {
      return null;
    }
    const summary =
      argValue("--summary") ||
      "أُنجزت أعمال الجلسة وفق ما توفّر في هذه الفترة.";
    return dual(
      [
        `${ORG.projectName} — نهاية جلسة عمل`,
        `الشركة: ${ORG.company}`,
        `المدير: ${ORG.managerName}`,
        `المهندسة: ${ORG.engineerName}`,
        `الجلسة: ${SESSION}`,
        `الوقت: ${t}`,
        `ملخص: ${summary}`,
      ].join("\n"),
      [
        openLine(),
        ``,
        greetEngineer(),
        ``,
        `شكراً على تعبكِ اليوم على «${ORG.projectName}» — بنقدّر تركيزكِ وصبركِ على التفاصيل.`,
        `ملخص سريع: ${summary}`,
        ``,
        `لو بقي اختبار يدوي معلّق، كمّليه على مهلكِ وبجودة. واستريحي وأنتِ راضية عن اللي قدّمتي.`,
        `يعطيكِ العافية يا ${n} 🙏`,
        ``,
        signOff(),
        t,
      ].join("\n")
    );
  }

  if (cmd === "phase") {
    const id = argValue("--id") || "?";
    const title = argValue("--title") || "مرحلة";
    return dual(
      [
        `${ORG.projectName} — تقرير مرحلة`,
        `المهندسة: ${ORG.engineerName}`,
        `المرحلة: ${id} — ${title}`,
        manualMgmt(manual),
        notes ? `ملاحظات: ${notes}` : null,
        `الوقت: ${t}`,
        `مرجع: docs/production-work-plan.md`,
      ]
        .filter(Boolean)
        .join("\n"),
      [
        openLine(),
        ``,
        greetEngineer(),
        ``,
        `سجّلنا تقدّم على المرحلة ${id} («${title}»). تمام 👍`,
        manualDev(manual),
        notes ? `ملاحظة: ${notes}` : null,
        ``,
        `كمّلي بنفس الأسلوب — خطوة خطوة وواضحة.`,
        ``,
        signOff(),
        t,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  if (cmd === "task") {
    const title = argValue("--title") || "مهمة";
    const status = argValue("--status") || "done";
    const statusAr =
      status === "done"
        ? "أُنجزت"
        : status === "blocked"
          ? "معلّقة بانتظار قرار"
          : status;
    return dual(
      [
        `${ORG.projectName} — تحديث مهمة`,
        `المهندسة: ${ORG.engineerName}`,
        `المهمة: ${title}`,
        `الحالة: ${statusAr}`,
        manualMgmt(manual),
        notes ? `ملاحظات: ${notes}` : null,
        `الوقت: ${t}`,
      ]
        .filter(Boolean)
        .join("\n"),
      [
        openLine(),
        ``,
        greetEngineer(),
        ``,
        `بخصوص «${title}»: صارت حالتها «${statusAr}».`,
        manualDev(manual),
        notes ? `تفاصيل: ${notes}` : null,
        ``,
        `شكراً لحرصكِ… تحبي نكمّل اللي بعده؟`,
        ``,
        signOff(),
        t,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  if (cmd === "gate") {
    const id = argValue("--id") || "?";
    const pass = boolish(argValue("--pass"));
    const mgmtGate =
      pass === true
        ? `بوابة المرحلة ${id}: ناجحة — مسموح الانتقال`
        : pass === false
          ? `بوابة المرحلة ${id}: راسبة — ممنوع الانتقال`
          : `بوابة المرحلة ${id}: قيد التوضيح`;
    const devGate =
      pass === true
        ? `بوابة المرحلة ${id} نجحت ✅ تقدرِ تمشي للمرحلة الجاية بعد ما توقّعي بالخطة.`
        : pass === false
          ? `بوابة المرحلة ${id} لسا ما انسكرت. عادي — نشوف السبب بهدوء ونكمّل النقص ونرجع نختبر. إحنا معكِ.`
          : `لما تخلصي الاختبار اليدوي، خبرينا حالة بوابة المرحلة ${id}.`;
    return dual(
      [
        `${ORG.projectName} — بوابة مرحلة`,
        `المهندسة: ${ORG.engineerName}`,
        mgmtGate,
        manualMgmt(manual),
        notes ? `ملاحظات: ${notes}` : null,
        `الوقت: ${t}`,
      ]
        .filter(Boolean)
        .join("\n"),
      [
        openLine(),
        ``,
        greetEngineer(),
        ``,
        devGate,
        manualDev(manual),
        notes ? `ملاحظة: ${notes}` : null,
        ``,
        pass === true
          ? `أحسنتي — الاختبار اليدوي هو اللي بيفرق. فخورة فيكِ 🌟`
          : `ثقتنا فيكِ عالية… خطوة تحقق زيادة اليوم بتريّحنا بكرا.`,
        ``,
        signOff(),
        t,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  if (cmd === "welcome" || cmd === "project-welcome" || cmd === "project-start") {
    const focus =
      argValue("--focus") ||
      argValue("--notes") ||
      "انطلاق منصة استوديو الراية — توثيق جاهز وريبو GitHub مفعّل";
    return dual(
      [
        `${ORG.projectName} — ترحيب ببداية المشروع`,
        `الشركة: ${ORG.company}`,
        `المدير: ${ORG.managerName} — ${ORG.managerTitle}`,
        `المهندسة المنفّذة: ${ORG.engineerName}`,
        `الجلسة: ${SESSION}`,
        `الوقت: ${t}`,
        `الريبو: https://github.com/baitpait/alrya`,
        `التركيز: ${focus}`,
        `ملاحظة: تفعيل رفع تلقائي إلى GitHub بعد بوابات ناجحة (GIT_AUTO_PUSH=1)`,
      ].join("\n"),
      [
        `أهلا وسهلا ${n} 🎉`,
        ``,
        `فرحانين نبلش معكِ مشروع «${ORG.projectName}». واثقين فيكِ، وبدنا نمشي مرحلة مرحلة بهدوء وجودة.`,
        ``,
        `جاهز عندنا اليوم:`,
        `• التوثيق وخطة الإنتاج`,
        `• الريبو: https://github.com/baitpait/alrya`,
        `• واتساب للإدارة ولكِ`,
        `• رفع تلقائي على GitHub بعد كل بوابة ناجحة`,
        ``,
        `نقطة الانطلاق: ${focus}`,
        ``,
        `يلا… أنتِ قدّها، وإحنا حدّك. أي سؤال صغير ابعتيه براحتكِ.`,
        ``,
        signOff(),
        t,
      ].join("\n")
    );
  }

  if (cmd === "custom") {
    const body = argValue("--text");
    if (!body) {
      console.error("--text required");
      process.exit(1);
    }
    const mgmtSummary =
      argValue("--mgmt-summary") ||
      `تم إرسال رسالة لنـهلة (${ORG.engineerName}). راجع نسخة المهندسة على واتسابها.`;
    return dual(
      [
        `${ORG.projectName} — إشعار إدارة`,
        `من: ${ORG.managerName}`,
        mgmtSummary,
        `الوقت: ${t}`,
      ].join("\n"),
      [
        openLine(),
        ``,
        greetEngineer(),
        ``,
        body,
        ``,
        `أي شي تحتاجيه خبرينا — منكمل سوا.`,
        ``,
        signOff(),
        t,
      ].join("\n")
    );
  }

  // برومبت أول / رسالة موجهة أساساً للمهندسة
  if (cmd === "prompt" || cmd === "first-prompt") {
    const body = argValue("--text");
    if (!body) {
      console.error("--text required for prompt");
      process.exit(1);
    }
    return dual(
      [
        `${ORG.projectName} — إشعار`,
        `أُرسل برومبت/تعليمات لنـهلة على واتسابها.`,
        `الوقت: ${t}`,
      ].join("\n"),
      [
        openLine(),
        ``,
        greetEngineer(),
        ``,
        body,
        ``,
        signOff(),
        t,
      ].join("\n")
    );
  }

  // مشاكل تقنية / عوائق واجهتها المهندسة أو المشروع
  if (cmd === "issue" || cmd === "problem" || cmd === "blocker") {
    const title = argValue("--title") || argValue("--text") || "مشكلة تقنية";
    const severity = argValue("--severity") || "medium";
    const sevAr =
      severity === "high" || severity === "critical"
        ? "عالية"
        : severity === "low"
          ? "منخفضة"
          : "متوسطة";
    return dual(
      [
        `${ORG.projectName} — تنبيه مشكلة`,
        `المهندسة: ${ORG.engineerName}`,
        `الموضوع: ${title}`,
        `الخطورة: ${sevAr}`,
        notes ? `تفاصيل: ${notes}` : null,
        `الوقت: ${t}`,
        `مطلوب: متابعة الإدارة`,
      ]
        .filter(Boolean)
        .join("\n"),
      [
        openLine(),
        ``,
        greetEngineer(),
        ``,
        `وصلنا إن في عائق: ${title}`,
        notes ? `التفاصيل: ${notes}` : null,
        ``,
        `عادي تصير مشاكل — المهم نوضحها بدري. خذِي نفس، واكتبي شو جرّبتي وشو صار بالضبط، ومنكمّل سوا خطوة خطوة.`,
        `تحبي نبلش بتشخيص سريع هسا؟`,
        ``,
        signOff(),
        t,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  // مخالفة قوانين المشروع / الخطة / بوابات الجودة
  if (
    cmd === "violation" ||
    cmd === "rules" ||
    cmd === "alert" ||
    cmd === "noncompliance"
  ) {
    const rule =
      argValue("--rule") ||
      argValue("--title") ||
      argValue("--text") ||
      "مخالفة لقواعد المشروع";
    return dual(
      [
        `${ORG.projectName} — تنبيه عدم التزام بالقواعد`,
        `المهندسة: ${ORG.engineerName}`,
        `القاعدة/الملاحظة: ${rule}`,
        notes ? `تفاصيل: ${notes}` : null,
        `الوقت: ${t}`,
        `الإجراء: تذكير ودّي + تصحيح قبل المتابعة`,
      ]
        .filter(Boolean)
        .join("\n"),
      [
        openLine(),
        ``,
        greetEngineer(),
        ``,
        `حابين نذكّركِ بلطف بقاعدة مهمة عندنا: ${rule}`,
        notes ? `التفصيل: ${notes}` : null,
        ``,
        `مو عتاب قاسي — بس القوانين موجودة عشان نحمي جودة شغلكِ والمنتج (مرحلة واحدة، اختبار يدوي، لا أزرار صامتة، بوابة قبل الانتقال).`,
        `خلينا نعدّل المسار هسا ونكمّل صح. تحبي أوضّحلكِ المطلوب بجملة واحدة؟`,
        ``,
        signOff(),
        t,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  console.error(`Unknown command: ${cmd}
Usage:
  welcome|project-welcome [--focus "..."] [--greeting "..."]
  session-start|session-end [--greeting "..."]
  issue|problem|blocker --title "..." [--notes "..."] [--severity low|medium|high]
  violation|rules|alert --rule "..." [--notes "..."]
  prompt|custom --text "..." [--to dev|mgmt|both] [--greeting "..."]
  phase|task|gate ...`);
  process.exit(1);
}

async function sendOne(to, text) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, text }),
  });
  const body = await res.text();
  let json;
  try {
    json = JSON.parse(body);
  } catch {
    json = { raw: body };
  }
  if (!res.ok || json.success === false) {
    throw new Error(`WasenderAPI ${res.status}: ${body}`);
  }
  return json;
}

function textForRole(payload, role) {
  if (typeof payload === "string") return payload;
  if (role === "مهندسة" || role === "مبرمج") return payload.dev;
  return payload.mgmt;
}

async function sendWhatsApp(payload) {
  if (!API_KEY) {
    console.error("Missing WASENDER_API_KEY in .env");
    process.exit(1);
  }
  const recipients = resolveRecipients();
  if (!recipients.length) {
    console.error("Missing PM_WHATSAPP_TO_MGMT / PM_WHATSAPP_TO_DEV");
    process.exit(1);
  }

  const gapMs = parseGapMs();
  for (let i = 0; i < recipients.length; i++) {
    const { to, role } = recipients[i];
    if (i > 0) {
      console.log(
        `⏳ شرط السليب: انتظار ${Math.round(gapMs / 1000)} ثانية قبل (${role})...`
      );
      await sleep(gapMs);
    }
    const text = textForRole(payload, role);
    const json = await sendOne(to, text);
    console.log(`OK sent to ${to} (${role})`, json.data || json);
  }
}

async function main() {
  const cmd = process.argv[2];
  if (!cmd) {
    console.error("Missing command. Try: welcome | session-start | session-end | phase | gate | ...");
    process.exit(1);
  }

  const isStart = cmd === "session-start" || cmd === "agent-start";
  const isEnd = cmd === "session-end" || cmd === "agent-stop";
  if ((isStart || isEnd) && process.argv.includes("--force") === false) {
    const kind = isStart ? "start" : "end";
    if (shouldDedupeSession(kind)) {
      console.log(
        `Notification skipped (dedupe ${Math.round(DEDUPE_MS / 60000)}m): ${cmd}`
      );
      return;
    }
  }

  const payload = buildMessages(cmd);
  if (payload === null) {
    console.log("Notification skipped by env flag");
    return;
  }
  await sendWhatsApp(payload);
  if (isStart) markSession("start");
  if (isEnd) markSession("end");

  // شرط الرفع التلقائي: بعد بوابة ناجحة فقط
  if (cmd === "gate" && boolish(argValue("--pass")) === true) {
    try {
      const { execFileSync } = await import("child_process");
      const id = argValue("--id") || "?";
      console.log("git-auto-push: بوابة ناجحة — محاولة الرفع إلى GitHub…");
      execFileSync(
        process.execPath,
        [
          path.join(ROOT, "tools", "git-auto-push.mjs"),
          "--reason",
          `بوابة مرحلة ${id} ناجحة`,
        ],
        { cwd: ROOT, stdio: "inherit" }
      );
    } catch (e) {
      console.error("git-auto-push بعد البوابة لم يكتمل:", e.message || e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
