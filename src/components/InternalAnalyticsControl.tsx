"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const cookieName = "tenlo_internal_traffic";

function isExcluded() {
  return document.cookie.split(";").some((part) => part.trim() === `${cookieName}=1`);
}

export default function InternalAnalyticsControl() {
  const [excluded, setExcluded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setExcluded(isExcluded());
    setReady(true);
  }, []);

  function toggle() {
    const next = !excluded;
    document.cookie = next
      ? `${cookieName}=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
      : `${cookieName}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
    setExcluded(next);
  }

  return (
    <section className="card mt-6 p-5" aria-labelledby="internal-analytics-title">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 shrink-0 text-petrol" size={22} aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="internal-analytics-title" className="minor-title">Tráfico interno de Tenlo</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Excluye este navegador de GA4 y de los informes de visibilidad del directorio. Úsalo en los dispositivos desde los que administras o pruebas Tenlo.</p>
          <button type="button" className="btn-secondary mt-4" onClick={toggle} disabled={!ready} aria-pressed={excluded}>
            {!ready ? "Comprobando…" : excluded ? "Incluir este navegador en analítica" : "Excluir este navegador de analítica"}
          </button>
          {ready ? <p className="mt-3 text-xs font-semibold text-muted" role="status">Estado: {excluded ? "tráfico interno excluido" : "medición normal"}.</p> : null}
        </div>
      </div>
    </section>
  );
}
