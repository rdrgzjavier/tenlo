import { NextResponse } from "next/server";
import { ADMIN_EMAIL, rows, sendMail, tenloEmailShell } from "@/lib/mail";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "Formato no válido." }, { status: 415 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const text = (key: string, max: number) => String(body?.[key] || "").trim().slice(0, max);
  const providerName = text("providerName", 160);
  const website = text("website", 500);
  const location = text("location", 160);
  const service = text("service", 160);
  const notes = text("notes", 2000);
  const submitterName = text("name", 120);
  const submitterEmail = text("email", 180);
  if (providerName.length < 2 || location.length < 2) return NextResponse.json({ error: "Indica el nombre y la ubicación." }, { status: 400 });
  if (website && !/^https?:\/\/[^\s]+$/i.test(website)) return NextResponse.json({ error: "La web debe empezar por http:// o https://." }, { status: 400 });
  if (submitterEmail && !/^\S+@\S+\.\S+$/.test(submitterEmail)) return NextResponse.json({ error: "Introduce un email válido." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("provider_suggestions").insert({
    user_id: authData.user?.id ?? null, provider_name: providerName, website: website || null,
    location, service: service || null, notes: notes || null, submitter_name: submitterName || null,
    submitter_email: submitterEmail || authData.user?.email || null
  }).select("id").single();
  if (error) {
    console.error("No se pudo registrar la propuesta de proveedor", error.code);
    return NextResponse.json({ error: "No hemos podido registrar la propuesta." }, { status: 400 });
  }
  try {
    await sendMail({
      to: ADMIN_EMAIL, subject: `PROVEEDOR PROPUESTO · ${providerName}`,
      html: tenloEmailShell("Proveedor propuesto", rows({ Nombre: providerName, Web: website, Ubicación: location, Servicio: service, Notas: notes, "Referencia interna": data.id })),
      replyTo: submitterEmail || authData.user?.email || undefined
    });
  } catch (mailError) { console.error("Propuesta guardada, pero no se pudo enviar el aviso", mailError); }
  return NextResponse.json({ ok: true });
}
