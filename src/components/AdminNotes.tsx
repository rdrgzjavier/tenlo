"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Note = { id: string; note: string; created_at: string };

export default function AdminNotes({ queue, recordId, notes }: { queue: "claim" | "connection" | "submission" | "feedback" | "business_profile"; recordId: string; notes: Note[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const note = value.trim();
    if (note.length < 2) return;
    setPending(true);
    setMessage("");
    const response = await fetch("/api/admin/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queue, recordId, note })
    });
    const result = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setMessage(result.error || "No se pudo guardar la nota.");
      return;
    }
    setValue("");
    setMessage("Nota guardada.");
    router.refresh();
  }

  return (
    <details className="mt-4 rounded-xl border border-line bg-white p-3">
      <summary className="cursor-pointer font-bold text-ink">Notas internas {notes.length ? `(${notes.length})` : ""}</summary>
      <p className="mt-2 text-xs leading-5 text-muted">Solo las personas administradoras de Tenlo pueden consultar estas notas.</p>
      {notes.length ? <ol className="mt-3 grid gap-2">{notes.map((item) => <li key={item.id} className="rounded-lg bg-soft p-3 text-xs leading-5 text-slatecopy"><p className="whitespace-pre-wrap">{item.note}</p><time className="mt-1 block text-muted" dateTime={item.created_at}>{new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))}</time></li>)}</ol> : <p className="mt-3 text-xs text-muted">Todavía no hay notas.</p>}
      <form className="mt-3 grid gap-2" onSubmit={submit}>
        <label className="text-xs font-bold text-ink" htmlFor={`note-${queue}-${recordId}`}>Añadir seguimiento</label>
        <textarea id={`note-${queue}-${recordId}`} value={value} onChange={(event) => setValue(event.target.value)} minLength={2} maxLength={2000} rows={3} className="rounded-xl border border-line p-3 text-sm text-ink" placeholder="Ej. Pendiente de confirmar la relación con la entidad." />
        <button className="btn-secondary min-h-11 px-4 py-2 text-sm sm:w-fit" disabled={pending || value.trim().length < 2}>{pending ? "Guardando…" : "Guardar nota"}</button>
        {message ? <p className="text-xs text-muted" role="status">{message}</p> : null}
      </form>
    </details>
  );
}
