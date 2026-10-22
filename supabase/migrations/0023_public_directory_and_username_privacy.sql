-- Endurece la lectura pública del directorio y evita enumerar UUID de perfiles
-- durante la comprobación de nombres públicos.

drop policy if exists "Public can read centers" on public.centers;
create policy "Anyone can read approved centers"
  on public.centers for select to anon, authenticated
  using (status = 'approved');

drop policy if exists "Anyone can read approved business profiles" on public.business_profiles;
create policy "Anyone can read approved business profiles"
  on public.business_profiles for select to anon, authenticated
  using (status = 'approved');

grant select on public.business_profiles to anon;

create or replace function public.is_profile_username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    char_length(btrim(candidate)) between 3 and 40
    and not exists (
      select 1
      from public.profile_usernames
      where public_name_normalized = lower(regexp_replace(btrim(candidate), '\s+', ' ', 'g'))
    );
$$;

revoke all on function public.is_profile_username_available(text) from public;
grant execute on function public.is_profile_username_available(text) to anon, authenticated;

drop policy if exists "Anyone can check profile usernames" on public.profile_usernames;
create policy "Users can read own profile username"
  on public.profile_usernames for select to authenticated
  using ((select auth.uid()) = profile_id);

revoke select on public.profile_usernames from anon;
grant select on public.profile_usernames to authenticated;

drop policy if exists "Admins can analyze search events" on public.search_events;
create policy "Admins can analyze search events"
  on public.search_events for select to authenticated
  using ((select public.is_tenlo_admin()));

grant select on public.search_events to authenticated;
