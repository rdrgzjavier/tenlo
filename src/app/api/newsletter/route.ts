import { NextResponse } from "next/server";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const data = await request.json().catch(() => null) as { email?: unknown; consent?: unknown; website?: unknown } | null;
  const email = String(data?.email || "").trim().toLowerCase().slice(0, 180);

  if (String(data?.website || "").trim()) {
    return NextResponse.json({ ok: true });
  }
  if (!emailPattern.test(email)) {
    return NextResponse.json({ ok: false, error: "Introduce un email válido." }, { status: 400 });
  }
  if (data?.consent !== true) {
    return NextResponse.json({ ok: false, error: "Necesitamos tu consentimiento para enviarte novedades." }, { status: 400 });
  }
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json({ ok: false, error: "La suscripción no está disponible temporalmente." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({
    email,
    source: "home_newsletter"
  });

  if (error && error.code !== "23505") {
    console.error("No se pudo guardar la suscripción a la newsletter", error.code);
    return NextResponse.json({ ok: false, error: "No hemos podido guardar tu suscripción. Inténtalo de nuevo." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
