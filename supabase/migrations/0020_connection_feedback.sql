-- Resultado declarado por la familia para medir conexiones útiles sin texto libre.

create table if not exists public.connection_feedback (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.connection_requests(id) on delete cascade,
  family_id uuid not null references public.profiles(id) on delete cascade,
  useful boolean not null,
  outcome text not null check (outcome in ('information', 'conversation', 'proposal', 'booking', 'hired', 'not_progressed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists connection_feedback_family_idx on public.connection_feedback (family_id, created_at desc);
alter table public.connection_feedback enable row level security;

create policy "Families can read own connection feedback" on public.connection_feedback
  for select to authenticated using ((select auth.uid()) = family_id);
create policy "Families can create own connection feedback" on public.connection_feedback
  for insert to authenticated with check (
    (select auth.uid()) = family_id and exists (
      select 1 from public.connection_requests request
      where request.id = request_id and request.family_id = (select auth.uid())
    )
  );
create policy "Families can update own connection feedback" on public.connection_feedback
  for update to authenticated using ((select auth.uid()) = family_id)
  with check ((select auth.uid()) = family_id);
create policy "Admins can read connection feedback" on public.connection_feedback
  for select to authenticated using ((select public.is_tenlo_admin()));

create trigger set_connection_feedback_updated_at before update on public.connection_feedback
  for each row execute function public.set_updated_at();
grant select, insert, update (useful, outcome) on public.connection_feedback to authenticated;

