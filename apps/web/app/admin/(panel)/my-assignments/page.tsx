import { redirect } from "next/navigation";

export const metadata = { title: "مناسباتي" };
export const dynamic = "force-dynamic";

/**
 * شاشة «مناسباتي» كانت لدخول الطاقم.
 * بعد قرار المرحلة 15 (مسؤول فقط): أُخفيت من السايدبار.
 * أي رابط قديم يُحوَّل لصفحة الموظفين (التعيينات من تفاصيل الموظف/المناسبة).
 */
export default function MyAssignmentsPage() {
  redirect("/admin/employees");
}
