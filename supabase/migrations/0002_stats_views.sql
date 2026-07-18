create view public.account_stats
with (security_invoker = true) as
select
  t.user_id, t.account,
  count(*) as trade_count,
  count(*) filter (where t.result in ('TP','SL')) as decided_count,
  count(*) filter (where t.result = 'TP') as win_count,
  count(*) filter (where t.result = 'SL') as loss_count,
  round(100.0 * count(*) filter (where t.result = 'TP')
    / nullif(count(*) filter (where t.result in ('TP','SL')), 0), 1) as winrate,
  round(coalesce(sum(t.pnl), 0)::numeric, 2) as total_pnl,
  case when coalesce(abs(sum(t.pnl) filter (where t.pnl < 0)), 0) > 0
    then round((sum(t.pnl) filter (where t.pnl > 0)
         / abs(sum(t.pnl) filter (where t.pnl < 0)))::numeric, 2)
    else null end as profit_factor,
  round(avg(t.rr)::numeric, 2) as avg_rr,
  round(avg(t.realized_rr)::numeric, 2) as avg_realized_rr
from public.trades t
group by t.user_id, t.account;

create view public.account_cash_summary
with (security_invoker = true) as
select user_id, account,
  round(coalesce(sum(case when type = 'deposit' then amount else -amount end), 0)::numeric, 2) as net_cash
from public.cash_transactions
group by user_id, account;

create view public.account_overview
with (security_invoker = true) as
with accounts as (
  select user_id, account from public.trades
  union
  select user_id, account from public.cash_transactions
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

create view public.overview_summary
with (security_invoker = true) as
select user_id,
  sum(trade_count) as trade_count,
  round(sum(total_pnl)::numeric, 2) as total_pnl,
  round(sum(current_balance)::numeric, 2) as combined_balance
from public.account_overview
group by user_id;

create or replace function public.equity_curve(p_account text)
returns table (event_date date, delta numeric, balance numeric, label text)
language sql stable security invoker as $$
  with events as (
    select t.datum::date as event_date, t.pnl as delta, coalesce(t.symbol, 'Trade') as label
    from public.trades t
    where t.user_id = auth.uid() and t.account = p_account and t.pnl is not null and t.datum is not null
    union all
    select c.occurred_at, case when c.type = 'deposit' then c.amount else -c.amount end,
           case when c.type = 'deposit' then 'Einzahlung' else 'Auszahlung' end
    from public.cash_transactions c
    where c.user_id = auth.uid() and c.account = p_account
  )
  select event_date, delta,
    round(sum(delta) over (order by event_date rows between unbounded preceding and current row)::numeric, 2),
    label
  from events order by event_date;
$$;

create or replace function public.daily_pnl(p_account text)
returns table (trade_date date, pnl numeric, trade_count int)
language sql stable security invoker as $$
  select t.datum::date, round(sum(t.pnl)::numeric, 2), count(*)::int
  from public.trades t
  where t.user_id = auth.uid() and t.account = p_account and t.datum is not null and t.pnl is not null
  group by t.datum::date order by 1;
$$;

create or replace function public.pnl_by_weekday(p_account text)
returns table (weekday int, pnl numeric, trade_count int)
language sql stable security invoker as $$
  select extract(isodow from t.datum)::int, round(sum(t.pnl)::numeric, 2), count(*)::int
  from public.trades t
  where t.user_id = auth.uid() and t.account = p_account and t.datum is not null and t.pnl is not null
  group by 1 order by 1;
$$;

create or replace function public.breakdown_by_symbol(p_account text)
returns table (symbol text, trade_count int, winrate numeric, total_pnl numeric)
language sql stable security invoker as $$
  select t.symbol, count(*)::int,
    round(100.0 * count(*) filter (where t.result = 'TP')
      / nullif(count(*) filter (where t.result in ('TP','SL')), 0), 1),
    round(coalesce(sum(t.pnl), 0)::numeric, 2)
  from public.trades t
  where t.user_id = auth.uid() and t.account = p_account and t.symbol is not null
  group by t.symbol order by 2 desc;
$$;

grant execute on function public.equity_curve(text) to authenticated;
grant execute on function public.daily_pnl(text) to authenticated;
grant execute on function public.pnl_by_weekday(text) to authenticated;
grant execute on function public.breakdown_by_symbol(text) to authenticated;

alter function public.equity_curve(text) set search_path = public;
alter function public.daily_pnl(text) set search_path = public;
alter function public.pnl_by_weekday(text) set search_path = public;
alter function public.breakdown_by_symbol(text) set search_path = public;
