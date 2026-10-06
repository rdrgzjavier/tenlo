import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Tenlo",
  description: "Información sobre cómo tratamos y protegemos tus datos personales en Tenlo."
};

export default function PrivacyPolicyPage() {
  return (
    <div className="section-shell max-w-4xl">
      <h1 className="page-title">Política de Privacidad</h1>
      <p className="lead mt-4">En Tenlo, la privacidad es nuestro pilar fundamental. Esta política explica cómo recogemos, usamos y protegemos la información de las familias y profesionales que utilizan nuestra plataforma.</p>

      <div className="mt-10 space-y-10 text-base leading-8 text-slatecopy">
        <section>
          <h2 className="text-xl font-bold text-ink">1. Responsable del Tratamiento</h2>
          <p className="mt-4">
            Identidad: Tenlo (vía [Nombre del Titular])<br />
            Email: <a href="mailto:hola@tenlo.es" className="font-semibold text-ink">hola@tenlo.es</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink">2. Finalidad del Tratamiento</h2>
          <p className="mt-4">
            Tratamos tus datos para gestionar tu cuenta de usuario, permitir la publicación de anuncios y facilitar la comunicación segura entre adultos. <strong>Tenlo nunca publica fotos ni datos identificativos de menores.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink">3. Legitimación</h2>
          <p className="mt-4">
            La base legal para el tratamiento de tus datos es el consentimiento que prestas al registrarte o contactar con nosotros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink">4. Conservación de Datos</h2>
          <p className="mt-4">
            Tus datos se conservarán mientras mantengas tu cuenta activa o durante el tiempo necesario para cumplir con las obligaciones legales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink">5. Derechos</h2>
          <p className="mt-4">
            Puedes ejercer tus derechos de acceso, rectificación, supresión y portabilidad escribiendo a <a href="mailto:hola@tenlo.es" className="font-semibold text-ink">hola@tenlo.es</a>.
          </p>
        </section>

        <section className="rounded-2xl bg-lavender/20 p-6 ring-1 ring-lavender">
          <h2 className="text-lg font-bold text-ink">Compromiso con la infancia</h2>
          <p className="mt-2 italic">
            Tenlo prohíbe explícitamente el uso de imágenes de menores en los anuncios y perfiles. Cualquier contenido que vulnere esta norma será eliminado de inmediato para garantizar un entorno digital seguro.
          </p>
        </section>
      </div>
    </div>
  );
}
