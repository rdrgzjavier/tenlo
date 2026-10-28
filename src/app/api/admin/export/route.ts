import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const columns = [
  "queue",
  "id",
  "status",
  "created_at",
  "updated_at",
  "target_type",
  "target_id",
  "entity_name",
  "category_id",
  "municipality",
  "service_area",
  "service_municipalities",
  "account_id",
  "provider_id",
  "service_id",
  "contact_name",
  "contact_email",
  "contact_phone",
  "website",
  "accepts_requests",
  "contact_preferences",
  "completeness_percent",
  "trust_level",
  "claim_status",
  "commercial_plan",
  "record_origin",
  "source_name",
  "source_url",
  "last_reviewed",
  "context",
  "message",
  "provider_notified_at",
  "first_response_at",
  "closed_at",
  "provider_response_summary",
  "alternative_summary",
  "family_useful",
  "family_outcome"
] as const;

type CsvRow = Partial<Record<(typeof columns)[number], string | null | undefined>>;

function csvCell(value: string | null | undefined) {
  const normalized = value ?? "";
  const formulaSafe = /^[=+\-@]/.test(normalized.trimStart()) ? `'${normalized}` : normalized;
  return `"${formulaSafe.replaceAll('"', '""')}"`;
}

function toCsv(rows: CsvRow[]) {
  const lines = [
    columns.map(csvCell).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))
  ];
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "tenlo_admin" || profile.status !== "approved") {
    return NextResponse.json({ error: "No tienes permiso para exportar la cola." }, { status: 403 });
  }

  const [claimsResult, requestsResult, submissionsResult, businessProfilesResult, providerSuggestionsResult, feedbackResult, connectionFeedbackResult] = await Promise.all([
    supabase
      .from("claim_requests")
      .select("id,entity_type,entity_id,entity_name,requester_name,requester_email,requester_phone,status,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("connection_requests")
      .select("id,family_id,provider_id,service_id,target_type,target_id,category_id,municipality,status,provider_notified_at,first_response_at,closed_at,provider_response_summary,alternative_summary,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("submissions")
      .select("id,user_id,submission_type,status,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("business_profiles")
      .select("id,owner_id,business_name,category,municipality,service_area,service_municipalities,contact_email,phone,website,accepts_requests,contact_preferences,completeness_percent,status,trust_level,claim_status,commercial_plan,record_origin,source_name,source_url,last_reviewed,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("provider_suggestions")
      .select("id,user_id,provider_name,website,location,service,notes,submitter_name,submitter_email,status,converted_profile_id,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("feedback_requests")
      .select("id,user_id,context,item_id,name,email,message,status,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("connection_feedback")
      .select("request_id,useful,outcome")
      .limit(1000)
  ]);

  const failed = [claimsResult, requestsResult, submissionsResult, businessProfilesResult, providerSuggestionsResult, feedbackResult, connectionFeedbackResult].find((result) => result.error);
  if (failed?.error) {
    console.error("No se pudo preparar la exportación administrativa", failed.error);
    return NextResponse.json({ error: "No hemos podido preparar la exportación." }, { status: 500 });
  }

  const connectionFeedback = new Map((connectionFeedbackResult.data ?? []).map((item) => [item.request_id, item]));
  const rows: CsvRow[] = [
    ...(claimsResult.data ?? []).map((item) => ({
      queue: "claim",
      id: item.id,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      target_type: item.entity_type,
      target_id: item.entity_id,
      entity_name: item.entity_name,
      contact_name: item.requester_name,
      contact_email: item.requester_email,
      contact_phone: item.requester_phone
    })),
    ...(requestsResult.data ?? []).map((item) => ({
      queue: "connection_request",
      id: item.id,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      target_type: item.target_type,
      target_id: item.target_id,
      category_id: item.category_id,
      municipality: item.municipality,
      account_id: item.family_id,
      provider_id: item.provider_id,
      service_id: item.service_id,
      provider_notified_at: item.provider_notified_at,
      first_response_at: item.first_response_at,
      closed_at: item.closed_at,
      provider_response_summary: item.provider_response_summary,
      alternative_summary: item.alternative_summary,
      family_useful: connectionFeedback.has(item.id) ? String(connectionFeedback.get(item.id)?.useful) : "",
      family_outcome: connectionFeedback.get(item.id)?.outcome
    })),
    ...(submissionsResult.data ?? []).map((item) => ({
      queue: "submission",
      id: item.id,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      target_type: item.submission_type,
      account_id: item.user_id
    })),
    ...(businessProfilesResult.data ?? []).map((item) => ({
      queue: "business_profile",
      id: item.id,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      entity_name: item.business_name,
      category_id: item.category,
      municipality: item.municipality,
      service_area: item.service_area,
      service_municipalities: item.service_municipalities.join(" | "),
      account_id: item.owner_id,
      provider_id: item.id,
      contact_email: item.contact_email,
      contact_phone: item.phone,
      website: item.website,
      accepts_requests: String(item.accepts_requests),
      contact_preferences: item.contact_preferences.join(" | "),
      completeness_percent: String(item.completeness_percent),
      trust_level: item.trust_level,
      claim_status: item.claim_status,
      commercial_plan: item.commercial_plan,
      record_origin: item.record_origin,
      source_name: item.source_name,
      source_url: item.source_url,
      last_reviewed: item.last_reviewed
    })),
    ...(providerSuggestionsResult.data ?? []).map((item) => ({
      queue: "provider_suggestion",
      id: item.id,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      entity_name: item.provider_name,
      category_id: item.service,
      municipality: item.location,
      account_id: item.user_id,
      provider_id: item.converted_profile_id,
      contact_name: item.submitter_name,
      contact_email: item.submitter_email,
      website: item.website,
      message: item.notes
    })),
    ...(feedbackResult.data ?? []).map((item) => ({
      queue: "feedback",
      id: item.id,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      target_id: item.item_id,
      account_id: item.user_id,
      contact_name: item.name,
      contact_email: item.email,
      context: item.context,
      message: item.message
    }))
  ];

  const { error: auditError } = await supabase.from("data_export_audit").insert({
    actor_id: user.id,
    export_scope: "admin_operation",
    record_count: rows.length
  });
  if (auditError) {
    console.error("No se pudo registrar la exportación administrativa", auditError);
    return NextResponse.json({ error: "No hemos podido registrar la exportación de forma segura." }, { status: 500 });
  }

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv(rows), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `attachment; filename="tenlo-operacion-${date}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
