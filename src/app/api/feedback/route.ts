import { NextResponse } from "next/server";
import { ADMIN_EMAIL, rows, sendMail, tenloEmailShell } from "@/lib/mail";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const data = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!data) return NextResponse.json({ ok: false, error: "Solicitud no válida." }, { status: 400 });
  if (String(data.website || "").trim()) {
    return NextResponse.json({ ok: true });
  }
  const message = String(data.message || "").trim();
  const allowedRequestTypes = new Set(["correction", "update", "withdrawal", "unsafe_content", "other"]);
  const requestType = allowedRequestTypes.has(String(data.requestType || "")) ? String(data.requestType) : "";
  const allowedContexts = new Set(["general", "contact_request", "report_listing", "anuncio", "centro", "servicio", "comunidad"]);
  const requestedContext = String(data.context || "general");
  const baseContext = allowedContexts.has(requestedContext) ? requestedContext : "general";
  const requiresRequestType = ["anuncio", "centro", "servicio", "report_listing"].includes(baseContext);

  if (message.length < 10 || message.length > 5000) {
    return NextResponse.json({ ok: false, error: "El mensaje debe tener entre 10 y 5.000 caracteres." }, { status: 400 });
  }
  if (requiresRequestType && !requestType) {
    return NextResponse.json({ ok: false, error: "Selecciona el tipo de solicitud." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  const submittedEmail = String(data.email || "").trim().slice(0, 180);
  const resolvedEmail = submittedEmail || user?.email || null;
  if (resolvedEmail && !/^\S+@\S+\.\S+$/.test(resolvedEmail)) return NextResponse.json({ ok: false, error: "Introduce un email válido." }, { status: 400 });

  const payload = {
    user_id: user?.id ?? null,
    context: `${baseContext}${requestType ? `:${requestType}` : ""}`.slice(0, 80),
    item_id: String(data.itemId || "").slice(0, 140),
    name: String(data.name || "").trim().slice(0, 120) || null,
    email: resolvedEmail,
    message
  };

  const { error } = await supabase.from("feedback_requests").insert(payload);
  if (error) {
    console.error("No se pudo registrar la sugerencia", error.code);
    return NextResponse.json({ ok: false, error: "No hemos podido registrar la solicitud." }, { status: 400 });
  }

  const adminHtml = tenloEmailShell("Nueva sugerencia en Tenlo", rows({
    Contexto: payload.context,
    "Tipo de solicitud": requestType || "No indicado",
    "Elemento relacionado": payload.item_id,
    Nombre: payload.name,
    Email: payload.email,
    Mensaje: payload.message
  }));

  try {
    await sendMail({
      to: ADMIN_EMAIL,
      subject: `SUGERENCIA TENLO · ${payload.context}`,
      html: adminHtml,
      replyTo: payload.email ?? undefined
    });
  } catch (mailError) {
    console.error("Sugerencia guardada, pero no se pudo enviar el email", mailError);
  }

  return NextResponse.json({ ok: true });
}
