import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="login-page admin-body">
      <section className="login-card panel">
        <img
          src="/branding/alraya-mark.svg"
          alt="استوديو الراية"
          width={56}
          height={56}
        />
        <h1>استوديو الراية</h1>
        <p>دخول لوحة الإدارة</p>
        <LoginForm />
      </section>
    </div>
  );
}
