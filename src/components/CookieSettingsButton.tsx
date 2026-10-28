"use client";

import { openAnalyticsConsentSettings } from "@/lib/consent";

export default function CookieSettingsButton() {
  return (
    <button type="button" className="btn-secondary mt-5" onClick={openAnalyticsConsentSettings}>
      Modificar preferencias de cookies
    </button>
  );
}
