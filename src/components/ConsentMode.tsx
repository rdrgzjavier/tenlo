"use client";

import { useEffect } from "react";
import { analyticsConsentChangedEvent, readAnalyticsConsent } from "@/lib/consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    google_tag_manager?: Record<string, unknown>;
    __tenloAnalyticsConsent?: boolean;
    __tenloAnalyticsReady?: boolean;
  }
}

export default function ConsentMode({ gtmId }: { gtmId?: string }) {
  useEffect(() => {
    const loadGtm = () => {
      if (!gtmId) return;
      let script = document.getElementById("gtm-script") as HTMLScriptElement | null;
      if (!script) {
        window.dataLayer?.push({ "gtm.start": Date.now(), event: "gtm.js" });
        script = document.createElement("script");
        script.id = "gtm-script";
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
        document.head.appendChild(script);
      }
      if (script.dataset.analyticsReady === "true" || script.dataset.analyticsWaiting === "true") return;
      script.dataset.analyticsWaiting = "true";
      const startedAt = Date.now();
      const readyTimer = window.setInterval(() => {
        if (window.google_tag_manager?.[gtmId]) {
          window.clearInterval(readyTimer);
          if (!script) return;
          delete script.dataset.analyticsWaiting;
          script.dataset.analyticsReady = "true";
          window.dataLayer?.push({ event: "analytics_consent_granted" });
          window.setTimeout(() => {
            window.__tenloAnalyticsReady = true;
            window.dispatchEvent(new Event("tenlo:analytics-ready"));
          }, 0);
          return;
        }
        if (Date.now() - startedAt >= 10_000) {
          window.clearInterval(readyTimer);
          if (script) delete script.dataset.analyticsWaiting;
        }
      }, 50);
    };

    const updateConsent = () => {
      if (!window.gtag) return;
      const analyticsGranted = readAnalyticsConsent() === "accepted";
      window.__tenloAnalyticsConsent = analyticsGranted;
      if (!analyticsGranted) window.__tenloAnalyticsReady = false;
      window.gtag("consent", "update", {
        analytics_storage: analyticsGranted ? "granted" : "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        functionality_storage: "granted",
        security_storage: "granted"
      });
      if (analyticsGranted) {
        loadGtm();
      }
    };

    window.addEventListener(analyticsConsentChangedEvent, updateConsent);
    updateConsent();
    return () => {
      window.removeEventListener(analyticsConsentChangedEvent, updateConsent);
    };
  }, [gtmId]);

  return null;
}
