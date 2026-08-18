"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

export type SettingsTabId = "contact" | "about" | "social" | "gallery" | "faq";

const TABS: { id: SettingsTabId; label: string }[] = [
  { id: "contact", label: "تواصل وواتساب" },
  { id: "about", label: "من نحن" },
  { id: "social", label: "السوشيال" },
  { id: "gallery", label: "المعرض" },
  { id: "faq", label: "الأسئلة الشائعة" },
];

type Props = {
  initialTab?: SettingsTabId;
  contact: ReactNode;
  about: ReactNode;
  social: ReactNode;
  gallery: ReactNode;
  faq: ReactNode;
};

export function SettingsTabs({
  initialTab = "contact",
  contact,
  about,
  social,
  gallery,
  faq,
}: Props) {
  const [tab, setTab] = useState<SettingsTabId>(initialTab);
  const router = useRouter();
  const pathname = usePathname();
  const panels: Record<SettingsTabId, ReactNode> = {
    contact,
    about,
    social,
    gallery,
    faq,
  };

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  function selectTab(id: SettingsTabId) {
    setTab(id);
    const next = new URLSearchParams();
    next.set("tab", id);
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="event-detail-tabs">
      <nav className="event-tab-nav" aria-label="أقسام الإعدادات">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`event-tab-btn${tab === t.id ? " is-active" : ""}`}
            onClick={() => selectTab(t.id)}
            aria-selected={tab === t.id}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="event-tab-panel" role="tabpanel">
        {panels[tab]}
      </div>
    </div>
  );
}
