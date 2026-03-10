import React, { useState, useCallback } from 'react';
import { getTickets } from './api/tickets';
import { BoardView } from './components/BoardView';
import { CreateTicketModal } from './components/CreateTicketModal';
import { Toast } from './components/Toast';
import type { Ticket } from 'shared/types';

type ToastType = 'info' | 'success' | 'error' | 'warning';

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
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
    try {
      const data = await getTickets();
      setTickets(data);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (!search.trim()) return tickets;
    const q = search.trim().toLowerCase();
    return tickets.filter(
      (t) =>
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.message && t.message.toLowerCase().includes(q)) ||
        (t.id && String(t.id).includes(q))
    );
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
            <div className="flex flex-1 min-w-0 items-center gap-2 px-2.5 py-2 sm:py-1.5 min-h-touch sm:min-h-0 sm:flex-none sm:min-w-[200px] bg-surface border border-border rounded-md">
              <svg className="flex-shrink-0 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search board"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-none text-[0.8125rem] text-text outline-none placeholder:text-text-muted"
                aria-label="Search board"
              />
            </div>
            <button type="button" className="inline-flex items-center justify-center min-h-touch sm:min-h-0 px-3.5 py-2.5 sm:py-1.5 sm:px-3 bg-surface border border-border rounded-md text-[0.8125rem] text-text cursor-pointer transition-colors hover:bg-surface-hover">
              Filter
            </button>
          </div>

          <div className="min-h-[300px] sm:min-h-[400px] pb-3 sm:pb-2 mb-[env(safe-area-inset-bottom,0)]" id="board">
            <BoardView tickets={filteredTickets} loading={loading} onUpdate={fetchTickets} onToast={showToast} />
          </div>
        </div>
      </div>

      <CreateTicketModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchTickets} onToast={showToast} />

      <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} duration={toast.message ? 4000 : 0} />
    </div>
  );
}

export default App;
