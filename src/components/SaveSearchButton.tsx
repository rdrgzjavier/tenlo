"use client";

import Link from "next/link";
import { BookmarkPlus, Check, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import { pushTrackingEvent } from "@/lib/analytics";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

type SaveSearchButtonProps = {
  category?: string;
  categoryLabel?: string;
  municipality?: string;
  query?: string;
};

function savedSearchName(query?: string, categoryLabel?: string, municipality?: string) {
  const subject = query?.trim() || categoryLabel?.trim() || "Recursos para familias";
  return `${subject}${municipality ? ` en ${municipality}` : ""}`.slice(0, 100);
}

export default function SaveSearchButton({ category, categoryLabel, municipality, query }: SaveSearchButtonProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const returnPath = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;

  async function saveSearch() {
    if (loading || saved) return;
    if (!hasSupabaseBrowserConfig()) {
      setNotice("Guardar búsquedas no está disponible en este momento.");
      return;
    }

    setLoading(true);
    setNotice("");
    const supabase = createSupabaseBrowserClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setLoading(false);
      setLoginOpen(true);
      return;
    }

    const { error } = await supabase.from("saved_searches").upsert({
      user_id: authData.user.id,
      name: savedSearchName(query, categoryLabel, municipality),
      search_path: returnPath.slice(0, 500),
      category_id: category ?? null,
      municipality: municipality ?? null
    }, { onConflict: "user_id,search_path" });

    if (error) {
      setNotice("No hemos podido guardar la búsqueda. Inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    const { error: activityError } = await supabase.rpc("record_profile_activity", { next_onboarding_status: null });
    if (activityError) console.error("No se pudo registrar la actividad de búsqueda guardada", activityError.code);
    setSaved(true);
    setNotice("Búsqueda guardada. La encontrarás en tu área personal.");
    pushTrackingEvent("search_saved", { category, municipality });
    setLoading(false);
  }

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        <button type="button" className="btn-secondary" onClick={saveSearch} disabled={loading || saved} aria-pressed={saved}>
          {saved ? <Check size={18} aria-hidden /> : <BookmarkPlus size={18} aria-hidden />}
          {loading ? "Guardando..." : saved ? "Búsqueda guardada" : "Guardar búsqueda"}
        </button>
        {notice ? <p className="text-xs leading-5 text-muted" role="status">{notice}</p> : null}
      </div>
      {loginOpen && typeof document !== "undefined" ? createPortal(
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="save-search-dialog-title">
          <div className="w-full max-w-sm rounded-[24px] border border-line bg-panel p-6 shadow-lift">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="chip">Búsquedas guardadas</p>
                <h2 id="save-search-dialog-title" className="mt-3 text-2xl font-bold text-slatecopy">Vuelve cuando quieras</h2>
              </div>
              <button type="button" className="icon-button h-9 w-9 rounded-xl" aria-label="Cerrar" onClick={() => setLoginOpen(false)}><X size={17} aria-hidden /></button>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">Crea una cuenta o inicia sesión para recuperar esta búsqueda desde cualquier dispositivo.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href={`/login?next=${encodeURIComponent(returnPath)}`} className="btn-primary">Registrarme</Link>
              <Link href={`/login?next=${encodeURIComponent(returnPath)}`} className="btn-secondary">Entrar</Link>
            </div>
          </div>
        </div>, document.body
      ) : null}
    </>
  );
}
