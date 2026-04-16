-- Migration v2 — run in Supabase SQL Editor after the initial schema.sql
-- Adds: estrato, links, seguro_pct

alter table public.apartments
  add column if not exists estrato        integer,
  add column if not exists links          text[] default '{}',
  add column if not exists seguro_pct     numeric default 0.05,
  add column if not exists escrituracion_pct numeric default 2.5,
  add column if not exists escrituracion_override numeric;

-- Remove old fixed-amount columns that are now auto-calculated
-- (only if they exist — safe to run even if already migrated)
alter table public.apartments
  alter column seguros drop default,
  alter column comision_agencia_pct drop default;
