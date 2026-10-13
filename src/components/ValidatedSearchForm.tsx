"use client";

import { FormEvent, ReactNode, useId, useState } from "react";
import { pushTrackingEvent } from "@/lib/analytics";

type ValidatedSearchFormProps = {
  action?: string;
  className?: string;
  children: ReactNode;
  message?: string;
  trackingEvent?: "filter_applied" | "search_started";
  trackingPlacement?: string;
};

export default function ValidatedSearchForm({
  action = "/buscar",
  className,
  children,
  message = "Completa al menos un campo para buscar o filtrar.",
  trackingEvent,
  trackingPlacement
}: ValidatedSearchFormProps) {
  const [error, setError] = useState("");
  const errorId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const hasValue = Array.from(data.entries()).some(([, value]) => String(value).trim().length > 0);
    if (!hasValue) {
      event.preventDefault();
      setError(message);
      return;
    }
    setError("");
    if (trackingEvent) {
      const searchId = window.crypto.randomUUID();
      let searchIdInput = event.currentTarget.elements.namedItem("search_id") as HTMLInputElement | null;
      if (!searchIdInput) {
        searchIdInput = document.createElement("input");
        searchIdInput.type = "hidden";
        searchIdInput.name = "search_id";
        event.currentTarget.append(searchIdInput);
      }
      searchIdInput.value = searchId;
      const activeFields = Array.from(data.entries()).filter(([, value]) => String(value).trim().length > 0);
      pushTrackingEvent(trackingEvent, {
        search_id: searchId,
        placement: trackingPlacement,
        category: String(data.get("categoria") ?? "") || undefined,
        municipality: String(data.get("municipio") ?? "") || undefined,
        filter_count: activeFields.length,
        has_keyword: Boolean(String(data.get("tag") ?? data.get("q") ?? "").trim())
      });
    }
  }

  return (
    <form action={action} className={className} onSubmit={handleSubmit} aria-describedby={error ? errorId : undefined}>
      {children}
      {error ? <p id={errorId} className="text-sm font-semibold text-coral" role="alert">{error}</p> : null}
    </form>
  );
}
