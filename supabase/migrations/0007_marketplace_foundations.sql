-- Fundamentos del piloto: confianza, consentimiento, demanda y solicitudes.

alter type public.trust_level add value if not exists 'managed' after 'collected';

alter table public.profiles
  add column if not exists related_center_name text,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz,
  add column if not exists marketing_consent_source text,
  add column if not exists interests text[] not null default '{}';

alter table public.business_profiles
  add column if not exists claim_status text not null default 'unclaimed'
    check (claim_status in ('unclaimed', 'claim_pending', 'managed', 'suspended')),
  add column if not exists commercial_plan text not null default 'free',
  add column if not exists completeness_percent integer not null default 0
    check (completeness_percent between 0 and 100),
  add column if not exists accepts_requests boolean not null default false,
  add column if not exists contact_preferences text[] not null default '{}',
  add column if not exists inactive_reason text;

create table if not exists public.search_events (
  id uuid primary key default gen_random_uuid(),
  anonymous_session_id uuid,
  user_id uuid references public.profiles(id) on delete set null,
  normalized_query text,
  category_id text,
  municipality text,
  filters jsonb not null default '{}'::jsonb,
  results_count integer not null default 0 check (results_count >= 0),
  created_at timestamptz not null default now(),
  check (normalized_query is null or char_length(normalized_query) <= 120)
);

create table if not exists public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.profiles(id) on delete set null,
  provider_id uuid references public.business_profiles(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  category_id text,
  municipality text,
  status text not null default 'submitted'
    check (status in ('submitted', 'delivered', 'viewed', 'responded', 'declined', 'alternative_requested', 'alternative_offered', 'closed')),
  relevance text check (relevance in ('relevant', 'irrelevant') or relevance is null),
  useful_connection boolean,
  first_response_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_connection_requests_updated_at
  before update on public.connection_requests
  for each row execute function public.set_updated_at();

alter table public.search_events enable row level security;
alter table public.connection_requests enable row level security;

create policy "Anyone can record privacy-safe search events"
  on public.search_events for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

create policy "Families can create connection requests"
  on public.connection_requests for insert to authenticated
  with check (auth.uid() = family_id);

create policy "Families can read own connection requests"
  on public.connection_requests for select to authenticated
  using (auth.uid() = family_id);

grant insert on public.search_events to anon, authenticated;
grant select, insert on public.connection_requests to authenticated;
