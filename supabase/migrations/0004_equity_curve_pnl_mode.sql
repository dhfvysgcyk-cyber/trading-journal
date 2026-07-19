-- equity_curve now returns both a combined balance (trades + cash flows,
-- previous behavior) and a pnl_balance that only accumulates trade PnL -
-- cash events contribute 0 to it, so deposits/withdrawals no longer distort
-- the pure trading-performance curve. Return type changed (new columns),
-- so the old function must be dropped first.
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
  )
  select event_date, delta,
    round(sum(delta) over (order by event_date rows between unbounded preceding and current row)::numeric, 2) as balance,
    round(sum(delta) filter (where event_type = 'trade') over (order by event_date rows between unbounded preceding and current row)::numeric, 2) as pnl_balance,
    label, event_type
  from events order by event_date;
$$;

alter function public.equity_curve(text) set search_path = public;
grant execute on function public.equity_curve(text) to authenticated;
