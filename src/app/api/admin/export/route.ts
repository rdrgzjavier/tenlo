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
  "account_id",
  "provider_id",
  "service_id",
  "contact_name",
  "contact_email",
  "contact_phone",
  "context"
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

  const [claimsResult, requestsResult, submissionsResult, feedbackResult] = await Promise.all([
    supabase
      .from("claim_requests")
      .select("id,entity_type,entity_id,entity_name,requester_name,requester_email,requester_phone,status,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("connection_requests")
      .select("id,family_id,provider_id,service_id,target_type,target_id,category_id,municipality,status,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("submissions")
      .select("id,user_id,submission_type,status,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("feedback_requests")
      .select("id,user_id,context,item_id,name,email,status,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(1000)
  ]);

  const failed = [claimsResult, requestsResult, submissionsResult, feedbackResult].find((result) => result.error);
  if (failed?.error) {
    console.error("No se pudo preparar la exportación administrativa", failed.error);
    return NextResponse.json({ error: "No hemos podido preparar la exportación." }, { status: 500 });
  }

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
      service_id: item.service_id
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
      context: item.context
    }))
  ];

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
