"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type QueueType = "claim" | "connection" | "submission" | "feedback" | "business_profile";

const statusOptions: Record<QueueType, Array<{ value: string; label: string }>> = {
  claim: [
    { value: "pending_review", label: "Pendiente" },
    { value: "approved", label: "Aprobada" },
    { value: "rejected", label: "Rechazada" },
    { value: "archived", label: "Archivada" }
  ],
  connection: [
    { value: "submitted", label: "Recibida" },
    { value: "delivered", label: "Enviada" },
    { value: "viewed", label: "Vista" },
    { value: "responded", label: "Respondida" },
    { value: "declined", label: "Rechazada" },
    { value: "alternative_requested", label: "Pide alternativa" },
    { value: "alternative_offered", label: "Alternativa ofrecida" },
    { value: "closed", label: "Cerrada" }
  ],
  submission: [
    { value: "pending_review", label: "Pendiente" },
    { value: "approved", label: "Aprobada" },
    { value: "rejected", label: "Rechazada" },
    { value: "archived", label: "Archivada" }
  ],
  feedback: [
    { value: "pending_review", label: "Pendiente" },
    { value: "approved", label: "Resuelta" },
    { value: "rejected", label: "Descartada" },
    { value: "archived", label: "Archivada" }
  ],
  business_profile: [
    { value: "pending_review", label: "Pendiente" },
    { value: "approved", label: "Aprobada" },
    { value: "rejected", label: "Rechazada" },
    { value: "archived", label: "Archivada" }
  ]
};

export default function AdminStatusControl({ queue, recordId, currentStatus }: { queue: QueueType; recordId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [informationRequest, setInformationRequest] = useState("");
  const [messagePending, setMessagePending] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState("");

  async function updateStatus() {
    if (status === currentStatus) return;
    setPending(true);
    setFeedback("");
    try {
      const response = await fetch("/api/admin/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queue, recordId, status })
      });
      const result = (await response.json()) as { error?: string; notificationSent?: boolean | null };
      if (!response.ok) throw new Error(result.error || "No se pudo actualizar el estado.");
      setFeedback(
        ["claim", "business_profile"].includes(queue) && ["approved", "rejected"].includes(status)
          ? result.notificationSent
            ? "Estado actualizado y solicitante avisado por email."
            : "Estado actualizado. Revisa manualmente el aviso por email."
          : "Estado actualizado."
      );
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo actualizar el estado.");
      setStatus(currentStatus);
    } finally {
      setPending(false);
    }
  }

  async function requestInformation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = informationRequest.trim();
    if (message.length < 10) return;
    setMessagePending(true);
    setMessageFeedback("");
    try {
      const response = await fetch("/api/admin/claim-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId, message })
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "No hemos podido enviar la petición.");
      setInformationRequest("");
      setMessageFeedback("Petición enviada y guardada en el seguimiento interno.");
      router.refresh();
    } catch (error) {
      setMessageFeedback(error instanceof Error ? error.message : "No hemos podido enviar la petición.");
      router.refresh();
    } finally {
      setMessagePending(false);
    }
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      <label className="text-xs font-bold text-ink" htmlFor={`${queue}-${recordId}`}>{queue === "feedback" ? "Resultado de la revisión" : "Estado operativo"}</label>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
        <select id={`${queue}-${recordId}`} className="min-h-11 flex-1 rounded-xl border border-line bg-white px-3 text-sm text-ink" value={status} onChange={(event) => setStatus(event.target.value)} disabled={pending}>
          {statusOptions[queue].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <button type="button" className="btn-secondary min-h-11 px-4 py-2 text-sm" onClick={updateStatus} disabled={pending || status === currentStatus}>
          {pending ? "Guardando…" : queue === "feedback" ? "Actualizar estado" : "Guardar"}
        </button>
      </div>
      {feedback ? <p className="mt-2 text-xs text-muted" role="status">{feedback}</p> : null}
      {queue === "claim" ? (
        <details className="mt-3 rounded-xl border border-line bg-white p-3">
          <summary className="cursor-pointer font-bold text-ink">Solicitar información</summary>
          <p className="mt-2 text-xs leading-5 text-muted">El texto se enviará por email al solicitante y quedará guardado como nota interna.</p>
          <form className="mt-3 grid gap-2" onSubmit={requestInformation}>
            <label className="text-xs font-bold text-ink" htmlFor={`claim-message-${recordId}`}>Información necesaria</label>
            <textarea
              id={`claim-message-${recordId}`}
              className="rounded-xl border border-line p-3 text-sm text-ink"
              value={informationRequest}
              onChange={(event) => setInformationRequest(event.target.value)}
              minLength={10}
              maxLength={2000}
              rows={4}
              placeholder="Ej. Necesitamos un documento que acredite tu relación con la entidad y la dirección pública que debe aparecer en la ficha."
            />
            <button className="btn-secondary min-h-11 px-4 py-2 text-sm sm:w-fit" disabled={messagePending || informationRequest.trim().length < 10}>
              {messagePending ? "Enviando…" : "Enviar petición"}
            </button>
            {messageFeedback ? <p className="text-xs leading-5 text-muted" role="status">{messageFeedback}</p> : null}
          </form>
        </details>
      ) : null}
    </div>
  );
}
