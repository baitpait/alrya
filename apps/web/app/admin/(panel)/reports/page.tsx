import { redirect } from "next/navigation";

/** فهرس التقارير → أول تقرير في المنيو الفرعية */
export default function AdminReportsIndexPage() {
  redirect("/admin/reports/events");
}
