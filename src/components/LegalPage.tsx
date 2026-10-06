import type { ReactNode } from "react";

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="page py-10">
      <article className="mx-auto max-w-3xl rounded-2xl border border-line bg-panel p-6 md:p-8">
        <p className="label">Información legal y de seguridad</p>
        <h1 className="page-title text-ink">{title}</h1>
        <div className="mt-5 space-y-4 text-base leading-8 text-slatecopy">{children}</div>
      </article>
    </div>
  );
}
