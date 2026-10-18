import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const outcomes = new Set(["information", "conversation", "proposal", "booking", "hired", "not_progressed"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { requestId?: string; useful?: boolean; outcome?: string } | null;
  const requestId = String(body?.requestId || "");
  const outcome = String(body?.outcome || "");
  if (!/^[0-9a-f-]{36}$/i.test(requestId) || typeof body?.useful !== "boolean" || !outcomes.has(outcome)) {
    return NextResponse.json({ error: "Selecciona una valoración y un resultado." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  const { data: ownedRequest } = await supabase.from("connection_requests").select("id").eq("id", requestId).eq("family_id", authData.user.id).maybeSingle();
  if (!ownedRequest) return NextResponse.json({ error: "No puedes valorar esta solicitud." }, { status: 403 });

  const { error } = await supabase.from("connection_feedback").upsert({ request_id: requestId, family_id: authData.user.id, useful: body.useful, outcome: outcome as "information" | "conversation" | "proposal" | "booking" | "hired" | "not_progressed" }, { onConflict: "request_id" });
  if (error) return NextResponse.json({ error: "No hemos podido guardar la valoración." }, { status: 500 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

