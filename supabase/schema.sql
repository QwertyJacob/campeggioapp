-- Crea la tabella delle registrazioni
create table public.registrazioni (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  cognome text not null,
  eta integer not null,
  date_disponibili text[] not null,
  area_campeggio text not null,
  area_altro_dettaglio text,
  ruolo text not null,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- Abilita Row Level Security
alter table public.registrazioni enable row level security;

-- Chiunque può inserire (form pubblico di registrazione)
create policy "Chiunque può registrarsi"
  on public.registrazioni
  for insert
  to anon
  with check (true);

-- Solo utenti autenticati (admin) possono leggere i dati
create policy "Solo admin può vedere le registrazioni"
  on public.registrazioni
  for select
  to authenticated
  using (true);
