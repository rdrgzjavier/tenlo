-- Seguimiento estructurado y visible para la familia en solicitudes de contacto.

alter table public.connection_requests
  add column if not exists provider_notified_at timestamptz,
  add column if not exists provider_response_summary text,
  add column if not exists alternative_summary text,
  add column if not exists last_family_update_at timestamptz;

alter table public.connection_requests
  drop constraint if exists connection_requests_provider_response_summary_length,
  add constraint connection_requests_provider_response_summary_length
    check (provider_response_summary is null or char_length(provider_response_summary) <= 1000),
  drop constraint if exists connection_requests_alternative_summary_length,
  add constraint connection_requests_alternative_summary_length
    check (alternative_summary is null or char_length(alternative_summary) <= 1000);

grant update (status, provider_notified_at, provider_response_summary, alternative_summary, last_family_update_at, first_response_at, closed_at, relevance, useful_connection)
  on public.connection_requests to authenticated;

