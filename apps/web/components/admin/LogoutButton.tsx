"use client";

import { useFormStatus } from "react-dom";

export function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="logout-btn" disabled={pending}>
      {pending ? "جاري الخروج…" : "خروج"}
    </button>
  );
}
