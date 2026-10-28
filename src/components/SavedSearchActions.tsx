"use client";

import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { pushTrackingEvent } from "@/lib/analytics";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SavedSearchActions({ id, href, category, municipality }: { id: string; href: string; category?: string | null; municipality?: string | null }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (deleting) return;
    setDeleting(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: deleteError } = await supabase.from("saved_searches").delete().eq("id", id);
    if (deleteError) {
      setError("No hemos podido eliminarla.");
      setDeleting(false);
      return;
    }
    pushTrackingEvent("saved_search_deleted", { category: category ?? undefined, municipality: municipality ?? undefined });
    router.refresh();
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Link href={href} className="btn-primary" onClick={() => pushTrackingEvent("saved_search_opened", { category: category ?? undefined, municipality: municipality ?? undefined })}>
        Ver resultados <ExternalLink size={17} aria-hidden />
      </Link>
      <button type="button" className="btn-secondary" onClick={remove} disabled={deleting}>
        <Trash2 size={17} aria-hidden /> {deleting ? "Eliminando..." : "Eliminar"}
      </button>
      {error ? <p className="w-full text-sm text-coral" role="alert">{error}</p> : null}
    </div>
  );
}
