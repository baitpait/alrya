import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/admin/PhasePlaceholder";

export const metadata: Metadata = { title: "المناسبات" };

export default function AdminEventsPage() {
  return (
    <PhasePlaceholder
      title="المناسبات"
      phase={4}
      summary="إدارة المناسبات وخدمات المناسبة (Event + EventService)."
    />
  );
}
