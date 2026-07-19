-- Winrate switches from result-based (TP/SL only) to PnL-threshold-based:
-- every trade counts toward the denominator, win = pnl > 5, loss = pnl < -5.
create or replace view public.account_stats
with (security_invoker = true) as
select
  t.user_id, t.account,
  count(*) as trade_count,
  count(*) filter (where t.pnl is not null) as decided_count,
  count(*) filter (where t.pnl > 5) as win_count,
  count(*) filter (where t.pnl < -5) as loss_count,
  round(100.0 * count(*) filter (where t.pnl > 5)
    / nullif(count(*), 0), 1) as winrate,
  round(coalesce(sum(t.pnl), 0)::numeric, 2) as total_pnl,
  case when coalesce(abs(sum(t.pnl) filter (where t.pnl < 0)), 0) > 0
    then round((sum(t.pnl) filter (where t.pnl > 0)
         / abs(sum(t.pnl) filter (where t.pnl < 0)))::numeric, 2)
    else null end as profit_factor,
  round(avg(t.rr)::numeric, 2) as avg_rr,
  round(avg(t.realized_rr)::numeric, 2) as avg_realized_rr
from public.trades t
group by t.user_id, t.account;

create or replace function public.breakdown_by_symbol(p_account text)
returns table (symbol text, trade_count int, winrate numeric, total_pnl numeric)
language sql stable security invoker as $$
  select t.symbol, count(*)::int,
    round(100.0 * count(*) filter (where t.pnl > 5)
      / nullif(count(*), 0), 1),
    round(coalesce(sum(t.pnl), 0)::numeric, 2)
  from public.trades t
  where t.user_id = auth.uid() and t.account = p_account and t.symbol is not null
  group by t.symbol order by 2 desc;
$$;

alter function public.breakdown_by_symbol(text) set search_path = public;
