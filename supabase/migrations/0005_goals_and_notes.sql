create table public.monthly_goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  account     text not null check (account in ('live','propfirm')),
  year        int not null,
  month       int not null check (month between 1 and 12),
  target_pnl  numeric not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, account, year, month)
);
alter table public.monthly_goals enable row level security;
create policy "monthly_goals_owner_all" on public.monthly_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.daily_notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  note_date   date not null,
  note        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, note_date)
);
alter table public.daily_notes enable row level security;
create policy "daily_notes_owner_all" on public.daily_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
