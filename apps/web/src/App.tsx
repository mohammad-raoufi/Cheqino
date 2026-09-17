import { useMemo, useState } from 'react'
import './App.css'
import { ChequeCalendar } from './components/ChequeCalendar'
import { ChequeCard } from './components/ChequeCard'
import { ChequeForm } from './components/ChequeForm'
import { Dashboard } from './components/Dashboard'
import { NotificationSettings } from './components/NotificationSettings'
import { useCheques } from './hooks/useCheques'
import { computeStatus, formatAmount, formatShamsi, STATUS_ICONS, STATUS_LABELS } from '@cheqino/shared'
import type { Cheque, ChequeStatus } from '@cheqino/shared'

type ViewMode = 'list' | 'calendar'
type StatusFilter = ChequeStatus | 'all'

const FILTER_OPTIONS: StatusFilter[] = ['all', 'pending', 'due_soon', 'due', 'cleared', 'bounced']

function App() {
  const { cheques, loading, addCheque, updateCheque, removeCheque } = useCheques()
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<ViewMode>('list')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const nearestDue = useMemo(() => {
    const unresolved = cheques.filter((c) => {
      const s = computeStatus(c)
      return s !== 'cleared' && s !== 'bounced'
    })
    return [...unresolved].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null
  }, [cheques])

  const filterCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: cheques.length,
      pending: 0,
      due_soon: 0,
      due: 0,
      cleared: 0,
      bounced: 0,
    }
    for (const cheque of cheques) {
      counts[computeStatus(cheque)]++
    }
    return counts
  }, [cheques])

  const visibleCheques = useMemo(() => {
    let list = cheques
    if (selectedDate) {
      list = list.filter((c) => c.dueDate === selectedDate)
    } else if (statusFilter !== 'all') {
      list = list.filter((c) => computeStatus(c) === statusFilter)
    }
    return [...list].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [cheques, statusFilter, selectedDate])

  async function handleAddCheque(input: Parameters<typeof addCheque>[0]) {
    await addCheque(input)
    setShowForm(false)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>چکینو</h1>
        <NotificationSettings />
      </header>

      <Dashboard cheques={cheques} />

      {nearestDue && (
        <section className="spotlight-section">
          <h2 className="section-title">نزدیک‌ترین سررسید</h2>
          <NearestDueCard cheque={nearestDue} />
        </section>
      )}

      <div className="list-section-head">
        <h2 className="section-title">
          همه چک‌ها <span className="section-count">{formatAmount(cheques.length)}</span>
        </h2>
      </div>

      <div className="list-controls">
        <button
          type="button"
          className="filter-chip"
          onClick={() => setFilterSheetOpen(true)}
        >
          {statusFilter === 'all' ? 'همه وضعیت‌ها' : STATUS_LABELS[statusFilter]}
          <span aria-hidden="true">▾</span>
        </button>

        <div className="segmented" role="tablist" aria-label="نمایش چک‌ها">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'list'}
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >
            لیست
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'calendar'}
            className={view === 'calendar' ? 'active' : ''}
            onClick={() => setView('calendar')}
          >
            تقویم
          </button>
        </div>
      </div>

      {view === 'calendar' && (
        <ChequeCalendar cheques={cheques} onSelectDate={setSelectedDate} />
      )}

      {selectedDate && (
        <div className="selected-date-banner">
          <span>چک‌های {formatShamsi(selectedDate)}</span>
          <button type="button" onClick={() => setSelectedDate(null)}>
            پاک کردن
          </button>
        </div>
      )}

      <main className="cheque-list">
        {loading && <p className="empty-state">در حال بارگذاری...</p>}
        {!loading && visibleCheques.length === 0 && (
          <p className="empty-state">چکی برای نمایش وجود ندارد.</p>
        )}
        {visibleCheques.map((cheque) => (
          <ChequeCard
            key={cheque.id}
            cheque={cheque}
            onMarkCleared={(id) => updateCheque(id, { manualStatus: 'cleared' })}
            onMarkBounced={(id) => updateCheque(id, { manualStatus: 'bounced' })}
            onDelete={(id) => removeCheque(id)}
          />
        ))}
      </main>

      <button type="button" className="fab" aria-label="ثبت چک جدید" onClick={() => setShowForm(true)}>
        +
      </button>

      {filterSheetOpen && (
        <div className="sheet-overlay" onClick={() => setFilterSheetOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-grab" />
            <h3>فیلتر وضعیت</h3>
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className="sheet-option"
                onClick={() => {
                  setStatusFilter(option)
                  setFilterSheetOpen(false)
                }}
              >
                <span className="sheet-option-left">
                  <span className={`radio${statusFilter === option ? ' checked' : ''}`} />
                  {option === 'all' ? 'همه چک‌ها' : `${STATUS_ICONS[option]} ${STATUS_LABELS[option]}`}
                </span>
                <span className="sheet-option-count">{formatAmount(filterCounts[option])}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ChequeForm onSubmit={handleAddCheque} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

function NearestDueCard({ cheque }: { cheque: Cheque }) {
  const status = computeStatus(cheque)
  return (
    <div className={`spotlight-card status-${status}`}>
      <div className="spotlight-top">
        <div>
          <div className="spotlight-amount">{formatAmount(cheque.amount)} ریال</div>
          <div className="spotlight-party">{cheque.partyName}</div>
        </div>
        <span className={`status-badge status-${status}`}>
          <span aria-hidden="true">{STATUS_ICONS[status]}</span>
          {STATUS_LABELS[status]}
        </span>
      </div>
      <div className="spotlight-meta">
        <span>📅 {formatShamsi(cheque.dueDate, true)}</span>
        {cheque.bankName && <span>🏦 {cheque.bankName}</span>}
      </div>
    </div>
  )
}

export default App
