import { NextResponse } from "next/server";
import { ADMIN_EMAIL, escapeHtml, sendMail, tenloEmailShell } from "@/lib/mail";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Formato no válido." }, { status: 415 });
  }

  const body = (await request.json().catch(() => null)) as { recordId?: unknown; message?: unknown } | null;
  const recordId = String(body?.recordId || "");
  const message = String(body?.message || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(recordId) || message.length < 10 || message.length > 2000) {
    return NextResponse.json({ error: "Escribe una petición concreta de entre 10 y 2.000 caracteres." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role,status").eq("id", authData.user.id).maybeSingle();
  if (profileError || profile?.role !== "tenlo_admin" || profile.status !== "approved") {
    return NextResponse.json({ error: "No tienes permiso para contactar con el titular." }, { status: 403 });
  }

  const { data: businessProfile, error: businessError } = await supabase
    .from("business_profiles")
    .select("business_name,contact_email,owner_id")
    .eq("id", recordId)
    .maybeSingle();
  if (businessError) {
    console.error("No se pudo consultar la ficha profesional", businessError);
    return NextResponse.json({ error: "No hemos podido consultar la ficha profesional." }, { status: 500 });
  }
  if (!businessProfile) return NextResponse.json({ error: "La ficha profesional ya no está disponible." }, { status: 404 });

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

  const { error: noteError } = await supabase.from("admin_queue_notes").insert({
    queue: "business_profile",
    record_id: recordId,
    note: `Información solicitada al titular:\n${message}`,
    created_by: authData.user.id
  });
  if (noteError) {
    console.error("No se pudo registrar la petición de información profesional", noteError);
    return NextResponse.json({ error: "No hemos podido registrar la petición antes de enviarla." }, { status: 500 });
  }

  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const html = tenloEmailShell(
    "Necesitamos ampliar la información",
    `<p style="margin:0 0 14px;line-height:1.6">Para continuar revisando la ficha profesional de <strong>${escapeHtml(businessProfile.business_name)}</strong>, necesitamos esta información:</p><div style="margin:0 0 14px;padding:14px;border-radius:10px;background:#F8FAFC;line-height:1.6">${safeMessage}</div><p style="margin:0;line-height:1.6">Responde a este email con la información solicitada. La ficha seguirá pendiente hasta que terminemos la revisión.</p>`
  );

  try {
    const result = await sendMail({
      to: recipient,
      subject: `Necesitamos información sobre ${businessProfile.business_name}`,
      html,
      replyTo: ADMIN_EMAIL
    });
    if (!result.sent) return NextResponse.json({ error: "La petición quedó registrada, pero el email no se pudo enviar. Contacta manualmente con el titular." }, { status: 503 });
  } catch (error) {
    console.error("La petición profesional quedó registrada, pero el email no se pudo enviar", error);
    return NextResponse.json({ error: "La petición quedó registrada, pero el email no se pudo enviar. Contacta manualmente con el titular." }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
