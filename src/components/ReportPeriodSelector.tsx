import Link from "next/link";

export const reportPeriods = [30, 90, 180] as const;
export type ReportPeriod = typeof reportPeriods[number];

export function resolveReportPeriod(value: string | undefined): ReportPeriod {
  const parsed = Number(value);
  return reportPeriods.includes(parsed as ReportPeriod) ? parsed as ReportPeriod : 90;
}

export default function ReportPeriodSelector({ activePeriod, pathname }: { activePeriod: ReportPeriod; pathname: string }) {
  return (
    <nav className="mt-5 flex flex-wrap items-center gap-2" aria-label="Periodo del informe">
      <span className="mr-1 text-sm font-semibold text-muted">Periodo:</span>
      {reportPeriods.map((period) => (
        <Link
          key={period}
          href={`${pathname}?period=${period}`}
          aria-current={period === activePeriod ? "page" : undefined}
          className={period === activePeriod ? "chip border-primary bg-violet/10 text-primary" : "chip hover:border-primary hover:text-primary"}
        >
          {period} días
        </Link>
      ))}
    </nav>
  );
}
