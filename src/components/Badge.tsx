import { CheckCircle2, Clock3, Database, ShieldCheck, UserRoundCheck } from "lucide-react";
import type { ModerationStatus, TrustLevel } from "@/lib/types";

export function VerifiedBadge({ verified }: { verified?: boolean }) {
  if (!verified) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sage/10 px-3 py-1 text-sm font-semibold text-black">
      <CheckCircle2 className="text-black" size={14} aria-hidden /> Verificado
    </span>
  );
}

export function TrustBadge({ level, variant = "soft" }: { level: TrustLevel; variant?: "soft" | "solid" }) {
  const config = {
    collected: { label: "Pública", title: "Información recopilada de fuentes públicas; el proveedor todavía no gestiona esta ficha.", Icon: Database },
    managed: { label: "Gestionada", title: "El proveedor ha reclamado la ficha y puede mantener su información actualizada.", Icon: UserRoundCheck },
    verified: { label: "Verificada", title: "Tenlo ha comprobado la identidad y los datos esenciales del proveedor.", Icon: CheckCircle2 },
    official: { label: "Oficial", title: "La información ha sido confirmada directamente por el proveedor.", Icon: ShieldCheck }
  }[level];
  const Icon = config.Icon;
  const className = variant === "solid" ? "bg-white text-black ring-line shadow-sm" : "bg-sage/10 text-black ring-sage/20";

  return (
    <span title={config.title} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${className}`}>
      <Icon className="text-black" size={14} aria-hidden /> {config.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: ModerationStatus }) {
  const labels: Record<ModerationStatus, string> = {
    draft: "Borrador",
    pending_review: "Pendiente de revisión",
    published: "Publicado",
    rejected: "Rechazado",
    archived: "Archivado"
  };

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-soft px-3 py-1 text-sm font-semibold text-slatecopy ring-1 ring-line">
      <Clock3 className="text-ink" size={14} aria-hidden /> {labels[status]}
    </span>
  );
}
