import { useEffect, useState } from 'react'
import { fetchPropAccounts, insertPropAccount, setPropAccountActive } from '../../api/propAccounts'
import { deleteCashTransaction, fetchCashTransactions, insertCashTransaction } from '../../api/cashTransactions'
import { PropAccountForm } from './PropAccountForm'
import { WithdrawalForm } from './WithdrawalForm'
import { Modal } from '../ui/Modal'
import { EmptyState } from '../ui/EmptyState'
import { TrashIcon } from '../ui/icons'
import { fmtDate, fmtEuro, pnlClass } from '../../lib/format'
import type { CashTransaction, CashTransactionInput, PropAccount, PropAccountInput } from '../../types/domain'

export function PropAccountsSection() {
  const [accounts, setAccounts] = useState<PropAccount[]>([])
  const [withdrawals, setWithdrawals] = useState<CashTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)

  async function load() {
    setLoading(true)
    const [a, w] = await Promise.all([fetchPropAccounts(), fetchCashTransactions('propfirm')])
    setAccounts(a)
    setWithdrawals(w.filter((t) => t.type === 'withdrawal'))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const netCash =
    accounts.filter((a) => a.active).reduce((sum, a) => sum + a.size, 0) -
    withdrawals.reduce((sum, w) => sum + w.amount, 0)

  async function handleAddAccount(input: PropAccountInput) {
    await insertPropAccount(input)
    setShowAccountForm(false)
    await load()
  }

  async function handleToggleActive(a: PropAccount) {
    const action = a.active ? 'deaktivieren' : 'aktivieren'
    const name = a.note ?? 'Ohne Notiz'
    if (!confirm(`Account "${name}" (${fmtEuro(a.size)}) wirklich ${action}?`)) return
    await setPropAccountActive(a.id, !a.active)
    await load()
  }

  async function handleAddWithdrawal(input: CashTransactionInput) {
    await insertCashTransaction(input)
    setShowWithdrawalForm(false)
    await load()
  }

  async function handleDeleteWithdrawal(w: CashTransaction) {
    if (!confirm('Diese Auszahlung wirklich löschen?')) return
    await deleteCashTransaction(w.id)
    await load()
  }

  function accountLabel(id: string | null): string {
    const a = accounts.find((acc) => acc.id === id)
    if (!a) return '–'
    return a.note ? `${a.note} · ${fmtEuro(a.size)}` : fmtEuro(a.size)
  }

  return (
    <>
      <div className="card cash-section">
        <div className="page-header">
          <h2 className="section-title" style={{ margin: 0 }}>Propfirm</h2>
          <button type="button" className="btn" onClick={() => setShowAccountForm(true)}>+ Account hinzufügen</button>
        </div>

        <div className="cash-net-row">
          <span>Netto-Kontostand</span>
          <strong className={pnlClass(netCash)}>{fmtEuro(netCash)}</strong>
        </div>

        {loading ? (
          <div className="loading-screen">Lade…</div>
        ) : accounts.length === 0 ? (
          <EmptyState text="Noch keine Prop-Accounts erfasst." />
        ) : (
          <div className="cash-list">
            {accounts.map((a) => (
              <div key={a.id} className="prop-account-row">
                <div>
                  <div className="prop-account-note">{a.note ?? 'Ohne Notiz'}</div>
                  <div className="prop-account-meta">{fmtDate(a.opened_at)} · {fmtEuro(a.size)}</div>
                </div>
                <div className="prop-account-actions">
                  <span className={`status-badge ${a.active ? 'status-active' : 'status-inactive'}`}>
                    {a.active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                  <button type="button" className="btn btn-secondary prop-account-toggle" onClick={() => handleToggleActive(a)}>
                    {a.active ? 'Deaktivieren' : 'Aktivieren'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="section-header" style={{ marginTop: '1.25rem' }}>
          <h3 className="section-title" style={{ margin: 0, fontSize: '0.95rem' }}>Auszahlungen</h3>
          <button type="button" className="btn" onClick={() => setShowWithdrawalForm(true)}>+ Auszahlung</button>
        </div>

        {loading ? null : withdrawals.length === 0 ? (
          <EmptyState text="Noch keine Auszahlungen erfasst." />
        ) : (
          <div className="cash-list">
            {withdrawals.map((w) => (
              <div key={w.id} className="cash-row">
                <span>{fmtDate(w.occurred_at)}</span>
                <span className="account-badge">{accountLabel(w.prop_account_id)}</span>
                <span className="cash-note">{w.note ?? ''}</span>
                <strong className="negative">-{fmtEuro(w.amount)}</strong>
                <button type="button" className="icon-btn icon-btn-danger" aria-label="Löschen" title="Löschen" onClick={() => handleDeleteWithdrawal(w)}>
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAccountForm && (
        <Modal title="Propfirm: Account hinzufügen" onClose={() => setShowAccountForm(false)}>
          <PropAccountForm onSubmit={handleAddAccount} onCancel={() => setShowAccountForm(false)} />
        </Modal>
      )}

      {showWithdrawalForm && (
        <Modal title="Propfirm: Neue Auszahlung" onClose={() => setShowWithdrawalForm(false)}>
          <WithdrawalForm accounts={accounts} onSubmit={handleAddWithdrawal} onCancel={() => setShowWithdrawalForm(false)} />
        </Modal>
      )}
    </>
  )
}
