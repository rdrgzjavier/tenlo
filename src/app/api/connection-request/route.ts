import { NextResponse } from "next/server";
import { findListing } from "@/lib/mock-data";
import { ADMIN_EMAIL, rows, sendMail, tenloEmailShell } from "@/lib/mail";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const contactPreferences = new Set(["tenlo", "email", "phone"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { targetId?: unknown; message?: unknown; contactPreference?: unknown; adultConfirmation?: unknown } | null;
  const targetId = String(body?.targetId || "").trim();
  const message = String(body?.message || "").trim();
  const contactPreference = String(body?.contactPreference || "tenlo");

  if (body?.adultConfirmation !== true) return NextResponse.json({ error: "Debes confirmar que eres una persona adulta." }, { status: 400 });
  if (message.length < 10 || message.length > 1500) return NextResponse.json({ error: "El mensaje debe tener entre 10 y 1.500 caracteres." }, { status: 400 });
  if (!contactPreferences.has(contactPreference)) return NextResponse.json({ error: "Selecciona un canal de contacto válido." }, { status: 400 });

  const listing = findListing(targetId);
  if (!listing) return NextResponse.json({ error: "La ficha indicada no existe." }, { status: 404 });

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Necesitas iniciar sesión para enviar la solicitud." }, { status: 401 });

  const eventId = crypto.randomUUID();
  const { error: insertError } = await supabase.from("connection_requests").insert({
    event_id: eventId,
    schema_version: "1.0",
    family_id: authData.user.id,
    target_type: "listing",
    target_id: listing.id,
    category_id: listing.categoryId,
    municipality: listing.municipality,
    message,
    contact_preference: contactPreference,
    adult_confirmation: true,
    status: "submitted"
  });
  if (insertError) {
    console.error("No se pudo registrar la solicitud", insertError.code);
    return NextResponse.json({ error: "No hemos podido enviar la solicitud. Inténtalo de nuevo." }, { status: 400 });
  }

  const { data: profile } = await supabase.from("profiles").select("public_name,display_name,contact_email,phone").eq("id", authData.user.id).maybeSingle();
  const familyEmail = profile?.contact_email || authData.user.email || null;
  const adminHtml = tenloEmailShell("Nueva solicitud protegida", rows({
    Ficha: listing.title,
    Categoría: listing.categoryId,
    Municipio: listing.municipality,
    "Canal preferido": contactPreference,
    "Nombre de cuenta": profile?.public_name || profile?.display_name,
    "Email de cuenta": familyEmail,
    "Teléfono de cuenta": profile?.phone,
    Mensaje: message
  }));

  let emailSent = false;
  try {
    const adminResult = await sendMail({ to: ADMIN_EMAIL, subject: `NUEVA SOLICITUD + ${listing.title}`, html: adminHtml, replyTo: familyEmail || undefined });
    if (familyEmail) {
      const userHtml = tenloEmailShell("Solicitud recibida", `<p style="margin:0 0 14px;line-height:1.6">Hemos registrado tu solicitud para <strong>${listing.title}</strong>.</p><p style="margin:0;line-height:1.6">Puedes seguir su estado y consultar la respuesta desde <a href="https://tenlo.es/solicitudes">Mis solicitudes</a>. Nuestro objetivo durante el piloto es responder u ofrecer una alternativa en un máximo de 48 horas.</p>`);
      await sendMail({ to: familyEmail, subject: "Hemos recibido tu solicitud en Tenlo", html: userHtml });
    }
    emailSent = adminResult.sent;
  } catch (mailError) {
    console.error("Solicitud guardada, pero no se pudo enviar el aviso", mailError);
  }

  return NextResponse.json({ ok: true, eventId, emailSent }, { headers: { "Cache-Control": "no-store" } });
}
