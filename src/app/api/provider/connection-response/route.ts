import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const allowedStatuses = new Set(["responded", "declined"]);

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Formato no válido." }, { status: 415 });
  }
  const body = (await request.json().catch(() => null)) as { recordId?: unknown; status?: unknown; responseSummary?: unknown } | null;
  const recordId = String(body?.recordId || "");
  const status = String(body?.status || "");
  const responseSummary = String(body?.responseSummary || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(recordId) || !allowedStatuses.has(status) || responseSummary.length < 10 || responseSummary.length > 1000) {
    return NextResponse.json({ error: "Revisa el estado y escribe una respuesta de entre 10 y 1.000 caracteres." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });

  const { data, error } = await supabase.rpc("respond_to_connection_request", {
    target_request_id: recordId,
    next_status: status,
    response_summary: responseSummary
  });
  if (error) {
    console.error("No se pudo registrar la respuesta del proveedor", error.code);
    return NextResponse.json({ error: "No hemos podido guardar la respuesta. Comprueba que la solicitud siga disponible." }, { status: 400 });
  }
  if (data !== true) return NextResponse.json({ error: "La solicitud no está asignada a una ficha que puedas gestionar." }, { status: 403 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
