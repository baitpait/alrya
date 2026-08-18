import { redirect } from "next/navigation";

/** الأسئلة الشائعة انتقلت لتبويب الإعدادات */
export default function AdminFaqRedirectPage() {
  redirect("/admin/settings?tab=faq");
}
