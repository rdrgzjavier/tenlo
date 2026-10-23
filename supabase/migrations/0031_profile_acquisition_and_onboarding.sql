-- Atribución propia y acotada para relacionar captación con activación real.
-- No guarda query strings, términos buscados, IP, user-agent ni referrer completo.

alter table public.profiles
  add column if not exists registration_channel text not null default 'unknown'
    check (registration_channel in ('email', 'google', 'unknown')),
  add column if not exists acquisition_entry_channel text
    check (acquisition_entry_channel is null or acquisition_entry_channel in ('campaign', 'organic_search', 'referral', 'direct')),
  add column if not exists acquisition_source text
    check (acquisition_source is null or char_length(acquisition_source) <= 80),
  add column if not exists acquisition_medium text
    check (acquisition_medium is null or char_length(acquisition_medium) <= 80),
  add column if not exists acquisition_campaign text
    check (acquisition_campaign is null or char_length(acquisition_campaign) <= 80),
  add column if not exists acquisition_content text
    check (acquisition_content is null or char_length(acquisition_content) <= 80),
  add column if not exists acquisition_landing_path text
    check (acquisition_landing_path is null or (acquisition_landing_path like '/%' and char_length(acquisition_landing_path) <= 200)),
  add column if not exists onboarding_status text not null default 'registered'
    check (onboarding_status in ('registered', 'email_confirmed', 'profile_started', 'profile_complete', 'active')),
  add column if not exists last_significant_activity_at timestamptz;

create index if not exists profiles_acquisition_reporting_idx
  on public.profiles (created_at desc, acquisition_entry_channel, acquisition_source, acquisition_campaign);

comment on column public.profiles.acquisition_landing_path is
  'Ruta de entrada sin query string ni fragmento; no contiene el termino buscado.';
comment on column public.profiles.onboarding_status is
  'Estado operativo de activacion; no sustituye al estado de moderacion de la cuenta.';
