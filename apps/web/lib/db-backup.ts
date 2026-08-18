import { spawn } from "node:child_process";

export type MysqlConnectionConfig = {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
};

/** يفك DATABASE_URL بصيغة mysql://user:pass@host:port/db */
export function parseMysqlDatabaseUrl(databaseUrl: string): MysqlConnectionConfig {
  let u: URL;
  try {
    u = new URL(databaseUrl);
  } catch {
    throw new Error("صيغة DATABASE_URL غير صالحة.");
  }
  if (!u.protocol.startsWith("mysql")) {
    throw new Error("النسخة الاحتياطية تدعم MySQL فقط حالياً.");
  }
  const database = decodeURIComponent(u.pathname.replace(/^\//, "")).split("/")[0];
  if (!database) {
    throw new Error("اسم قاعدة البيانات غير موجود في DATABASE_URL.");
  }
  return {
    host: u.hostname || "localhost",
    port: u.port || "3306",
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database,
  };
}

function backupFilename(database: string) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${database}-backup-${stamp}.sql`;
}

/** ينشئ ملف SQL عبر mysqldump (محلي) */
export async function dumpMysqlDatabase(): Promise<{ sql: Buffer; filename: string }> {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL غير معرّف.");
  }

  const cfg = parseMysqlDatabaseUrl(databaseUrl);
  const filename = backupFilename(cfg.database);

  const sql = await new Promise<Buffer>((resolve, reject) => {
    const args = [
      `-h${cfg.host}`,
      `-P${cfg.port}`,
      `-u${cfg.user}`,
      "--single-transaction",
      "--routines",
      "--triggers",
      "--databases",
      cfg.database,
    ];

    const child = spawn("mysqldump", args, {
      env: { ...process.env, MYSQL_PWD: cfg.password },
    });

    const out: Buffer[] = [];
    const err: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => out.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk: Buffer) => err.push(Buffer.from(chunk)));
    child.on("error", (e: NodeJS.ErrnoException) => {
      if (e.code === "ENOENT") {
        reject(new Error("أداة mysqldump غير مثبتة على هذا الجهاز."));
        return;
      }
      reject(e);
    });
    child.on("close", (code) => {
      if (code !== 0) {
        const msg = Buffer.concat(err).toString("utf8").trim();
        reject(new Error(msg || `فشل إنشاء النسخة الاحتياطية (رمز ${code}).`));
        return;
      }
      resolve(Buffer.concat(out));
    });
  });

  if (sql.length === 0) {
    throw new Error("ملف النسخة الاحتياطية فارغ.");
  }

  return { sql, filename };
}
