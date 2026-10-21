import { NextResponse } from "next/server";
import { ADMIN_EMAIL, escapeHtml, sendMail, tenloEmailShell } from "@/lib/mail";
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

  let claimBeforeUpdate: { entity_name: string; requester_email: string; status: string } | null = null;
  if (body.queue === "claim") {
    const { data, error } = await supabase
      .from("claim_requests")
      .select("entity_name,requester_email,status")
      .eq("id", body.recordId)
      .maybeSingle();
    if (error) {
      console.error("No se pudo consultar la reclamación antes de actualizarla", error);
      return NextResponse.json({ error: "No hemos podido consultar la reclamación." }, { status: 500 });
    }
    claimBeforeUpdate = data;
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

  let notificationSent: boolean | null = null;
  if (
    body.queue === "claim" &&
    claimBeforeUpdate &&
    claimBeforeUpdate.status !== body.status &&
    ["approved", "rejected"].includes(body.status)
  ) {
    const approved = body.status === "approved";
    const entityName = escapeHtml(claimBeforeUpdate.entity_name);
    const subject = approved ? "Tu solicitud para gestionar una ficha ha sido aprobada" : "Actualización sobre tu solicitud de ficha";
    const html = tenloEmailShell(
      approved ? "Solicitud aprobada" : "No hemos podido aprobar la solicitud",
      approved
        ? `<p style="margin:0 0 14px;line-height:1.6">Hemos aprobado tu solicitud para gestionar la ficha de <strong>${entityName}</strong>.</p><p style="margin:0;line-height:1.6">El equipo de Tenlo revisará contigo la información que debe quedar publicada. Si necesitas aportar algún dato adicional, responde a este email.</p>`
        : `<p style="margin:0 0 14px;line-height:1.6">Con la información disponible no hemos podido aprobar tu solicitud para gestionar la ficha de <strong>${entityName}</strong>.</p><p style="margin:0;line-height:1.6">Si puedes aportar documentación o contexto adicional, responde a este email para que podamos revisarla de nuevo.</p>`
    );

    try {
      const notification = await sendMail({
        to: claimBeforeUpdate.requester_email,
        subject,
        html,
        replyTo: ADMIN_EMAIL
      });
      notificationSent = notification.sent;
    } catch (error) {
      notificationSent = false;
      console.error("El estado se actualizó, pero no se pudo avisar al solicitante", error);
    }
  }

  return NextResponse.json({ ok: true, notificationSent }, { headers: { "Cache-Control": "no-store" } });
}
