import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies | Tenlo",
  description: "Información sobre el uso de cookies en la plataforma Tenlo."
};

export default function CookiesPolicyPage() {
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
            Puedes restringir, bloquear o borrar las cookies desde tu navegador. Cuando activemos el gestor de consentimiento, Tenlo mostrará un panel para aceptar, rechazar o modificar preferencias de cookies no técnicas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink">Gestor de consentimiento</h2>
          <p className="mt-4">
            La arquitectura está preparada para usar Cookiebot como gestor de consentimiento. Si se configura, las etiquetas de analítica deberán respetar el consentimiento declarado por el usuario.
          </p>
        </section>
      </div>
    </div>
  );
}
