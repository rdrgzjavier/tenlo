-- Ubicación utilizable para proximidad y mapas sin exponer domicilios particulares.

alter table public.centers
  add column if not exists latitude numeric(9, 6),
  add column if not exists longitude numeric(9, 6),
  add column if not exists location_verified_at timestamptz;

alter table public.business_profiles
  add column if not exists latitude numeric(9, 6),
  add column if not exists longitude numeric(9, 6),
  add column if not exists location_visibility text not null default 'service_area'
    check (location_visibility in ('exact', 'approximate', 'service_area', 'hidden')),
  add column if not exists service_municipalities text[] not null default '{}',
  add column if not exists location_verified_at timestamptz;

alter table public.services
  add column if not exists venue_address text,
  add column if not exists latitude numeric(9, 6),
  add column if not exists longitude numeric(9, 6),
  add column if not exists location_visibility text not null default 'service_area'
    check (location_visibility in ('exact', 'approximate', 'service_area', 'hidden')),
  add column if not exists service_municipalities text[] not null default '{}',
  add column if not exists location_verified_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'centers_latitude_range') then
    alter table public.centers add constraint centers_latitude_range
      check (latitude is null or latitude between -90 and 90);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'centers_longitude_range') then
    alter table public.centers add constraint centers_longitude_range
      check (longitude is null or longitude between -180 and 180);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'business_profiles_latitude_range') then
    alter table public.business_profiles add constraint business_profiles_latitude_range
      check (latitude is null or latitude between -90 and 90);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'business_profiles_longitude_range') then
    alter table public.business_profiles add constraint business_profiles_longitude_range
      check (longitude is null or longitude between -180 and 180);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'business_profiles_exact_location_complete') then
    alter table public.business_profiles add constraint business_profiles_exact_location_complete
      check (location_visibility <> 'exact' or (address is not null and latitude is not null and longitude is not null));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'services_latitude_range') then
    alter table public.services add constraint services_latitude_range
      check (latitude is null or latitude between -90 and 90);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'services_longitude_range') then
    alter table public.services add constraint services_longitude_range
      check (longitude is null or longitude between -180 and 180);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'services_exact_location_complete') then
    alter table public.services add constraint services_exact_location_complete
      check (location_visibility <> 'exact' or (venue_address is not null and latitude is not null and longitude is not null));
  end if;
end
$$;

