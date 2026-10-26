import type { EmailOtpType } from "@supabase/supabase-js";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirmar acceso | Tenlo",
  description: "Confirma la acción solicitada para tu cuenta de Tenlo.",
  robots: { index: false, follow: false }
};

const supportedTypes = new Set<EmailOtpType>([
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup"
]);

const contentByType: Partial<Record<EmailOtpType, { label: string; title: string; description: string; action: string; next: string }>> = {
  email: {
    label: "Confirmación de cuenta",
    title: "Confirma tu email",
    description: "Confirma que quieres activar tu cuenta de Tenlo.",
    action: "Confirmar mi email",
    next: "/area-personal"
  },
  signup: {
    label: "Confirmación de cuenta",
    title: "Confirma tu email",
    description: "Confirma que quieres activar tu cuenta de Tenlo.",
    action: "Confirmar mi email",
    next: "/area-personal"
  },
  invite: {
    label: "Invitación",
    title: "Acepta tu invitación",
    description: "Confirma la invitación para crear tu contraseña y completar el acceso a Tenlo.",
    action: "Aceptar invitación",
    next: "/completar-invitacion"
  },
  recovery: {
    label: "Recuperación de acceso",
    title: "Restablece tu contraseña",
    description: "Confirma que has solicitado crear una contraseña nueva para tu cuenta de Tenlo.",
    action: "Continuar de forma segura",
    next: "/restablecer-contrasena"
  },
  magiclink: {
    label: "Acceso seguro",
    title: "Entra en Tenlo",
    description: "Confirma que quieres acceder a tu cuenta mediante este enlace.",
    action: "Entrar en Tenlo",
    next: "/area-personal"
  },
  email_change: {
    label: "Cambio de email",
    title: "Confirma tu nuevo email",
    description: "Confirma que quieres utilizar esta dirección en tu cuenta de Tenlo.",
    action: "Confirmar nuevo email",
    next: "/area-personal"
  }
};

function safeType(value: string | undefined) {
  return value && supportedTypes.has(value as EmailOtpType) ? value as EmailOtpType : null;
}

function safeNext(value: string | undefined, fallback: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export default async function ConfirmAuthActionPage({
  searchParams
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>;
}) {
  const params = await searchParams;
  const type = safeType(params.type);
  const content = type ? contentByType[type] : null;
  const validRequest = Boolean(content && params.token_hash);

  return (
    <div className="section-shell">
      <div className="mx-auto max-w-xl card p-6 md:p-8">
        <p className="label">{content?.label ?? "Acceso a Tenlo"}</p>
        <h1 className="detail-title mt-3">{content?.title ?? "El enlace no es válido"}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {content?.description ?? "Solicita un enlace nuevo desde la página de acceso para continuar."}
        </p>

        {validRequest && type && content ? (
          <form action="/auth/callback" method="post" className="mt-6">
            <input type="hidden" name="token_hash" value={params.token_hash} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="next" value={safeNext(params.next, content.next)} />
            <button type="submit" className="btn-primary w-full justify-center sm:w-fit">
              {content.action}
            </button>
          </form>
        ) : (
          <a href="/recuperar-contrasena" className="btn-primary mt-6 w-full justify-center sm:w-fit">
            Solicitar un enlace nuevo
          </a>
        )}

        <p className="mt-5 text-xs leading-5 text-muted">
          Este paso evita que los sistemas automáticos de correo consuman el enlace antes de que lo utilices.
        </p>
      </div>
    </div>
  );
}
