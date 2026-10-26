-- Aisla las cuentas y solicitudes de prueba de los datos reales del piloto.
-- Las fichas marcadas como prueba nunca se exponen en el directorio publico.

alter table public.profiles
  add column if not exists is_test boolean not null default false;

alter table public.business_profiles
  add column if not exists is_test boolean not null default false;

alter table public.connection_requests
  add column if not exists is_test boolean not null default false;

create index if not exists profiles_test_reporting_idx
  on public.profiles (is_test, created_at desc);

create index if not exists business_profiles_test_reporting_idx
  on public.business_profiles (is_test, created_at desc);

create index if not exists connection_requests_test_reporting_idx
  on public.connection_requests (is_test, created_at desc);

comment on column public.profiles.is_test is
  'Cuenta controlada de prueba; debe excluirse de informes y campanas.';

comment on column public.business_profiles.is_test is
  'Ficha interna de prueba; nunca debe exponerse en el directorio publico.';

comment on column public.connection_requests.is_test is
  'Solicitud controlada de prueba; debe excluirse de metricas reales.';

create or replace function public.get_public_business_profiles()
returns table (
  public_id text,
  external_key text,
  business_name text,
  category text,
  description text,
  municipality text,
  service_area text,
  website text,
  phone text,
  contact_email text,
  source_name text,
  source_url text,
  last_reviewed date,
  trust_level public.trust_level,
  commercial_plan text,
  accepts_requests boolean,
  tags text[],
  image_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(profile.external_key, profile.id::text),
    profile.external_key,
    profile.business_name,
    profile.category,
    profile.description,
    profile.municipality,
    profile.service_area,
    profile.website,
    profile.phone,
    profile.contact_email,
    profile.source_name,
    profile.source_url,
    profile.last_reviewed,
    profile.trust_level,
    profile.commercial_plan,
    profile.accepts_requests,
    profile.tags,
    profile.image_url
  from public.business_profiles as profile
  where profile.status = 'approved'
    and profile.is_test = false;
$$;

revoke all on function public.get_public_business_profiles() from public, anon, authenticated;
grant execute on function public.get_public_business_profiles() to anon, authenticated;

