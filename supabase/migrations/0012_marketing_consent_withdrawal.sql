-- Evidencia mínima para poder retirar y, si procede, volver a otorgar marketing.

alter table public.profiles
  add column if not exists marketing_consent_withdrawn_at timestamptz;
