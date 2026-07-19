create table public.prop_accounts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  size        numeric not null check (size > 0),
  note        text,
  opened_at   date not null default current_date,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.prop_accounts enable row level security;
create policy "prop_accounts_owner_all" on public.prop_accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.cash_transactions
  add column prop_account_id uuid references public.prop_accounts(id) on delete set null;

create or replace view public.account_cash_summary
with (security_invoker = true) as
select auth.uid() as user_id, 'live'::text as account,
  round(coalesce(sum(case when type = 'deposit' then amount else -amount end), 0)::numeric, 2) as net_cash
from public.cash_transactions
where account = 'live'
union all
select auth.uid() as user_id, 'propfirm'::text as account,
  round((
    coalesce((select sum(size) from public.prop_accounts where active), 0)
    - coalesce((select sum(amount) from public.cash_transactions where account = 'propfirm' and type = 'withdrawal'), 0)
  )::numeric, 2) as net_cash;

create or replace view public.account_overview
with (security_invoker = true) as
with accounts as (
  select user_id, account from public.trades
  union
  select user_id, account from public.cash_transactions
  union
  select user_id, 'propfirm'::text as account from public.prop_accounts
)
select
  a.user_id, a.account,
  coalesce(s.trade_count, 0) as trade_count,
  s.winrate, coalesce(s.total_pnl, 0) as total_pnl, s.profit_factor, s.avg_rr, s.avg_realized_rr,
  coalesce(c.net_cash, 0) as net_cash,
  round((coalesce(c.net_cash, 0) + coalesce(s.total_pnl, 0))::numeric, 2) as current_balance
from accounts a
left join public.account_stats s using (user_id, account)
left join public.account_cash_summary c using (user_id, account);

drop function public.equity_curve(text);

create function public.equity_curve(p_account text)
returns table (event_date date, delta numeric, balance numeric, pnl_balance numeric, label text, event_type text)
language sql stable security invoker as $$
  with events as (
    select t.datum::date as event_date, t.pnl as delta, coalesce(t.symbol, 'Trade') as label, 'trade'::text as event_type
    from public.trades t
    where t.user_id = auth.uid() and t.account = p_account and t.pnl is not null and t.datum is not null

    union all

    select c.occurred_at, case when c.type = 'deposit' then c.amount else -c.amount end,
           case when c.type = 'deposit' then 'Einzahlung' else 'Auszahlung' end, 'cash'::text
    from public.cash_transactions c
    where c.user_id = auth.uid() and c.account = p_account
      and (p_account <> 'propfirm' or c.type = 'withdrawal')

    union all

    select pa.opened_at, pa.size,
           case when pa.note is not null then 'Account: ' || pa.note else 'Neuer Account' end,
           'cash'::text
    from public.prop_accounts pa
    where pa.user_id = auth.uid() and p_account = 'propfirm'
  )
  select event_date, delta,
    round(sum(delta) over (order by event_date rows between unbounded preceding and current row)::numeric, 2) as balance,
    round(sum(delta) filter (where event_type = 'trade') over (order by event_date rows between unbounded preceding and current row)::numeric, 2) as pnl_balance,
    label, event_type
  from events order by event_date;
$$;

grant execute on function public.equity_curve(text) to authenticated;
alter function public.equity_curve(text) set search_path = public;

-- Data migration: turn legacy propfirm 'deposit' rows into prop_accounts, and
-- re-point existing propfirm withdrawals (that don't yet reference an
-- account) to the newly created one.
do $$
declare
  dep record;
  new_id uuid;
begin
  for dep in select * from public.cash_transactions where account = 'propfirm' and type = 'deposit' loop
    insert into public.prop_accounts (user_id, size, note, opened_at, active)
    values (dep.user_id, dep.amount, coalesce(dep.note, 'Umgewandelt aus alter Einzahlung'), dep.occurred_at, true)
    returning id into new_id;

    update public.cash_transactions
    set prop_account_id = new_id
    where account = 'propfirm' and type = 'withdrawal' and prop_account_id is null and user_id = dep.user_id;

    delete from public.cash_transactions where id = dep.id;
  end loop;
end $$;
