import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/authz";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
};

export default async function AdminLoginPage() {
  const session = await getVerifiedSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="login-page admin-body">
      <section className="login-card panel">
        <img
          className="login-logo"
          src="/branding/alraya-studio-logo.png"
          alt="استوديو الراية — علامة الجودة والاحتراف"
          width={120}
          height={120}
        />
        <h1>استوديو الراية</h1>
        <p className="login-tagline">علامة الجودة والاحتراف</p>
        <LoginForm />
      </section>
    </div>
  );
}
