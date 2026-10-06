"use client";

import Link from "next/link";
import { Heart, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { pushTrackingEvent } from "@/lib/analytics";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

type FavoriteButtonProps = {
  className?: string;
  label?: string;
  showLabel?: boolean;
  targetId: string;
  targetType?: "listing" | "center" | "provider";
  initialSaved?: boolean;
};

export default function FavoriteButton({ className = "icon-button", label = "Guardar favorito", showLabel = false, targetId, targetType = "listing", initialSaved = false }: FavoriteButtonProps) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const canUsePortal = typeof document !== "undefined";
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (initialSaved || !hasSupabaseBrowserConfig()) return;
    let active = true;
    const supabase = createSupabaseBrowserClient();

    async function loadSavedState() {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user || !active) return;
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", authData.user.id)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .maybeSingle();
      if (active) setSaved(Boolean(data));
    }

    void loadSavedState();
    return () => { active = false; };
  }, [initialSaved, targetId, targetType]);

  async function handleClick() {
    if (loading) return;
    if (!hasSupabaseBrowserConfig()) {
      setNotice("Favoritos no está disponible en este momento.");
      return;
    }

    setLoading(true);
    setNotice("");
    const supabase = createSupabaseBrowserClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setLoading(false);
      setOpen(true);
      return;
    }

    const query = supabase
      .from("favorites")
      .delete()
      .eq("user_id", authData.user.id)
      .eq("target_type", targetType)
      .eq("target_id", targetId);
    const result = saved
      ? await query
      : await supabase.from("favorites").upsert({ user_id: authData.user.id, target_type: targetType, target_id: targetId }, { onConflict: "user_id,target_type,target_id" });

    if (result.error) {
      setNotice("No hemos podido actualizar tus favoritos. Inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    const nextSaved = !saved;
    setSaved(nextSaved);
    setNotice(nextSaved ? "Guardado en tus favoritos." : "Eliminado de tus favoritos.");
    pushTrackingEvent(nextSaved ? "provider_saved" : "provider_unsaved", { item: targetId, type: targetType });
    setLoading(false);
    router.refresh();
  }

  const buttonLabel = saved ? `Quitar ${label.toLowerCase().replace(/^guardar /, "")}` : label;

  return (
    <>
      <button type="button" className={className} aria-label={buttonLabel} aria-pressed={saved} onClick={handleClick} disabled={loading}>
        <Heart size={19} fill={saved ? "currentColor" : "none"} aria-hidden />
        {showLabel ? <span>{loading ? "Guardando..." : saved ? "Quitar favorito" : label}</span> : null}
      </button>
      {notice ? <span className="sr-only" role="status">{notice}</span> : null}
      {open && canUsePortal ? createPortal(
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="favorite-dialog-title">
          <div className="w-full max-w-sm rounded-[24px] border border-line bg-panel p-6 shadow-lift">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="chip">Favoritos</p>
                <h2 id="favorite-dialog-title" className="mt-3 text-2xl font-bold text-slatecopy">Guarda tus recursos</h2>
              </div>
              <button type="button" className="icon-button h-9 w-9 rounded-xl" aria-label="Cerrar" onClick={() => setOpen(false)}>
                <X size={17} aria-hidden />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              Crea una cuenta o inicia sesión para guardar servicios, centros y recursos en tu zona.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn-primary">Registrarme</Link>
              <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn-secondary">Entrar</Link>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
