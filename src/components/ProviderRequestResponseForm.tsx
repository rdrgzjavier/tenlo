"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { pushTrackingEvent } from "@/lib/analytics";

type LeadRelevance = "relevant" | "irrelevant";

export default function ProviderRequestResponseForm({ recordId, initialRelevance }: { recordId: string; initialRelevance: LeadRelevance | null }) {
  const router = useRouter();
  const [responseSummary, setResponseSummary] = useState("");
  const [relevance, setRelevance] = useState<LeadRelevance | null>(initialRelevance);
  const [pendingStatus, setPendingStatus] = useState<"responded" | "declined" | null>(null);
  const [feedback, setFeedback] = useState("");

  async function submit(status: "responded" | "declined") {
    if (!relevance) {
      setFeedback("Indica primero si esta solicitud encaja con tu oferta.");
      return;
    }
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
        body: JSON.stringify({ recordId, status, responseSummary, relevance })
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setFeedback(result.error || "No hemos podido guardar la respuesta.");
        pushTrackingEvent("provider_request_response_failed", { response_status: status });
        return;
      }
      pushTrackingEvent(status === "responded" ? "provider_request_responded" : "provider_request_declined", { response_status: status });
      pushTrackingEvent("lead_relevance_reported", { lead_relevance: relevance });
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
      <fieldset>
        <legend className="field-label">¿Esta solicitud encaja con tu oferta?</legend>
        <p className="mt-1 text-xs leading-5 text-muted">Valora la necesidad, aunque ahora no tengas disponibilidad. Tenlo usará esta señal para mejorar futuras solicitudes.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${relevance === "relevant" ? "border-primary bg-violet/5 text-ink" : "border-line text-slatecopy"}`}>
            <input type="radio" name={`relevance-${recordId}`} value="relevant" checked={relevance === "relevant"} onChange={() => setRelevance("relevant")} />Sí, encaja
          </label>
          <label className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${relevance === "irrelevant" ? "border-primary bg-violet/5 text-ink" : "border-line text-slatecopy"}`}>
            <input type="radio" name={`relevance-${recordId}`} value="irrelevant" checked={relevance === "irrelevant"} onChange={() => setRelevance("irrelevant")} />No encaja
          </label>
        </div>
      </fieldset>
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
