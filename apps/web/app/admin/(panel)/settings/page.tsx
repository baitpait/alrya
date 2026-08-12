import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/admin/PhasePlaceholder";

export const metadata: Metadata = { title: "الإعدادات" };

export default function AdminSettingsPage() {
  return (
    <PhasePlaceholder
      title="الإعدادات"
      phase={8}
      summary="إعدادات عامة + إعدادات الموقع (واتساب عائم وروابط السوشيال)."
    />
  );
}
