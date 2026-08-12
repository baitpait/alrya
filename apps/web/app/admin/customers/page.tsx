import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/admin/PhasePlaceholder";

export const metadata: Metadata = { title: "الزبائن" };

export default function AdminCustomersPage() {
  return (
    <PhasePlaceholder
      title="الزبائن"
      phase={4}
      summary="CRUD الزبائن (Customer) وربطهم بالمناسبات."
    />
  );
}
