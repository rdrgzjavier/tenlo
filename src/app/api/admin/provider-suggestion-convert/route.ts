import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "Formato no válido." }, { status: 415 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const text = (key: string, max: number) => String(body?.[key] || "").trim().slice(0, max);
  const targetId = text("targetId", 80); const name = text("name", 160); const website = text("website", 500);
  const municipality = text("municipality", 160); const category = text("category", 160); const description = text("description", 2000);
  if (!targetId || name.length < 2 || municipality.length < 2 || category.length < 2 || description.length < 20) return NextResponse.json({ error: "Completa los datos revisados antes de crear la ficha." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", authData.user.id).maybeSingle();
  if (profile?.role !== "tenlo_admin" || profile.status !== "approved") return NextResponse.json({ error: "No tienes permiso para crear la ficha." }, { status: 403 });
  const { data, error } = await supabase.rpc("convert_provider_suggestion", {
    target_id: targetId, reviewed_name: name, reviewed_website: website,
    reviewed_municipality: municipality, reviewed_category: category, reviewed_description: description
  });
  if (error) {
    console.error("No se pudo convertir la propuesta", error.code);
    const duplicate = error.message?.includes("Provider already exists");
    return NextResponse.json({ error: duplicate ? "Ya existe una ficha con ese nombre y municipio." : "No hemos podido crear la ficha revisada." }, { status: duplicate ? 409 : 400 });
  }
  return NextResponse.json({ ok: true, profileId: data }, { headers: { "Cache-Control": "no-store" } });
}
