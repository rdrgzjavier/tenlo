import { NextResponse } from "next/server";
import { ADMIN_EMAIL, escapeHtml, sendMail, tenloEmailShell } from "@/lib/mail";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "Formato no válido." }, { status: 415 });
  const body = (await request.json().catch(() => null)) as { recordId?: unknown } | null;
  const recordId = String(body?.recordId || "");
  if (!/^[0-9a-f-]{36}$/i.test(recordId)) return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  const { data: admin } = await supabase.from("profiles").select("role,status").eq("id", authData.user.id).maybeSingle();
  if (admin?.role !== "tenlo_admin" || admin.status !== "approved") return NextResponse.json({ error: "No tienes permiso para enviar recordatorios." }, { status: 403 });

  const { data: connection, error: connectionError } = await supabase.from("connection_requests")
    .select("provider_id,category_id,municipality,status,provider_notified_at,provider_reminded_at")
    .eq("id", recordId).maybeSingle();
  if (connectionError) return NextResponse.json({ error: "No hemos podido consultar la solicitud." }, { status: 500 });
  if (!connection?.provider_id || !connection.provider_notified_at) return NextResponse.json({ error: "Primero debes enviar el aviso inicial al proveedor." }, { status: 409 });
  if (connection.provider_reminded_at) return NextResponse.json({ error: "Esta solicitud ya tiene un recordatorio registrado." }, { status: 409 });
  if (!new Set(["delivered", "viewed"]).has(connection.status)) return NextResponse.json({ error: "La solicitud ya no está pendiente de respuesta." }, { status: 409 });
  const eligibleAt = new Date(connection.provider_notified_at).getTime() + 48 * 60 * 60 * 1000;
  if (Date.now() < eligibleAt) return NextResponse.json({ error: "El recordatorio estará disponible 48 horas después del aviso inicial." }, { status: 409 });

  const { data: business } = await supabase.from("business_profiles")
    .select("business_name,contact_email,owner_id,status,accepts_requests")
    .eq("id", connection.provider_id).maybeSingle();
  if (!business || business.status !== "approved" || !business.accepts_requests) return NextResponse.json({ error: "La ficha ya no está disponible para recibir solicitudes." }, { status: 409 });
  let recipient = business.contact_email;
  if (!recipient && business.owner_id) {
    const { data: owner } = await supabase.from("profiles").select("contact_email").eq("id", business.owner_id).maybeSingle();
    recipient = owner?.contact_email ?? null;
  }
  if (!recipient) return NextResponse.json({ error: "La ficha no tiene un email de contacto." }, { status: 409 });

  const html = tenloEmailShell("Recordatorio de solicitud pendiente", `<p style="margin:0 0 14px;line-height:1.6">Tienes una solicitud pendiente de respuesta para <strong>${escapeHtml(business.business_name)}</strong>.</p><p style="margin:0 0 14px;line-height:1.6">Indica si puedes atenderla o si no tienes disponibilidad. La familia recibirá tu respuesta dentro de Tenlo sin que veas sus datos de contacto.</p><p style="margin:20px 0"><a href="https://tenlo.es/solicitudes-profesionales" style="display:inline-block;border-radius:10px;background:#5B46FF;color:#fff;padding:12px 18px;font-weight:700;text-decoration:none">Responder solicitud</a></p><p style="margin:0;color:#475569;font-size:14px;line-height:1.6">Categoría: ${escapeHtml(connection.category_id || "No indicada")} · Zona: ${escapeHtml(connection.municipality || "No indicada")}</p>`);
  try {
    const result = await sendMail({ to: recipient, subject: `Solicitud pendiente para ${business.business_name}`, html, replyTo: ADMIN_EMAIL });
    if (!result.sent) return NextResponse.json({ error: "El servicio de correo no está configurado." }, { status: 503 });
  } catch (error) {
    console.error("No se pudo recordar la solicitud al proveedor", error);
    return NextResponse.json({ error: "No hemos podido enviar el recordatorio." }, { status: 502 });
  }

  const { data: updated, error: updateError } = await supabase.rpc("record_provider_request_reminder", { target_request_id: recordId });
  if (updateError || !updated) return NextResponse.json({ error: "El email se envió, pero no se pudo registrar. No lo repitas sin revisar." }, { status: 500 });
  await supabase.from("admin_queue_notes").insert({ queue: "connection", record_id: recordId, note: `Recordatorio enviado al titular de ${business.business_name}.`, created_by: authData.user.id });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
