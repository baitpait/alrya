import { NextResponse } from "next/server";
import { listCalendarEvents } from "@/lib/calendar-events";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const events = await listCalendarEvents();
  return NextResponse.json({ events });
}
