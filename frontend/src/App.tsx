import React, { useState, useCallback } from 'react';
import { getTickets } from './api/tickets';
import { BoardView } from './components/BoardView';
import { CreateTicketModal } from './components/CreateTicketModal';
import { Toast } from './components/Toast';
import type { Priority, Status, Ticket } from 'shared/types';
import { PRIORITIES, STATUSES } from 'shared/types';

type ToastType = 'info' | 'success' | 'error' | 'warning';

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [toast, setToast] = useState<{ message: string; type: ToastType }>({ message: '', type: 'info' });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTickets({
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      });
      setTickets(data);
    } catch (err) {
      setTickets([]);
      setError(err instanceof Error ? err.message : 'Error fetching tickets');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  React.useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, message: '' }));
  }, []);

  const filteredTickets = React.useMemo(() => {
    let list = tickets;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          (t.subject && t.subject.toLowerCase().includes(q)) ||
          (t.message && t.message.toLowerCase().includes(q)) ||
          (t.id && String(t.id).includes(q))
      );
    }
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tickets, search]);

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-bg">
      <aside className="hidden sm:flex w-14 flex-shrink-0 flex-col items-center border-r border-border bg-surface py-3">
        <div className="flex flex-col items-center gap-0.5 mb-4 text-[0.6875rem] font-semibold text-text-muted">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">S</span>
          <span>Support</span>
        </div>
        <nav className="flex w-full flex-col">
          <a href="#board" className="py-2.5 text-center text-xs text-accent font-semibold border-l-[3px] border-accent">
            Board
          </a>
        </nav>
      </aside>

      <div className="flex flex-1 min-w-0 flex-col">
        <header className="flex flex-shrink-0 items-center gap-2 min-h-[56px] px-4 py-0 sm:px-5 sm:gap-3 bg-surface border-b border-border">
          <div className="hidden sm:flex flex-1 max-w-[400px] items-center gap-2 px-3 py-2 bg-bg border border-border rounded-md">
            <svg className="flex-shrink-0 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search" className="flex-1 min-w-0 bg-transparent border-none text-sm text-text outline-none placeholder:text-text-muted" readOnly aria-label="Search" />
          </div>
          <button type="button" className="inline-flex items-center justify-center min-h-touch min-w-[44px] px-3.5 py-2.5 bg-accent text-white border-0 rounded-md text-sm font-semibold cursor-pointer transition-colors hover:bg-accent-hover" onClick={() => setCreateOpen(true)}>
            Create
          </button>
          <button
            type="button"
            className="flex sm:w-9 sm:h-9 sm:min-w-0 sm:min-h-0 items-center justify-center w-[44px] h-[44px] min-w-[44px] min-h-[44px] bg-transparent border-0 rounded-md text-text-muted cursor-pointer transition-colors hover:bg-surface-hover hover:text-text"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
          </button>
        </header>

        <div className="flex-1 overflow-auto overflow-x-hidden p-3 sm:p-5">
          <div className="mb-3 sm:mb-4">
            <h1 className="m-0 mb-2 text-xl sm:text-2xl font-semibold text-text">Support</h1>
            <div className="flex gap-1">
              <a href="#board" className="tab-active px-3.5 py-2 text-sm font-medium text-accent rounded-md">
                Board
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => { setSearchOpen((o) => !o); if (filterDropdownOpen) setFilterDropdownOpen(false); }}
                className="inline-flex items-center gap-2 min-h-touch sm:min-h-0 px-3.5 py-2.5 sm:py-1.5 bg-surface border border-border rounded-md text-[0.8125rem] text-text cursor-pointer transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-accent/30"
                aria-expanded={searchOpen}
                aria-haspopup="true"
                aria-label="Open search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Search
                {search.trim() ? (
                  <span className="bg-accent text-white text-[0.625rem] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">1</span>
                ) : null}
                <svg width="12" height="12" className={`transition-transform ${searchOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {searchOpen && (
                <>
                  <div className="fixed inset-0 z-10" aria-hidden onClick={() => setSearchOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 z-20 min-w-[260px] bg-surface border border-border rounded-lg shadow-lg py-3 px-3">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-text-muted mb-2">Search board</p>
                    <div className="flex items-center gap-2 px-2.5 py-2 bg-bg border border-border rounded-md">
                      <svg className="flex-shrink-0 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input
                        type="text"
                        placeholder="Subject, message, or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 min-w-0 bg-transparent border-none text-[0.8125rem] text-text outline-none placeholder:text-text-muted"
                        aria-label="Search board"
                        autoFocus
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setFilterDropdownOpen((o) => !o); if (searchOpen) setSearchOpen(false); }}
                className="inline-flex items-center gap-2 min-h-touch sm:min-h-0 px-3.5 py-2.5 sm:py-1.5 bg-surface border border-border rounded-md text-[0.8125rem] text-text cursor-pointer transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-accent/30"
                aria-expanded={filterDropdownOpen}
                aria-haspopup="true"
                aria-label="Open filter dropdown"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filter
                {(statusFilter || priorityFilter) ? (
                  <span className="bg-accent text-white text-[0.625rem] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {(statusFilter ? 1 : 0) + (priorityFilter ? 1 : 0)}
                  </span>
                ) : null}
                <svg width="12" height="12" className={`transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {filterDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" aria-hidden onClick={() => setFilterDropdownOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 z-20 min-w-[220px] bg-surface border border-border rounded-lg shadow-lg py-3 px-3">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-text-muted mb-2">Filter by</p>
                    <label className="block mb-3">
                      <span className="block text-[0.75rem] text-text-muted mb-1">Status</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter((e.target.value || '') as Status | '')}
                        className="w-full py-2 px-2.5 bg-bg border border-border rounded-md text-[0.8125rem] text-text focus:outline-none focus:ring-2 focus:ring-accent/30"
                        aria-label="Filter by status"
                      >
                        <option value="">All</option>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s === 'NEW' ? 'To Do' : s === 'INVESTIGATING' ? 'In Progress' : 'Done'}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-[0.75rem] text-text-muted mb-1">Priority</span>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter((e.target.value || '') as Priority | '')}
                        className="w-full py-2 px-2.5 bg-bg border border-border rounded-md text-[0.8125rem] text-text focus:outline-none focus:ring-2 focus:ring-accent/30"
                        aria-label="Filter by priority"
                      >
                        <option value="">All</option>
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          {!loading && !error && (
            <p className="m-0 mb-2 text-sm font-medium text-text-muted">
              Total tickets: <span className="text-text">{filteredTickets.length}</span>
            </p>
          )}
          <div className="min-h-[300px] sm:min-h-[400px] pb-3 sm:pb-2 mb-[env(safe-area-inset-bottom,0)]" id="board">
            <BoardView tickets={filteredTickets} loading={loading} error={error} onUpdate={fetchTickets} onToast={showToast} onRetry={fetchTickets} />
          </div>
        </div>
      </div>

      <CreateTicketModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchTickets} onToast={showToast} />

      <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} duration={toast.message ? 4000 : 0} />
    </div>
  );
}

export default App;
