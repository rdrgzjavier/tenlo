import { NextResponse } from "next/server";
import { ADMIN_EMAIL, escapeHtml, rows, sendMail, tenloEmailShell } from "@/lib/mail";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedRoles = new Set([
  "Titular o dirección",
  "Equipo de administración",
  "Responsable de comunicación",
  "Profesional independiente",
  "Otra relación verificable"
]);

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ ok: false, error: "Formato no válido." }, { status: 415 });
  const data = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!data) return NextResponse.json({ ok: false, error: "Solicitud no válida." }, { status: 400 });
  const eventId = crypto.randomUUID();

  if (data.company) {
    return NextResponse.json({ ok: true });
  }
  if (data.adultConfirmation !== true) return NextResponse.json({ ok: false, error: "Debes confirmar que actúas como persona adulta responsable." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  const value = (key: string, max: number) => String(data[key] || "").trim().slice(0, max);
  const payload = {
    event_id: eventId,
    schema_version: "1.0",
    user_id: user?.id ?? null,
    entity_type: value("entityType", 40),
    entity_id: value("entityId", 160),
    entity_name: value("entityName", 200),
    requester_name: value("requesterName", 120),
    requester_email: value("requesterEmail", 254).toLowerCase(),
    requester_phone: value("requesterPhone", 40),
    role_description: value("roleDescription", 120),
    corrections: value("corrections", 5000),
    official_website: value("officialWebsite", 500),
    image_url: value("imageUrl", 500)
  };

  if (!payload.entity_id || !payload.entity_name || !payload.requester_name || !payload.requester_email || !payload.role_description) {
    return NextResponse.json({ ok: false, error: "Completa los campos obligatorios." }, { status: 400 });
  }

  if (!/^\S+@\S+\.\S+$/.test(payload.requester_email) || payload.requester_email.length > 254) {
    return NextResponse.json({ ok: false, error: "Indica un email profesional válido." }, { status: 400 });
  }

  if (!new Set(["center", "provider", "community"]).has(payload.entity_type)) return NextResponse.json({ ok: false, error: "Tipo de ficha no válido." }, { status: 400 });
  if (!allowedRoles.has(payload.role_description)) return NextResponse.json({ ok: false, error: "Relación con la ficha no válida." }, { status: 400 });
  if (payload.official_website && !/^https?:\/\/[^\s]+$/i.test(payload.official_website)) return NextResponse.json({ ok: false, error: "La web oficial no es válida." }, { status: 400 });
  if (payload.image_url && !/^https?:\/\/[^\s]+$/i.test(payload.image_url)) return NextResponse.json({ ok: false, error: "La referencia de imagen no es válida." }, { status: 400 });

  const { error } = await supabase.from("claim_requests").insert(payload);
  if (error) {
    console.error("No se pudo registrar la reclamación", error.code);
    return NextResponse.json({ ok: false, error: "No hemos podido registrar la solicitud." }, { status: 400 });
  }

  const adminHtml = tenloEmailShell("Solicitud de validación de ficha", rows({
    Ficha: payload.entity_name,
    Tipo: payload.entity_type,
    "ID interno": payload.entity_id,
    "Responsable": payload.requester_name,
    Email: payload.requester_email,
    Teléfono: payload.requester_phone,
    "Relación con la ficha": payload.role_description,
    "Correcciones propuestas": payload.corrections,
    "Web oficial": payload.official_website,
    "Imagen sugerida": payload.image_url
  }));

  const userHtml = tenloEmailShell("Hemos recibido tu solicitud", `
    <p style="margin:0 0 14px;line-height:1.6">Gracias. Hemos recibido tu solicitud para validar la ficha de <strong>${escapeHtml(payload.entity_name)}</strong>.</p>
    <p style="margin:0;line-height:1.6">El equipo de Tenlo revisará la información y verificará tu relación con la ficha antes de publicar cambios visibles. No necesitas crear una cuenta para iniciar la solicitud; te indicaremos por email el siguiente paso.</p>
  `);

  try {
    await sendMail({ to: ADMIN_EMAIL, subject: `VALIDAR FICHA + ${payload.entity_name}`, html: adminHtml, replyTo: payload.requester_email });
    await sendMail({ to: payload.requester_email, subject: "Hemos recibido tu solicitud en Tenlo", html: userHtml });
  } catch (mailError) {
    console.error("Solicitud guardada, pero no se pudo enviar el email", mailError);
  }

  return NextResponse.json({ ok: true, eventId });
}
