"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  analyticsConsentOpenEvent,
  readAnalyticsConsent,
  storeAnalyticsConsent,
  type AnalyticsConsentChoice
} from "@/lib/consent";

export default function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(readAnalyticsConsent() === null);
    const showSettings = () => setOpen(true);
    window.addEventListener(analyticsConsentOpenEvent, showSettings);
    return () => window.removeEventListener(analyticsConsentOpenEvent, showSettings);
  }, []);

  const choose = (choice: AnalyticsConsentChoice) => {
    storeAnalyticsConsent(choice);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-3 pb-3 sm:px-5 sm:pb-5">
      <section
        aria-labelledby="tenlo-consent-title"
        aria-describedby="tenlo-consent-description"
        role="dialog"
        className="mx-auto max-w-3xl rounded-[1.5rem] border border-line bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start gap-3">
          <Image src="/brand/tenlo-isotipo-192.png" width={44} height={44} alt="" className="h-11 w-11 rounded-xl" />
          <div>
            <p className="eyebrow">Tu privacidad en Tenlo</p>
            <h2 id="tenlo-consent-title" className="mt-1 text-xl font-bold text-ink sm:text-2xl">
              Cookies claras, sin publicidad
            </h2>
          </div>
        </div>
        <p id="tenlo-consent-description" className="mt-4 text-sm leading-6 text-slatecopy sm:text-base">
          Usamos cookies necesarias para que Tenlo funcione. Si nos das permiso, también usamos analítica agregada para entender qué buscan las familias y mejorar la plataforma. No activamos cookies publicitarias.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" className="btn-secondary w-full" onClick={() => choose("rejected")}>
            Solo necesarias
          </button>
          <button type="button" className="btn-primary w-full" onClick={() => choose("accepted")}>
            Permitir analítica
          </button>
        </div>
        <p className="mt-4 text-center text-xs leading-5 text-muted">
          Puedes cambiar tu elección cuando quieras en la <Link className="font-semibold text-primary underline" href="/cookies">política de cookies</Link>.
        </p>
      </section>
    </div>
  );
}
