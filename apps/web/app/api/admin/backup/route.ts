import { NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/authz";
import { dumpMysqlDatabase } from "@/lib/db-backup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** تنزيل نسخة احتياطية SQL لقاعدة MySQL — للمدير فقط */
export async function GET() {
  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  if (!session.isManager) {
    return NextResponse.json({ error: "صلاحية المدير مطلوبة" }, { status: 403 });
  }

  try {
    const { sql, filename } = await dumpMysqlDatabase();
    return new NextResponse(new Uint8Array(sql), {
      status: 200,
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const msg =
      err instanceof Error && err.message.trim()
        ? err.message.trim()
        : "تعذّر إنشاء النسخة الاحتياطية.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
