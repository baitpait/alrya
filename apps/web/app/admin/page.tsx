import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم",
};

export default function AdminHomePage() {
  return (
    <section className="panel">
      <h1>لوحة التحكم</h1>
      <p>
        مرحباً بكِ في شِل الإدارة لاستوديو الراية. هذه المرحلة تثبت الإطار فقط:
        اتجاه عربي، ثيم فاتح افتراضي، وزر التبديل للوضع الداكن.
      </p>
      <p>
        مؤشرات الأرقام الحقيقية (طلبات، رسائل، مناسبات…) تُربط بقاعدة البيانات في
        المرحلة 9. القائمة الجانبية تعرض صفحات هيكلية جاهزة لكل بند MVP.
      </p>
      <span className="badge-phase">المرحلة 1 — الشِل نشط الآن</span>
    </section>
  );
}
