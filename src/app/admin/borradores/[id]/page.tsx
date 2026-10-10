import Link from "next/link";

export default async function DraftReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="section-shell max-w-3xl">
      <p className="label">Borrador pendiente</p>
      <h1 className="page-title">Revisión de publicación</h1>
      <p className="lead">Borrador recibido: {id}</p>
      <div className="mt-8 rounded-2xl border border-line bg-panel p-6">
        <p className="text-sm leading-6 text-muted">Esta pantalla queda preparada para la fase de base de datos y panel privado. Cuando conectemos Supabase, aquí se verá el anuncio completo, se podrá responder al usuario y publicar la ficha.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-secondary" type="button">Dar respuesta</button>
          <button className="btn-primary" type="button">Publicar</button>
          <Link className="btn-secondary" href="/publicar">Volver</Link>
        </div>
      </div>
    </div>
  );
}
