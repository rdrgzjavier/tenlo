import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso Legal | Tenlo",
  description: "Información legal sobre el uso de la plataforma Tenlo."
};

export default function LegalNoticePage() {
  return (
    <div className="section-shell max-w-4xl">
      <h1 className="page-title">Aviso Legal</h1>
      <p className="lead mt-4">Bienvenido a Tenlo. En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa a los usuarios de los siguientes datos identificativos.</p>

      <div className="mt-10 space-y-10 text-base leading-8 text-slatecopy">
        <section>
          <h2 className="text-xl font-bold text-ink">1. Datos Identificativos</h2>
          <p className="mt-4">
            El titular de la plataforma Tenlo es [Nombre del Titular/Empresa], con NIF [NIF] y domicilio en [Dirección Completa]. 
            Correo electrónico de contacto: <a href="mailto:hola@tenlo.es" className="font-semibold text-ink">hola@tenlo.es</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink">2. Objeto</h2>
          <p className="mt-4">
            Tenlo es una plataforma que facilita el contacto entre familias y proveedores de servicios/recursos locales. El uso de la plataforma atribuye la condición de usuario e implica la aceptación total de este Aviso Legal.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink">3. Uso de la Plataforma</h2>
          <p className="mt-4">
            El usuario se compromete a hacer un uso lícito de la plataforma, absteniéndose de publicar contenidos que vulneren la ley, la moral, el orden público o los derechos de terceros, especialmente aquellos relacionados con la protección de menores.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink">4. Propiedad Intelectual</h2>
          <p className="mt-4">
            Todos los contenidos, diseños, logos y códigos fuente de Tenlo son propiedad de sus titulares o cuentan con la autorización para su uso. Queda prohibida la reproducción total o parcial sin consentimiento previo.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink">5. Responsabilidad</h2>
          <p className="mt-4">
            Tenlo actúa como intermediario y no se hace responsable de la veracidad de los anuncios publicados por terceros, ni de la calidad de los servicios prestados por los proveedores listados. No obstante, Tenlo realiza una moderación proactiva para asegurar la integridad de la comunidad.
          </p>
        </section>
      </div>
    </div>
  );
}
