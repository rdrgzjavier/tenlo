-- Una propuesta enviada es inmutable: el administrador puede cambiar su estado,
-- pero no alterar el contenido que aportó la persona usuaria.

revoke update on public.submissions from authenticated;
grant update (status) on public.submissions to authenticated;

comment on table public.submissions is
  'Propuestas aportadas por usuarios. El contenido enviado es inmutable; solo su estado de moderacion puede cambiar.';
