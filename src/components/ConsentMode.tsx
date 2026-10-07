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

export default function ConsentMode() {
  useEffect(() => {
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
  }, []);

  return null;
}
