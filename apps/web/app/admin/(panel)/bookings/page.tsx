import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/admin/PhasePlaceholder";

export const metadata: Metadata = { title: "طلبات التسجيل" };

export default function AdminBookingsPage() {
  return (
    <PhasePlaceholder
      title="طلبات التسجيل"
      phase={7}
      summary="Inbox لطلبات الحجز القادمة من اللاندينغ (BookingRequest) قبل تحويلها لمناسبة."
    />
  );
}
