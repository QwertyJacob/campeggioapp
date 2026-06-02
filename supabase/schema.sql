-- =============================================================
-- Campeggio Estivo Gioventù Idente 2026 — Schema Supabase
-- Esegui questo intero file nel SQL Editor di Supabase
-- =============================================================

-- Elimina la tabella precedente (se esiste) e ricreala
drop table if exists public.registrazioni;

create table public.registrazioni (
  id                    uuid default gen_random_uuid() primary key,
  user_id               uuid references auth.users(id) on delete cascade unique,
  username              text not null unique,
  nome                  text not null,
  cognome               text not null,
  eta                   integer not null,
  date_disponibili      text[] not null,
  area_campeggio        text not null,
  area_altro_dettaglio  text,
  ruolo                 text not null,
  stato                 text not null default 'in_attesa',  -- 'in_attesa' | 'approvato'
  capo_area             boolean not null default false,
  created_at            timestamp with time zone default timezone('utc', now()) not null
);

-- Abilita Row Level Security
alter table public.registrazioni enable row level security;

-- Utenti autenticati possono inserire la propria registrazione
create policy "Utenti possono registrarsi"
  on public.registrazioni
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Utenti vedono solo la propria registrazione
create policy "Utenti vedono la propria registrazione"
  on public.registrazioni
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Nota: le operazioni admin (approve, update, select all) avvengono tramite
-- la service_role key nelle API routes, che bypass la RLS automaticamente.

-- =============================================================
-- IMPOSTAZIONI SUPABASE DA CONFIGURARE:
--
-- 1. Authentication → Settings → Email:
--    → Disabilita "Enable email confirmations"
--
-- 2. Aggiungi variabili in Vercel:
--    → NEXT_PUBLIC_SUPABASE_URL  (da Project Settings → API)
--    → NEXT_PUBLIC_SUPABASE_ANON_KEY (da Project Settings → API)
--    → SUPABASE_SERVICE_ROLE_KEY (da Project Settings → API → service_role)
--
-- 3. Dopo il deploy, visita una volta:
--    → https://campeggioapp.vercel.app/api/seed
--    per creare l'utente admin jcevallos
-- =============================================================
