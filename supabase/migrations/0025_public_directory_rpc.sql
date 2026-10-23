-- Superficie pública explícita del directorio.
-- Evita que la Data API exponga columnas internas como owner_id, legal_name,
-- details, created_by o record_origin aunque una fila esté aprobada.

create or replace function public.get_public_centers()
returns table (
  public_id text,
  external_key text,
  slug text,
  name text,
  municipality text,
  center_type text,
  religious_character text,
  stages text[],
  languages text[],
  services text[],
  description text,
  address text,
  phone text,
  email text,
  website text,
  source_name text,
  source_url text,
  last_reviewed date,
  trust_level public.trust_level,
  tags text[],
  image_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(center.external_key, center.id::text),
    center.external_key,
    center.slug,
    center.name,
    center.municipality,
    center.center_type,
    center.religious_character,
    center.stages,
    center.languages,
    center.services,
    center.description,
    center.address,
    center.phone,
    center.email,
    center.website,
    center.source_name,
    center.source_url,
    center.last_reviewed,
    center.trust_level,
    center.tags,
    center.image_url
  from public.centers as center
  where center.status = 'approved';
$$;

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
  where profile.status = 'approved';
$$;

create or replace function public.get_public_services()
returns table (
  public_id text,
  external_key text,
  business_public_id text,
  slug text,
  title text,
  category_id text,
  municipality text,
  service_area text,
  description text,
  age_min integer,
  age_max integer,
  price_label text,
  availability text,
  contact_email text,
  phone text,
  website text,
  source_name text,
  source_url text,
  last_reviewed date,
  trust_level public.trust_level,
  tags text[],
  image_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(service.external_key, service.id::text),
    service.external_key,
    coalesce(profile.external_key, profile.id::text),
    service.slug,
    service.title,
    service.category_id,
    service.municipality,
    service.service_area,
    service.description,
    service.age_min,
    service.age_max,
    service.price_label,
    service.availability,
    service.contact_email,
    service.phone,
    service.website,
    service.source_name,
    service.source_url,
    service.last_reviewed,
    service.trust_level,
    service.tags,
    service.image_url
  from public.services as service
  left join public.business_profiles as profile on profile.id = service.business_profile_id
  where service.status = 'approved'
    and (service.business_profile_id is null or profile.status = 'approved');
$$;

revoke all on function public.get_public_centers() from public;
revoke all on function public.get_public_business_profiles() from public;
revoke all on function public.get_public_services() from public;
grant execute on function public.get_public_centers() to anon, authenticated;
grant execute on function public.get_public_business_profiles() to anon, authenticated;
grant execute on function public.get_public_services() to anon, authenticated;

drop policy if exists "Anyone can read approved centers" on public.centers;
drop policy if exists "Users can read approved services" on public.services;
drop policy if exists "Anyone can read approved business profiles" on public.business_profiles;
drop policy if exists "Users can read approved listings" on public.listings;
drop policy if exists "Users can read approved community posts" on public.community_posts;

drop policy if exists "Users can read own proposed centers" on public.centers;
drop policy if exists "Admins can read centers" on public.centers;
drop policy if exists "Admins can read services" on public.services;
drop policy if exists "Admins can read business profiles" on public.business_profiles;

create policy "Users can read own proposed centers"
  on public.centers for select to authenticated
  using ((select auth.uid()) = created_by);

create policy "Admins can read centers"
  on public.centers for select to authenticated
  using ((select public.is_tenlo_admin()));

create policy "Admins can read services"
  on public.services for select to authenticated
  using ((select public.is_tenlo_admin()));

create policy "Admins can read business profiles"
  on public.business_profiles for select to authenticated
  using ((select public.is_tenlo_admin()));

revoke select on public.centers, public.services, public.business_profiles, public.listings, public.community_posts from anon;

comment on function public.get_public_centers() is 'Directorio público de centros con columnas expresamente seguras y filas aprobadas.';
comment on function public.get_public_business_profiles() is 'Directorio público de proveedores sin titularidad, datos legales ni detalles internos.';
comment on function public.get_public_services() is 'Directorio público de servicios sin owner_id ni UUID de relación internos.';
