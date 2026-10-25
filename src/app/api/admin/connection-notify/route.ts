import { NextResponse } from "next/server";
import { ADMIN_EMAIL, escapeHtml, sendMail, tenloEmailShell } from "@/lib/mail";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Formato no válido." }, { status: 415 });
  }

  const body = (await request.json().catch(() => null)) as { recordId?: unknown } | null;
  const recordId = String(body?.recordId || "");
  if (!/^[0-9a-f-]{36}$/i.test(recordId)) {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });

  const { data: adminProfile, error: adminError } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (adminError || adminProfile?.role !== "tenlo_admin" || adminProfile.status !== "approved") {
    return NextResponse.json({ error: "No tienes permiso para avisar a proveedores." }, { status: 403 });
  }

  const { data: connectionRequest, error: requestError } = await supabase
    .from("connection_requests")
    .select("provider_id,target_id,category_id,municipality,status,provider_notified_at")
    .eq("id", recordId)
    .maybeSingle();
  if (requestError) {
    console.error("No se pudo consultar la solicitud antes de avisar", requestError);
    return NextResponse.json({ error: "No hemos podido consultar la solicitud." }, { status: 500 });
  }
  if (!connectionRequest) return NextResponse.json({ error: "La solicitud ya no está disponible." }, { status: 404 });
  if (!connectionRequest.provider_id) {
    return NextResponse.json({ error: "Esta solicitud todavía no está asociada a una ficha profesional gestionada." }, { status: 409 });
  }
  if (connectionRequest.provider_notified_at) {
    return NextResponse.json({ error: "El proveedor ya fue avisado de esta solicitud." }, { status: 409 });
  }

  const { data: businessProfile, error: businessError } = await supabase
    .from("business_profiles")
    .select("business_name,contact_email,owner_id,status,accepts_requests")
    .eq("id", connectionRequest.provider_id)
    .maybeSingle();
  if (businessError) {
    console.error("No se pudo consultar la ficha profesional de la solicitud", businessError);
    return NextResponse.json({ error: "No hemos podido consultar la ficha profesional." }, { status: 500 });
  }
  if (!businessProfile || businessProfile.status !== "approved" || !businessProfile.accepts_requests) {
    return NextResponse.json({ error: "La ficha no está aprobada o no acepta solicitudes." }, { status: 409 });
  }

  let recipient = businessProfile.contact_email;
  if (!recipient) {
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("contact_email")
      .eq("id", businessProfile.owner_id)
      .maybeSingle();
    recipient = ownerProfile?.contact_email ?? null;
  }
  if (!recipient) return NextResponse.json({ error: "La ficha no tiene un email de contacto disponible." }, { status: 409 });

  const html = tenloEmailShell(
    "Tienes una nueva solicitud en Tenlo",
    `<p style="margin:0 0 14px;line-height:1.6">Una familia ha enviado una solicitud a <strong>${escapeHtml(businessProfile.business_name)}</strong>.</p><p style="margin:0 0 14px;line-height:1.6">Puedes consultar la necesidad y responder desde tu bandeja privada. Tenlo no mostrará en ella la identidad, el email ni el teléfono de la familia.</p><p style="margin:20px 0"><a href="https://tenlo.es/solicitudes-profesionales" style="display:inline-block;border-radius:10px;background:#5B46FF;color:#fff;padding:12px 18px;font-weight:700;text-decoration:none">Revisar solicitud</a></p><p style="margin:0;color:#475569;font-size:14px;line-height:1.6">Categoría: ${escapeHtml(connectionRequest.category_id || "No indicada")} · Zona: ${escapeHtml(connectionRequest.municipality || "No indicada")}</p>`
  );

  try {
    const result = await sendMail({
      to: recipient,
      subject: `Nueva solicitud para ${businessProfile.business_name}`,
      html,
      replyTo: ADMIN_EMAIL
    });
    if (!result.sent) return NextResponse.json({ error: "No se ha enviado el email porque el proveedor de correo no está configurado." }, { status: 503 });
  } catch (error) {
    console.error("No se pudo avisar al proveedor", error);
    return NextResponse.json({ error: "No hemos podido enviar el aviso al proveedor." }, { status: 502 });
  }

  const now = new Date().toISOString();
  const nextStatus = connectionRequest.status === "submitted" ? "delivered" : connectionRequest.status;
  const { data: updatedRequest, error: updateError } = await supabase
    .from("connection_requests")
    .update({ provider_notified_at: now, status: nextStatus, last_family_update_at: now })
    .eq("id", recordId)
    .is("provider_notified_at", null)
    .select("id")
    .maybeSingle();
  if (updateError || !updatedRequest) {
    console.error("El aviso se envió, pero no se pudo registrar", updateError);
    return NextResponse.json({ error: "El email se ha enviado, pero no se pudo registrar el aviso. Revisa la solicitud antes de repetirlo." }, { status: 500 });
  }

  const { error: noteError } = await supabase.from("admin_queue_notes").insert({
    queue: "connection",
    record_id: recordId,
    note: `Aviso enviado al titular de ${businessProfile.business_name}.`,
    created_by: authData.user.id
  });
  if (noteError) console.error("El aviso se registró, pero no se pudo añadir la nota", noteError);

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
