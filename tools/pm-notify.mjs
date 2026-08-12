#!/usr/bin/env node
/**
 * إشعارات واتساب — استوديو الراية
 * إدارة (مصطفى البستنجي): تقرير مختصر واضح
 * مهندسة (نهلة البستنجي): أسلوب راقٍ · مهذّب · تحفيزي · ثقة بالنفس
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
    `— بالنيابة عن ${ORG.company}`,
    `${ORG.managerName}`,
    `${ORG.managerTitle}`,
  ].join("\n");
}

function greetEngineer() {
  return `المهندسة الفاضلة ${ORG.engineerName}،`;
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
    return "نشكر التزامَكِ بالتحقق اليدوي — هذه العناية هي ما يرفع جودة التسليم.";
  if (v === false)
    return "نثق بقدرتكِ على إكمال التحقق اليدوي قبل الانتقال؛ الجودة تستحق هذه الخطوة.";
  return "نرجو تأكيد نتيجة التحقق اليدوي عند إغلاق المرحلة.";
}

/** رسائل مزدوجة: إدارة (تقرير) + مهندسة (راقي/تحفيزي) */
function dual(mgmtBody, devBody) {
  return { mgmt: mgmtBody.trim(), dev: devBody.trim() };
}

function buildMessages(cmd) {
  const notes = argValue("--notes") || "";
  const manual = boolish(argValue("--manual-test"));
  const t = stamp();

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
        `السلام عليكم ورحمة الله وبركاته،`,
        ``,
        greetEngineer(),
        ``,
        `نفتتح معكِ جلسة عمل جديدة على منصة «${ORG.projectName}»، ونحن على ثقة تامة بقدرتكِ وكفاءتكِ.`,
        `خبرتكِ وعنايتكِ بالتفاصيل تصنعان فرقاً حقيقياً، ونؤمن أنكِ أهلٌ لإنجاز متين يراعي الهيكل الكامل وتدفّق البيانات.`,
        ``,
        `محور هذه الجلسة: ${focus}`,
        ``,
        `تذكير لطيف من روح الفريق: إتمام التحقق اليدوي قبل إغلاق أي مرحلة يحفظ جودة عملكِ ويمهّد للمرحلة التالية بثقة.`,
        `والأهم دائماً في هذا المنتج: أن تظهر الحجوزات بوضوح على شاشة التقويم.`,
        ``,
        `ابدئي بثقة… نحن معكِ، ونتطلّع لجلسة منتجة تليق باسمكِ وباسم الشركة.`,
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
        `السلام عليكم ورحمة الله وبركاته،`,
        ``,
        greetEngineer(),
        ``,
        `نختتم معكِ جلسة العمل على «${ORG.projectName}» بكل شكر وتقدير لِما بذلتِه من تعب وجهد وتركيز.`,
        `نقدّر حرفيتكِ والصبر على التفاصيل؛ هذا النوع من الإخلاص هو ما تعتمد عليه الشركة في تسليم منتج يفتخر به العميل.`,
        ``,
        `ملخص موجز للجلسة: ${summary}`,
        ``,
        `إن بقي تحقق يدوي معلّق، فإكماله بعنايتكِ المعتادة يفتح الطريق للمرحلة التالية بسلاسة.`,
        `شكراً لكِ من القلب… واستريحي وأنتِ فخورة بما قدّمتِ اليوم.`,
        ``,
        `مع خالص الامتنان والتقدير،`,
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
        `السلام عليكم ورحمة الله،`,
        ``,
        greetEngineer(),
        ``,
        `تم تسجيل تقدّم على المرحلة ${id} («${title}»).`,
        manualDev(manual),
        notes ? `ملاحظة من التنفيذ: ${notes}` : null,
        ``,
        `نعتز بانضباطكِ مع خطة الإنتاج؛ استمراركِ بهذا الأسلوب يبني منصة تليق باستوديو الراية وباسمكِ المهني.`,
        ``,
        `مع خالص التقدير،`,
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
        `السلام عليكم،`,
        ``,
        greetEngineer(),
        ``,
        `بخصوص المهمة «${title}»: حالتها الآن «${statusAr}».`,
        manualDev(manual),
        notes ? `تفاصيل: ${notes}` : null,
        ``,
        `شكراً لحرصكِ على إنجاز واضح ومهني.`,
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
        ? `يسعدنا إبلاغكِ أن بوابة المرحلة ${id} قد اجتازت التحقق. يمكنكِ المضي للمرحلة التالية بعد توثيق التوقيع في الخطة.`
        : pass === false
          ? `بوابة المرحلة ${id} لم تُغلق بعد. لا بأس؛ نراجع السبب بهدوء ونُكمل النقص ثم نعيد التحقق. نحن معكِ حتى تُغلق بجودة تليق بعملكِ.`
          : `نرجو توضيح حالة بوابة المرحلة ${id} بعد إكمال التحقق اليدوي.`;
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
        `السلام عليكم ورحمة الله،`,
        ``,
        greetEngineer(),
        ``,
        devGate,
        manualDev(manual),
        notes ? `ملاحظة: ${notes}` : null,
        ``,
        pass === true
          ? `أحسنتِ — الدقة في الاختبار اليدوي علامة مهندسة محترفة يُعتدّ بها.`
          : `ثقتنا بكِ كبيرة؛ خطوة تحقق إضافية اليوم توفّر وقتاً غداً.`,
        ``,
        `مع التقدير والاحترام،`,
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
        `السلام عليكم ورحمة الله وبركاته،`,
        ``,
        greetEngineer(),
        ``,
        `أهلاً بكِ في بداية مشروع «${ORG.projectName}».`,
        `نفتتح معكِ هذه الرحلة ونحن على ثقة تامة بقدرتكِ وكفاءتكِ واحترافيتكِ.`,
        `هذا المشروع فرصة لتبنينِ منصة إنتاجية متينة — مرحلةً مرحلة — بأسلوب مهندسة عالمية: فهم، تخطيط، تنفيذ، ثم اختبار يدوي صادق.`,
        ``,
        `ما هو جاهز اليوم:`,
        `• التوثيق وخطة الإنتاج وبوابات الجودة`,
        `• ريبو GitHub: https://github.com/baitpait/alrya`,
        `• إشعارات واتساب للإدارة ولكِ`,
        `• رفع تلقائي إلى GitHub بعد كل بوابة مرحلة ناجحة`,
        ``,
        `محور الانطلاق: ${focus}`,
        ``,
        `ابدئي بثقة… نحن في ${ORG.company} فخورون بقيادتكِ للتنفيذ، ونتطلّع لإنجاز يليق باسمكِ وباسم استوديو الراية.`,
        ``,
        `مع خالص التحية والتقدير،`,
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
    return dual(
      [
        `${ORG.projectName} — رسالة إدارية`,
        `من: ${ORG.managerName}`,
        body,
        `الوقت: ${t}`,
      ].join("\n"),
      [
        `السلام عليكم ورحمة الله،`,
        ``,
        greetEngineer(),
        ``,
        body,
        ``,
        `نقدّر تعاونكِ ومتابعتكِ.`,
        ``,
        signOff(),
        t,
      ].join("\n")
    );
  }

  console.error(`Unknown command: ${cmd}
Usage:
  welcome|project-welcome [--focus "..."]
  session-start [--focus "..."]
  session-end|agent-stop [--summary "..."]
  phase|task|gate|custom ...`);
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
