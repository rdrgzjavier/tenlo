import { Phone } from "lucide-react";
import type { Listing, Provider } from "@/lib/types";
import { trackingAttrs } from "@/lib/analytics";
import { providerProfileSections } from "@/lib/provider-profile-template";

function callablePhone(value: string) {
  if (!/^\+?[\d\s().-]{6,}$/.test(value)) return null;
  const normalized = value.replace(/[^+\d]/g, "");
  return normalized.length >= 6 ? normalized : null;
}

export default function ProviderProfileSections({ provider, listing }: { provider: Provider; listing?: Listing }) {
  return (
    <>
      {providerProfileSections(provider, listing).map((section) => (
        <section key={section.title} className="card p-6">
          <h2 className="text-2xl font-semibold text-ink">{section.title}</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => {
              const pending = field.value === "Pendiente de verificar";
              const phone = field.label === "Teléfono" ? callablePhone(field.value) : null;
              return (
                <div key={field.label} className="rounded-xl border border-line bg-soft p-4">
                  <dt className="label">{field.label}</dt>
                  <dd className={`mt-2 break-words text-sm font-semibold ${pending ? "text-muted" : "text-ink"}`}>
                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="inline-flex min-h-11 items-center gap-2 underline decoration-ink/35 underline-offset-4"
                        aria-label={`Llamar al ${field.value}`}
                        {...trackingAttrs("contact_phone_clicked", {
                          item: provider.id,
                          type: "provider",
                          category: provider.category,
                          municipality: provider.municipality
                        })}
                      >
                        <Phone size={16} aria-hidden />
                        {field.value}
                      </a>
                    ) : field.value}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </>
  );
}
