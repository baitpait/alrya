"use client";

import { useActionState } from "react";
import { submitContactMessage, type ContactState } from "./actions";

const initial: ContactState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, initial);

  return (
    <form action={formAction} className="book-form">
      <label className="hp-field" aria-hidden="true">
        الموقع
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label>
        الاسم
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        الهاتف
        <input
          className="input-ltr"
          name="phone"
          required
          inputMode="tel"
          autoComplete="tel"
        />
      </label>
      <label>
        البريد (اختياري)
        <input className="input-ltr" name="email" type="email" autoComplete="email" />
      </label>
      <label>
        الموضوع (اختياري)
        <input name="subject" />
      </label>
      <label>
        الرسالة
        <textarea name="body" rows={5} required />
      </label>
      {state.error ? <p className="book-error">{state.error}</p> : null}
      <button type="submit" disabled={pending}>
        {pending ? "جاري الإرسال…" : "إرسال الرسالة"}
      </button>
    </form>
  );
}
