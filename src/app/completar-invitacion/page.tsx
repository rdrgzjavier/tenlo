import type { Metadata } from "next";
import { Suspense } from "react";
import InvitationSetupForm from "@/components/InvitationSetupForm";

export const metadata: Metadata = {
  title: "Completar invitación | Tenlo",
  description: "Confirma tu acceso y crea la contraseña de tu cuenta de Tenlo.",
  robots: { index: false, follow: false }
};

export default function CompleteInvitationPage() {
  return (
    <div className="section-shell">
      <div className="mx-auto max-w-xl">
        <Suspense fallback={<section className="card p-6 text-center md:p-8"><p className="text-base font-semibold text-slatecopy">Preparando tu acceso…</p></section>}>
          <InvitationSetupForm />
        </Suspense>
      </div>
    </div>
  );
}
