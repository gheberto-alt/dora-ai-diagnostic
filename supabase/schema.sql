create extension if not exists pgcrypto;

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  name text not null,
  email text not null,
  answers jsonb not null,
  average_score numeric(3,2) not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.responses enable row level security;

create policy "Allow anonymous inserts"
on public.responses
for insert
to anon
with check (true);

create policy "Allow anonymous reads"
on public.responses
for select
to anon
using (true);