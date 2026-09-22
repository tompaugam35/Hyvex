-- Schéma initial pour Hybrid (MVP)
-- À exécuter dans Supabase : Project > SQL Editor > New query

create table if not exists public.profils (
  user_id uuid primary key references auth.users (id) on delete cascade,
  prenom text not null,
  niveau text not null,
  objectifs jsonb not null,
  jours_disponibles integer not null,
  duree_seance_minutes integer not null,
  materiel jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.programmes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  numero_semaine integer not null,
  date_debut date not null,
  seances jsonb not null,
  dernier_bilan jsonb,
  updated_at timestamptz not null default now()
);

-- Journal : une ligne par séance validée (course, muscu ou explosivité),
-- jamais écrasée. Sert au graphique mensuel et aux "dernières séances".
create table if not exists public.journal_seances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  numero_semaine integer not null,
  seance_id uuid not null,
  jour text not null,
  titre text not null,
  qualite text not null,
  date timestamptz not null default now(),
  rpe integer,
  fatigue integer,
  retours_exercices jsonb,
  notes text,
  created_at timestamptz not null default now()
);

-- Archive : un résumé par semaine passée, créé au moment de l'adaptation.
create table if not exists public.semaines_historique (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  numero_semaine integer not null,
  date_debut date not null,
  nb_seances_prevues integer not null,
  nb_seances_terminees integer not null,
  bilan jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, numero_semaine)
);

alter table public.profils enable row level security;
alter table public.programmes enable row level security;
alter table public.journal_seances enable row level security;
alter table public.semaines_historique enable row level security;

create policy "Un utilisateur gère son propre profil"
  on public.profils for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Un utilisateur gère son propre programme"
  on public.programmes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Un utilisateur gère son propre journal de séances"
  on public.journal_seances for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Un utilisateur gère son propre historique de semaines"
  on public.semaines_historique for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
