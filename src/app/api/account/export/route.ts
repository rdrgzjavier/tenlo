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

  const [profile, businessProfiles, favorites, savedSearches, submissions, requests, requestFeedback, claims, consentHistory, searchHistory] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("business_profiles").select("business_name,website,address,municipality,service_area,category,subtype,trust_level,status,details,claim_status,commercial_plan,completeness_percent,accepts_requests,contact_preferences,inactive_reason,description,phone,contact_email,tags,location_visibility,service_municipalities,created_at,updated_at").eq("owner_id", user.id),
    supabase.from("favorites").select("target_type,target_id,created_at").eq("user_id", user.id),
    supabase.from("saved_searches").select("name,search_path,category_id,municipality,created_at,updated_at").eq("user_id", user.id),
    supabase.from("submissions").select("submission_type,payload,status,created_at,updated_at").eq("user_id", user.id),
    supabase.from("connection_requests").select("id,target_type,target_id,category_id,municipality,status,relevance,useful_connection,provider_response_summary,alternative_summary,last_family_update_at,created_at,updated_at").eq("family_id", user.id),
    supabase.from("connection_feedback").select("request_id,useful,outcome,created_at,updated_at").eq("family_id", user.id),
    supabase.from("claim_requests").select("entity_type,entity_id,entity_name,role_description,corrections,official_website,image_url,status,created_at,updated_at").eq("user_id", user.id),
    supabase.from("consent_history").select("purpose,decision,text_version,source,recorded_at").eq("user_id", user.id).order("recorded_at", { ascending: true }),
    supabase.from("search_events").select("search_id,vertical_id,normalized_query,category_id,municipality,filters,results_count,zero_results,created_at").eq("user_id", user.id).order("created_at", { ascending: true })
  ]);

  const failed = [profile, businessProfiles, favorites, savedSearches, submissions, requests, requestFeedback, claims, consentHistory, searchHistory].find((result) => result.error);
  if (failed?.error) {
    console.error("No se pudo preparar la exportación de cuenta", failed.error);
    return NextResponse.json({ error: "No hemos podido preparar tus datos." }, { status: 500 });
  }

  const exportedAt = new Date().toISOString();
  const payload = {
    export_version: "1.2",
    exported_at: exportedAt,
    account: {
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at ?? null
    },
    profile: profile.data,
    business_profiles: businessProfiles.data ?? [],
    favorites: favorites.data ?? [],
    saved_searches: savedSearches.data ?? [],
    submissions: submissions.data ?? [],
    connection_requests: requests.data ?? [],
    connection_feedback: requestFeedback.data ?? [],
    claim_requests: claims.data ?? [],
    consent_history: consentHistory.data ?? [],
    search_history: searchHistory.data ?? []
  };

  const recordCount = (businessProfiles.data?.length ?? 0) + (favorites.data?.length ?? 0) + (savedSearches.data?.length ?? 0) + (submissions.data?.length ?? 0) + (requests.data?.length ?? 0) + (requestFeedback.data?.length ?? 0) + (claims.data?.length ?? 0) + (consentHistory.data?.length ?? 0) + (searchHistory.data?.length ?? 0) + 1;
  const { error: auditError } = await supabase.from("data_export_audit").insert({
    actor_id: user.id,
    export_scope: "account_portability",
    record_count: recordCount
  });
  if (auditError) {
    console.error("No se pudo registrar la exportación de cuenta", auditError);
    return NextResponse.json({ error: "No hemos podido registrar la exportación de forma segura." }, { status: 500 });
  }

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
