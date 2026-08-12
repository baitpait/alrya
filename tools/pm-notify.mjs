#!/usr/bin/env node
/**
 * إشعارات واتساب — استوديو الراية
 * إدارة: تقرير مختصر واضح
 * مبرمج: أسلوب هندسي راقٍ · مهذّب · تحفيزي
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
  push(process.env.PM_WHATSAPP_TO_DEV, "مبرمج");
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
    return "نشكر التزامكم بالتحقق اليدوي — هذه العناية هي ما يرفع جودة التسليم.";
  if (v === false)
    return "نثق بقدرتكم على إكمال التحقق اليدوي قبل الانتقال؛ الجودة تستحق هذه الخطوة.";
  return "نرجو تأكيد نتيجة التحقق اليدوي عند إغلاق المرحلة.";
}

/** رسائل مزدوجة: إدارة (تقرير) + مبرمج (راقي/تحفيزي) */
function dual(mgmtBody, devBody) {
  return { mgmt: mgmtBody.trim(), dev: devBody.trim() };
}

function buildMessages(cmd) {
  const notes = argValue("--notes") || "";
  const manual = boolish(argValue("--manual-test"));
  const t = stamp();

  if (cmd === "session-start" || cmd === "agent-start") {
    const focus = argValue("--focus") || argValue("--summary") || "متابعة خطة الإنتاج المعتمدة";
    return dual(
      [
        `استوديو الراية — بدء جلسة عمل`,
        `الجلسة: ${SESSION}`,
        `الوقت: ${t}`,
        `التركيز: ${focus}`,
        `الحالة: بدأت جلسة هندسية على المشروع.`,
      ].join("\n"),
      [
        `السلام عليكم ورحمة الله،`,
        ``,
        `زميلنا المهندس الفاضل،`,
        ``,
        `نبدأ معكم جلسة عمل جديدة على منصة «استوديو الراية».`,
        `نثق بخبرتكم ودقّتكم، ونتطلع لإنجاز متين يراعي الهيكل الكامل وتدفّق البيانات.`,
        ``,
        `محور الجلسة: ${focus}`,
        ``,
        `تذكير لطيف: إتمام التحقق اليدوي قبل إغلاق أي مرحلة يحفظ جودة العمل ويمهّد للمرحلة التالية بثقة.`,
        `والأهم دائماً: أن تظهر الحجوزات بوضوح على التقويم.`,
        ``,
        `وفقكم الله، ونتمنى لكم جلسة منتجة ومريحة.`,
        `— إدارة المشروع · بيت بايت`,
        `${t}`,
      ].join("\n")
    );
  }

  if (cmd === "session-end" || cmd === "agent-stop") {
    if (cmd === "agent-stop" && process.env.PM_NOTIFY_ON_AGENT_STOP === "0") {
      return null;
    }
    const summary =
      argValue("--summary") || "أُنجزت أعمال الجلسة وفق ما توفّر في هذه الفترة.";
    return dual(
      [
        `استوديو الراية — نهاية جلسة عمل`,
        `الجلسة: ${SESSION}`,
        `الوقت: ${t}`,
        `ملخص: ${summary}`,
        `يرجى متابعة بوابات الاختبار اليدوي في خطة الإنتاج.`,
      ].join("\n"),
      [
        `السلام عليكم ورحمة الله،`,
        ``,
        `زميلنا المهندس الفاضل،`,
        ``,
        `نختتم معكم جلسة العمل على «استوديو الراية» بكل تقدير لجهودكم.`,
        ``,
        `ملخص موجز: ${summary}`,
        ``,
        `إن كانت هناك مرحلة بانتظار التحقق اليدوي، فإكمالها بعناية هو ما يفتح الطريق للمرحلة التالية بسلاسة.`,
        `نعتز بمهنيّتكم، ونتطلّع لجلسات قادمة بنفس الرقي في التنفيذ.`,
        ``,
        `دمتم بألقٍ وتوفيق.`,
        `— إدارة المشروع · بيت بايت`,
        `${t}`,
      ].join("\n")
    );
  }

  if (cmd === "phase") {
    const id = argValue("--id") || "?";
    const title = argValue("--title") || "مرحلة";
    return dual(
      [
        `استوديو الراية — تقرير مرحلة`,
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
        `زميلنا المهندس،`,
        ``,
        `تم تسجيل تقدّم على المرحلة ${id} («${title}»).`,
        manualDev(manual),
        notes ? `ملاحظة من التنفيذ: ${notes}` : null,
        ``,
        `نقدّر انضباطكم مع خطة الإنتاج؛ الاستمرار بهذا الأسلوب يصنع منصة تليق باسم استوديو الراية.`,
        ``,
        `مع خالص التقدير،`,
        `— إدارة المشروع · بيت بايت`,
        `${t}`,
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
        `استوديو الراية — تحديث مهمة`,
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
        `مهندسنا العزيز،`,
        ``,
        `بخصوص المهمة «${title}»: حالتها الآن «${statusAr}».`,
        manualDev(manual),
        notes ? `تفاصيل: ${notes}` : null,
        ``,
        `شكراً لحرصكم على إنجاز واضح ومهني.`,
        `— إدارة المشروع · بيت بايت`,
        `${t}`,
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
        ? `يسعدنا إبلاغكم أن بوابة المرحلة ${id} قد اجتازت التحقق. يمكنكم المضي للمرحلة التالية بعد توثيق التوقيع في الخطة.`
        : pass === false
          ? `بوابة المرحلة ${id} لم تُغلق بعد. لا بأس؛ نراجع السبب بهدوء ونُكمل النقص ثم نعيد التحقق. نحن معكم حتى تُغلق بجودة تليق بعملكم.`
          : `نرجو توضيح حالة بوابة المرحلة ${id} بعد إكمال التحقق اليدوي.`;
    return dual(
      [
        `استوديو الراية — بوابة مرحلة`,
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
        `زميلنا المهندس الفاضل،`,
        ``,
        devGate,
        manualDev(manual),
        notes ? `ملاحظة: ${notes}` : null,
        ``,
        pass === true
          ? `أحسنتم — الدقة في الاختبار اليدوي علامة مهندس محترف.`
          : `ثقتنا بكم كبيرة؛ خطوة تحقق إضافية اليوم توفّر وقتاً غداً.`,
        ``,
        `مع التقدير والاحترام،`,
        `— إدارة المشروع · بيت بايت`,
        `${t}`,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  if (cmd === "custom") {
    const body = argValue("--text");
    if (!body) {
      console.error("--text required");
      process.exit(1);
    }
    return dual(
      [`استوديو الراية — رسالة إدارية`, body, `الوقت: ${t}`].join("\n"),
      [
        `السلام عليكم ورحمة الله،`,
        ``,
        `زميلنا المهندس،`,
        ``,
        body,
        ``,
        `نقدّر تعاونكم ومتابعتكم.`,
        `— إدارة المشروع · بيت بايت`,
        `${t}`,
      ].join("\n")
    );
  }

  console.error(`Unknown command: ${cmd}
Usage:
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
  if (role === "مبرمج") return payload.dev;
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
    console.error("Missing command. Try: session-start | session-end | phase | gate | ...");
    process.exit(1);
  }
  const payload = buildMessages(cmd);
  if (payload === null) {
    console.log("Notification skipped by env flag");
    return;
  }
  await sendWhatsApp(payload);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
