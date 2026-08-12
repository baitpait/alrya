import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/admin/PhasePlaceholder";

export const metadata: Metadata = { title: "التقويم" };

export default function AdminCalendarPage() {
  return (
    <PhasePlaceholder
      title="التقويم"
      phase={5}
      summary="هنا سيظهر FullCalendar مربوطاً بـ EventService (تواريخ المواعيد الحقيقية)."
    />
  );
}
