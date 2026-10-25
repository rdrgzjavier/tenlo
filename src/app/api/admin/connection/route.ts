import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const statuses = new Set(["submitted", "delivered", "viewed", "responded", "declined", "alternative_requested", "alternative_offered", "closed"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { recordId?: string; status?: string; responseSummary?: string; alternativeSummary?: string } | null;
  const recordId = String(body?.recordId || "");
  const status = String(body?.status || "");
  const responseSummary = String(body?.responseSummary || "").trim();
  const alternativeSummary = String(body?.alternativeSummary || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(recordId) || !statuses.has(status) || responseSummary.length > 1000 || alternativeSummary.length > 1000) {
    return NextResponse.json({ error: "Revisa los datos del seguimiento." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", authData.user.id).maybeSingle();
  if (profile?.role !== "tenlo_admin" || profile.status !== "approved") return NextResponse.json({ error: "No tienes permiso para actualizar solicitudes." }, { status: 403 });

  const { data: existing, error: readError } = await supabase.from("connection_requests").select("status,provider_response_summary,alternative_summary,first_response_at,closed_at").eq("id", recordId).maybeSingle();
  if (readError) return NextResponse.json({ error: "No hemos podido consultar el seguimiento." }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "La solicitud no existe." }, { status: 404 });

  const now = new Date().toISOString();
  const update: Record<string, string | null> = {
    status,
    provider_response_summary: responseSummary || null,
    alternative_summary: alternativeSummary || null
  };
  const familyVisibleChange = existing.status !== status || (existing.provider_response_summary || "") !== responseSummary || (existing.alternative_summary || "") !== alternativeSummary;
  if (familyVisibleChange) update.last_family_update_at = now;
  if (["responded", "declined"].includes(status) && !existing.first_response_at) update.first_response_at = now;
  if (status === "closed" && !existing.closed_at) update.closed_at = now;

  const { data, error } = await supabase.from("connection_requests").update(update).eq("id", recordId).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "No hemos podido guardar el seguimiento." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "La solicitud no existe." }, { status: 404 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

