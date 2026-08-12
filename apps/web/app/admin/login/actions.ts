"use server";

import { redirect } from "next/navigation";
import { loginWithCredentials } from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await loginWithCredentials(email, password);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/admin");
}
