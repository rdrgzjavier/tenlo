import Link from "next/link";
import { Instagram, Linkedin, ShieldCheck } from "lucide-react";

const columns = [
  {
    title: "Familias",
    links: [
      ["Buscar servicios", "/buscar"],
      ["Servicios populares", "/servicios"],
      ["Comunidad", "/comunidad"],
      ["Categorías", "/categoria"],
      ["Sugerencias", "/sugerencias"]
    ]
  },
  {
    title: "Profesionales",
    links: [
      ["Programa para proveedores", "/proveedores"],
      ["Buscar mi ficha", "/servicios"],
      ["Publicar oferta", "/publicar"],
      ["Contacto", "/contacto"]
    ]
  },
  {
    title: "Recursos",
    links: [
      ["Centros educativos", "/centros"],
      ["Guías locales", "/comunidad"],
      ["Buscar recursos", "/buscar"]
    ]
  },
  {
    title: "Zonas",
    links: [
      ["Las Rozas de Madrid", "/buscar?municipio=Las%20Rozas%20de%20Madrid"],
      ["Majadahonda", "/buscar?municipio=Majadahonda"],
      ["Pozuelo de Alarcón", "/buscar?municipio=Pozuelo%20de%20Alarc%C3%B3n"],
      ["Boadilla del Monte", "/buscar?municipio=Boadilla%20del%20Monte"]
    ]
  },
  {
    title: "Legal",
    links: [
      ["Privacidad", "/privacidad"],
      ["Términos de uso", "/aviso-legal"],
      ["Aviso legal", "/aviso-legal"],
      ["Cookies", "/cookies"]
    ]
  }
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-panel">
      <div className="page py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          {columns.map((column) => <FooterColumn key={column.title} title={column.title} links={column.links} />)}
        </div>
        <div className="mt-10 grid gap-6 border-t border-line pt-8 lg:mt-12 lg:grid-cols-[1.3fr_1fr_auto] lg:items-center">
          <div>
            <p className="text-3xl font-extrabold text-ink">Tenlo</p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
              La plataforma que conecta a familias con servicios educativos, bienestar y recursos locales de confianza.
            </p>
          </div>
          <div className="flex items-start gap-2 text-sm font-semibold leading-6 text-petrol">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden />
            <span>Dirigida a adultos, con publicaciones revisadas y privacidad desde el inicio.</span>
          </div>
          <div className="flex gap-3">
            <Link href="https://www.instagram.com/tenlocerca/" className="icon-button" aria-label="Instagram">
              <Instagram size={18} />
            </Link>
            <Link href="https://www.linkedin.com/company/tenlocerca" className="icon-button" aria-label="LinkedIn">
              <Linkedin size={18} />
            </Link>
          </div>
        </div>
        <div className="mt-8 text-sm text-muted">© {new Date().getFullYear()} Tenlo. Todos los derechos reservados.</div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="text-sm font-bold text-slatecopy">{title}</p>
      <ul className="mt-3 grid gap-2 text-sm text-muted lg:gap-3">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="transition-colors hover:text-ink">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
