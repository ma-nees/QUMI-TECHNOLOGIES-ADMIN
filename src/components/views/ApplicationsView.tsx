'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { fetchApplications, getResumeUrl, deleteApplication } from '@/actions';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Download,
  Inbox,
  Link as LinkIcon,
  Phone,
  RefreshCw,
  Search,
  Tag,
  Trash2
} from 'lucide-react';

type Application = {
  id: string | number;
  name: string;
  email: string;
  phone?: string | null;
  portfolio_url?: string | null;
  cover_letter?: string | null;
  resume_path: string;
  created_at: string;
  jobs?: { title: string } | null;
};

const DAY = 24 * 60 * 60 * 1000;

function initials(name: string) {
  const parts = (name || '?').trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || '?';
}

function shortDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60 * 1000) return 'Just now';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < DAY) return `${Math.floor(diff / 3600000)} h ago`;
  if (diff < 7 * DAY) return d.toLocaleDateString(undefined, { weekday: 'short' });
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function fullDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Skeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-4 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-border" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded bg-border" />
            <div className="h-3 w-3/4 rounded bg-border/70" />
            <div className="h-3 w-full rounded bg-border/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ApplicationsView() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<Application['id'] | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const confirmDelete = async () => {
    if (!selectedId) return;
    setIsDeleting(true);
    try {
      await deleteApplication(selectedId);
      setApplications(prev => prev.filter(a => a.id !== selectedId));
      setSelectedId(null);
      setShowDetail(false);
      setShowDeleteConfirm(false);
    } catch (err: any) {
      alert("Failed to delete application: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchApplications()
      .then((data: any) => {
        const list: Application[] = data ?? [];
        setApplications(list);
        if (list.length) setSelectedId(prev => prev ?? list[0].id);
      })
      .catch(err => {
        console.error('Failed to load applications', err);
        setError('We couldn’t retrieve the applications right now. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = applications.filter(app => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      app.name.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      (app.jobs?.title || 'General Application').toLowerCase().includes(q)
    );
  });

  const selected = applications.find(a => a.id === selectedId);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-medium">
      <div className="grid lg:grid-cols-[380px_1fr]">
        {/* List column */}
        <div className={`${showDetail ? 'hidden lg:block' : 'block'} border-border lg:border-r`}>
          <div className="flex flex-col gap-3 border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-primary">Applications</h2>
              <button
                onClick={load}
                disabled={loading}
                aria-label="Refresh"
                className="rounded-md p-1.5 text-muted transition hover:bg-surface-alt hover:text-primary disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search applications..."
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="max-h-[640px] overflow-y-auto">
            {loading ? (
            <Skeleton />
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle size={24} className="mx-auto mb-3 text-red-600" />
              <p className="text-sm text-muted">{error}</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-muted">
                <Inbox size={20} />
              </div>
              <p className="mt-3 text-sm font-medium text-primary">No applications found</p>
              <p className="mt-1 text-xs text-muted">
                {query ? 'Try adjusting your search.' : "You haven't received any job applications yet."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {visible.map(app => {
                const active = app.id === selectedId;
                return (
                  <li key={app.id}>
                    <button
                      onClick={() => {
                        setSelectedId(app.id);
                        setShowDetail(true);
                      }}
                      className={`relative flex w-full gap-3 p-4 text-left transition-colors ${active ? 'bg-primary/5' : 'hover:bg-surface-alt'
                        }`}
                    >
                      {active && <span className="absolute inset-y-0 left-0 w-[3px] bg-primary" />}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {initials(app.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-primary">{app.name}</span>
                          <span className="shrink-0 text-[11px] text-muted">{shortDate(app.created_at)}</span>
                        </div>
                        <div className="truncate text-xs text-muted">{app.jobs?.title || 'General Application'}</div>
                        {app.cover_letter && (
                          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-body/80">{app.cover_letter}</p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Detail column */}
      <div className={`${showDetail ? 'block' : 'hidden lg:block'} min-h-[480px] overflow-y-auto bg-background`}>
        {selected ? (
          <article className="flex h-full flex-col">
            <div className="border-b border-border p-6 sm:p-8 bg-surface">
              <button
                onClick={() => setShowDetail(false)}
                className="mb-5 inline-flex items-center gap-2 text-sm text-muted hover:text-primary lg:hidden"
              >
                <ArrowLeft size={16} /> Back to list
              </button>

              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-background">
                    {initials(selected.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-serif font-bold text-primary">{selected.name}</h3>
                    <p className="truncate text-sm text-muted">
                      <a href={`mailto:${selected.email}`} className="hover:underline hover:text-primary transition">{selected.email}</a>
                    </p>
                    <p className="mt-1 text-xs text-muted">{fullDate(selected.created_at)}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="shrink-0 rounded-md p-2 text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  title="Delete Application"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  <Tag size={12} /> {selected.jobs?.title || 'General Application'}
                </span>
                {selected.phone && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-body">
                    <Phone size={13} className="text-muted" /> {selected.phone}
                  </span>
                )}
                {selected.portfolio_url && (
                  <a href={selected.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-body hover:border-primary hover:text-primary transition">
                    <LinkIcon size={13} className="text-muted" /> Portfolio
                  </a>
                )}
              </div>
            </div>

            <div className="flex-1 p-6 sm:p-8 space-y-8">
              {selected.resume_path && (
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Resume / CV</p>
                  <a
                    href={getResumeUrl(selected.resume_path) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-md border border-border bg-surface p-4 text-sm font-medium text-primary shadow-soft hover:border-primary/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                      <Download size={18} />
                    </div>
                    <div>
                      <div className="block">Download Resume</div>
                      <div className="text-xs text-muted font-normal mt-0.5">Click to view or save file</div>
                    </div>
                  </a>
                </div>
              )}

              {selected.cover_letter && (
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Cover Letter</p>
                  <div className="whitespace-pre-wrap rounded-md border border-border/60 border-l-[3px] border-l-primary bg-surface p-5 text-[15px] leading-relaxed text-body">
                    {selected.cover_letter}
                  </div>
                </div>
              )}
            </div>
          </article>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-muted">
              <Inbox size={24} />
            </div>
            <p className="mt-4 font-medium text-primary">No application selected</p>
            <p className="mt-1 max-w-xs text-sm text-muted">Select an application from the list to view its details, cover letter, and resume.</p>
          </div>
        )}
      </div>
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-surface shadow-2xl border border-border animate-pop-in" style={{ animationDuration: '0.3s' }}>
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                  <AlertCircle size={20} />
                </div>
                <h3 className="text-lg font-semibold text-primary">Delete Application</h3>
              </div>
              <p className="text-[15px] leading-relaxed text-body">
                Are you sure you want to delete this job application from <span className="font-semibold text-primary">{selected?.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 bg-surface-alt/50 px-6 py-4 border-t border-border">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-md px-4 py-2 text-sm font-medium text-muted transition hover:text-primary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50 shadow-soft"
              >
                {isDeleting ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isDeleting ? 'Deleting...' : 'Delete Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
