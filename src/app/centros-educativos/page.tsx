import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Centros educativos | Tenlo",
  description: "Solicita revisión, actualización o validación de ficha de centro educativo."
};

export default function CentersForSchoolsPage() {
  return (
    <div className="page py-10">
      <p className="label">Para colegios, escuelas infantiles e institutos</p>
      <h1 className="page-title text-ink">Centros educativos</h1>
      <p className="mt-3 max-w-3xl text-slatecopy">La plataforma ayuda a las familias a encontrar recursos alrededor del centro y permite a cada centro validar su ficha o proponer correcciones.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {["Ficha pública clara", "Recursos útiles para familias", "Canal de revisión controlado"].map((item) => (
          <div key={item} className="card p-6"><h2 className="text-xl font-semibold text-ink">{item}</h2><p className="mt-2 text-sm leading-6 text-muted">Información estructurada, moderada y orientada a decisiones familiares respetuosas.</p></div>
        ))}
      </div>
      <form className="mt-8 grid gap-4 rounded-2xl border border-line bg-panel p-5 md:grid-cols-2 md:p-8">
        <h2 className="text-2xl font-semibold text-ink md:col-span-2">Solicitar revisión de ficha</h2>
        <label className="field-label">Nombre del centro<input required className="field" /></label>
        <label className="field-label">Persona de contacto<input required className="field" /></label>
        <label className="field-label">Email<input required type="email" className="field" /></label>
        <label className="field-label">Solicitud<select className="field"><option>Actualizar datos</option><option>Validar ficha</option><option>Recibir información</option></select></label>
        <label className="field-label md:col-span-2">Mensaje<textarea required className="field min-h-28" /></label>
        <div className="flex flex-wrap gap-3 md:col-span-2"><button className="btn-primary">Solicitar revisión de ficha</button><Link className="btn-secondary" href="/contacto">Contactar con el equipo</Link></div>
      </form>
    </div>
  );
}
