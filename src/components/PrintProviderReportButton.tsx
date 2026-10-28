"use client";

import { Printer } from "lucide-react";

export default function PrintProviderReportButton() {
  return (
    <button type="button" className="btn-secondary print:hidden" onClick={() => window.print()}>
      <Printer size={18} aria-hidden />
      Imprimir o guardar en PDF
    </button>
  );
}
