"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="login-form">
      <label>
        البريد الإلكتروني
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          defaultValue="admin@alray.studio"
        />
      </label>
      <label>
        كلمة المرور
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state?.error ? <p className="login-error">{state.error}</p> : null}
      <button type="submit" disabled={pending}>
        {pending ? "جاري الدخول…" : "دخول"}
      </button>
    </form>
  );
}
