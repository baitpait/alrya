#!/usr/bin/env node
/**
 * رفع تلقائي إلى GitHub — استوديو الراية
 *
 * يشتغل فقط إذا GIT_AUTO_PUSH=1
 * لا يستخدم force push أبداً
 *
 * الاستخدام:
 *   node tools/git-auto-push.mjs
 *   node tools/git-auto-push.mjs --reason "بوابة مرحلة 5 ناجحة"
 *   node tools/git-auto-push.mjs --commit "msg"   # إن GIT_AUTO_COMMIT=1 أو مُرّر --commit
 */

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i < 0 ? undefined : process.argv[i + 1];
}

function sh(args, opts = {}) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  }).trim();
}

function enabled(flag) {
  const v = String(process.env[flag] || "").toLowerCase();
  return ["1", "true", "yes", "on"].includes(v);
}

function main() {
  if (!enabled("GIT_AUTO_PUSH")) {
    console.log("git-auto-push: متوقف (ضع GIT_AUTO_PUSH=1 في .env)");
    return;
  }

  let remote;
  try {
    remote = sh(["remote", "get-url", "origin"]);
  } catch {
    console.error("git-auto-push: لا يوجد remote اسمه origin");
    process.exit(1);
  }

  const reason = argValue("--reason") || "تحديث تلقائي للمشروع";
  const commitMsg = argValue("--commit");
  const status = sh(["status", "--porcelain"]);
  const branch = sh(["rev-parse", "--abbrev-ref", "HEAD"]);

  if (status) {
    const allowCommit = Boolean(commitMsg) || enabled("GIT_AUTO_COMMIT");
    if (!allowCommit) {
      console.log(
        "git-auto-push: توجد تغييرات غير مُلتزَمة — لن يُرفع شيء. التزم أولاً أو فعّل GIT_AUTO_COMMIT=1"
      );
      console.log(status);
      return;
    }
    sh(["add", "-A"]);
    const msg =
      commitMsg ||
      `chore: auto-commit — ${reason}`;
    try {
      sh(["commit", "-m", msg]);
      console.log("git-auto-push: تم commit");
    } catch (e) {
      const err = String(e.stderr || e.message || e);
      if (!/nothing to commit/i.test(err)) {
        console.error("git-auto-push: فشل commit", err);
        process.exit(1);
      }
    }
  }

  let ahead = "0";
  try {
    sh(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
    ahead = sh(["rev-list", "--count", "@{u}..HEAD"]) || "0";
  } catch {
    // لا يوجد upstream بعد — نرفع مع -u
    console.log(`git-auto-push: رفع أول لـ origin/${branch} …`);
    sh(["push", "-u", "origin", "HEAD"], { stdio: "inherit" });
    console.log(`OK pushed → ${remote} (${reason})`);
    return;
  }

  if (ahead === "0") {
    console.log("git-auto-push: لا يوجد شيء جديد للرفع (متزامن مع origin)");
    return;
  }

  console.log(`git-auto-push: رفع ${ahead} commit(s) إلى origin/${branch} …`);
  sh(["push", "origin", "HEAD"], { stdio: "inherit" });
  console.log(`OK pushed → ${remote}`);
  console.log(`السبب: ${reason}`);
}

try {
  main();
} catch (e) {
  console.error(e.stderr || e.message || e);
  process.exit(1);
}
