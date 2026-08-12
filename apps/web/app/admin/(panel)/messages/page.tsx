import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/admin/PhasePlaceholder";

export const metadata: Metadata = { title: "رسائل التواصل" };

export default function AdminMessagesPage() {
  return (
    <PhasePlaceholder
      title="رسائل التواصل"
      phase={8}
      summary="رسائل صفحة /contact (ContactMessage) — منفصلة عن طلبات الحجز."
    />
  );
}
