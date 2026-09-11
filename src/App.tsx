import { useMemo, useState } from 'react'
import './App.css'
import { ChequeCalendar } from './components/ChequeCalendar'
import { ChequeCard } from './components/ChequeCard'
import { ChequeForm } from './components/ChequeForm'
import { Dashboard } from './components/Dashboard'
import { NotificationSettings } from './components/NotificationSettings'
import { useCheques } from './hooks/useCheques'
import { formatShamsi } from './lib/shamsi'
import { computeStatus, STATUS_LABELS } from './lib/status'
import type { ChequeStatus } from './types'

type ViewMode = 'list' | 'calendar'
type StatusFilter = ChequeStatus | 'all'

function App() {
  const { cheques, loading, addCheque, updateCheque, removeCheque } = useCheques()
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<ViewMode>('list')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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
        <button type="button" className="primary" onClick={() => setShowForm(true)}>
          + ثبت چک جدید
        </button>
      </header>

      <Dashboard cheques={cheques} />

      <NotificationSettings />

      <div className="view-toggle">
        <button
          type="button"
          className={view === 'list' ? 'active' : ''}
          onClick={() => setView('list')}
        >
          لیست
        </button>
        <button
          type="button"
          className={view === 'calendar' ? 'active' : ''}
          onClick={() => setView('calendar')}
        >
          تقویم
        </button>
      </div>

      {view === 'calendar' && (
        <ChequeCalendar cheques={cheques} onSelectDate={setSelectedDate} />
      )}

      {view === 'list' && (
        <div className="status-filter">
          {(['all', 'pending', 'due_soon', 'due', 'cleared', 'bounced'] as const).map(
            (status) => (
              <button
                key={status}
                type="button"
                className={statusFilter === status ? 'active' : ''}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'همه' : STATUS_LABELS[status]}
              </button>
            ),
          )}
        </div>
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

export default App
