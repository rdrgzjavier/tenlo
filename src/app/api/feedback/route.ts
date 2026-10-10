import { NextResponse } from "next/server";
import { ADMIN_EMAIL, rows, sendMail, tenloEmailShell } from "@/lib/mail";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const data = await request.json();
  const message = String(data.message || "").trim();

  if (message.length < 10) {
    return NextResponse.json({ ok: false, error: "Cuéntanos un poco más para poder revisarlo." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  const payload = {
    user_id: user?.id ?? null,
    context: String(data.context || "general").slice(0, 80),
    item_id: String(data.itemId || "").slice(0, 140),
    name: String(data.name || "").trim().slice(0, 120) || null,
    email: String(data.email || "").trim().slice(0, 180) || user?.email || null,
    message
  };

  const { error } = await supabase.from("feedback_requests").insert(payload);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  const adminHtml = tenloEmailShell("Nueva sugerencia en Tenlo", rows({
    Contexto: payload.context,
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
