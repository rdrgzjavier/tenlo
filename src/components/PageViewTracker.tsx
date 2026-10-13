"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { hasAnalyticsConsent, pushTrackingEvent } from "@/lib/analytics";
import { currentAcquisitionContext } from "@/lib/acquisition";

const navigationSessionKey = "tenlo_page_view_recorded_v1";

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
      if (!hasAnalyticsConsent()) return;
      tracked = true;
      let previousPageRecorded = false;
      try {
        previousPageRecorded = window.sessionStorage.getItem(navigationSessionKey) === "1";
      } catch {
        // La medición no debe bloquear la navegación si el almacenamiento está restringido.
      }
      pushTrackingEvent("page_view", {
        page_path: pathname,
        page_type: pageType(pathname),
        navigation_scope: previousPageRecorded ? "internal" : "entry",
        ...currentAcquisitionContext()
      });
      try {
        window.sessionStorage.setItem(navigationSessionKey, "1");
      } catch {
        // Sin estado de sesión se mantiene la medición básica de página.
      }
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
