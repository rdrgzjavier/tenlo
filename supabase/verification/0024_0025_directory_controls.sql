select
  to_regclass('public.directory_events') is not null as directory_events_exists,
  has_function_privilege('anon', 'public.get_public_centers()', 'execute') as anon_can_read_public_centers,
  has_function_privilege('anon', 'public.get_public_business_profiles()', 'execute') as anon_can_read_public_providers,
  has_function_privilege('anon', 'public.get_public_services()', 'execute') as anon_can_read_public_services,
  has_table_privilege('anon', 'public.centers', 'select') as anon_can_select_centers_base,
  has_table_privilege('anon', 'public.business_profiles', 'select') as anon_can_select_providers_base,
  has_table_privilege('anon', 'public.services', 'select') as anon_can_select_services_base,
  (select count(*) from public.get_public_centers()) as public_centers,
  (select count(*) from public.get_public_business_profiles()) as public_providers,
  (select count(*) from public.get_public_services()) as public_services,
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'directory_events'
      and policyname = 'Admins can analyze directory events'
  ) as admin_directory_reporting_policy;

select
  has_column_privilege('authenticated', 'public.profiles', 'role', 'update') as authenticated_can_update_role,
  has_column_privilege('authenticated', 'public.profiles', 'status', 'update') as authenticated_can_update_status,
  has_column_privilege('authenticated', 'public.profiles', 'display_name', 'update') as authenticated_can_update_display_name,
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can create safe own profile'
  ) as safe_profile_insert_policy;
