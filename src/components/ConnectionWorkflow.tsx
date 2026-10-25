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
  const [response, setResponse] = useState(responseSummary || "");
  const [alternative, setAlternative] = useState(alternativeSummary || "");
  const [pending, setPending] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage("");
    try {
      const result = await fetch("/api/admin/connection", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recordId, status, responseSummary: response, alternativeSummary: alternative }) });
      const data = (await result.json().catch(() => ({}))) as { error?: string };
      if (!result.ok) { setMessage(data.error || "No se pudo guardar."); return; }
      setMessage("Seguimiento actualizado."); router.refresh();
    } catch {
      setMessage("No se pudo guardar. Comprueba la conexión e inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  async function notifyProvider() {
    setNotifying(true); setMessage("");
    try {
      const result = await fetch("/api/admin/connection-notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recordId }) });
      const data = (await result.json().catch(() => ({}))) as { error?: string };
      if (!result.ok) { setMessage(data.error || "No se pudo avisar al proveedor."); return; }
      setMessage("Proveedor avisado por email."); router.refresh();
    } catch {
      setMessage("No se pudo avisar al proveedor. Comprueba la conexión e inténtalo de nuevo.");
    } finally {
      setNotifying(false);
    }
  }

  return <form className="mt-4 grid gap-3 border-t border-line pt-4" onSubmit={submit}>
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="btn-secondary min-h-11 px-4 py-2 text-sm" disabled={Boolean(providerNotifiedAt) || notifying} onClick={notifyProvider}>{providerNotifiedAt ? "Proveedor avisado" : notifying ? "Enviando aviso…" : "Avisar al proveedor"}</button>
      <span className="text-xs text-muted">{providerNotifiedAt ? "Aviso registrado en el seguimiento." : "Se enviará un enlace a su bandeja privada."}</span>
    </div>
    <label className="text-xs font-bold text-ink">Estado<select className="mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label className="text-xs font-bold text-ink">Actualización para la familia<textarea className="mt-1 min-h-24 w-full rounded-xl border border-line p-3 text-sm font-normal" maxLength={1000} value={response} onChange={(event) => setResponse(event.target.value)} placeholder="Ej. El proveedor confirma disponibilidad y contactará por email." /></label>
    <label className="text-xs font-bold text-ink">Alternativa ofrecida<textarea className="mt-1 min-h-20 w-full rounded-xl border border-line p-3 text-sm font-normal" maxLength={1000} value={alternative} onChange={(event) => setAlternative(event.target.value)} placeholder="Solo si se ha localizado otra opción adecuada." /></label>
    <button className="btn-secondary min-h-11 px-4 py-2 text-sm sm:w-fit" disabled={pending}>{pending ? "Guardando…" : "Guardar seguimiento"}</button>
    {message ? <p className="text-xs text-muted" role="status">{message}</p> : null}
  </form>;
}
