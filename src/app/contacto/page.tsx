import type { Metadata } from "next";
import SafeEnvironmentCard from "@/components/SafeEnvironmentCard";
import { Mail, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto | Tenlo",
  description: "Contacta con el equipo de Tenlo para consultas, soporte o propuestas de colaboración."
};

export default function ContactPage() {
  return (
    <div className="section-shell max-w-4xl">
      <p className="label">Contacto</p>
      <h1 className="page-title">Estamos aquí para ayudarte</h1>
      <p className="lead">Para cualquier duda, sugerencia o incidencia, puedes escribirnos directamente a nuestra dirección de correo electrónico oficial.</p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-panel p-8 shadow-none">
          <Mail className="text-ink" size={32} />
          <h2 className="mt-4 text-xl font-bold text-ink">Correo electrónico</h2>
          <p className="mt-2 text-sm text-muted">Nuestro equipo revisa todos los mensajes y responde en un plazo de 24-48 horas laborables.</p>
          <a href="mailto:hola@tenlo.es" className="mt-6 inline-block text-xl font-bold text-ink underline decoration-lavender underline-offset-4 transition-colors hover:text-lavender">
            hola@tenlo.es
          </a>
        </div>

        <div className="space-y-6">
          <SafeEnvironmentCard compact title="Seguridad y privacidad" body="Tratamos tus datos con confidencialidad y Tenlo no solicita información personal de menores." />
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-soft ring-1 ring-line">
              <MessageSquare className="text-ink" size={20} />
            </div>
            <div>
              <h3 className="minor-title text-ink">Sugerencias</h3>
              <p className="mt-1 text-sm text-muted text-slatecopy">Tenlo es una plataforma en constante evolución. Tu feedback es vital para nosotros.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
