-- La relevancia declarada por el proveedor se guarda como señal operativa,
-- separada de su disponibilidad y de la respuesta que recibe la familia.

create or replace function public.get_provider_connection_requests_v2()
returns table (
  id uuid,
  provider_id uuid,
  target_id text,
  category_id text,
  municipality text,
  message text,
  contact_preference text,
  status text,
  relevance text,
  provider_response_summary text,
  provider_notified_at timestamptz,
  first_response_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    request.id,
    request.provider_id,
    request.target_id,
    request.category_id,
    request.municipality,
    request.message,
    request.contact_preference,
    request.status,
    request.relevance,
    request.provider_response_summary,
    request.provider_notified_at,
    request.first_response_at,
    request.created_at
  from public.connection_requests as request
  join public.business_profiles as profile on profile.id = request.provider_id
  where (select auth.uid()) is not null
    and profile.owner_id = (select auth.uid())
    and profile.status = 'approved'
  order by request.created_at desc;
$$;

revoke all on function public.get_provider_connection_requests_v2() from public, anon, authenticated;
grant execute on function public.get_provider_connection_requests_v2() to authenticated;

create or replace function public.respond_to_connection_request_v2(
  target_request_id uuid,
  next_status text,
  response_summary text,
  lead_relevance text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  cleaned_summary text := nullif(btrim(response_summary), '');
  affected_rows integer;
begin
  if caller_id is null then
    return false;
  end if;
  if next_status not in ('responded', 'declined') then
    raise exception 'Estado de respuesta no permitido';
  end if;
  if lead_relevance not in ('relevant', 'irrelevant') then
    raise exception 'Relevancia no permitida';
  end if;
  if cleaned_summary is null or char_length(cleaned_summary) < 10 or char_length(cleaned_summary) > 1000 then
    raise exception 'La respuesta debe tener entre 10 y 1000 caracteres';
  end if;

  update public.connection_requests as request
  set
    status = next_status,
    relevance = lead_relevance,
    provider_response_summary = cleaned_summary,
    first_response_at = coalesce(request.first_response_at, now()),
    last_family_update_at = now(),
    updated_at = now()
  from public.business_profiles as profile
  where request.id = target_request_id
    and profile.id = request.provider_id
    and profile.owner_id = caller_id
    and profile.status = 'approved'
    and request.status not in ('closed', 'alternative_offered');

  get diagnostics affected_rows = row_count;
  if affected_rows = 1 then
    update public.profiles set last_significant_activity_at = now() where id = caller_id;
  end if;
  return affected_rows = 1;
end;
$$;

revoke all on function public.respond_to_connection_request_v2(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.respond_to_connection_request_v2(uuid, text, text, text) to authenticated;

comment on function public.get_provider_connection_requests_v2() is
  'Devuelve al titular sus solicitudes y la relevancia declarada, sin identidad ni contacto de la familia.';
comment on function public.respond_to_connection_request_v2(uuid, text, text, text) is
  'Permite responder y declarar por separado si la solicitud encaja con la oferta del proveedor.';
