-- Identidad técnica y versión de esquema para deduplicar conversiones críticas.
-- created_at sigue siendo el timestamp autoritativo generado por el servidor.

alter table public.connection_requests
  add column if not exists event_id uuid not null default gen_random_uuid(),
  add column if not exists schema_version text not null default '1.0';

alter table public.claim_requests
  add column if not exists event_id uuid not null default gen_random_uuid(),
  add column if not exists schema_version text not null default '1.0';

create unique index if not exists connection_requests_event_id_unique
  on public.connection_requests (event_id);

create unique index if not exists claim_requests_event_id_unique
  on public.claim_requests (event_id);

comment on column public.connection_requests.event_id is
  'Identificador técnico compartible con analítica para deduplicar request_created.';

comment on column public.claim_requests.event_id is
  'Identificador técnico compartible con analítica para deduplicar claim_submitted.';
