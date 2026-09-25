-- Schéma initial pour Hybrid (MVP)
-- À exécuter dans Supabase : Project > SQL Editor > New query

create table if not exists public.profils (
  user_id uuid primary key references auth.users (id) on delete cascade,
  prenom text not null,
  niveau text not null,
  taille_cm integer,
  poids_kg numeric,
  poids_objectif_kg numeric,
  dernier_bilan_mensuel_vu text,
  photo_url text,
  objectif_calories integer,
  objectif_proteines_g numeric,
  objectif_glucides_g numeric,
  objectif_lipides_g numeric,
  qualites_prioritaires jsonb not null default '[]',
  performance_course jsonb not null default '{}',
  performance_muscu jsonb not null default '{}',
  objectifs_texte jsonb not null default '{}',
  autres_sports jsonb not null default '[]',
  objectifs jsonb not null,
  seances_par_semaine integer not null,
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
  autres_sports_places jsonb not null default '[]',
  dernier_bilan jsonb,
  updated_at timestamptz not null default now()
);

-- Journal : une ligne par séance validée (course, muscu ou explosivité),
-- jamais écrasée. Sert au graphique mensuel et aux "dernières séances".
-- numero_semaine/seance_id sont absents pour les courses importées depuis Strava,
-- qui ne sont pas rattachées à une séance planifiée dans le programme.
create table if not exists public.journal_seances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  numero_semaine integer,
  seance_id uuid,
  jour text not null,
  titre text not null,
  qualite text not null,
  date timestamptz not null default now(),
  rpe integer,
  fatigue integer,
  retours_exercices jsonb,
  notes text,
  source text not null default 'manuel',
  strava_activity_id bigint,
  distance_metres numeric,
  duree_secondes integer,
  denivele_metres numeric,
  terrain text,
  -- Durée prévue de la séance au moment de sa validation (pas la durée réelle) :
  -- sert au calcul du temps total d'entraînement dans le bilan mensuel.
  duree_estimee_minutes integer,
  created_at timestamptz not null default now(),
  unique (user_id, strava_activity_id)
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

-- Une ligne par jour où le poids a été renseigné (au plus une par jour : une
-- nouvelle saisie le même jour remplace la précédente). Sert au graphique
-- d'évolution poids/fatigue de la page profil.
create table if not exists public.poids_historique (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  poids_kg numeric not null,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Jetons OAuth Strava, un par utilisateur connecté.
create table if not exists public.strava_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  athlete_id bigint,
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,
  derniere_synchro timestamptz,
  created_at timestamptz not null default now()
);

-- Un repas photographié et analysé par l'IA. La photo est stockée redimensionnée
-- (data URL base64) directement en base, sans bucket de stockage séparé.
create table if not exists public.repas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titre text not null,
  calories integer not null,
  proteines_g numeric not null,
  glucides_g numeric not null,
  lipides_g numeric not null,
  photo text,
  created_at timestamptz not null default now()
);

alter table public.profils enable row level security;
alter table public.programmes enable row level security;
alter table public.journal_seances enable row level security;
alter table public.semaines_historique enable row level security;
alter table public.poids_historique enable row level security;
alter table public.strava_tokens enable row level security;
alter table public.repas enable row level security;

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

create policy "Un utilisateur gère son propre historique de poids"
  on public.poids_historique for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Un utilisateur gère son propre jeton Strava"
  on public.strava_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Un utilisateur gère ses propres repas"
  on public.repas for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
