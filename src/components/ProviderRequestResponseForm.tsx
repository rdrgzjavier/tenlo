"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { pushTrackingEvent } from "@/lib/analytics";

export default function ProviderRequestResponseForm({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [responseSummary, setResponseSummary] = useState("");
  const [pendingStatus, setPendingStatus] = useState<"responded" | "declined" | null>(null);
  const [feedback, setFeedback] = useState("");

  async function submit(status: "responded" | "declined") {
    if (responseSummary.trim().length < 10) {
      setFeedback("Explica brevemente la respuesta o la falta de disponibilidad.");
      return;
    }
    setPendingStatus(status);
    setFeedback("");
    try {
      const response = await fetch("/api/provider/connection-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId, status, responseSummary })
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setFeedback(result.error || "No hemos podido guardar la respuesta.");
        pushTrackingEvent("provider_request_response_failed", { response_status: status });
        return;
      }
      pushTrackingEvent(status === "responded" ? "provider_request_responded" : "provider_request_declined", { response_status: status });
      setFeedback(status === "responded" ? "Respuesta enviada a la familia." : "Falta de disponibilidad comunicada.");
      setResponseSummary("");
      router.refresh();
    } catch {
      setFeedback("No hemos podido conectar con Tenlo. Inténtalo de nuevo.");
      pushTrackingEvent("provider_request_response_failed", { response_status: status });
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-line bg-white p-4">
      <label className="field-label" htmlFor={`provider-response-${recordId}`}>
        Respuesta para la familia
        <textarea id={`provider-response-${recordId}`} className="field min-h-28 font-normal" minLength={10} maxLength={1000} value={responseSummary} onChange={(event) => setResponseSummary(event.target.value)} placeholder="Indica disponibilidad, siguiente paso o por qué no puedes atender esta solicitud. No incluyas datos personales de menores." />
      </label>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn-primary flex-1" disabled={pendingStatus !== null} onClick={() => void submit("responded")}><CheckCircle2 size={17} aria-hidden />{pendingStatus === "responded" ? "Enviando…" : "Enviar respuesta"}</button>
        <button type="button" className="btn-secondary flex-1" disabled={pendingStatus !== null} onClick={() => void submit("declined")}><XCircle size={17} aria-hidden />{pendingStatus === "declined" ? "Guardando…" : "Sin disponibilidad"}</button>
      </div>
      {feedback ? <p className="mt-3 text-sm font-semibold text-ink" role="status" aria-live="polite">{feedback}</p> : null}
    </div>
  );
}
