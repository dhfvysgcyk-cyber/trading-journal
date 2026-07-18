import { useEffect, useState } from 'react'
import { deleteTrade, fetchTrades, insertTrade, updateTrade, type TradeFilters } from '../api/trades'
import { TradeForm } from '../components/trades/TradeForm'
import { TradeTable } from '../components/trades/TradeTable'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import type { AccountType, Trade, TradeInput } from '../types/domain'

export function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [accountFilter, setAccountFilter] = useState<AccountType | ''>('')
  const [editing, setEditing] = useState<Trade | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    const filters: TradeFilters = {}
    if (accountFilter) filters.account = accountFilter
    const data = await fetchTrades(filters)
    setTrades(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountFilter])

  async function handleSubmit(input: TradeInput) {
    if (editing) {
      await updateTrade(editing.id, input)
    } else {
      await insertTrade(input)
    }
    setShowForm(false)
    setEditing(null)
    await load()
  }

  async function handleDelete(trade: Trade) {
    if (!confirm('Diesen Trade wirklich löschen?')) return
    await deleteTrade(trade.id)
    await load()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Trading Journal</h1>
        <button type="button" className="btn" onClick={() => { setEditing(null); setShowForm(true) }}>+ Neuer Trade</button>
      </div>

      <div className="filter-row">
        <select className="input" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value as AccountType | '')}>
          <option value="">Alle Accounts</option>
          <option value="live">Live</option>
          <option value="propfirm">Propfirm</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-screen">Lade…</div>
      ) : trades.length === 0 ? (
        <EmptyState text='Noch keine Trades erfasst. Lege deinen ersten Trade über "Neuer Trade" an.' />
      ) : (
        <TradeTable trades={trades} onEdit={(t) => { setEditing(t); setShowForm(true) }} onDelete={handleDelete} />
      )}

      {showForm && (
        <Modal title={editing ? 'Trade bearbeiten' : 'Neuer Trade'} onClose={() => { setShowForm(false); setEditing(null) }}>
          <TradeForm initial={editing} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditing(null) }} />
        </Modal>
      )}
    </div>
  )
}
