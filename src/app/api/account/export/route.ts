import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }

  const [profile, favorites, submissions, requests, claims] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("favorites").select("target_type,target_id,created_at").eq("user_id", user.id),
    supabase.from("submissions").select("submission_type,payload,status,created_at,updated_at").eq("user_id", user.id),
    supabase.from("connection_requests").select("target_type,target_id,category_id,municipality,status,relevance,useful_connection,created_at,updated_at").eq("family_id", user.id),
    supabase.from("claim_requests").select("entity_type,entity_id,entity_name,role_description,corrections,official_website,image_url,status,created_at,updated_at").eq("user_id", user.id)
  ]);

  const failed = [profile, favorites, submissions, requests, claims].find((result) => result.error);
  if (failed?.error) {
    console.error("No se pudo preparar la exportación de cuenta", failed.error);
    return NextResponse.json({ error: "No hemos podido preparar tus datos." }, { status: 500 });
  }

  const exportedAt = new Date().toISOString();
  const payload = {
    export_version: "1.0",
    exported_at: exportedAt,
    account: {
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at ?? null
    },
    profile: profile.data,
    favorites: favorites.data ?? [],
    submissions: submissions.data ?? [],
    connection_requests: requests.data ?? [],
    claim_requests: claims.data ?? []
  };

  const date = exportedAt.slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `attachment; filename="tenlo-datos-${date}.json"`,
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
