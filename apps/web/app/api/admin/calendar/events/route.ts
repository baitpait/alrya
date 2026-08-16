import { NextResponse } from "next/server";
import { listCalendarEvents } from "@/lib/calendar-events";
import { getVerifiedSession } from "@/lib/authz";

export async function GET() {
  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const events = await listCalendarEvents();
  return NextResponse.json({ events });
}
