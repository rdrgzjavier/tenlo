import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { communityInitiatives, findCommunityInitiative } from "@/lib/mock-data";

const communityFallbackImage = "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600";

export function generateStaticParams() {
  return communityInitiatives.map((initiative) => ({ id: initiative.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const initiative = findCommunityInitiative(id);
  if (!initiative) return { title: "Iniciativa no encontrada | Tenlo" };
  return { title: `${initiative.name} | Comunidad | Tenlo`, description: initiative.summary };
}

export default async function CommunityInitiativePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initiative = findCommunityInitiative(id);
  if (!initiative) notFound();
  const officialUrl = initiative.url.startsWith("http") ? initiative.url : undefined;

  return (
    <div className="section-shell">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <article>
          <ImageWithFallback src={initiative.image} fallbackSrc={communityFallbackImage} alt={`Imagen de ${initiative.name}`} className="h-64 w-full rounded-2xl border border-line object-cover sm:h-80" />
          <p className="label mt-6">Iniciativa comunitaria</p>
          <h1 className="page-title">{initiative.name}</h1>
          <p className="lead">{initiative.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {initiative.tags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
          </div>

          <section className="mt-8 grid gap-5">
            <InfoBlock title="Datos de la iniciativa" items={[
              ["Tipo de recurso", initiative.tags[0] ?? "Iniciativa comunitaria"],
              ["Municipio", initiative.municipality],
              ["Referencia", officialUrl ? "Web oficial disponible" : "Consultar con la entidad"]
            ]} />
            <section className="card p-6">
              <h2 className="text-2xl font-semibold text-ink">Por qué aparece en Tenlo</h2>
              <p className="mt-3 text-sm leading-6 text-muted">Tenlo también puede dar visibilidad a causas, iniciativas y recursos locales útiles para familias. No funciona como foro abierto, grupo privado ni espacio para publicar datos de menores.</p>
            </section>
          </section>
        </article>

        <aside className="card h-fit p-6">
          <h2 className="text-xl font-semibold text-ink">Ayúdanos a mejorar</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Si falta un dato, hay una iniciativa local que deberíamos incluir o quieres proponer una mejora, envíanos una sugerencia.</p>
          <Link href={`/sugerencias?context=comunidad&item=${initiative.id}`} className="btn-primary mt-5 w-full">Enviar sugerencia</Link>
          {officialUrl ? (
            <a href={officialUrl} target="_blank" rel="noreferrer" className="btn-secondary mt-3 w-full">Web oficial<ExternalLink size={16} /></a>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[][] }) {
  return (
    <section className="card p-6">
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-soft p-4">
            <dt className="label">{label}</dt>
            <dd className="mt-2 break-words text-sm font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
