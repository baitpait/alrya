import { redirect } from "next/navigation";

/** المعرض انتقل لتبويب الإعدادات */
export default function AdminGalleryRedirectPage() {
  redirect("/admin/settings?tab=gallery");
}
