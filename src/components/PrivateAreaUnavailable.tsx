import Link from "next/link";
import { Clock3 } from "lucide-react";

export default function PrivateAreaUnavailable() {
  return (
    <div className="section-shell">
      <div className="mx-auto max-w-2xl rounded-[24px] border border-line bg-panel p-8 text-center shadow-soft">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lavender text-ink">
          <Clock3 size={24} aria-hidden />
        </span>
        <p className="label mt-5">Área personal</p>
        <h1 className="detail-title mt-2">Temporalmente no disponible</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          No podemos abrir ahora las funciones de tu cuenta. Tus datos no se han modificado. Inténtalo de nuevo más tarde o vuelve al directorio público.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/buscar" className="btn-primary">Explorar servicios</Link>
          <Link href="/contacto" className="btn-secondary">Avisar a Tenlo</Link>
        </div>
      </div>
    </div>
  );
}
