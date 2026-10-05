import type { Metadata } from "next";
import Link from "next/link";
import ClaimProfileForm from "@/components/ClaimProfileForm";
import { findCenter, findProvider } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Gestionar ficha | Tenlo",
  description: "Solicita la gestión, validación o corrección de una ficha de centro, servicio o recurso local en Tenlo."
};

export default function ClaimProfilePage({ searchParams }: { searchParams: { tipo?: string; id?: string } }) {
  const type = searchParams.tipo === "centro" ? "center" : "provider";
  const entity = type === "center" ? findCenter(searchParams.id || "") : findProvider(searchParams.id || "");

  if (!entity) {
    return (
      <div className="section-shell max-w-3xl">
        <p className="label">Gestionar ficha</p>
        <h1 className="page-title">No encontramos la ficha</h1>
        <p className="lead">Vuelve a la ficha original o contacta con Tenlo para proponernos una corrección.</p>
        <Link href="/contacto" className="btn-primary mt-6 w-fit">Contactar con Tenlo</Link>
      </div>
    );
  }

  const entityName = "name" in entity ? entity.name : entity.businessName;

  return (
    <div className="section-shell max-w-4xl">
      <p className="label">Gestionar ficha</p>
      <h1 className="page-title">Solicitar la gestión de {entityName}</h1>
      <p className="lead">
        Si representas este centro, servicio o entidad, puedes revisar la información pública y solicitar su gestión. Tenlo verificará tu relación con la ficha antes de publicar cambios.
      </p>
      <ClaimProfileForm entityType={type} entityId={entity.id} entityName={entityName} />
    </div>
  );
}
