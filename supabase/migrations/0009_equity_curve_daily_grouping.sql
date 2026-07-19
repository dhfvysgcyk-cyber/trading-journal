-- Multiple same-day events (e.g. a trade + a withdrawal + a prop account
-- activation all on one date) were previously plotted as separate points in
-- whatever arbitrary order Postgres processed the tie, which could show a
-- fake intermediate dip (even into negative territory) before the day's
-- events were all accounted for. Now every day is collapsed into a single
-- net point before computing the running balance.
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
  ),
  daily as (
    select
      event_date,
      sum(delta) as day_delta,
      sum(delta) filter (where event_type = 'trade') as trade_delta,
      coalesce(
        (array_agg(label) filter (where event_type = 'cash'))[1],
        (count(*) filter (where event_type = 'trade'))::text || ' Trade(s)'
      ) as label
    from events
    group by event_date
  )
  select
    event_date,
    round(day_delta::numeric, 2) as delta,
    round(sum(day_delta) over (order by event_date rows between unbounded preceding and current row)::numeric, 2) as balance,
    round(sum(coalesce(trade_delta, 0)) over (order by event_date rows between unbounded preceding and current row)::numeric, 2) as pnl_balance,
    label,
    'day'::text as event_type
  from daily
  order by event_date;
$$;

grant execute on function public.equity_curve(text) to authenticated;
alter function public.equity_curve(text) set search_path = public;
