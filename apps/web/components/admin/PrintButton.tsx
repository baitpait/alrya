"use client";

export function PrintButton() {
  return (
    <button type="button" className="btn-secondary report-print-hide" onClick={() => window.print()}>
      طباعة / PDF
    </button>
  );
}
