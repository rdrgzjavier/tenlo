import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Formato no válido." }, { status: 415 });
  }
  const body = (await request.json().catch(() => null)) as { recordIds?: unknown } | null;
  const recordIds = Array.isArray(body?.recordIds)
    ? [...new Set(body.recordIds.map((value) => String(value)).filter((value) => /^[0-9a-f-]{36}$/i.test(value)))].slice(0, 50)
    : [];
  if (!recordIds.length) return NextResponse.json({ error: "No hay solicitudes válidas." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });

  const results = await Promise.all(recordIds.map((targetRequestId) => supabase.rpc("mark_provider_request_viewed", { target_request_id: targetRequestId })));
  const updated = results.filter((result) => !result.error && result.data === true).length;
  return NextResponse.json({ ok: true, updated }, { headers: { "Cache-Control": "no-store" } });
}
