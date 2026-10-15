import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const moderationStatuses = new Set(["pending_review", "approved", "rejected", "archived"]);
const connectionStatuses = new Set(["submitted", "delivered", "viewed", "responded", "declined", "alternative_requested", "alternative_offered", "closed"]);

type QueueType = "claim" | "connection" | "submission" | "feedback";

function validStatus(queue: QueueType, status: string) {
  return queue === "connection" ? connectionStatuses.has(status) : moderationStatuses.has(status);
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Formato no válido." }, { status: 415 });
  }

  const body = (await request.json().catch(() => null)) as { queue?: QueueType; recordId?: string; status?: string } | null;
  if (!body?.queue || !["claim", "connection", "submission", "feedback"].includes(body.queue) || !body.recordId || !body.status || !validStatus(body.queue, body.status)) {
    return NextResponse.json({ error: "Datos de actualización no válidos." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role,status").eq("id", authData.user.id).maybeSingle();
  if (profileError || profile?.role !== "tenlo_admin" || profile.status !== "approved") {
    return NextResponse.json({ error: "No tienes permiso para actualizar la cola." }, { status: 403 });
  }

  let result;
  if (body.queue === "claim") result = await supabase.from("claim_requests").update({ status: body.status }).eq("id", body.recordId).select("id").maybeSingle();
  else if (body.queue === "connection") result = await supabase.from("connection_requests").update({ status: body.status }).eq("id", body.recordId).select("id").maybeSingle();
  else if (body.queue === "submission") result = await supabase.from("submissions").update({ status: body.status }).eq("id", body.recordId).select("id").maybeSingle();
  else result = await supabase.from("feedback_requests").update({ status: body.status }).eq("id", body.recordId).select("id").maybeSingle();

  if (result.error) {
    console.error("No se pudo actualizar la cola administrativa", result.error);
    return NextResponse.json({ error: "No hemos podido guardar el estado." }, { status: 500 });
  }
  if (!result.data) return NextResponse.json({ error: "La tarea no existe o ya no está disponible." }, { status: 404 });

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
