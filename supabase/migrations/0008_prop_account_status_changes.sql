create table public.prop_account_status_changes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  prop_account_id uuid not null references public.prop_accounts(id) on delete cascade,
  active          boolean not null,
  occurred_at     date not null default current_date,
  created_at      timestamptz not null default now()
);
alter table public.prop_account_status_changes enable row level security;
create policy "prop_account_status_changes_owner_all" on public.prop_account_status_changes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Backfill for accounts created before this table existed: record their
-- initial activation at opened_at, and (since we don't know the exact
-- historical toggle date) a deactivation "today" for any already inactive.
insert into public.prop_account_status_changes (user_id, prop_account_id, active, occurred_at)
select user_id, id, true, opened_at from public.prop_accounts;

insert into public.prop_account_status_changes (user_id, prop_account_id, active, occurred_at)
select user_id, id, false, current_date from public.prop_accounts where active = false;

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

    select sc.occurred_at,
      case when sc.active then pa.size else -pa.size end,
      case when sc.active then coalesce('Account aktiv: ' || pa.note, 'Account aktiv')
           else coalesce('Account deaktiviert: ' || pa.note, 'Account deaktiviert') end,
      'cash'::text
    from public.prop_account_status_changes sc
    join public.prop_accounts pa on pa.id = sc.prop_account_id
    where sc.user_id = auth.uid() and p_account = 'propfirm'
  )
  select event_date, delta,
    round(sum(delta) over (order by event_date rows between unbounded preceding and current row)::numeric, 2) as balance,
    round(sum(delta) filter (where event_type = 'trade') over (order by event_date rows between unbounded preceding and current row)::numeric, 2) as pnl_balance,
    label, event_type
  from events order by event_date;
$$;

grant execute on function public.equity_curve(text) to authenticated;
alter function public.equity_curve(text) set search_path = public;
