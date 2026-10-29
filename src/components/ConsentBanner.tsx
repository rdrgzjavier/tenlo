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
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    setOpen(readAnalyticsConsent() === null);
    const openSettings = () => {
      setAnalyticsEnabled(readAnalyticsConsent() === "accepted");
      setShowSettings(true);
      setOpen(true);
    };
    window.addEventListener(analyticsConsentOpenEvent, openSettings);
    return () => window.removeEventListener(analyticsConsentOpenEvent, openSettings);
  }, []);

  const choose = (choice: AnalyticsConsentChoice) => {
    storeAnalyticsConsent(choice);
    setShowSettings(false);
    setOpen(false);
  };

  const configure = () => {
    setAnalyticsEnabled(readAnalyticsConsent() === "accepted");
    setShowSettings(true);
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
              {showSettings ? "Configura tus cookies" : "Cookies claras, sin publicidad"}
            </h2>
          </div>
        </div>
        {showSettings ? (
          <div id="tenlo-consent-description" className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-soft p-4">
              <div>
                <p className="font-bold text-ink">Cookies necesarias</p>
                <p className="mt-1 text-sm leading-5 text-slatecopy">Sesión, seguridad y funcionamiento básico de Tenlo.</p>
              </div>
              <span className="shrink-0 text-sm font-bold text-primary">Siempre activas</span>
            </div>
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4">
              <span>
                <span className="block font-bold text-ink">Cookies analíticas</span>
                <span className="mt-1 block text-sm leading-5 text-slatecopy">Medición agregada con GTM y GA4 para mejorar búsquedas y contenidos.</span>
              </span>
              <input
                type="checkbox"
                className="h-6 w-6 shrink-0 accent-primary"
                checked={analyticsEnabled}
                onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                aria-label="Permitir cookies analíticas"
              />
            </label>
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <button type="button" className="btn-secondary w-full" onClick={() => setShowSettings(false)}>
                Volver
              </button>
              <button type="button" className="btn-primary w-full" onClick={() => choose(analyticsEnabled ? "accepted" : "rejected")}>
                Guardar selección
              </button>
            </div>
          </div>
        ) : (
          <>
            <p id="tenlo-consent-description" className="mt-4 text-sm leading-6 text-slatecopy sm:text-base">
              Usamos cookies necesarias para que Tenlo funcione. Si nos das permiso, también usamos analítica agregada para entender qué buscan las familias y mejorar la plataforma. No activamos cookies publicitarias.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button type="button" className="btn-primary w-full" onClick={() => choose("rejected")}>
                Rechazar
              </button>
              <button type="button" className="btn-secondary w-full" onClick={configure}>
                Configurar
              </button>
              <button type="button" className="btn-primary w-full" onClick={() => choose("accepted")}>
                Aceptar
              </button>
            </div>
          </>
        )}
        <p className="mt-4 text-center text-xs leading-5 text-muted">
          Puedes cambiar tu elección cuando quieras en la <Link className="font-semibold text-primary underline" href="/cookies">política de cookies</Link>.
        </p>
      </section>
    </div>
  );
}
