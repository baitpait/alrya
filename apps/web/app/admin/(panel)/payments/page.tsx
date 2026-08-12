import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/admin/PhasePlaceholder";

export const metadata: Metadata = { title: "الدفعات" };

export default function AdminPaymentsPage() {
  return (
    <PhasePlaceholder
      title="الدفعات"
      phase={6}
      summary="تسجيل الدفعات والخصومات وحساب المتبقي للمناسبة."
    />
  );
}
