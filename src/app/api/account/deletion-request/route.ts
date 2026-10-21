import { NextResponse } from "next/server";
import { ADMIN_EMAIL, rows, sendMail, tenloEmailShell } from "@/lib/mail";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { confirmation?: unknown } | null;
  if (String(body?.confirmation || "").trim().toUpperCase() !== "BORRAR") return NextResponse.json({ error: "Escribe BORRAR para solicitar la baja." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "No hemos podido confirmar tu sesión." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("public_name,display_name,contact_email").eq("id", authData.user.id).maybeSingle();
  const email = profile?.contact_email || authData.user.email || null;
  const displayName = profile?.public_name || profile?.display_name || "Cuenta Tenlo";
  const { data: existing } = await supabase.from("submissions").select("id").eq("user_id", authData.user.id).eq("submission_type", "account_deletion").in("status", ["draft", "pending_review"]).limit(1).maybeSingle();
  if (existing) return NextResponse.json({ ok: true, alreadyRequested: true }, { headers: { "Cache-Control": "no-store" } });

  const { data: deletionRequest, error: insertError } = await supabase.from("submissions").insert({
    user_id: authData.user.id,
    submission_type: "account_deletion",
    payload: { email, display_name: displayName, requested_from: "datos-cuenta" }
  }).select("id").single();
  if (insertError) {
    console.error("No se pudo registrar la solicitud de baja", insertError.code);
    return NextResponse.json({ error: "No hemos podido registrar la solicitud de baja." }, { status: 400 });
  }

  try {
    await sendMail({ to: ADMIN_EMAIL, subject: "SOLICITUD DE BAJA DE CUENTA", html: tenloEmailShell("Solicitud de baja de cuenta", rows({ Cuenta: displayName, Email: email, "Referencia interna": deletionRequest.id, "Fecha de solicitud": new Date().toISOString() })) });
    if (email) await sendMail({ to: email, subject: "Solicitud de baja recibida en Tenlo", html: tenloEmailShell("Solicitud de baja recibida", `<p style="margin:0 0 14px;line-height:1.6">Hemos recibido tu solicitud de baja.</p><p style="margin:0;line-height:1.6">La revisaremos antes de eliminar o anonimizar los datos asociados y te comunicaremos la finalización por email.</p>`) });
  } catch (mailError) {
    console.error("Solicitud de baja guardada, pero no se pudo enviar el aviso", mailError);
  }

  return NextResponse.json({ ok: true, alreadyRequested: false }, { headers: { "Cache-Control": "no-store" } });
}
