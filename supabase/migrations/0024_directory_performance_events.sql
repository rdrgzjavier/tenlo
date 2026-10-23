-- Histórico propio, agregado y sin PII para medir el rendimiento por ficha.
-- Solo se registra después de que el navegador haya obtenido consentimiento estadístico.

create table if not exists public.directory_events (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  anonymous_session_id uuid not null,
  event_name text not null check (event_name in (
    'provider_impression',
    'result_opened',
    'provider_profile_viewed',
    'center_profile_viewed',
    'contact_started',
    'contact_form_completed',
    'request_created',
    'contact_email_clicked',
    'contact_phone_clicked',
    'contact_web_clicked',
    'map_directions_clicked',
    'provider_saved',
    'provider_unsaved',
    'provider_shared'
  )),
  entity_type text not null check (entity_type in ('center', 'provider', 'listing')),
  entity_id text not null check (char_length(entity_id) between 1 and 140),
  category_id text check (category_id is null or char_length(category_id) <= 80),
  vertical_id text check (vertical_id is null or char_length(vertical_id) <= 80),
  municipality text check (municipality is null or char_length(municipality) <= 120),
  search_id uuid,
  result_position integer check (result_position is null or result_position between 1 and 200),
  schema_version text not null default '1.0',
  created_at timestamptz not null default now(),
  constraint directory_events_event_name_unique unique (event_id, event_name)
);

create index if not exists directory_events_entity_reporting_idx
  on public.directory_events (entity_type, entity_id, created_at desc);

create index if not exists directory_events_segment_reporting_idx
  on public.directory_events (created_at desc, vertical_id, category_id, municipality, event_name);

create index if not exists directory_events_search_idx
  on public.directory_events (search_id)
  where search_id is not null;

alter table public.directory_events enable row level security;

-- No dependemos de los privilegios por defecto del proyecto. El navegador
-- solo puede insertar eventos válidos; lectura, edición y borrado quedan fuera
-- de la superficie pública.
revoke all on public.directory_events from anon, authenticated;

create policy "Anyone can record privacy-safe directory events"
  on public.directory_events for insert to anon, authenticated
  with check (
    anonymous_session_id is not null
    and char_length(entity_id) between 1 and 140
  );

create policy "Admins can analyze directory events"
  on public.directory_events for select to authenticated
  using ((select public.is_tenlo_admin()));

grant insert on public.directory_events to anon, authenticated;
grant select on public.directory_events to authenticated;

create or replace view public.analytics_directory_daily
with (security_invoker = true)
as
select
  date_trunc('day', created_at) as event_day,
  entity_type,
  entity_id,
  coalesce(vertical_id, 'unclassified') as vertical_id,
  coalesce(category_id, 'unclassified') as category_id,
  coalesce(municipality, 'unclassified') as municipality,
  count(*) filter (where event_name = 'provider_impression') as impressions,
  count(*) filter (where event_name in ('provider_profile_viewed', 'center_profile_viewed')) as profile_views,
  count(*) filter (where event_name in ('contact_started', 'contact_email_clicked', 'contact_phone_clicked', 'contact_web_clicked')) as contact_intents,
  count(*) filter (where event_name = 'request_created') as requests,
  count(*) filter (where event_name = 'provider_saved') as saves
from public.directory_events
group by 1, 2, 3, 4, 5, 6;

comment on table public.directory_events is
  'Eventos consentidos y sin PII para informes históricos por ficha, vertical, categoría y municipio.';

comment on view public.analytics_directory_daily is
  'Agregación diaria privada para informes de rendimiento del directorio.';

revoke all on public.analytics_directory_daily from anon;
grant select on public.analytics_directory_daily to authenticated;
