import { NextResponse } from "next/server";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

const allowedEvents = new Set([
  "provider_impression",
  "result_opened",
  "provider_profile_viewed",
  "center_profile_viewed",
  "contact_started",
  "contact_form_completed",
  "request_created",
  "contact_email_clicked",
  "contact_phone_clicked",
  "contact_web_clicked",
  "map_directions_clicked",
  "provider_saved",
  "provider_unsaved",
  "provider_shared"
]);

const allowedEntityTypes = new Set(["center", "provider", "listing"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type IncomingEvent = Record<string, unknown>;

function optionalText(value: unknown, limit: number) {
  const text = typeof value === "string" ? value.trim().slice(0, limit) : "";
  return text || null;
}

function validEvent(value: IncomingEvent) {
  const eventId = String(value.event_id || "");
  const sessionId = String(value.anonymous_session_id || "");
  const eventName = String(value.event_name || "");
  const entityType = String(value.entity_type || "");
  const entityId = String(value.entity_id || "").trim();
  const searchId = value.search_id ? String(value.search_id) : null;
  const rawPosition = Number(value.result_position);

  if (!uuidPattern.test(eventId) || !uuidPattern.test(sessionId)) return null;
  if (!allowedEvents.has(eventName) || !allowedEntityTypes.has(entityType)) return null;
  if (!entityId || entityId.length > 140) return null;
  if (searchId && !uuidPattern.test(searchId)) return null;

  return {
    event_id: eventId,
    anonymous_session_id: sessionId,
    event_name: eventName,
    entity_type: entityType,
    entity_id: entityId,
    category_id: optionalText(value.category_id, 80),
    vertical_id: optionalText(value.vertical_id, 80),
    municipality: optionalText(value.municipality, 120),
    search_id: searchId,
    result_position: Number.isInteger(rawPosition) && rawPosition >= 1 && rawPosition <= 200 ? rawPosition : null,
    schema_version: "1.0"
  };
}

export async function POST(request: Request) {
  if (!hasSupabaseServerConfig()) return NextResponse.json({ ok: false }, { status: 503 });
  const requestCookies = request.headers.get("cookie")?.split(";").map((part) => part.trim()) ?? [];
  if (requestCookies.includes("tenlo_internal_traffic=1")) {
    return NextResponse.json({ ok: true, excluded: true }, { headers: { "Cache-Control": "no-store" } });
  }
  if (!requestCookies.includes("tenlo_analytics_consent=accepted")) {
    return NextResponse.json({ ok: true, excluded: true, reason: "consent_required" }, { headers: { "Cache-Control": "no-store" } });
  }

  const body = await request.json().catch(() => null) as { events?: unknown } | null;
  if (!Array.isArray(body?.events) || body.events.length < 1 || body.events.length > 50) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const events = body.events
    .map((value) => value && typeof value === "object" && !Array.isArray(value) ? validEvent(value as IncomingEvent) : null)
    .filter((value): value is NonNullable<typeof value> => Boolean(value));

  if (events.length !== body.events.length) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("directory_events").insert(events);
  if (error) {
    console.error("No se pudieron persistir los eventos del directorio", error.code);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
