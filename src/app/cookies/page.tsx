import type { Metadata } from "next";
import CookieSettingsButton from "@/components/CookieSettingsButton";

export const metadata: Metadata = {
  title: "Política de Cookies | Tenlo",
  description: "Información sobre el uso de cookies en la plataforma Tenlo."
};

export default function CookiesPolicyPage() {
  const cookiebotId = process.env.NEXT_PUBLIC_COOKIEBOT_ID;
  const hasValidCookiebotId = Boolean(
    cookiebotId && !/^(tu-id|your-|example|placeholder)/i.test(cookiebotId)
  );

  return (
    <div className="section-shell max-w-4xl">
      <h1 className="page-title">Política de Cookies</h1>
      <p className="lead mt-4">Tenlo utiliza cookies técnicas para que la plataforma funcione correctamente. Las cookies de analítica solo se activarán cuando exista consentimiento.</p>

      <div className="mt-10 space-y-10 text-base leading-8 text-slatecopy">
        <section>
          <h2 className="text-xl font-bold text-ink">¿Qué son las cookies?</h2>
          <p className="mt-4">
            Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando visitas casi cualquier página web. Su utilidad es que la web sea capaz de recordar tu visita cuando vuelvas a navegar por esa página.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink">Cookies utilizadas en Tenlo</h2>
          <ul className="mt-4 list-disc pl-5 space-y-3">
            <li><strong>Cookies técnicas:</strong> necesarias para sesión, seguridad, preferencias básicas y funcionamiento de la cuenta.</li>
            <li><strong>Cookies de análisis:</strong> nos ayudan a medir uso agregado de la web mediante herramientas como Google Tag Manager o GA4, siempre condicionadas al consentimiento cuando proceda.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink">Cómo gestionar las cookies</h2>
          <p className="mt-4">
            Puedes aceptar, rechazar o cambiar las cookies no técnicas desde el gestor de consentimiento, además de restringirlas o borrarlas desde tu navegador.
          </p>
          {hasValidCookiebotId ? <CookieSettingsButton /> : null}
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink">Gestor de consentimiento</h2>
          <p className="mt-4">
            {hasValidCookiebotId
              ? "Tenlo utiliza Cookiebot para recoger y conservar las preferencias. Google Tag Manager y GA4 parten con el almacenamiento analítico y publicitario denegado y solo actualizan su estado según la elección comunicada por el gestor."
              : "Tenlo tiene preparada la integración con un gestor de consentimiento. Hasta que se active y valide en producción, no se cargarán etiquetas de analítica que requieran consentimiento."}
          </p>
        </section>
      </div>
    </div>
  );
}
