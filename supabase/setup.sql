-- À exécuter UNE SEULE FOIS dans Supabase : SQL Editor → New query → coller → Run.
-- Crée la table qui stocke tes données et verrouille l'accès : chaque utilisateur
-- ne peut lire et écrire que sa propre ligne.

create table if not exists public.app_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb       not null,
  version    integer     not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

create policy "lecture de sa propre ligne"
  on public.app_state for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "creation de sa propre ligne"
  on public.app_state for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "modification de sa propre ligne"
  on public.app_state for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
