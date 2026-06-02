# Campeggio Estivo Gioventù Idente 2026 — Dev Reference

Web app per coordinare ruoli e responsabilità dei professori e collaboratori del campeggio estivo. Tutta la UI è in **italiano**.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v3 |
| Database + Auth | Supabase (PostgreSQL + Supabase Auth) |
| Deploy | Vercel (auto-deploy dal branch `main`) |

---

## Struttura del progetto

```
src/
├── app/
│   ├── page.tsx                  # Landing page (Accedi / Registrati)
│   ├── layout.tsx                # Root layout, metadata, Tailwind
│   ├── globals.css               # Tailwind base
│   ├── accedi/
│   │   └── page.tsx              # Login (username + password)
│   ├── registrati/
│   │   └── page.tsx              # Form registrazione pubblica
│   ├── dashboard/
│   │   ├── page.tsx              # Server component: smista admin vs utente
│   │   ├── AdminView.tsx         # Client component: pannello admin
│   │   └── LogoutButton.tsx      # Client component: bottone logout
│   └── api/
│       ├── seed/route.ts         # GET  — crea utente admin jcevallos (una volta sola)
│       ├── approva/route.ts      # POST — approva o revoca una registrazione
│       └── aggiorna/route.ts     # POST — modifica area/date/ruolo/capo_area
├── lib/
│   ├── constants.ts              # DATE_DISPONIBILI, AREE, RUOLI, EMAIL_DOMAIN
│   ├── supabase.ts               # Browser client (@supabase/ssr createBrowserClient)
│   ├── supabase-server.ts        # Server client (usa cookies di Next.js)
│   └── supabase-admin.ts         # Admin client (service_role key, solo server-side)
└── middleware.ts                 # Protegge /dashboard — redirect a /accedi se non loggato

supabase/
└── schema.sql                    # Schema completo da eseguire nel SQL Editor di Supabase
```

---

## Autenticazione

Usa **Supabase Auth** con password. Poiché Supabase richiede un'email, ogni username viene mappato internamente come:

```
{username}@campeggio.interno
```

Questa email non viene mai mostrata agli utenti. La costante `EMAIL_DOMAIN = "@campeggio.interno"` è in `src/lib/constants.ts`.

**Requisito:** La conferma email deve essere **disabilitata** in Supabase (Authentication → Settings → Email Auth → disable "Enable email confirmations"). Altrimenti il signup non crea la sessione immediatamente.

### Sessione e cookie

Il client browser (`@supabase/ssr createBrowserClient`) salva la sessione in cookie HTTP, non solo in localStorage. Questo permette al server di leggere la sessione tramite `createServerSupabaseClient()` nel middleware e nei Server Components.

### Ruolo admin

Il flag admin è in `auth.users.user_metadata.is_admin = true`. Viene impostato dall'endpoint `/api/seed` al momento della creazione dell'utente jcevallos. Per verificarlo lato server:

```ts
const { data: { user } } = await supabase.auth.getUser()
const isAdmin = user?.user_metadata?.is_admin === true
```

---

## Database

### Tabella `registrazioni`

| Colonna | Tipo | Note |
|---|---|---|
| `id` | uuid | PK, auto-generato |
| `user_id` | uuid | FK → `auth.users.id`, unique |
| `username` | text | unique, lowercase |
| `nome` | text | |
| `cognome` | text | |
| `eta` | integer | |
| `date_disponibili` | text[] | Array di date ISO, es. `["2026-07-13", "2026-07-14"]` |
| `area_campeggio` | text | Valori: `aperta`, `umanistica`, `servizi`, `sanitaria`, `altro` |
| `area_altro_dettaglio` | text | Nullable, usato quando `area_campeggio = 'altro'` |
| `ruolo` | text | Valori: `aiuto-prof`, `prof`, `collaboratore` |
| `stato` | text | `in_attesa` (default) oppure `approvato` |
| `capo_area` | boolean | Default false, assegnabile solo dall'admin |
| `created_at` | timestamptz | Auto |

### RLS (Row Level Security)

- **INSERT** — solo utenti autenticati, con `user_id = auth.uid()` (protezione self-insert)
- **SELECT** — solo l'utente proprietario (`user_id = auth.uid()`)
- **UPDATE / DELETE / SELECT admin** — gestiti tramite `supabaseAdmin` (service_role key), che bypassa la RLS

---

## Variabili d'ambiente

| Variabile | Dove | Descrizione |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + `.env.local` | URL del progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + `.env.local` | Chiave pubblica (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo Vercel (mai su client) | Chiave service_role, bypassa RLS |

Le prime due hanno il prefisso `NEXT_PUBLIC_` e sono esposte al browser (è corretto — la RLS le protegge). La `SERVICE_ROLE_KEY` non ha prefisso e viene usata **solo** in `src/lib/supabase-admin.ts` e nelle API routes.

---

## Flussi principali

### Registrazione (`/registrati`)
1. Utente compila il form (nome, cognome, età, username, password, date, area, ruolo)
2. `supabase.auth.signUp({ email: username@campeggio.interno, password })` — crea account
3. Insert su `registrazioni` con `user_id = authData.user.id`
4. Redirect a `/dashboard` → mostra schermata "in validazione"

### Login (`/accedi`)
1. `supabase.auth.signInWithPassword({ email: username@campeggio.interno, password })`
2. Redirect a `/dashboard`

### Dashboard utente normale
- Mostra "grazie, in validazione" se `stato = 'in_attesa'`
- Mostra "sei stato approvato" se `stato = 'approvato'`
- Bottone logout

### Dashboard admin (`is_admin = true`)
- Server component carica tutte le registrazioni tramite `supabaseAdmin`
- `AdminView.tsx` (client) gestisce:
  - **Approva** → `POST /api/approva` con `{ id, stato: 'approvato' }`
  - **Revoca** → `POST /api/approva` con `{ id, stato: 'in_attesa' }`
  - **Modifica** → modal con date, area, ruolo, capo_area → `POST /api/aggiorna`
- Dopo ogni azione chiama `router.refresh()` per ri-caricare i dati server-side

### Setup admin (`/api/seed`)
- Chiamato **una sola volta** dopo il primo deploy
- Usa `supabaseAdmin.auth.admin.createUser()` per creare jcevallos
- Inserisce la registrazione con `stato = 'approvato'` e `is_admin = true` nei metadati
- Idempotente: se l'utente esiste già risponde senza errore

---

## Costanti condivise (`src/lib/constants.ts`)

```ts
DATE_DISPONIBILI   // 13 date: "2026-07-13" → "2026-07-25"
AREE               // aperta | umanistica | servizi | sanitaria | altro
RUOLI              // aiuto-prof | prof | collaboratore
EMAIL_DOMAIN       // "@campeggio.interno"
```

Qualsiasi modifica a date o aree va fatta in questo file — viene usato sia nei form pubblici che nel pannello admin.

---

## Sicurezza delle API routes

`/api/approva` e `/api/aggiorna` verificano sempre che il chiamante sia admin:

```ts
const supabase = await createServerSupabaseClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user || !user.user_metadata?.is_admin) return 403
// poi usa supabaseAdmin per l'operazione
```

Non fidarsi mai dell'input client per determinare i permessi.

---

## Deploy

- **Vercel** legge dal branch `main` e fa auto-deploy a ogni push
- Il build command è `npm run build` (standard Next.js)
- Le variabili d'ambiente vanno impostate nel dashboard Vercel (Settings → Environment Variables)
- Dopo aver aggiunto `SUPABASE_SERVICE_ROLE_KEY` serve un Redeploy manuale

---

## Checklist setup nuovo ambiente

1. Esegui `supabase/schema.sql` nel SQL Editor di Supabase
2. In Supabase: disabilita conferma email (Authentication → Settings)
3. In Vercel: aggiungi le 3 variabili d'ambiente
4. Dopo il deploy: visita `/api/seed` una volta per creare jcevallos
5. Login: `jcevallos` / `bigj26`
