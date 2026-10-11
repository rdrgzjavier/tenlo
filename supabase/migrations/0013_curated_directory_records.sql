-- Permite migrar el directorio editorial de Tenlo sin inventar propietarios.
-- La publicación (approved) y la confianza (collected) siguen siendo conceptos separados.

alter table public.centers
  add column if not exists external_key text,
  add column if not exists status public.moderation_status not null default 'pending_review',
  add column if not exists record_origin text not null default 'user_submitted'
    check (record_origin in ('tenlo_curated', 'user_submitted', 'provider_managed'));

alter table public.business_profiles
  alter column owner_id drop not null,
  add column if not exists external_key text,
  add column if not exists description text,
  add column if not exists phone text,
  add column if not exists contact_email text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists image_url text,
  add column if not exists record_origin text not null default 'user_submitted'
    check (record_origin in ('tenlo_curated', 'user_submitted', 'provider_managed'));

alter table public.services
  add column if not exists external_key text,
  add column if not exists record_origin text not null default 'user_submitted'
    check (record_origin in ('tenlo_curated', 'user_submitted', 'provider_managed'));

alter table public.listings
  alter column owner_id drop not null,
  add column if not exists external_key text,
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists last_reviewed date,
  add column if not exists record_origin text not null default 'user_submitted'
    check (record_origin in ('tenlo_curated', 'user_submitted', 'provider_managed'));

create unique index if not exists centers_external_key_unique
  on public.centers (external_key) where external_key is not null;

create unique index if not exists business_profiles_external_key_unique
  on public.business_profiles (external_key) where external_key is not null;

create unique index if not exists services_external_key_unique
  on public.services (external_key) where external_key is not null;

create unique index if not exists listings_external_key_unique
  on public.listings (external_key) where external_key is not null;

