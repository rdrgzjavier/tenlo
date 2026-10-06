"use client";

import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

type FavoriteButtonProps = {
  className?: string;
  label?: string;
  showLabel?: boolean;
};

function hasLocalSession() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("tenlo-session") === "true";
}

export default function FavoriteButton({ className = "icon-button", label = "Favoritos", showLabel = false }: FavoriteButtonProps) {
  const [open, setOpen] = useState(false);
  const canUsePortal = typeof document !== "undefined";

  function handleClick() {
    if (hasLocalSession()) {
      window.location.href = "/favoritos";
      return;
    }

    setOpen(true);
  }

  return (
    <>
      <button type="button" className={className} aria-label={label} onClick={handleClick}>
        <Heart size={19} aria-hidden />
        {showLabel ? <span>{label}</span> : null}
      </button>
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
              <Link href="/login" className="btn-primary">Registrarme</Link>
              <Link href="/login" className="btn-secondary">Entrar</Link>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
