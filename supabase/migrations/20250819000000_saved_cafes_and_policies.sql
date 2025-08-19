-- Table (idempotent-ish: create if missing)
create table if not exists public.saved_cafes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, business_id)
);
-- RLS so the API can read/write own rows
alter table public.saved_cafes enable row level security;
drop policy if exists "read own saved cafes" on public.saved_cafes;
create policy "read own saved cafes"
on public.saved_cafes for select
using (auth.uid() = user_id);
drop policy if exists "insert own saved cafes" on public.saved_cafes;
create policy "insert own saved cafes"
on public.saved_cafes for insert
with check (auth.uid() = user_id);
drop policy if exists "delete own saved cafes" on public.saved_cafes;
create policy "delete own saved cafes"
on public.saved_cafes for delete
using (auth.uid() = user_id);
grant select, insert, delete on public.saved_cafes to authenticated;
