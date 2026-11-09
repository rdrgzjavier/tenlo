-- Resultados agregados de las solicitudes propias del proveedor. No devuelve
-- identidad, texto libre ni filas individuales de feedback familiar.

create or replace function public.get_provider_private_outcomes(
  window_days integer default 30,
  offset_days integer default 0
)
returns table (
  feedback_count bigint,
  useful_connections bigint,
  confirmed_outcomes bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with owned_profiles as (
    select profile.id
    from public.business_profiles as profile
    where profile.owner_id = (select auth.uid())
      and profile.status = 'approved'
  ),
  owned_requests as (
    select request.id
    from public.connection_requests as request
    join owned_profiles as profile on profile.id = request.provider_id
    where (select auth.uid()) is not null
      and window_days between 1 and 366
      and offset_days between 0 and 366
      and request.created_at >= now() - make_interval(days => window_days + offset_days)
      and request.created_at < now() - make_interval(days => offset_days)
  )
  select
    count(feedback.id)::bigint,
    count(feedback.id) filter (where feedback.useful)::bigint,
    count(feedback.id) filter (where feedback.outcome <> 'not_progressed')::bigint
  from owned_requests as request
  left join public.connection_feedback as feedback on feedback.request_id = request.id;
$$;

revoke all on function public.get_provider_private_outcomes(integer, integer) from public, anon, authenticated;
grant execute on function public.get_provider_private_outcomes(integer, integer) to authenticated;

comment on function public.get_provider_private_outcomes(integer, integer) is
  'Devuelve feedback, conexiones útiles y resultados confirmados agregados de las solicitudes propias del proveedor autenticado.';
