"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { hasAnalyticsConsent, pushTrackingEvent } from "@/lib/analytics";

function pageType(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname === "/buscar") return "search";
  if (/^\/(servicios|centros|anuncios)\//.test(pathname)) return "profile";
  if (pathname === "/proveedores") return "provider_landing";
  return "content";
}

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let tracked = false;

    const trackPageView = () => {
      if (tracked) return;
      const gtmScript = document.getElementById("gtm-script") as HTMLScriptElement | null;
      if (gtmScript?.dataset.analyticsReady !== "true" || !hasAnalyticsConsent()) return;
      tracked = true;
      pushTrackingEvent("page_view", {
        page_path: pathname,
        page_type: pageType(pathname)
      });
    };

    const readyTimer = window.setInterval(trackPageView, 50);
    const stopTimer = window.setTimeout(() => window.clearInterval(readyTimer), 10_000);
    trackPageView();
    window.addEventListener("tenlo:analytics-ready", trackPageView);
    return () => {
      window.clearInterval(readyTimer);
      window.clearTimeout(stopTimer);
      window.removeEventListener("tenlo:analytics-ready", trackPageView);
    };
  }, [pathname]);

  return null;
}
