-- Resumen privado de rendimiento para que cada proveedor vea solo las señales
-- agregadas de sus propias fichas y servicios. No devuelve sesiones ni eventos.

create or replace function public.get_provider_private_performance(
  window_days integer default 30,
  offset_days integer default 0
)
returns table (
  impressions bigint,
  profile_views bigint,
  saves bigint,
  contact_intents bigint,
  requests bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with owned_profiles as (
    select profile.id, coalesce(profile.external_key, profile.id::text) as entity_id
    from public.business_profiles as profile
    where profile.owner_id = (select auth.uid())
      and profile.status = 'approved'
  ),
  owned_entities as (
    select 'provider'::text as entity_type, profile.entity_id
    from owned_profiles as profile
    union all
    select 'listing'::text, coalesce(service.external_key, service.id::text)
    from public.services as service
    join owned_profiles as profile on profile.id = service.business_profile_id
    where service.status = 'approved'
  ),
  selected_events as (
    select event.event_name
    from public.directory_events as event
    join owned_entities as entity
      on entity.entity_type = event.entity_type
     and entity.entity_id = event.entity_id
    where (select auth.uid()) is not null
      and window_days between 1 and 366
      and offset_days between 0 and 366
      and event.created_at >= now() - make_interval(days => window_days + offset_days)
      and event.created_at < now() - make_interval(days => offset_days)
  )
  select
    count(*) filter (where event_name = 'provider_impression')::bigint,
    count(*) filter (where event_name in ('provider_profile_viewed', 'center_profile_viewed'))::bigint,
    count(*) filter (where event_name = 'provider_saved')::bigint,
    count(*) filter (where event_name in ('contact_started', 'contact_email_clicked', 'contact_phone_clicked', 'contact_web_clicked', 'map_directions_clicked'))::bigint,
    count(*) filter (where event_name = 'request_created')::bigint
  from selected_events;
$$;

revoke all on function public.get_provider_private_performance(integer, integer) from public, anon, authenticated;
grant execute on function public.get_provider_private_performance(integer, integer) to authenticated;

comment on function public.get_provider_private_performance(integer, integer) is
  'Devuelve métricas agregadas y consentidas de las fichas aprobadas del proveedor autenticado, sin exponer eventos ni sesiones.';
