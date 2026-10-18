"use client";

import { useState } from "react";
import { pushTrackingEvent } from "@/lib/analytics";

const outcomes = [
  ["information", "Obtuve la información que necesitaba"], ["conversation", "Iniciamos una conversación"],
  ["proposal", "Recibí una propuesta"], ["booking", "Hice una reserva"],
  ["hired", "Contraté el servicio"], ["not_progressed", "No avanzó"]
];

export default function RequestOutcomeFeedback({ requestId, initialUseful, initialOutcome }: { requestId: string; initialUseful?: boolean | null; initialOutcome?: string | null }) {
  const [useful, setUseful] = useState<boolean | null>(initialUseful ?? null);
  const [outcome, setOutcome] = useState(initialOutcome || "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (useful === null || !outcome) return; setPending(true); setMessage("");
    const response = await fetch("/api/connection-feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId, useful, outcome }) });
    const data = (await response.json()) as { error?: string }; setPending(false);
    if (!response.ok) { setMessage(data.error || "No se pudo guardar."); return; }
    pushTrackingEvent("connection_marked_useful", { request_id: requestId, useful });
    pushTrackingEvent("outcome_reported", { request_id: requestId, outcome });
    setMessage("Gracias. Tu valoración se ha guardado.");
  }

  return <form className="mt-5 rounded-2xl border border-line bg-soft p-4" onSubmit={submit}>
    <p className="font-bold text-ink">¿Te resultó útil esta conexión?</p>
    <div className="mt-3 flex gap-2"><button type="button" className={useful === true ? "btn-primary min-h-11 px-4 py-2 text-sm" : "btn-secondary min-h-11 px-4 py-2 text-sm"} onClick={() => setUseful(true)}>Sí</button><button type="button" className={useful === false ? "btn-primary min-h-11 px-4 py-2 text-sm" : "btn-secondary min-h-11 px-4 py-2 text-sm"} onClick={() => setUseful(false)}>No</button></div>
    <label className="mt-4 block text-xs font-bold text-ink">¿En qué quedó?<select className="mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm font-normal" value={outcome} onChange={(event) => setOutcome(event.target.value)}><option value="">Selecciona un resultado</option>{outcomes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <button className="btn-secondary mt-3 min-h-11 px-4 py-2 text-sm" disabled={pending || useful === null || !outcome}>{pending ? "Guardando…" : "Guardar valoración"}</button>
    {message ? <p className="mt-2 text-xs text-muted" role="status">{message}</p> : null}
  </form>;
}
