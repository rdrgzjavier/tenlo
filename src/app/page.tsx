import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Bus,
  CheckCircle2,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  MapPinned,
  Monitor,
  PartyPopper,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { TrustBadge } from "@/components/Badge";
import ValidatedSearchForm from "@/components/ValidatedSearchForm";
import { trackingAttrs } from "@/lib/analytics";
import { centerTypeLabel } from "@/lib/display-labels";
import { centers, listings, municipalities } from "@/lib/mock-data";
import { formatStat, getSiteStats } from "@/lib/site-stats";
import { siteConfig } from "@/lib/site";

const heroImageMobile = "https://images.pexels.com/photos/33593549/pexels-photo-33593549.jpeg?auto=compress&cs=tinysrgb&w=640&q=78";
const heroImage = "https://images.pexels.com/photos/33593549/pexels-photo-33593549.jpeg?auto=compress&cs=tinysrgb&w=900&q=82";

export const metadata: Metadata = {
  title: "Tenlo | Servicios, centros y recursos para familias en Madrid noroeste",
  description: "Encuentra actividades, apoyo escolar, campamentos, uniformes, canguros, centros educativos y recursos locales para familias de Las Rozas, Majadahonda, Pozuelo y Boadilla.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Tenlo | Servicios, centros y recursos para familias en Madrid noroeste",
    description: siteConfig.description,
    url: "/"
  }
};

const benefits = [
  { title: "Confianza visible", text: "Estado claro de cada ficha", Icon: ShieldCheck, color: "text-petrol" },
  { title: "Información revisada", text: "Fuentes y datos claros", Icon: CheckCircle2, color: "text-sage" },
  { title: "Todo en un lugar", text: "Ahorra tiempo", Icon: Heart, color: "text-coral" }
];

const homeCategories = [
  { name: "Apoyo escolar", href: "/categoria/clases-particulares", Icon: BookOpen, color: "text-ink" },
  { name: "Actividades extraescolares", href: "/categoria/extraescolares", Icon: Sparkles, color: "text-coral" },
  { name: "Salud y bienestar", href: "/servicios", Icon: Heart, color: "text-sage" },
  { name: "Tecnología y clases online", href: "/buscar?tag=tecnologia", Icon: Monitor, color: "text-ink" },
  { name: "Transporte escolar", href: "/buscar?tag=transporte", Icon: Bus, color: "text-petrol" },
  { name: "Campamentos y vacaciones", href: "/categoria/extraescolares", Icon: Sparkles, color: "text-ink" },
  { name: "Fiestas y eventos", href: "/buscar?tag=cumpleaños", Icon: PartyPopper, color: "text-coral" }
];

const audienceCards = [
  {
    title: "Familias",
    text: "Encuentra y compara recursos locales sin navegar entre decenas de webs.",
    href: "/buscar",
    cta: "Buscar servicios",
    Icon: UsersRound
  },
  {
    title: "Profesionales",
    text: "Da visibilidad a tu negocio y conecta con familias que ya te necesitan.",
    href: "/proveedores",
    cta: "Ver ventajas",
    Icon: BriefcaseBusiness
  },
  {
    title: "Centros educativos",
    text: "Ordena recursos útiles alrededor del centro y mejora la experiencia familiar.",
    href: "/centros",
    cta: "Explorar centros",
    Icon: GraduationCap
  }
];

const popularServices = [
  {
    title: "Refuerzo de Matemáticas",
    provider: "Academic Madrid",
    category: "Apoyo escolar",
    signal: "Verificado",
    zone: "Majadahonda",
    href: "/categoria/clases-particulares",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Fútbol extraescolar",
    provider: "Campus Sport",
    category: "Actividades",
    signal: "Contacto público",
    zone: "Las Rozas",
    href: "/categoria/extraescolares",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Programación online",
    provider: "Codey School",
    category: "Tecnología",
    signal: "Información revisada",
    zone: "Pozuelo",
    href: "/buscar?tag=tecnologia",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Inglés dinámico",
    provider: "Kids & Us",
    category: "Inglés",
    signal: "Verificado",
    zone: "Boadilla",
    href: "/categoria/clases-particulares",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85"
  }
];

const steps = [
  ["Cuéntanos qué necesitas", "Elige categoría, zona y el tipo de ayuda que estás buscando."],
  ["Explora opciones fiables", "Compara servicios, centros y recursos ya organizados para tu zona."],
  ["Guarda y contacta", "Marca favoritos o abre el detalle para continuar cuando quieras."],
  ["Construimos contigo", "El directorio crece con aportaciones revisadas y criterios seguros."]
];

const privacyBullets = [
  ["Perfiles revisados", "Publicaciones moderadas antes de ganar visibilidad."],
  ["Datos protegidos", "Sin perfiles, horarios personales ni datos sensibles de menores."],
  ["Entorno seguro", "Pensado para decisiones familiares desde una cuenta adulta."]
];

const faqs = [
  ["¿Tenlo es una app escolar?", "No. Tenlo es un directorio local para familias adultas, no una herramienta de gestión escolar ni una red social para menores."],
  ["¿Puedo buscar por zona y categoría?", "Sí. Puedes filtrar por municipio, categoría, centro orientativo, edad recomendada y etiquetas útiles."],
  ["¿Qué significa perfil verificado?", "Indica que la ficha tiene señales adicionales de confianza, como datos contrastados, contacto público o revisión del equipo Tenlo."]
];

const realSituations = [
  { text: "Necesito campamento para la próxima semana", href: "/buscar?tag=campamentos" },
  { text: "Busco apoyo escolar cerca del cole", href: "/buscar?tag=clases-particulares" },
  { text: "Quiero encontrar extraescolares en mi zona", href: "/buscar?tag=extraescolares" },
  { text: "Necesito una sala para celebrar un cumpleaños", href: "/buscar?tag=salas%20multiusos" },
  { text: "Busco un canguro cerca de casa", href: "/buscar?tag=canguros" }
];

export default function Home() {
  const stats = getSiteStats();
  const totalPublished = listings.filter((listing) => listing.status === "published").length;
  const statCards = [
    { value: `+${formatStat(stats.centers)}`, label: "Centros educativos", Icon: GraduationCap },
    { value: `+${formatStat(Math.max(stats.localResources, totalPublished))}`, label: "Recursos locales", Icon: MapPinned },
    { value: "+4", label: "Zonas cubiertas", Icon: MapPin },
    { value: "Revisión", label: "Antes de publicar", Icon: ShieldCheck }
  ];
  const featuredCenters = centers.slice(0, 3);

  return (
    <>
      <section className="overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#F7F5F2_100%)]">
        <div className="page grid gap-8 py-10 lg:grid-cols-[1.22fr_0.78fr] lg:py-14">
          <div className="flex flex-col justify-center">
            <div className="mb-6 h-40 overflow-hidden rounded-[28px] bg-soft md:hidden">
              <ImageWithFallback src={heroImageMobile} fallbackSrc="https://images.pexels.com/photos/7880624/pexels-photo-7880624.jpeg?auto=compress&cs=tinysrgb&w=640&q=78" alt="Persona adulta caminando de la mano con una menor, sin datos identificativos" className="h-full w-full object-cover object-center" loading="eager" fetchPriority="high" />
            </div>
            <h1 className="page-title max-w-3xl">Encuentra, compara y contacta con servicios para tu familia</h1>
            <p className="lead">Actividades, apoyo escolar, salud, tecnología, transporte y mucho más. Información organizada por zona, sin datos identificativos de menores.</p>
            <ValidatedSearchForm className="mt-8 grid gap-3 rounded-[24px] bg-panel p-3 shadow-soft sm:grid-cols-[1fr_0.72fr_auto]" message="Indica qué quieres encontrar o dónde quieres buscar.">
              <label className="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 ring-1 ring-line">
                <Search size={20} className="text-muted" aria-hidden />
                <span className="sr-only">Servicio</span>
                <input name="tag" placeholder="¿Qué quieres encontrar?" className="w-full bg-transparent text-base placeholder:text-muted outline-none" />
              </label>
              <label className="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 ring-1 ring-line">
                <MapPin size={20} className="text-muted" aria-hidden />
                <span className="sr-only">Zona</span>
                <select name="municipio" className="w-full bg-transparent pr-8 text-base text-muted outline-none">
                  <option value="">¿Dónde?</option>
                  {municipalities.map((municipality) => <option key={municipality.id} value={municipality.name}>{municipality.name}</option>)}
                </select>
              </label>
              <button className="btn-primary min-w-40" type="submit" {...trackingAttrs("search", { placement: "home_hero" })}>Buscar servicios</button>
            </ValidatedSearchForm>
            <Link href="/centros" className="mt-4 inline-flex w-full items-center justify-center gap-2 text-sm font-bold text-ink md:w-fit md:justify-start">Explorar centros educativos <ArrowRight size={16} aria-hidden /></Link>
            <div className="mt-7 grid justify-items-center gap-4 sm:grid-cols-3 sm:justify-items-stretch">
              {benefits.map(({ title, text, Icon, color }) => (
                <div key={title} className="grid w-full max-w-[270px] grid-cols-[56px_1fr] items-center gap-4 text-left sm:max-w-none">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm"><Icon size={26} className={color} aria-hidden /></span>
                  <span className="min-w-0"><strong className="block text-base text-slatecopy">{title}</strong><span className="block text-sm leading-5 text-muted">{text}</span></span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden min-h-[370px] lg:block">
            <div className="absolute inset-x-4 bottom-0 top-6 overflow-hidden rounded-[44px] bg-white xl:inset-x-8">
              <ImageWithFallback src={heroImage} fallbackSrc="https://images.pexels.com/photos/7880624/pexels-photo-7880624.jpeg?auto=compress&cs=tinysrgb&w=900&q=82" alt="Persona adulta caminando de la mano con una menor, sin datos identificativos" className="h-full w-full object-cover object-center" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="page relative z-10 py-14 lg:py-16">
        <div className="mb-5 text-left md:text-center">
          <h2 className="section-title">Encuentra antes el tipo de ayuda que necesitas</h2>
          <p className="supporting-copy mx-auto mt-3 max-w-4xl lg:whitespace-nowrap">Categorías útiles para comparar servicios, centros y recursos locales.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {homeCategories.map(({ name, href, Icon, color }) => (
            <Link key={name} href={href} className="group flex aspect-square w-full flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-white p-4 text-center text-sm font-bold text-slatecopy shadow-sm transition-all hover:-translate-y-0.5 hover:border-ink hover:text-ink hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 sm:aspect-auto sm:min-h-32">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-soft ring-1 ring-line transition-colors group-hover:bg-lavender">
                <Icon size={26} className={color} aria-hidden />
              </span>
              <span className="flex min-h-10 items-center justify-center leading-5">{name}</span>
            </Link>
          ))}
        </div>
        <Link href="/categoria" className="mt-5 inline-flex w-full items-center justify-center gap-2 text-sm font-bold text-ink">Ver otros <ArrowRight size={16} /></Link>
      </section>

      <section className="page py-14 lg:py-16">
        <div className="mx-auto mb-7 max-w-3xl text-left md:text-center">
          <h2 className="section-title lg:whitespace-nowrap">Oferta local para decidir con confianza</h2>
          <p className="supporting-copy mt-3">Datos vivos del directorio Tenlo: centros educativos, recursos disponibles, zonas cubiertas y revisión del contenido.</p>
        </div>
        <div className="grid grid-cols-2 overflow-hidden rounded-[24px] border border-line bg-white shadow-soft lg:grid-cols-4">
          {statCards.map(({ value, label, Icon }) => (
            <div key={label} className="border-line bg-white p-5 text-center odd:border-r [&:nth-child(-n+2)]:border-b lg:border-b-0 lg:p-8 lg:[&:nth-child(2n)]:border-r lg:[&:last-child]:border-r-0">
              <Icon size={26} className="mx-auto text-ink lg:size-[30px]" aria-hidden />
              <p className="mt-3 text-2xl font-extrabold text-slatecopy lg:mt-4 lg:text-3xl">{value}</p>
              <p className="mt-1 text-sm leading-5 text-muted lg:mt-2">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page py-14 lg:py-16">
        <h2 className="section-title text-left md:text-center">Para quién está destinado Tenlo</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {audienceCards.map(({ title, text, href, cta, Icon }) => (
            <article key={title} className="card p-7">
              <Icon size={32} className="text-slatecopy" aria-hidden />
              <h3 className="mt-5 text-lg font-bold text-slatecopy">{title}</h3>
              <p className="supporting-copy mt-3">{text}</p>
              <Link href={href} className="btn-secondary mt-5">{cta}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="page py-14 lg:py-16">
        <div className="mb-8 rounded-[24px] border border-line bg-white p-6 shadow-soft">
          <p className="label">Situaciones reales</p>
          <h2 className="subsection-title mt-2">Tenlo ayuda cuando necesitas resolver algo concreto</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {realSituations.map((situation) => (
              <Link key={situation.text} href={situation.href} className="chip hover:text-ink">{situation.text}</Link>
            ))}
          </div>
        </div>
        <div className="mb-6 text-left md:text-center">
          <h2 className="section-title w-full">Servicios populares en tu zona</h2>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-3 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {popularServices.map((service) => (
            <article key={service.title} className="card min-w-[270px] overflow-hidden lg:min-w-0">
              <Link href={service.href} aria-label={`Ver ${service.title}`} className="relative block">
                <ImageWithFallback src={service.image} fallbackSrc={heroImage} alt={`Imagen de ${service.title}`} className="h-36 w-full object-cover" />
                {service.signal === "Verificado" ? <span className="absolute right-3 top-3"><TrustBadge level="verified" variant="solid" /></span> : null}
              </Link>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="chip">{service.category}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slatecopy"><Link href={service.href}>{service.title}</Link></h3>
                <p className="mt-1 text-sm text-muted">{service.provider}</p>
                <div className={`mt-4 flex items-center text-sm text-muted ${service.signal === "Verificado" ? "justify-end" : "justify-between"}`}>
                  {service.signal !== "Verificado" ? <span className="inline-flex items-center gap-1"><CheckCircle2 size={16} className="text-sage" aria-hidden />{service.signal}</span> : null}
                  <span className="inline-flex items-center gap-1"><MapPin size={15} aria-hidden />{service.zone}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <Link href="/servicios" className="mt-5 inline-flex w-full items-center justify-center gap-2 text-sm font-bold text-ink">Ver todos <ArrowRight size={16} /></Link>
      </section>

      <section className="page py-14 lg:py-16">
        <div className="mb-7 text-left md:text-center">
          <div>
            <h2 className="section-title">Centros educativos destacados</h2>
            <p className="supporting-copy mt-3 max-w-2xl md:mx-auto">Fichas públicas organizadas para entender etapas, servicios y recursos relacionados sin perderte entre páginas sueltas.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredCenters.map((center) => (
            <Link key={center.id} href={`/centros/${center.slug}`} className="card p-5 hover:border-ink">
              <span className="chip">{centerTypeLabel(center.type)}</span>
              <h3 className="mt-4 text-lg font-bold text-slatecopy">{center.name}</h3>
              <p className="supporting-copy mt-2">{center.description}</p>
              <p className="mt-4 text-sm font-semibold text-ink">{center.municipality}</p>
            </Link>
          ))}
        </div>
        <Link href="/centros" className="mt-5 inline-flex w-full items-center justify-center gap-2 text-sm font-bold text-ink">Ver centros <ArrowRight size={16} /></Link>
      </section>

      <section className="page py-14 lg:py-16">
        <div className="grid gap-8 rounded-[24px] bg-soft p-6 shadow-soft md:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <MapPinned size={34} className="text-petrol" aria-hidden />
            <h2 className="subsection-title mt-5">Empezamos por el Noroeste de Madrid</h2>
            <p className="supporting-copy mt-4">Cobertura inicial en cuatro municipios para comparar oferta local cerca de casa.</p>
            <Link href="/buscar?region=madrid" className="btn-primary mt-6 w-fit">Ver todas las zonas</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ZoneMapLink href="/buscar?municipio=Pozuelo%20de%20Alarc%C3%B3n" label="Pozuelo de Alarcón" />
            <ZoneMapLink href="/buscar?municipio=Majadahonda" label="Majadahonda" />
            <ZoneMapLink href="/buscar?municipio=Las%20Rozas%20de%20Madrid" label="Las Rozas de Madrid" />
            <ZoneMapLink href="/buscar?municipio=Boadilla%20del%20Monte" label="Boadilla del Monte" />
          </div>
        </div>
      </section>

      <section className="page py-14 lg:py-16">
        <div className="grid items-center gap-6 rounded-[24px] bg-lavender p-8 shadow-soft md:grid-cols-[1fr_auto] md:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/70"><BriefcaseBusiness size={34} className="text-slatecopy" /></span>
            <div>
              <h2 className="subsection-title">¿Quieres formar parte de Tenlo?</h2>
              <p className="supporting-copy mt-2 max-w-2xl">Únete como profesional o centro y forma parte del directorio de confianza para familias.</p>
            </div>
          </div>
          <Link href="/publicar" className="btn-primary w-full justify-center sm:w-auto" {...trackingAttrs("publish", { placement: "home_join" })}>Publicar oferta</Link>
        </div>
      </section>

      <section className="page py-14 lg:py-16">
        <div className="mx-auto max-w-3xl text-left md:text-center">
          <h2 className="section-title">Cómo funciona Tenlo</h2>
          <p className="supporting-copy mt-3">De la necesidad familiar a una decisión local clara.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, text], index) => (
            <article key={title} className="card p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lavender text-sm font-extrabold text-ink">{index + 1}</span>
              </div>
              <h3 className="mt-6 text-lg font-bold text-slatecopy">{title}</h3>
              <p className="supporting-copy mt-3">{text}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/buscar" className="btn-primary">Empezar a buscar</Link>
        </div>
      </section>

      <section className="page py-14 lg:py-16">
        <div className="card grid gap-8 bg-[linear-gradient(90deg,#ffffff,#F3FAF7)] p-6 md:grid-cols-[0.95fr_1.45fr] md:items-center md:p-10">
          <div className="flex flex-col gap-4 md:flex-row">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-petrol shadow-sm"><ShieldCheck size={24} aria-hidden /></span>
            <div>
              <h2 className="subsection-title">Privacidad desde el inicio</h2>
              <p className="supporting-copy mt-3">La privacidad y seguridad de las familias es nuestra prioridad. No publicamos fotos, perfiles, horarios personales ni datos sensibles de menores.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {privacyBullets.map(([title, text]) => (
              <article key={title} className="rounded-[20px] bg-white/80 p-5 text-center shadow-sm ring-1 ring-line">
                <CheckCircle2 size={24} className="mx-auto text-petrol" aria-hidden />
                <h3 className="minor-title mt-4">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page py-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="label">Guía local para familias</p>
            <h2 className="section-title">Todo lo que necesitas alrededor del cole</h2>
            <p className="supporting-copy mt-4">Tenlo agrupa servicios educativos, logística familiar, centros, actividades y recursos próximos en Las Rozas, Majadahonda, Pozuelo y Boadilla. La arquitectura está preparada para crecer por zona, categoría y centro educativo.</p>
          </div>
          <div className="grid gap-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="card p-5">
                <summary className="cursor-pointer text-sm font-bold text-slatecopy">{question}</summary>
                <p className="mt-3 text-sm leading-6 text-muted">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="page py-14 lg:py-16">
        <div className="grid items-center gap-6 rounded-[24px] bg-lavender p-8 shadow-soft md:grid-cols-[1fr_auto] md:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/70"><Mail size={34} className="text-slatecopy" /></span>
            <div>
              <h2 className="subsection-title">¿Quieres estar al día?</h2>
              <p className="supporting-copy mt-2">Recibe novedades, recursos y recomendaciones pensadas para familias como la tuya.</p>
            </div>
          </div>
          <form action="/contacto" className="grid min-w-[min(100%,460px)] gap-3 xl:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="newsletter-email">Tu correo electrónico</label>
            <input id="newsletter-email" name="email" type="email" placeholder="Tu correo electrónico" className="field m-0 bg-white" />
            <button className="btn-primary" type="submit">Suscribirme</button>
          </form>
        </div>
      </section>
    </>
  );
}

function ZoneMapLink({ href, label, className = "" }: { href: string; label: string; className?: string }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-3 text-sm font-bold text-slatecopy ring-1 ring-line transition-colors hover:text-ink ${className}`}>
      <MapPin size={15} className="text-muted" aria-hidden />
      {label}
    </Link>
  );
}
