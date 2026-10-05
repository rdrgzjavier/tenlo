import type { Listing, Provider } from "@/lib/types";
import { providerProfileSections } from "@/lib/provider-profile-template";

export default function ProviderProfileSections({ provider, listing }: { provider: Provider; listing?: Listing }) {
  return (
    <>
      {providerProfileSections(provider, listing).map((section) => (
        <section key={section.title} className="card p-6">
          <h2 className="text-2xl font-semibold text-ink">{section.title}</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => {
              const pending = field.value === "Pendiente de verificar";
              return (
                <div key={field.label} className="rounded-xl border border-line bg-soft p-4">
                  <dt className="label">{field.label}</dt>
                  <dd className={`mt-2 break-words text-sm font-semibold ${pending ? "text-muted" : "text-ink"}`}>{field.value}</dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </>
  );
}
