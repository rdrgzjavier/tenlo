-- Completa las solicitudes del piloto con una referencia estable a la ficha y datos mínimos de contacto.

alter table public.connection_requests
  add column if not exists target_type text not null default 'listing'
    check (target_type in ('listing', 'center', 'provider')),
  add column if not exists target_id text,
  add column if not exists message text,
  add column if not exists contact_preference text not null default 'tenlo'
    check (contact_preference in ('tenlo', 'email', 'phone')),
  add column if not exists adult_confirmation boolean not null default false,
  add column if not exists alternatives_requested boolean not null default false;

alter table public.connection_requests
  drop constraint if exists connection_requests_target_id_length,
  add constraint connection_requests_target_id_length
    check (target_id is null or char_length(target_id) between 1 and 160),
  drop constraint if exists connection_requests_message_length,
  add constraint connection_requests_message_length
    check (message is null or char_length(message) between 10 and 1500);

create index if not exists connection_requests_family_created_idx
  on public.connection_requests (family_id, created_at desc);

create index if not exists connection_requests_target_idx
  on public.connection_requests (target_type, target_id)
  where target_id is not null;

grant select, insert on public.connection_requests to authenticated;
