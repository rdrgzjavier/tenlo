-- Impide que los propietarios alteren por su cuenta señales de confianza,
-- moderación, origen o plan comercial. Los campos protegidos se gestionan
-- mediante procesos administrativos con privilegios elevados.

create index if not exists business_profiles_owner_idx on public.business_profiles (owner_id);
create index if not exists business_profiles_status_created_idx on public.business_profiles (status, created_at desc);
create index if not exists services_owner_idx on public.services (owner_id);
create index if not exists services_business_profile_idx on public.services (business_profile_id);
create index if not exists listings_owner_idx on public.listings (owner_id);
create index if not exists community_posts_owner_idx on public.community_posts (owner_id);
create index if not exists submissions_user_idx on public.submissions (user_id, created_at desc);

create or replace function public.calculate_business_profile_completeness()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.completeness_percent :=
    (case when nullif(btrim(new.business_name), '') is not null then 15 else 0 end) +
    (case when nullif(btrim(new.category), '') is not null then 15 else 0 end) +
    (case when nullif(btrim(new.description), '') is not null then 20 else 0 end) +
    (case when nullif(btrim(new.municipality), '') is not null then 10 else 0 end) +
    (case when nullif(btrim(new.service_area), '') is not null then 10 else 0 end) +
    (case when nullif(btrim(new.contact_email), '') is not null or nullif(btrim(new.phone), '') is not null then 10 else 0 end) +
    (case when nullif(btrim(new.website), '') is not null then 5 else 0 end) +
    (case when nullif(btrim(new.subtype), '') is not null then 5 else 0 end) +
    (case when new.details <> '{}'::jsonb then 10 else 0 end);
  return new;
end;
$$;

revoke all on function public.calculate_business_profile_completeness() from public;

drop trigger if exists calculate_business_profile_completeness_insert on public.business_profiles;
create trigger calculate_business_profile_completeness_insert
  before insert on public.business_profiles
  for each row execute function public.calculate_business_profile_completeness();

drop trigger if exists calculate_business_profile_completeness_update on public.business_profiles;
create trigger calculate_business_profile_completeness_update
  before update of business_name, category, description, municipality, service_area, contact_email, phone, website, subtype, details
  on public.business_profiles
  for each row execute function public.calculate_business_profile_completeness();

-- Fichas de proveedor -------------------------------------------------------

drop policy if exists "Users can manage own business profile" on public.business_profiles;

create policy "Owners can read own business profiles"
  on public.business_profiles for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can create pending business profiles"
  on public.business_profiles for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and trust_level = 'collected'
    and status = 'pending_review'
    and claim_status = 'unclaimed'
    and commercial_plan = 'free'
    and record_origin = 'user_submitted'
    and external_key is null
    and source_name is null
    and source_url is null
    and last_reviewed is null
    and location_verified_at is null
  );

create policy "Owners can edit own business content"
  on public.business_profiles for update to authenticated
  using (
    (select auth.uid()) = owner_id
    and status in ('draft', 'pending_review', 'rejected')
  )
  with check (
    (select auth.uid()) = owner_id
    and status in ('draft', 'pending_review', 'rejected')
  );

revoke update on public.business_profiles from authenticated;
grant update (
  business_name,
  legal_name,
  website,
  address,
  municipality,
  service_area,
  category,
  subtype,
  description,
  phone,
  contact_email,
  tags,
  image_url,
  accepts_requests,
  contact_preferences,
  inactive_reason,
  details,
  latitude,
  longitude,
  location_visibility,
  service_municipalities
) on public.business_profiles to authenticated;

-- Servicios ----------------------------------------------------------------

drop policy if exists "Users can manage own services" on public.services;

create policy "Owners can read own services"
  on public.services for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can create pending services"
  on public.services for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and trust_level = 'collected'
    and status = 'pending_review'
    and record_origin = 'user_submitted'
    and external_key is null
    and source_name is null
    and source_url is null
    and last_reviewed is null
    and location_verified_at is null
    and (
      business_profile_id is null
      or exists (
        select 1
        from public.business_profiles as owned_profile
        where owned_profile.id = business_profile_id
          and owned_profile.owner_id = (select auth.uid())
      )
    )
  );

create policy "Owners can edit own service content"
  on public.services for update to authenticated
  using (
    (select auth.uid()) = owner_id
    and status in ('draft', 'pending_review', 'rejected')
  )
  with check (
    (select auth.uid()) = owner_id
    and status in ('draft', 'pending_review', 'rejected')
    and (
      business_profile_id is null
      or exists (
        select 1
        from public.business_profiles as owned_profile
        where owned_profile.id = business_profile_id
          and owned_profile.owner_id = (select auth.uid())
      )
    )
  );

revoke update on public.services from authenticated;
grant update (
  business_profile_id,
  slug,
  title,
  category_id,
  municipality,
  service_area,
  description,
  extended_description,
  modality,
  provider_type,
  age_min,
  age_max,
  price_label,
  availability,
  conditions,
  contact_email,
  phone,
  website,
  tags,
  image_url,
  venue_address,
  latitude,
  longitude,
  location_visibility,
  service_municipalities
) on public.services to authenticated;

-- Anuncios -----------------------------------------------------------------

drop policy if exists "Users can manage own listings" on public.listings;

create policy "Owners can read own listings"
  on public.listings for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can create pending listings"
  on public.listings for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and status = 'pending_review'
    and trust_level = 'collected'
    and record_origin = 'user_submitted'
    and external_key is null
    and source_name is null
    and source_url is null
    and last_reviewed is null
  );

create policy "Owners can edit own listing content"
  on public.listings for update to authenticated
  using (
    (select auth.uid()) = owner_id
    and status in ('draft', 'pending_review', 'rejected')
  )
  with check (
    (select auth.uid()) = owner_id
    and status in ('draft', 'pending_review', 'rejected')
  );

revoke update on public.listings from authenticated;
grant update (
  slug,
  title,
  category_id,
  center_id,
  description,
  municipality,
  area,
  age_min,
  age_max,
  price,
  price_label,
  condition,
  availability,
  publication_type,
  tags,
  image_url,
  details
) on public.listings to authenticated;

-- Publicaciones de comunidad ----------------------------------------------

drop policy if exists "Users can manage own community posts" on public.community_posts;

create policy "Owners can read own community posts"
  on public.community_posts for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can create pending community posts"
  on public.community_posts for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and status = 'pending_review'
    and source_name is null
    and source_url is null
    and last_reviewed is null
  );

create policy "Owners can edit own community content"
  on public.community_posts for update to authenticated
  using (
    (select auth.uid()) = owner_id
    and status in ('draft', 'pending_review', 'rejected')
  )
  with check (
    (select auth.uid()) = owner_id
    and status in ('draft', 'pending_review', 'rejected')
  );

revoke update on public.community_posts from authenticated;
grant update (
  slug,
  title,
  type,
  municipality,
  summary,
  body,
  url,
  tags,
  image_url
) on public.community_posts to authenticated;

-- Una propuesta enviada pasa a ser una entrada inmutable para la persona que
-- la creó. Solo el flujo administrativo puede cambiar su moderación.

drop policy if exists "Users can manage own submissions" on public.submissions;

create policy "Users can read own submissions"
  on public.submissions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create pending submissions"
  on public.submissions for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending_review'
    and review_notes is null
  );
