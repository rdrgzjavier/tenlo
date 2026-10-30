import { NextResponse } from "next/server";
import { ADMIN_EMAIL, escapeHtml, sendMail, tenloEmailShell } from "@/lib/mail";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const moderationStatuses = new Set(["pending_review", "approved", "rejected", "archived"]);
const connectionStatuses = new Set(["submitted", "delivered", "viewed", "responded", "declined", "alternative_requested", "alternative_offered", "closed"]);

type QueueType = "claim" | "connection" | "submission" | "feedback" | "business_profile";
type SubmissionReviewSnapshot = { submission_type: string; payload: Record<string, unknown>; status: string; user_id: string | null; contact_email?: string | null };

function validStatus(queue: QueueType, status: string) {
  return queue === "connection" ? connectionStatuses.has(status) : moderationStatuses.has(status);
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Formato no válido." }, { status: 415 });
  }

  const body = (await request.json().catch(() => null)) as { queue?: QueueType; recordId?: string; status?: string } | null;
  if (!body?.queue || !["claim", "connection", "submission", "feedback", "business_profile"].includes(body.queue) || !body.recordId || !body.status || !validStatus(body.queue, body.status)) {
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
  let businessBeforeUpdate: { business_name: string; contact_email: string | null; owner_id: string; status: string } | null = null;
  let submissionBeforeUpdate: SubmissionReviewSnapshot | null = null;
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
  if (body.queue === "business_profile") {
    const { data, error } = await supabase
      .from("business_profiles")
      .select("business_name,contact_email,owner_id,status")
      .eq("id", body.recordId)
      .maybeSingle();
    if (error) {
      console.error("No se pudo consultar la ficha profesional antes de actualizarla", error);
      return NextResponse.json({ error: "No hemos podido consultar la ficha profesional." }, { status: 500 });
    }
    businessBeforeUpdate = data;
    if (businessBeforeUpdate && !businessBeforeUpdate.contact_email) {
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("contact_email")
        .eq("id", businessBeforeUpdate.owner_id)
        .maybeSingle();
      businessBeforeUpdate.contact_email = ownerProfile?.contact_email ?? null;
    }
  }
  if (body.queue === "submission") {
    const { data, error } = await supabase
      .from("submissions")
      .select("submission_type,payload,status,user_id")
      .eq("id", body.recordId)
      .maybeSingle();
    if (error) {
      console.error("No se pudo consultar la solicitud antes de actualizarla", error);
      return NextResponse.json({ error: "No hemos podido consultar la solicitud." }, { status: 500 });
    }
    submissionBeforeUpdate = data as SubmissionReviewSnapshot | null;
    if (submissionBeforeUpdate?.user_id && submissionBeforeUpdate.submission_type !== "account_deletion") {
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("contact_email")
        .eq("id", submissionBeforeUpdate.user_id)
        .maybeSingle();
      submissionBeforeUpdate.contact_email = ownerProfile?.contact_email ?? null;
    }
  }

  let result;
  if (body.queue === "claim") result = await supabase.from("claim_requests").update({ status: body.status }).eq("id", body.recordId).select("id").maybeSingle();
  else if (body.queue === "connection") result = await supabase.from("connection_requests").update({ status: body.status }).eq("id", body.recordId).select("id").maybeSingle();
  else if (body.queue === "submission") result = await supabase.from("submissions").update({ status: body.status }).eq("id", body.recordId).select("id").maybeSingle();
  else if (body.queue === "business_profile") {
    const rpcResult = await supabase.rpc("moderate_business_profile", { target_id: body.recordId, next_status: body.status });
    result = { data: rpcResult.data ? { id: body.recordId } : null, error: rpcResult.error };
  }
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

  if (
    body.queue === "business_profile" &&
    businessBeforeUpdate &&
    businessBeforeUpdate.contact_email &&
    businessBeforeUpdate.status !== body.status &&
    ["approved", "rejected"].includes(body.status)
  ) {
    const approved = body.status === "approved";
    const businessName = escapeHtml(businessBeforeUpdate.business_name);
    const subject = approved ? "Tu ficha profesional de Tenlo ha sido aprobada" : "Actualización sobre tu ficha profesional en Tenlo";
    const html = tenloEmailShell(
      approved ? "Ficha profesional aprobada" : "Tu ficha necesita una nueva revisión",
      approved
        ? `<p style="margin:0 0 14px;line-height:1.6">Hemos aprobado la ficha profesional de <strong>${businessName}</strong>.</p><p style="margin:0;line-height:1.6">La confianza y la verificación se revisan por separado. Si todavía falta definir algún servicio antes de publicarlo, el equipo de Tenlo contactará contigo.</p>`
        : `<p style="margin:0 0 14px;line-height:1.6">No hemos podido aprobar por ahora la ficha profesional de <strong>${businessName}</strong>.</p><p style="margin:0;line-height:1.6">Responde a este email si quieres aportar información o corregir los datos para que podamos revisarla de nuevo.</p>`
    );

    try {
      const notification = await sendMail({
        to: businessBeforeUpdate.contact_email,
        subject,
        html,
        replyTo: ADMIN_EMAIL
      });
      notificationSent = notification.sent;
    } catch (error) {
      notificationSent = false;
      console.error("El estado de la ficha se actualizó, pero no se pudo avisar al titular", error);
    }
  }

  if (
    body.queue === "submission" &&
    submissionBeforeUpdate?.submission_type === "account_deletion" &&
    submissionBeforeUpdate.status !== body.status &&
    ["approved", "rejected"].includes(body.status)
  ) {
    const payload = submissionBeforeUpdate.payload;
    const email = typeof payload.email === "string" && /^\S+@\S+\.\S+$/.test(payload.email) ? payload.email : null;
    const displayName = escapeHtml(typeof payload.display_name === "string" ? payload.display_name : "");
    const completed = body.status === "approved";
    if (email) {
      try {
        const notification = await sendMail({
          to: email,
          subject: completed ? "Tu baja de Tenlo ha sido completada" : "Actualización sobre tu solicitud de baja",
          html: tenloEmailShell(
            completed ? "Baja completada" : "La solicitud de baja no se ha completado",
            completed
              ? `<p style="margin:0 0 14px;line-height:1.6">${displayName ? `${displayName}, hemos` : "Hemos"} completado la baja solicitada y aplicado la eliminación o anonimización correspondiente.</p><p style="margin:0;line-height:1.6">Si necesitas ejercer otro derecho o pedir aclaraciones, responde a este email.</p>`
              : `<p style="margin:0 0 14px;line-height:1.6">${displayName ? `${displayName}, no hemos` : "No hemos"} podido completar la baja con la información disponible.</p><p style="margin:0;line-height:1.6">Responde a este email para que podamos revisar el caso contigo.</p>`
          ),
          replyTo: ADMIN_EMAIL
        });
        notificationSent = notification.sent;
      } catch (error) {
        notificationSent = false;
        console.error("El estado de la baja se actualizó, pero no se pudo avisar a la cuenta", error);
      }
    }
  }

  if (
    body.queue === "submission" &&
    submissionBeforeUpdate &&
    submissionBeforeUpdate.submission_type !== "account_deletion" &&
    submissionBeforeUpdate.status !== body.status &&
    ["approved", "rejected"].includes(body.status)
  ) {
    const payload = submissionBeforeUpdate.payload;
    const payloadContact = typeof payload.contact === "string" && /^\S+@\S+\.\S+$/.test(payload.contact) ? payload.contact : null;
    const email = submissionBeforeUpdate.contact_email || payloadContact;
    const title = escapeHtml(typeof payload.title === "string" ? payload.title : "tu publicación");
    const approved = body.status === "approved";
    if (email) {
      try {
        const notification = await sendMail({
          to: email,
          subject: approved ? "Tu publicación de Tenlo ha sido aprobada" : "Actualización sobre tu publicación en Tenlo",
          html: tenloEmailShell(
            approved ? "Publicación aprobada" : "La publicación necesita una nueva revisión",
            approved
              ? `<p style="margin:0 0 14px;line-height:1.6">Hemos aprobado <strong>${title}</strong>.</p><p style="margin:0;line-height:1.6">El equipo de Tenlo mantiene la revisión editorial y la información de confianza separadas. Te avisaremos si necesitamos actualizar algún dato.</p>`
              : `<p style="margin:0 0 14px;line-height:1.6">No hemos podido aprobar por ahora <strong>${title}</strong>.</p><p style="margin:0;line-height:1.6">Responde a este email si quieres aportar información o corregir los datos para que podamos revisarla de nuevo.</p>`
          ),
          replyTo: ADMIN_EMAIL
        });
        notificationSent = notification.sent;
      } catch (error) {
        notificationSent = false;
        console.error("El estado de la publicación se actualizó, pero no se pudo avisar a la cuenta", error);
      }
    }
  }

  return NextResponse.json({ ok: true, notificationSent }, { headers: { "Cache-Control": "no-store" } });
}
