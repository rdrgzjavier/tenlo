import type { Metadata } from "next";
import { Suspense } from "react";
import PasswordResetForm from "@/components/PasswordResetForm";

export const metadata: Metadata = {
  title: "Crear nueva contraseña | Tenlo",
  description: "Crea una nueva contraseña para recuperar el acceso a Tenlo.",
  robots: { index: false, follow: false }
};

export default function ResetPasswordPage() {
  return <Suspense><PasswordResetForm /></Suspense>;
}
