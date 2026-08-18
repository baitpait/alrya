"use client";

import { useState, type ReactNode } from "react";

export type EventDetailTabId = "overview" | "appointments" | "finance" | "crew";

const TABS: { id: EventDetailTabId; label: string }[] = [
  { id: "overview", label: "نظرة عامة" },
  { id: "appointments", label: "المواعيد" },
  { id: "finance", label: "المالية" },
  { id: "crew", label: "الطاقم" },
];

type Props = {
  overview: ReactNode;
  appointments: ReactNode;
  finance: ReactNode;
  crew: ReactNode;
};

export function EventDetailTabs({ overview, appointments, finance, crew }: Props) {
  const [tab, setTab] = useState<EventDetailTabId>("overview");
  const panels: Record<EventDetailTabId, ReactNode> = {
    overview,
    appointments,
    finance,
    crew,
  };

  return (
    <div className="event-detail-tabs">
      <nav className="event-tab-nav" aria-label="أقسام المناسبة">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`event-tab-btn${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
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
