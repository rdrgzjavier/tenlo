"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const options = [
  ["submitted", "Recibida"], ["delivered", "Enviada al proveedor"], ["viewed", "Vista por el proveedor"],
  ["responded", "Respondida"], ["declined", "Sin disponibilidad"], ["alternative_requested", "Alternativa solicitada"],
  ["alternative_offered", "Alternativa ofrecida"], ["closed", "Cerrada"]
];

export default function ConnectionWorkflow({ recordId, currentStatus, providerNotifiedAt, responseSummary, alternativeSummary }: { recordId: string; currentStatus: string; providerNotifiedAt?: string | null; responseSummary?: string | null; alternativeSummary?: string | null }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notified, setNotified] = useState(Boolean(providerNotifiedAt));
  const [response, setResponse] = useState(responseSummary || "");
  const [alternative, setAlternative] = useState(alternativeSummary || "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage("");
    const result = await fetch("/api/admin/connection", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recordId, status, providerNotified: notified && !providerNotifiedAt, responseSummary: response, alternativeSummary: alternative }) });
    const data = (await result.json()) as { error?: string }; setPending(false);
    if (!result.ok) { setMessage(data.error || "No se pudo guardar."); return; }
    setMessage("Seguimiento actualizado."); router.refresh();
  }

  return <form className="mt-4 grid gap-3 border-t border-line pt-4" onSubmit={submit}>
    <label className="flex items-start gap-2 text-sm font-semibold text-ink"><input type="checkbox" className="mt-1" checked={notified} onChange={(event) => setNotified(event.target.checked)} disabled={Boolean(providerNotifiedAt)} />Proveedor avisado{providerNotifiedAt ? " · registrado" : ""}</label>
    <label className="text-xs font-bold text-ink">Estado<select className="mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label className="text-xs font-bold text-ink">Actualización para la familia<textarea className="mt-1 min-h-24 w-full rounded-xl border border-line p-3 text-sm font-normal" maxLength={1000} value={response} onChange={(event) => setResponse(event.target.value)} placeholder="Ej. El proveedor confirma disponibilidad y contactará por email." /></label>
    <label className="text-xs font-bold text-ink">Alternativa ofrecida<textarea className="mt-1 min-h-20 w-full rounded-xl border border-line p-3 text-sm font-normal" maxLength={1000} value={alternative} onChange={(event) => setAlternative(event.target.value)} placeholder="Solo si se ha localizado otra opción adecuada." /></label>
    <button className="btn-secondary min-h-11 px-4 py-2 text-sm sm:w-fit" disabled={pending}>{pending ? "Guardando…" : "Guardar seguimiento"}</button>
    {message ? <p className="text-xs text-muted" role="status">{message}</p> : null}
  </form>;
}
