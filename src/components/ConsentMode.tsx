"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Cookiebot?: {
      consent?: { statistics?: boolean; marketing?: boolean; preferences?: boolean };
      renew?: () => void;
    };
    gtag?: (...args: unknown[]) => void;
  }
}

export default function ConsentMode({ gtmId }: { gtmId?: string }) {
  useEffect(() => {
    const loadGtm = () => {
      if (!gtmId) return;
      const existingScript = document.getElementById("gtm-script") as HTMLScriptElement | null;
      if (existingScript) return;
      const script = document.createElement("script");
      script.id = "gtm-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
      script.addEventListener("load", () => {
        script.dataset.analyticsReady = "true";
        window.dispatchEvent(new Event("tenlo:analytics-ready"));
      });
      document.head.appendChild(script);
    };

    const updateConsent = () => {
      const consent = window.Cookiebot?.consent;
      if (!consent || !window.gtag) return;
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
