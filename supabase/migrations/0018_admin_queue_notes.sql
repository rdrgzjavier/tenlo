-- Notas operativas privadas para el seguimiento de las colas administrativas.

create table if not exists public.admin_queue_notes (
  id uuid primary key default gen_random_uuid(),
  queue text not null check (queue in ('claim', 'connection', 'submission', 'feedback')),
  record_id uuid not null,
  note text not null check (char_length(note) between 2 and 2000),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists admin_queue_notes_record_idx
  on public.admin_queue_notes (queue, record_id, created_at desc);

alter table public.admin_queue_notes enable row level security;

create policy "Admins can read queue notes"
  on public.admin_queue_notes for select to authenticated
  using ((select public.is_tenlo_admin()));

create policy "Admins can create queue notes"
  on public.admin_queue_notes for insert to authenticated
  with check (
    (select public.is_tenlo_admin())
    and created_by = (select auth.uid())
  );

grant select, insert on public.admin_queue_notes to authenticated;

