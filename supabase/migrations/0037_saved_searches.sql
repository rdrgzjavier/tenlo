create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  search_path text not null check (
    char_length(search_path) between 7 and 500
    and search_path like '/buscar%'
    and search_path not like '%://%'
  ),
  category_id text check (category_id is null or char_length(category_id) <= 100),
  municipality text check (municipality is null or char_length(municipality) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, search_path)
);

create index if not exists saved_searches_user_created_idx
  on public.saved_searches (user_id, created_at desc);

create trigger set_saved_searches_updated_at
  before update on public.saved_searches
  for each row execute function public.set_updated_at();

alter table public.saved_searches enable row level security;

create policy "Users can read own saved searches"
  on public.saved_searches for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own saved searches"
  on public.saved_searches for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own saved searches"
  on public.saved_searches for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own saved searches"
  on public.saved_searches for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.saved_searches from anon;
grant select, insert, update, delete on table public.saved_searches to authenticated;
