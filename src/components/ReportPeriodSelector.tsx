import Link from "next/link";

export const reportPeriods = [30, 90, 180] as const;
export type ReportPeriod = typeof reportPeriods[number];

export function resolveReportPeriod(value: string | undefined): ReportPeriod {
  const parsed = Number(value);
  return reportPeriods.includes(parsed as ReportPeriod) ? parsed as ReportPeriod : 90;
}

function periodHref(pathname: string, period: ReportPeriod, preservedParams: Record<string, string>) {
  const params = new URLSearchParams({ period: String(period) });
  Object.entries(preservedParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return `${pathname}?${params.toString()}`;
}

export default function ReportPeriodSelector({ activePeriod, pathname, preservedParams = {} }: { activePeriod: ReportPeriod; pathname: string; preservedParams?: Record<string, string> }) {
  return (
    <nav className="mt-5 flex flex-wrap items-center gap-2" aria-label="Periodo del informe">
      <span className="mr-1 text-sm font-semibold text-muted">Periodo:</span>
      {reportPeriods.map((period) => (
        <Link
          key={period}
          href={periodHref(pathname, period, preservedParams)}
          aria-current={period === activePeriod ? "page" : undefined}
          className={period === activePeriod ? "chip border-primary bg-violet/10 text-primary" : "chip hover:border-primary hover:text-primary"}
        >
          {period} días
        </Link>
      ))}
    </nav>
  );
}
