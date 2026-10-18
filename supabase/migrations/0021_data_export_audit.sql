-- Trazabilidad mínima de exportaciones de datos sin almacenar el contenido exportado.

create table if not exists public.data_export_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  export_scope text not null check (export_scope in ('admin_operation', 'account_portability')),
  record_count integer not null default 0 check (record_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists data_export_audit_actor_created_idx
  on public.data_export_audit (actor_id, created_at desc);

alter table public.data_export_audit enable row level security;

create policy "Users can record own data exports"
  on public.data_export_audit for insert to authenticated
  with check (actor_id = (select auth.uid()));

create policy "Admins can read data export audit"
  on public.data_export_audit for select to authenticated
  using ((select public.is_tenlo_admin()));

grant select, insert on public.data_export_audit to authenticated;
