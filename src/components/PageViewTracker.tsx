"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pushTrackingEvent } from "@/lib/analytics";

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
    const trackPageView = () => {
      pushTrackingEvent("page_view", {
        page_path: pathname,
        page_type: pageType(pathname)
      });
    };

    const gtmScript = document.getElementById("gtm-script") as HTMLScriptElement | null;
    if (gtmScript?.dataset.analyticsReady === "true") trackPageView();
    window.addEventListener("tenlo:analytics-ready", trackPageView);
    return () => window.removeEventListener("tenlo:analytics-ready", trackPageView);
  }, [pathname]);

  return null;
}
