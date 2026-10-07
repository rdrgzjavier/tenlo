import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, CheckCircle2, FilePenLine, Search, ShieldCheck, UsersRound } from "lucide-react";
import { TrustBadge } from "@/components/Badge";
import { trackingAttrs } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Tenlo para proveedores | Gestiona gratis tu ficha durante el piloto",
  description: "Revisa tu ficha, actualiza servicios y participa gratuitamente en el piloto de Tenlo para familias de Madrid noroeste.",
  alternates: { canonical: "/proveedores" }
};

const benefits = [
  { title: "Información correcta", text: "Revisa datos, servicios, edades, horarios, cobertura y formas de contacto desde una estructura adaptada a tu actividad.", Icon: FilePenLine },
  { title: "Confianza comprensible", text: "La ficha explica de dónde procede la información y diferencia claramente información pública, gestión y verificación.", Icon: ShieldCheck },
  { title: "Demanda útil", text: "Tenlo quiere conectar necesidades concretas de familias con proveedores que puedan responder, no vender listados de contactos.", Icon: UsersRound },
  { title: "Aprendizaje medible", text: "Durante el piloto construiremos informes de visibilidad, búsquedas, contactos y respuesta con datos reales.", Icon: BarChart3 }
];

const steps = [
  ["1", "Encuentra tu ficha", "Busca si Tenlo ya ha recopilado información pública sobre tu centro o negocio."],
  ["2", "Solicita gestionarla", "No necesitas crear una cuenta para iniciar la solicitud. Verificaremos tu email y relación con la entidad."],
  ["3", "Completa la información", "Revisa todos los campos de la plantilla de tu servicio. Lo desconocido seguirá marcado como pendiente."],
  ["4", "Activa el piloto", "Decide si quieres recibir solicitudes y mantén actualizada tu disponibilidad."]
];

export default function ProvidersPage() {
  return (
    <div>
      <section className="section-shell grid items-center gap-10 lg:grid-cols-[1.08fr_.92fr]">
        <div>
          <p className="label">Tenlo para proveedores</p>
          <h1 className="page-title">Haz que las familias entiendan mejor lo que ofreces</h1>
          <p className="lead">Revisa tu ficha, completa la información que realmente ayuda a decidir y participa sin coste en el piloto de Tenlo en Madrid noroeste.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/servicios" className="btn-primary" {...trackingAttrs("claim_started", { placement: "provider_landing" })}><Search size={18} /> Buscar mi ficha</Link>
            <Link href="/contacto" className="btn-secondary">Hablar con Tenlo</Link>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">Participación gratuita durante el piloto. No prometemos contactos ni posiciones; primero queremos demostrar valor real.</p>
        </div>
        <aside className="card p-6 md:p-8">
          <p className="label">Estados de confianza</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Cada etiqueta significa algo concreto</h2>
          <div className="mt-6 grid gap-4">
            {(["collected", "managed", "verified", "official"] as const).map((level) => (
              <div key={level} className="flex items-start gap-3 rounded-2xl border border-line bg-soft p-4">
                <TrustBadge level={level} />
                <p className="text-sm leading-6 text-muted">{{
                  collected: "Tenlo ha localizado información pública, pero aún no ha sido confirmada por la entidad.",
                  managed: "La entidad ha reclamado la ficha y puede actualizarla.",
                  verified: "Tenlo ha comprobado identidad y datos esenciales.",
                  official: "La información ha sido confirmada directamente por la entidad."
                }[level]}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="border-y border-line bg-panel py-16">
        <div className="page">
          <p className="label">Qué aporta el piloto</p>
          <h2 className="section-title mt-2">Una ficha útil antes que una suscripción</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {benefits.map(({ title, text, Icon }) => (
              <article key={title} className="card p-6">
                <Icon size={24} className="text-petrol" aria-hidden />
                <h3 className="mt-4 text-xl font-bold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <p className="label">Cómo participar</p>
        <h2 className="section-title mt-2">Cuatro pasos sencillos</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {steps.map(([number, title, text]) => (
            <article key={number} className="card p-5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-bold text-white">{number}</span>
              <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page pb-16 sm:pb-20">
        <div className="rounded-3xl bg-ink p-7 text-white md:p-10">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-2 text-sage"><CheckCircle2 size={20} /><span className="text-sm font-bold uppercase tracking-wide">Programa fundador</span></div>
              <h2 className="mt-3 text-3xl font-bold">Ayúdanos a construir una plataforma que sea útil también para ti</h2>
              <p className="mt-3 max-w-3xl leading-7 text-white/75">Buscamos una primera cohorte pequeña de actividades y servicios familiares de Las Rozas, Majadahonda, Pozuelo y Boadilla para probar fichas, solicitudes e informes antes de plantear cualquier suscripción.</p>
            </div>
            <Link href="/servicios" className="btn-secondary border-white/30 bg-white text-ink">Buscar mi ficha</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
