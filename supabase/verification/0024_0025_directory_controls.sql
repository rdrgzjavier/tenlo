select
  to_regclass('public.directory_events') is not null as directory_events_exists,
  has_table_privilege('anon', 'public.directory_events', 'insert') as anon_can_insert_directory_events,
  has_table_privilege('anon', 'public.directory_events', 'select') as anon_can_read_directory_events,
  has_table_privilege('anon', 'public.directory_events', 'update') as anon_can_update_directory_events,
  has_table_privilege('anon', 'public.directory_events', 'delete') as anon_can_delete_directory_events,
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

-- Deben ser false en los campos protegidos y true en los de contenido.
select
  has_column_privilege('authenticated', 'public.business_profiles', 'status', 'update') as can_update_business_status,
  has_column_privilege('authenticated', 'public.business_profiles', 'trust_level', 'update') as can_update_business_trust,
  has_column_privilege('authenticated', 'public.business_profiles', 'commercial_plan', 'update') as can_update_business_plan,
  has_column_privilege('authenticated', 'public.business_profiles', 'business_name', 'update') as can_update_business_name,
  has_column_privilege('authenticated', 'public.services', 'status', 'update') as can_update_service_status,
  has_column_privilege('authenticated', 'public.services', 'trust_level', 'update') as can_update_service_trust,
  has_column_privilege('authenticated', 'public.services', 'title', 'update') as can_update_service_title,
  has_column_privilege('authenticated', 'public.listings', 'status', 'update') as can_update_listing_status,
  has_column_privilege('authenticated', 'public.listings', 'title', 'update') as can_update_listing_title,
  has_column_privilege('authenticated', 'public.community_posts', 'status', 'update') as can_update_post_status,
  has_column_privilege('authenticated', 'public.community_posts', 'title', 'update') as can_update_post_title;

-- El permiso general debe ser false. Solo status queda actualizable y RLS lo
-- limita al administrador; payload y notas de revision permanecen inmutables.
select
  has_table_privilege('authenticated', 'public.submissions', 'update')
    as authenticated_can_update_submissions,
  has_column_privilege('authenticated', 'public.submissions', 'status', 'update')
    as authenticated_can_update_submission_status,
  has_column_privilege('authenticated', 'public.submissions', 'payload', 'update')
    as authenticated_can_update_submission_payload,
  has_column_privilege('authenticated', 'public.submissions', 'review_notes', 'update')
    as authenticated_can_update_submission_review_notes,
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'submissions'
      and policyname = 'Admins can update submissions'
  ) as admin_submission_update_policy,
  not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'submissions'
      and policyname = 'Users can manage own submissions'
  ) as owner_submission_update_removed;

-- Debe ser true: el RPC ejecuta solo después de validar tenlo_admin.
select has_function_privilege(
  'authenticated',
  'public.moderate_business_profile(uuid,public.moderation_status)',
  'execute'
) as admin_business_moderation_rpc_available;

select has_function_privilege(
  'authenticated',
  'public.resubmit_business_profile(uuid)',
  'execute'
) as owner_business_resubmission_rpc_available;

-- Historial de consentimiento: lectura solo del titular o admin; sin escritura directa.
select
  to_regclass('public.consent_history') is not null as consent_history_exists,
  has_table_privilege('anon', 'public.consent_history', 'select') as anon_can_read_consent_history,
  has_table_privilege('authenticated', 'public.consent_history', 'insert') as authenticated_can_insert_consent_history,
  has_table_privilege('authenticated', 'public.consent_history', 'update') as authenticated_can_update_consent_history,
  has_table_privilege('authenticated', 'public.consent_history', 'delete') as authenticated_can_delete_consent_history,
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'consent_history'
      and policyname = 'Users can read own consent history'
  ) as own_consent_history_policy,
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'search_events'
      and policyname = 'Users can read own search history'
  ) as own_search_history_policy;

-- Deben devolver una lista de configuración que contenga search_path="".
select
  procedure.proname,
  procedure.proconfig
from pg_proc as procedure
join pg_namespace as namespace on namespace.oid = procedure.pronamespace
where namespace.nspname = 'public'
  and procedure.proname in ('is_tenlo_admin', 'audit_admin_queue_status')
order by procedure.proname;

-- Debe devolver 9: todos los campos de atribución y activación están presentes.
select count(*) as profile_acquisition_columns
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name in (
    'registration_channel',
    'acquisition_entry_channel',
    'acquisition_source',
    'acquisition_medium',
    'acquisition_campaign',
    'acquisition_content',
    'acquisition_landing_path',
    'onboarding_status',
    'last_significant_activity_at'
  );

-- Debe estar disponible para autenticados, aislada y nunca para anónimos.
select
  has_function_privilege('authenticated', 'public.record_profile_activity(text)', 'execute')
    as authenticated_activity_rpc_available,
  has_function_privilege('anon', 'public.record_profile_activity(text)', 'execute')
    as anon_activity_rpc_available,
  (
    select procedure.proconfig
    from pg_proc as procedure
    join pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'record_profile_activity'
    limit 1
  ) as activity_rpc_config;
