-- Bandeja privada y respuesta acotada para titulares de fichas profesionales.
-- La familia conserva su seguimiento y Tenlo controla alternativas y cierre.

create index if not exists connection_requests_provider_created_idx
  on public.connection_requests (provider_id, created_at desc)
  where provider_id is not null;

create or replace function public.assign_connection_request_provider()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Nunca confiar en una asociación aportada por el cliente. La ficha profesional
  -- se resuelve únicamente desde el destino público y su estado aprobado.
  new.provider_id := null;

  if new.target_id is null then
    return new;
  end if;

  if new.target_type = 'listing' then
    select service.business_profile_id
    into new.provider_id
    from public.services as service
    join public.business_profiles as profile on profile.id = service.business_profile_id
    where coalesce(service.external_key, service.id::text) = new.target_id
      and service.status = 'approved'
      and profile.status = 'approved'
    limit 1;
  elsif new.target_type = 'provider' then
    select profile.id
    into new.provider_id
    from public.business_profiles as profile
    where coalesce(profile.external_key, profile.id::text) = new.target_id
      and profile.status = 'approved'
    limit 1;
  end if;

  return new;
end;
$$;

revoke all on function public.assign_connection_request_provider() from public, anon, authenticated;

drop trigger if exists assign_connection_request_provider on public.connection_requests;
create trigger assign_connection_request_provider
  before insert or update of target_type, target_id on public.connection_requests
  for each row execute function public.assign_connection_request_provider();

update public.connection_requests as request
set provider_id = service.business_profile_id
from public.services as service
join public.business_profiles as profile on profile.id = service.business_profile_id
where request.provider_id is null
  and request.target_type = 'listing'
  and request.target_id = coalesce(service.external_key, service.id::text)
  and service.status = 'approved'
  and profile.status = 'approved';

update public.connection_requests as request
set provider_id = profile.id
from public.business_profiles as profile
where request.provider_id is null
  and request.target_type = 'provider'
  and request.target_id = coalesce(profile.external_key, profile.id::text)
  and profile.status = 'approved';

create or replace function public.get_provider_connection_requests()
returns table (
  id uuid,
  provider_id uuid,
  target_id text,
  category_id text,
  municipality text,
  message text,
  contact_preference text,
  status text,
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

revoke all on function public.get_provider_connection_requests() from public, anon, authenticated;
grant execute on function public.get_provider_connection_requests() to authenticated;

create or replace function public.mark_provider_request_viewed(target_request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  affected_rows integer;
begin
  if caller_id is null then
    return false;
  end if;

  update public.connection_requests as request
  set
    status = case when request.status in ('submitted', 'delivered') then 'viewed' else request.status end,
    updated_at = now()
  from public.business_profiles as profile
  where request.id = target_request_id
    and profile.id = request.provider_id
    and profile.owner_id = caller_id
    and profile.status = 'approved';

  get diagnostics affected_rows = row_count;
  if affected_rows = 1 then
    update public.profiles set last_significant_activity_at = now() where id = caller_id;
  end if;
  return affected_rows = 1;
end;
$$;

revoke all on function public.mark_provider_request_viewed(uuid) from public, anon, authenticated;
grant execute on function public.mark_provider_request_viewed(uuid) to authenticated;

create or replace function public.respond_to_connection_request(
  target_request_id uuid,
  next_status text,
  response_summary text
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
  if cleaned_summary is null or char_length(cleaned_summary) < 10 or char_length(cleaned_summary) > 1000 then
    raise exception 'La respuesta debe tener entre 10 y 1000 caracteres';
  end if;

  update public.connection_requests as request
  set
    status = next_status,
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

revoke all on function public.respond_to_connection_request(uuid, text, text) from public, anon, authenticated;
grant execute on function public.respond_to_connection_request(uuid, text, text) to authenticated;

comment on function public.get_provider_connection_requests() is
  'Devuelve al titular solo las solicitudes asignadas a sus fichas aprobadas, sin identidad ni contacto de la familia.';
comment on function public.respond_to_connection_request(uuid, text, text) is
  'Permite al titular responder o indicar falta de disponibilidad sin acceder a campos administrativos.';
