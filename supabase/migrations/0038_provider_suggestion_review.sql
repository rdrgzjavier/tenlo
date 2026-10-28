create table public.provider_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  provider_name text not null check (char_length(provider_name) between 2 and 160),
  website text check (website is null or char_length(website) <= 500),
  location text not null check (char_length(location) between 2 and 160),
  service text check (service is null or char_length(service) <= 160),
  notes text check (notes is null or char_length(notes) <= 2000),
  submitter_name text check (submitter_name is null or char_length(submitter_name) <= 120),
  submitter_email text check (submitter_email is null or char_length(submitter_email) <= 180),
  status public.moderation_status not null default 'pending_review',
  converted_profile_id uuid references public.business_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index provider_suggestions_status_created_idx on public.provider_suggestions (status, created_at desc);
create trigger set_provider_suggestions_updated_at before update on public.provider_suggestions for each row execute function public.set_updated_at();
alter table public.provider_suggestions enable row level security;

create policy "Anyone can propose a provider" on public.provider_suggestions for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));
create policy "Admins can review provider suggestions" on public.provider_suggestions for select to authenticated
  using ((select public.is_tenlo_admin()));

revoke all on table public.provider_suggestions from anon, authenticated;
grant insert on table public.provider_suggestions to anon, authenticated;
grant select on table public.provider_suggestions to authenticated;

create or replace function public.convert_provider_suggestion(
  target_id uuid, reviewed_name text, reviewed_website text, reviewed_municipality text,
  reviewed_category text, reviewed_description text
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  suggestion public.provider_suggestions;
  created_profile_id uuid;
  clean_website text := nullif(btrim(reviewed_website), '');
begin
  if not public.is_tenlo_admin() then raise exception 'Not authorized'; end if;
  select * into suggestion from public.provider_suggestions where id = target_id for update;
  if suggestion.id is null then raise exception 'Suggestion not found'; end if;
  if suggestion.status <> 'pending_review' or suggestion.converted_profile_id is not null then raise exception 'Suggestion already reviewed'; end if;
  if char_length(btrim(reviewed_name)) < 2 or char_length(btrim(reviewed_municipality)) < 2
    or char_length(btrim(reviewed_category)) < 2 or char_length(btrim(reviewed_description)) < 20 then
    raise exception 'Incomplete reviewed profile';
  end if;
  if clean_website is not null and clean_website !~* '^https?://' then raise exception 'Invalid website'; end if;
  if exists (
    select 1 from public.business_profiles profile
    where lower(profile.business_name) = lower(btrim(reviewed_name))
      and lower(coalesce(profile.municipality, '')) = lower(btrim(reviewed_municipality))
  ) then raise exception 'Provider already exists'; end if;

  insert into public.business_profiles (
    owner_id, business_name, website, municipality, service_area, category, description,
    trust_level, status, source_name, source_url, last_reviewed, record_origin, external_key,
    claim_status, commercial_plan, accepts_requests
  ) values (
    null, btrim(reviewed_name), clean_website, btrim(reviewed_municipality), btrim(reviewed_municipality),
    btrim(reviewed_category), btrim(reviewed_description), 'collected', 'approved',
    'Propuesta revisada por Tenlo', clean_website, current_date, 'user_submitted',
    'suggestion-' || replace(target_id::text, '-', ''), 'unclaimed', 'free', false
  ) returning id into created_profile_id;

  update public.provider_suggestions set status = 'approved', converted_profile_id = created_profile_id where id = target_id;
  return created_profile_id;
end;
$$;

revoke all on function public.convert_provider_suggestion(uuid, text, text, text, text, text) from public;
grant execute on function public.convert_provider_suggestion(uuid, text, text, text, text, text) to authenticated;
