-- Identificadores y dimensiones estables para búsquedas e informes del piloto.

alter table public.search_events
  add column if not exists search_id uuid,
  add column if not exists vertical_id text,
  add column if not exists zero_results boolean not null default false,
  add column if not exists schema_version text not null default '1.0';

create unique index if not exists search_events_search_id_idx
  on public.search_events (search_id)
  where search_id is not null;

create index if not exists search_events_reporting_idx
  on public.search_events (created_at desc, category_id, municipality, zero_results);

create or replace view public.analytics_search_daily
with (security_invoker = true)
as
select
  date_trunc('day', created_at) as event_day,
  coalesce(vertical_id, 'unclassified') as vertical_id,
  coalesce(category_id, 'unclassified') as category_id,
  coalesce(municipality, 'unclassified') as municipality,
  count(*) as searches,
  count(*) filter (where zero_results) as zero_result_searches,
  round(avg(results_count)::numeric, 2) as average_results
from public.search_events
group by 1, 2, 3, 4;

comment on view public.analytics_search_daily is
  'Vista agregada sin PII para informes internos de demanda. No exponer al cliente anónimo.';
