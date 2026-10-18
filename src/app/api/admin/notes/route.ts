import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const queues = new Set(["claim", "connection", "submission", "feedback"]);

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Formato no válido." }, { status: 415 });
  }

  const body = (await request.json().catch(() => null)) as { queue?: string; recordId?: string; note?: string } | null;
  const queue = String(body?.queue || "");
  const recordId = String(body?.recordId || "");
  const note = String(body?.note || "").trim();
  if (!queues.has(queue) || !/^[0-9a-f-]{36}$/i.test(recordId) || note.length < 2 || note.length > 2000) {
    return NextResponse.json({ error: "Revisa la nota antes de guardarla." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role,status").eq("id", authData.user.id).maybeSingle();
  if (profileError || profile?.role !== "tenlo_admin" || profile.status !== "approved") {
    return NextResponse.json({ error: "No tienes permiso para añadir notas." }, { status: 403 });
  }

  const { error } = await supabase.from("admin_queue_notes").insert({
    queue: queue as "claim" | "connection" | "submission" | "feedback",
    record_id: recordId,
    note,
    created_by: authData.user.id
  });
  if (error) {
    console.error("No se pudo guardar la nota administrativa", error);
    return NextResponse.json({ error: "No hemos podido guardar la nota." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

