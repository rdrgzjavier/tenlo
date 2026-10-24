import { NextResponse } from "next/server";
import { categories, municipalities } from "@/lib/mock-data";
import { ADMIN_EMAIL, escapeHtml, rows, sendMail, tenloEmailShell } from "@/lib/mail";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicationTypes = new Set(["service_offer", "family_resource", "community_content", "informational_profile"]);
const sources = new Set(["official_source", "third_party_public_source"]);
const categoryNames = new Set(categories.map((category) => category.name));
const municipalityNames = new Set(municipalities.map((municipality) => municipality.name));

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const value = (key: string, max: number) => String(body?.[key] || "").trim().slice(0, max);
  const submissionType = value("publicationType", 60);
  const category = value("category", 100);
  const municipality = value("municipality", 100);
  const title = value("title", 160);
  const description = value("description", 3000);
  const source = value("source", 60);
  const contact = value("contact", 180);

  if (body?.adultConfirmation !== true) return NextResponse.json({ error: "Debes confirmar las normas de publicación." }, { status: 400 });
  if (!publicationTypes.has(submissionType) || !categoryNames.has(category) || !municipalityNames.has(municipality) || !sources.has(source)) return NextResponse.json({ error: "Revisa el tipo, la categoría, la zona y la fuente." }, { status: 400 });
  if (title.length < 5 || description.length < 20 || !contact) return NextResponse.json({ error: "Completa el título, la descripción y el contacto." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Debes iniciar sesión para enviar una publicación." }, { status: 401 });

  const payload = {
    publication_type: submissionType,
    category,
    municipality,
    title,
    description,
    center: value("center", 180),
    recommended_age: value("recommendedAge", 80),
    price: value("price", 40),
    contact,
    source
  };
  const { data: submission, error: insertError } = await supabase.from("submissions").insert({ user_id: authData.user.id, submission_type: submissionType, payload }).select("id").single();
  if (insertError) {
    console.error("No se pudo registrar la publicación", insertError.code);
    return NextResponse.json({ error: "No hemos podido enviar la publicación a revisión." }, { status: 400 });
  }

  const { error: activityError } = await supabase.rpc("record_profile_activity", { next_onboarding_status: null });
  if (activityError) console.error("No se pudo registrar la actividad de la publicación", activityError.code);

  const adminHtml = tenloEmailShell("Nueva publicación pendiente", rows({
    Tipo: submissionType,
    Categoría: category,
    Zona: municipality,
    Título: title,
    Descripción: description,
    "Centro relacionado": payload.center,
    "Edad recomendada": payload.recommended_age,
    Precio: payload.price,
    Contacto: contact,
    Fuente: source,
    "Referencia interna": submission.id
  }));
  try {
    await sendMail({ to: ADMIN_EMAIL, subject: `PUBLICACIÓN PENDIENTE + ${title}`, html: adminHtml, replyTo: /^\S+@\S+\.\S+$/.test(contact) ? contact : authData.user.email || undefined });
    if (authData.user.email) {
      await sendMail({ to: authData.user.email, subject: "Publicación recibida en Tenlo", html: tenloEmailShell("Publicación recibida", `<p style="margin:0 0 14px;line-height:1.6">Hemos recibido <strong>${escapeHtml(title)}</strong> y queda pendiente de revisión.</p><p style="margin:0;line-height:1.6">Puedes consultar el estado desde <a href="https://tenlo.es/mis-publicaciones">Mis publicaciones</a>. No se publicará ningún contenido sin revisión previa.</p>`) });
    }
  } catch (mailError) {
    console.error("Publicación guardada, pero no se pudo enviar el aviso", mailError);
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
