-- ============================================================
-- RentApto — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Table ────────────────────────────────────────────────────
create table public.apartments (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  created_at          timestamptz not null default now(),

  -- Identity
  name                text,
  neighborhood        text,
  address             text,
  floor               numeric,
  type                text,

  -- Size
  area                numeric,
  bedrooms            numeric,
  bathrooms           numeric,
  age                 numeric,
  parking             numeric,

  -- Ambience
  view                text,
  sun_exposure        text,
  amenities           text[],
  notes               text,

  -- Financial — price & mortgage
  price               numeric,
  down_pct            numeric,
  down_custom         numeric,
  rate                numeric,   -- annual effective rate %
  term                numeric,   -- months
  loan_type           text,
  quota               numeric,   -- computed monthly payment

  -- Monthly income & costs
  rent                numeric,
  seguros             numeric default 300000,
  admin               numeric,
  comision_agencia_pct numeric default 24,
  tax                 numeric,
  other_costs         numeric,

  -- Purchase costs
  gasto_avaluo        numeric default 1600000,
  gasto_titulos       numeric default 1600000,
  escrituracion_pct   numeric default 3.5,
  remodelacion        numeric,

  -- Projection
  ipc                 numeric default 6,
  anio_proyectado     numeric default 3
);

-- ── Row Level Security ────────────────────────────────────────
alter table public.apartments enable row level security;

-- Users can only see their own rows
create policy "Users see own apartments"
  on public.apartments for select
  using (auth.uid() = user_id);

-- Users can only insert their own rows
create policy "Users insert own apartments"
  on public.apartments for insert
  with check (auth.uid() = user_id);

-- Users can only update their own rows
create policy "Users update own apartments"
  on public.apartments for update
  using (auth.uid() = user_id);

-- Users can only delete their own rows
create policy "Users delete own apartments"
  on public.apartments for delete
  using (auth.uid() = user_id);
