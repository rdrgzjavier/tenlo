import Link from "next/link";
import { CalendarClock, Database, ExternalLink, UserRoundCheck } from "lucide-react";
import type { TrustLevel } from "@/lib/types";

type InformationTraceabilityProps = {
  sourceName?: string;
  sourceUrl?: string;
  lastReviewed?: string;
  verificationStatus?: string;
  trustLevel: TrustLevel;
  correctionHref: string;
};

const providerControlLabels: Record<TrustLevel, string> = {
  collected: "No confirmada por el proveedor",
  managed: "Gestionada por el proveedor",
  verified: "Verificada por Tenlo",
  official: "Fuente oficial"
};

function displayedValue(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export default function InformationTraceability({
  sourceName,
  sourceUrl,
  lastReviewed,
  verificationStatus,
  trustLevel,
  correctionHref
}: InformationTraceabilityProps) {
  const linkedSource = sourceName?.trim() && sourceUrl?.startsWith("http");
  const rows = [
    {
      label: "Fuente",
      value: displayedValue(sourceName, "Pendiente de documentar"),
      Icon: Database,
      href: linkedSource ? sourceUrl : undefined
    },
    {
      label: "Última revisión",
      value: displayedValue(lastReviewed, "Pendiente de revisión"),
      Icon: CalendarClock
    },
    {
      label: "Control de la ficha",
      value: providerControlLabels[trustLevel],
      Icon: UserRoundCheck
    }
  ];

  return (
    <section className="card p-5 md:p-6">
      <h2 className="subsection-title text-ink">Origen y actualización</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Consulta de dónde procede la información, cuándo se revisó y quién mantiene la ficha.
      </p>
      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        {rows.map(({ label, value, Icon, href }) => (
          <div key={label} className="rounded-xl border border-line bg-soft p-4">
            <Icon size={19} className="text-ink" aria-hidden />
            <dt className="label mt-3">{label}</dt>
            <dd className="mt-2 break-words text-sm font-semibold leading-6 text-ink">
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 underline decoration-ink/35 underline-offset-4">
                  {value}
                  <ExternalLink size={14} aria-hidden />
                </a>
              ) : value}
            </dd>
          </div>
        ))}
      </dl>
      {verificationStatus?.trim() ? (
        <p className="mt-4 text-sm leading-6 text-slatecopy">
          <span className="font-semibold text-ink">Estado de revisión:</span> {verificationStatus}
        </p>
      ) : null}
      <Link href={correctionHref} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-ink underline decoration-ink/35 underline-offset-4">
        Solicitar corrección o actualización
      </Link>
    </section>
  );
}
