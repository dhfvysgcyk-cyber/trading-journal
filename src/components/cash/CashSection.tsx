import { useEffect, useState } from 'react'
import { deleteCashTransaction, fetchCashTransactions, insertCashTransaction } from '../../api/cashTransactions'
import { CashForm } from './CashForm'
import { Modal } from '../ui/Modal'
import { EmptyState } from '../ui/EmptyState'
import { fmtDate, fmtEuro, pnlClass } from '../../lib/format'
import type { AccountType, CashTransaction, CashTransactionInput } from '../../types/domain'

const ACCOUNT_LABEL: Record<AccountType, string> = { live: 'Live Account', propfirm: 'Propfirm' }

export function CashSection({ account }: { account: AccountType }) {
  const [transactions, setTransactions] = useState<CashTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    const data = await fetchCashTransactions(account)
    setTransactions(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  const netCash = transactions.reduce((sum, t) => sum + (t.type === 'deposit' ? t.amount : -t.amount), 0)

  async function handleSubmit(input: CashTransactionInput) {
    await insertCashTransaction(input)
    setShowForm(false)
    await load()
  }

  async function handleDelete(t: CashTransaction) {
    if (!confirm('Diese Buchung wirklich löschen?')) return
    await deleteCashTransaction(t.id)
    await load()
  }

  return (
    <div className="card cash-section">
      <div className="page-header">
        <h2 className="section-title" style={{ margin: 0 }}>{ACCOUNT_LABEL[account]}</h2>
        <button type="button" className="btn" onClick={() => setShowForm(true)}>+ Buchung</button>
      </div>

      <div className="cash-net-row">
        <span>Netto-Einzahlungen</span>
        <strong className={pnlClass(netCash)}>{fmtEuro(netCash)}</strong>
      </div>

      {loading ? (
        <div className="loading-screen">Lade…</div>
      ) : transactions.length === 0 ? (
        <EmptyState text="Noch keine Ein-/Auszahlungen erfasst." />
      ) : (
        <div className="cash-list">
          {transactions.map((t) => (
            <div key={t.id} className="cash-row">
              <span>{fmtDate(t.occurred_at)}</span>
              <span className="account-badge">{t.type === 'deposit' ? 'Einzahlung' : 'Auszahlung'}</span>
              <span className="cash-note">{t.note ?? ''}</span>
              <strong className={pnlClass(t.type === 'deposit' ? t.amount : -t.amount)}>
                {t.type === 'deposit' ? '+' : '-'}{fmtEuro(t.amount)}
              </strong>
              <button type="button" className="btn btn-secondary cash-delete-btn" onClick={() => handleDelete(t)}>Löschen</button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={`${ACCOUNT_LABEL[account]}: Neue Buchung`} onClose={() => setShowForm(false)}>
          <CashForm account={account} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  )
}
