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
  round(avg(t.realized_rr)::numeric, 2) as avg_realized_rr,
  round(avg(t.pnl) filter (where t.pnl > 5)::numeric, 2) as avg_win_pnl,
  round(avg(t.pnl) filter (where t.pnl < -5)::numeric, 2) as avg_loss_pnl
from public.trades t
group by t.user_id, t.account;

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
  round((coalesce(c.net_cash, 0) + coalesce(s.total_pnl, 0))::numeric, 2) as current_balance,
  s.avg_win_pnl, s.avg_loss_pnl
from accounts a
left join public.account_stats s using (user_id, account)
left join public.account_cash_summary c using (user_id, account);
