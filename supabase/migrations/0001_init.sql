create extension if not exists pgcrypto;

create table public.trades (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  account          text not null check (account in ('live','propfirm')),
  datum            timestamptz,
  symbol           text,
  direction        text check (direction in ('Long','Short')),
  rr               numeric,
  entry_emotion    text,
  result           text check (result in ('TP','SL','BE','TSL')),
  realized_rr      numeric,
  pnl              numeric,
  reason           text,
  plan_adherence   text,
  adverse_emotion  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index trades_user_account_idx on public.trades(user_id, account);
create index trades_datum_idx on public.trades(datum);
alter table public.trades enable row level security;
create policy "trades_owner_all" on public.trades
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.cash_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  account     text not null check (account in ('live','propfirm')),
  type        text not null check (type in ('deposit','withdrawal')),
  amount      numeric not null check (amount > 0),
  occurred_at date not null default current_date,
  note        text,
  created_at  timestamptz not null default now()
);
create index cash_transactions_user_account_idx on public.cash_transactions(user_id, account);
alter table public.cash_transactions enable row level security;
create policy "cash_transactions_owner_all" on public.cash_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
