"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Cookiebot?: {
      consent?: { statistics?: boolean; marketing?: boolean; preferences?: boolean };
      renew?: () => void;
    };
    gtag?: (...args: unknown[]) => void;
    google_tag_manager?: Record<string, unknown>;
    __tenloAnalyticsConsent?: boolean;
  }
}

export default function ConsentMode({ gtmId }: { gtmId?: string }) {
  useEffect(() => {
    const loadGtm = () => {
      if (!gtmId) return;
      let script = document.getElementById("gtm-script") as HTMLScriptElement | null;
      if (!script) {
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
          window.setTimeout(() => window.dispatchEvent(new Event("tenlo:analytics-ready")), 0);
          return;
        }
        if (Date.now() - startedAt >= 10_000) {
          window.clearInterval(readyTimer);
          if (script) delete script.dataset.analyticsWaiting;
        }
      }, 50);
    };

    const updateConsent = () => {
      const consent = window.Cookiebot?.consent;
      if (!consent || !window.gtag) return;
      window.__tenloAnalyticsConsent = consent.statistics === true;
      window.gtag("consent", "update", {
        analytics_storage: consent.statistics ? "granted" : "denied",
        ad_storage: consent.marketing ? "granted" : "denied",
        ad_user_data: consent.marketing ? "granted" : "denied",
        ad_personalization: consent.marketing ? "granted" : "denied",
        functionality_storage: consent.preferences ? "granted" : "denied",
        security_storage: "granted"
      });
      if (consent.statistics) {
        loadGtm();
      }
    };

    window.addEventListener("CookiebotOnConsentReady", updateConsent);
    window.addEventListener("CookiebotOnAccept", updateConsent);
    window.addEventListener("CookiebotOnDecline", updateConsent);
    updateConsent();
    return () => {
      window.removeEventListener("CookiebotOnConsentReady", updateConsent);
      window.removeEventListener("CookiebotOnAccept", updateConsent);
      window.removeEventListener("CookiebotOnDecline", updateConsent);
    };
  }, [gtmId]);

  return null;
}
