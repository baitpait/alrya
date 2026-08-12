import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/admin/PhasePlaceholder";

export const metadata: Metadata = { title: "الخدمات" };

export default function AdminServicesPage() {
  return (
    <PhasePlaceholder
      title="الخدمات"
      phase={3}
      summary="كتالوج الخدمات والعروض/الباقات (Service → Offer)."
    />
  );
}
