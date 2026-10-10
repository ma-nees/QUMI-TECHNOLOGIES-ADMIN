'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Building2,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  X,
  Wand2,
  Trash2,
} from 'lucide-react';
import { fetchJobs as fetchJobsAction, createJob, updateJob, deleteJob } from '@/actions';
import { enhanceTextWithAI } from '@/actions/ai';
import ReactMarkdown from 'react-markdown';

type Job = {
  id: string | number;
  title: string;
  department: string;
  location: string;
  employment_type?: string | null;
  summary?: string | null;
  description?: string | null;
  is_open: boolean;
  created_at?: string | null;
};

type FormJob = {
  id?: string | number;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  summary: string;
  description: string;
  is_open: boolean;
};

const EMPTY_JOB: FormJob = {
  title: '',
  department: '',
  location: '',
  employment_type: 'Full-time',
  summary: '',
  description: '',
  is_open: true,
};

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const FILTERS = ['All', 'Open', 'Closed'] as const;
type Filter = (typeof FILTERS)[number];

const inputClass =
  'w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15';

function postedLabel(iso?: string | null) {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  if (days < 30) return `Posted ${days} days ago`;
  return `Posted ${new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-primary">
        {label}
      </label>
      {children}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-surface p-6 shadow-soft">
      <div className="h-4 w-2/3 rounded bg-border" />
      <div className="mt-3 h-3 w-1/3 rounded bg-border/70" />
      <div className="mt-6 space-y-2">
        <div className="h-3 w-full rounded bg-border/60" />
        <div className="h-3 w-4/5 rounded bg-border/60" />
      </div>
    </div>
  );
}

export function JobsView() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [expanded, setExpanded] = useState<Job['id'] | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormJob>(EMPTY_JOB);
  const [isEnhancingDesc, setIsEnhancingDesc] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const confirmDelete = async () => {
    if (!formData.id) return;
    setIsDeleting(true);
    try {
      await deleteJob(formData.id);
      setIsModalOpen(false);
      setShowDeleteConfirm(false);
      setFormData(EMPTY_JOB);
      await loadJobs();
    } catch (err: any) {
      setFormError("Failed to delete job: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchJobsAction();
      if (data) setJobs(data as Job[]);
    } catch (err) {
      console.error('Failed to load jobs', err);
      setLoadError('The job postings could not be loaded. Please check your connection and try again.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Close the panel with Escape
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !saving && setIsModalOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isModalOpen, saving]);

  const openCreatePanel = () => {
    setFormError(null);
    setFormData(EMPTY_JOB);
    setIsModalOpen(true);
  };
  
  const openEditPanel = (job: Job) => {
    setFormError(null);
    setFormData({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      employment_type: job.employment_type || 'Full-time',
      summary: job.summary || '',
      description: job.description || '',
      is_open: job.is_open
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (formData.id) {
        await updateJob(formData.id, formData);
      } else {
        await createJob(formData);
      }
      setIsModalOpen(false);
      setFormData(EMPTY_JOB);
      await loadJobs();
    } catch (error: any) {
      setFormError(error?.message || 'The job could not be saved. Please try again.');
    }
    setSaving(false);
  };

  const stats = useMemo(() => {
    const open = jobs.filter(j => j.is_open).length;
    return { total: jobs.length, open, closed: jobs.length - open };
  }, [jobs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter(j => {
      if (filter === 'Open' && !j.is_open) return false;
      if (filter === 'Closed' && j.is_open) return false;
      if (!q) return true;
      return [j.title, j.department, j.location, j.employment_type].some(v => (v ?? '').toLowerCase().includes(q));
    });
  }, [jobs, query, filter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Careers</p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-primary">Job postings</h2>
          <p className="mt-1 text-sm text-muted">Publish and manage the positions shown on your careers page.</p>
        </div>
        <button
          onClick={openCreatePanel}
          className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-background shadow-soft transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] md:self-auto"
        >
          <Plus size={16} />
          Post new job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:max-w-md">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Open', value: stats.open },
          { label: 'Closed', value: stats.closed },
        ].map(s => (
          <div key={s.label} className="rounded-md border border-border bg-surface px-4 py-3 shadow-soft">
            <div className="font-serif text-2xl font-bold leading-none text-primary">{loading ? '-' : s.value}</div>
            <div className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title, department or location"
            aria-label="Search job postings"
            className={`${inputClass} pl-9`}
          />
        </div>
        <div className="inline-flex self-start rounded-md border border-border bg-surface p-1 shadow-soft">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${filter === f ? 'bg-primary text-background' : 'text-muted hover:text-primary'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-12 text-center shadow-soft">
          <AlertCircle size={28} className="text-red-600" />
          <p className="text-sm text-muted">{loadError}</p>
          <button
            onClick={loadJobs}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-background shadow-soft hover:bg-primary/90"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface p-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Briefcase size={24} />
          </div>
          <p className="font-medium text-primary">{jobs.length ? 'No matching positions' : 'No positions posted yet'}</p>
          <p className="max-w-sm text-sm text-muted">
            {jobs.length
              ? 'Adjust your search or status filter to see more results.'
              : 'Create your first posting and it will appear on the careers page.'}
          </p>
          {!jobs.length && (
            <button
              onClick={openCreatePanel}
              className="mt-2 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-background shadow-soft hover:bg-primary/90"
            >
              <Plus size={16} /> Post new job
            </button>
          )}
        </div>
      ) : (
        <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map(job => {
            const isOpen = expanded === job.id;
            const posted = postedLabel(job.created_at);
            return (
              <article
                key={job.id}
                onClick={() => openEditPanel(job)}
                className="group relative flex cursor-pointer overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                <div className="relative flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {/* Glowing status dot */}
                        <div className="relative flex h-2 w-2 items-center justify-center">
                          {job.is_open && <span className="absolute h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>}
                          <span className={`relative h-2 w-2 rounded-full ${job.is_open ? 'bg-green-500' : 'bg-muted'}`}></span>
                        </div>
                        <h3 className="font-serif text-base font-bold tracking-tight text-primary transition-colors group-hover:text-primary/90 sm:text-lg">
                          {job.title}
                        </h3>
                      </div>
                      
                      {/* Sleek Metadata Pills */}
                      <ul className="mt-3 flex flex-wrap items-center gap-2">
                        <li className="flex items-center gap-1.5 rounded-full bg-surface-alt/50 px-2.5 py-1 text-[11px] font-medium text-muted transition-colors group-hover:bg-surface-alt sm:text-xs">
                          <Building2 size={12} className="text-primary/60" /> {job.department}
                        </li>
                        <li className="flex items-center gap-1.5 rounded-full bg-surface-alt/50 px-2.5 py-1 text-[11px] font-medium text-muted transition-colors group-hover:bg-surface-alt sm:text-xs">
                          <MapPin size={12} className="text-primary/60" /> {job.location}
                        </li>
                        {job.employment_type && (
                          <li className="flex items-center gap-1.5 rounded-full bg-surface-alt/50 px-2.5 py-1 text-[11px] font-medium text-muted transition-colors group-hover:bg-surface-alt sm:text-xs">
                            <Clock size={12} className="text-primary/60" /> {job.employment_type}
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    {/* Floating Action Button style arrow */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-alt text-muted transition-all duration-300 group-hover:bg-primary group-hover:text-background">
                      <ChevronDown size={16} className="-rotate-90" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 opacity-70 transition-opacity group-hover:opacity-100">
                    <span className="text-[10px] uppercase tracking-wider text-muted sm:text-[11px]">{posted ?? ''}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary sm:text-[11px]">
                      {job.is_open ? 'Accepting applications' : 'Closed'}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Slide-over form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="new-job-title">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => !saving && setIsModalOpen(false)}
          />
          <form
            onSubmit={handleSave}
            className="relative flex h-full w-full max-w-xl flex-col bg-background shadow-medium animate-slide-in-right"
          >
            <div className="flex items-start justify-between border-b border-border bg-surface/30 p-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{formData.id ? 'Edit position' : 'New position'}</p>
                <h3 id="new-job-title" className="mt-1 font-serif text-xl font-bold text-primary">
                  {formData.id ? 'Edit job posting' : 'Create a job posting'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                aria-label="Close"
                className="rounded-md p-1.5 text-muted transition hover:bg-surface-alt hover:text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {formError && (
                <div role="alert" className="flex items-start gap-3 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <Field id="job-title" label="Job title">
                <input
                  id="job-title"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Mathematics Instructor"
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="job-dept" label="Department">
                  <input
                    id="job-dept"
                    required
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Academics"
                    className={inputClass}
                  />
                </Field>
                <Field id="job-location" label="Location">
                  <input
                    id="job-location"
                    required
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Main campus"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field id="job-type" label="Employment type">
                <select
                  id="job-type"
                  value={formData.employment_type}
                  onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
                  className={inputClass}
                >
                  {EMPLOYMENT_TYPES.map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>

              <Field id="job-summary" label="Short summary">
                <input
                  id="job-summary"
                  required
                  maxLength={160}
                  value={formData.summary}
                  onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="One sentence shown on the careers listing"
                  className={inputClass}
                />
                <p className="mt-1 text-right text-[11px] text-muted">{formData.summary.length}/160</p>
              </Field>

              <Field id="job-desc" label="Full description">
                <div className="flex flex-col gap-3">
                  <textarea
                    id="job-desc"
                    required
                    rows={8}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Responsibilities, requirements and how to apply"
                    className={inputClass}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.description.trim()) return;
                        setIsEnhancingDesc(true);
                        setFormError(null);
                        try {
                          const res = await enhanceTextWithAI(formData.description, 'description');
                          if (res.success && res.enhancedText) {
                            setFormData({ ...formData, description: res.enhancedText });
                          } else {
                            setFormError("Failed to enhance description: " + (res as any).error);
                          }
                        } catch (err: any) {
                          setFormError("An unexpected error occurred: " + err.message);
                        } finally {
                          setIsEnhancingDesc(false);
                        }
                      }}
                      disabled={isEnhancingDesc || !formData.description.trim()}
                      className="inline-flex items-center gap-1.5 rounded-md border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 shadow-soft transition-all duration-200 hover:bg-purple-500/20 active:scale-[0.98] disabled:opacity-50"
                    >
                      <Wand2 size={12} className={isEnhancingDesc ? "animate-pulse" : ""} />
                      {isEnhancingDesc ? 'Enhancing...' : 'Enhance with AI'}
                    </button>
                  </div>
                </div>
              </Field>

              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background p-4">
                <input
                  type="checkbox"
                  checked={formData.is_open}
                  onChange={e => setFormData({ ...formData, is_open: e.target.checked })}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-primary,currentColor)]"
                />
                <span>
                  <span className="block text-sm font-medium text-primary">Open for applications</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    When enabled, the position is visible on the careers page immediately.
                  </span>
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-alt/50 p-4 px-6">
              {formData.id ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={saving || isDeleting}
                  className="inline-flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 shadow-soft transition-all duration-200 hover:bg-red-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving || isDeleting}
                  className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-primary transition hover:border-primary/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || isDeleting}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-background shadow-soft transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {saving ? 'Saving' : formData.id ? 'Save changes' : 'Publish job'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-surface shadow-2xl border border-border animate-pop-in" style={{ animationDuration: '0.3s' }}>
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                  <AlertCircle size={20} />
                </div>
                <h3 className="text-lg font-semibold text-primary">Delete Job</h3>
              </div>
              <p className="text-[15px] leading-relaxed text-body">
                Are you sure you want to delete <span className="font-semibold text-primary">{formData.title}</span>? This action cannot be undone.
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
                {isDeleting ? 'Deleting...' : 'Delete Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}