import type { Metadata } from "next";
import PasswordRecoveryRequest from "@/components/PasswordRecoveryRequest";

export const metadata: Metadata = {
  title: "Recuperar contraseña | Tenlo",
  description: "Solicita un enlace seguro para recuperar el acceso a tu cuenta de Tenlo.",
  robots: { index: false, follow: false }
};

export default function RecoverPasswordPage() {
  return <PasswordRecoveryRequest />;
}
