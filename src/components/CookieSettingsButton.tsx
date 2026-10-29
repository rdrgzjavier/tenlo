"use client";

import { useEffect, useState } from "react";
import {
  analyticsConsentChangedEvent,
  openAnalyticsConsentSettings,
  readAnalyticsConsent,
  type AnalyticsConsentChoice
} from "@/lib/consent";

const consentLabels: Record<AnalyticsConsentChoice, string> = {
  accepted: "Analítica permitida",
  rejected: "Solo cookies necesarias"
};

export default function CookieSettingsButton() {
  const [choice, setChoice] = useState<AnalyticsConsentChoice | null>(null);

  useEffect(() => {
    const syncChoice = () => setChoice(readAnalyticsConsent());
    syncChoice();
    window.addEventListener(analyticsConsentChangedEvent, syncChoice);
    return () => window.removeEventListener(analyticsConsentChangedEvent, syncChoice);
  }, []);

  return (
    <div className="mt-5 rounded-2xl border border-line bg-white p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Estado actual</p>
        <p className="mt-1 font-semibold text-ink" aria-live="polite">
          {choice ? consentLabels[choice] : "Preferencia pendiente"}
        </p>
      </div>
      <button type="button" className="btn-secondary mt-4 w-full sm:mt-0 sm:w-auto" onClick={openAnalyticsConsentSettings}>
        Modificar preferencias
      </button>
    </div>
  );
}
