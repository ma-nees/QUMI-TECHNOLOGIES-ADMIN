'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  FolderKanban,
  Globe,
  ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
  Wand2,
  X,
} from 'lucide-react';
import {
  fetchCaseStudies,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  uploadCaseStudyImage,
} from '@/actions';
import { enhanceTextWithAI } from '@/actions/ai';

export type CaseStudy = {
  id: string | number;
  title: string;
  client?: string | null;
  industry: string;
  problem: string;
  solution: string;
  technology: string;
  result?: string | null;
  image_url?: string | null;
  is_published: boolean;
  created_at?: string;
};

const EMPTY_CASE_STUDY: Omit<CaseStudy, 'id'> = {
  title: '',
  client: '',
  industry: 'FinTech',
  problem: '',
  solution: '',
  technology: '',
  result: '',
  image_url: '',
  is_published: true,
};

const INDUSTRIES = [
  'FinTech',
  'Logistics',
  'Healthcare',
  'Retail & Commerce',
  'AI & Cloud',
  'EdTech',
  'Enterprise Software',
];

const PRESET_IMAGES = [
  { label: 'FinTech / Banking', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Logistics / Fleet', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Healthcare / Medical', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cloud Infrastructure', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Enterprise Workspace', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80' },
];

export function CaseStudiesView() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft'>('All');

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<Omit<CaseStudy, 'id'>>(EMPTY_CASE_STUDY);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // AI enhancement state
  const [enhancingField, setEnhancingField] = useState<'problem' | 'solution' | 'result' | null>(null);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCaseStudies();
      setCaseStudies((data || []) as CaseStudy[]);
    } catch (err: any) {
      console.error('Failed to load case studies:', err);
      setError(err.message || 'Failed to load case studies');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Unique industries
  const availableIndustries = useMemo(() => {
    const set = new Set<string>();
    caseStudies.forEach(c => {
      if (c.industry) set.add(c.industry.trim());
    });
    return ['All', ...Array.from(set)];
  }, [caseStudies]);

  // Filtered case studies
  const filtered = useMemo(() => {
    return caseStudies.filter(c => {
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.client && c.client.toLowerCase().includes(q)) ||
        c.industry.toLowerCase().includes(q) ||
        c.technology.toLowerCase().includes(q) ||
        c.problem.toLowerCase().includes(q) ||
        c.solution.toLowerCase().includes(q);

      const matchesIndustry =
        selectedIndustry === 'All' || c.industry.toLowerCase() === selectedIndustry.toLowerCase();

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Published' && c.is_published) ||
        (statusFilter === 'Draft' && !c.is_published);

      return matchesQuery && matchesIndustry && matchesStatus;
    });
  }, [caseStudies, query, selectedIndustry, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_CASE_STUDY);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (cs: CaseStudy) => {
    setEditingId(cs.id);
    setFormData({
      title: cs.title,
      client: cs.client || '',
      industry: cs.industry || 'FinTech',
      problem: cs.problem,
      solution: cs.solution,
      technology: cs.technology,
      result: cs.result || '',
      image_url: cs.image_url || '',
      is_published: cs.is_published ?? true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleEnhanceWithAI = async (field: 'problem' | 'solution' | 'result') => {
    const raw = formData[field];
    if (!raw || !raw.trim()) {
      alert(`Please write a brief draft in the ${field} field first so AI can enhance it.`);
      return;
    }

    setEnhancingField(field);
    try {
      const res = await enhanceTextWithAI(raw, 'case_study');
      if (res.success && res.enhancedText) {
        setFormData(prev => ({ ...prev, [field]: res.enhancedText }));
      } else if (!res.success) {
        alert(res.error || 'Failed to enhance with AI');
      }
    } catch (e: any) {
      alert(e.message || 'AI enhancement error');
    } finally {
      setEnhancingField(null);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadCaseStudyImage(fd);
      if (res.publicUrl) {
        setFormData(prev => ({ ...prev, image_url: res.publicUrl }));
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Please enter a project title.');
      return;
    }
    if (!formData.problem.trim()) {
      setFormError('Please explain the problem or business challenge.');
      return;
    }
    if (!formData.solution.trim()) {
      setFormError('Please describe the solution or architecture.');
      return;
    }
    if (!formData.technology.trim()) {
      setFormError('Please list the technologies used.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateCaseStudy(editingId, formData);
      } else {
        await createCaseStudy(formData);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save case study.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteCaseStudy(deleteId);
      setDeleteId(null);
      await loadData();
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePublished = async (cs: CaseStudy) => {
    try {
      await updateCaseStudy(cs.id, { is_published: !cs.is_published });
      setCaseStudies(prev =>
        prev.map(item => (item.id === cs.id ? { ...item, is_published: !item.is_published } : item))
      );
    } catch (e: any) {
      alert('Failed to update status: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Portfolio Management</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {caseStudies.length} Total
            </span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-primary">Project Case Studies</h2>
          <p className="mt-1 text-sm text-muted">
            Create, manage, and publish client project case studies to the live QUMI website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-muted hover:text-primary transition-colors disabled:opacity-50"
            title="Refresh case studies"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-background shadow-soft hover:bg-primary/90 transition-all hover:shadow-medium"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Post New Case Study</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-soft md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by project name, client, tech, or problem keywords..."
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Industry Pill Filter */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {availableIndustries.map(ind => {
            const active = selectedIndustry.toLowerCase() === ind.toLowerCase();
            return (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-primary text-background'
                    : 'border border-border bg-background text-muted hover:border-primary/40 hover:text-primary'
                }`}
              >
                {ind}
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 border-l border-border pl-3">
          {(['All', 'Published', 'Draft'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded px-2 py-1 text-xs font-medium transition ${
                statusFilter === s ? 'bg-primary/10 font-bold text-primary' : 'text-muted hover:text-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
          <button onClick={loadData} className="ml-auto text-xs underline font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Case Studies Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-lg border border-border bg-surface p-5 space-y-4">
              <div className="h-40 rounded bg-border/60" />
              <div className="h-4 w-3/4 rounded bg-border" />
              <div className="h-3 w-1/2 rounded bg-border/70" />
              <div className="space-y-2">
                <div className="h-3 rounded bg-border/50" />
                <div className="h-3 rounded bg-border/50" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FolderKanban size={24} />
          </div>
          <h3 className="mt-4 font-serif text-lg font-bold text-primary">No case studies found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {query || selectedIndustry !== 'All' || statusFilter !== 'All'
              ? 'Try adjusting your filters or search keywords.'
              : 'Post your first client project case study to showcase your engineering work.'}
          </p>
          <button
            onClick={openCreate}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-background"
          >
            <Plus size={16} /> Post Case Study
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(cs => (
            <article
              key={cs.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-surface shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-medium"
            >
              <div>
                {/* Image Banner */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {cs.image_url ? (
                    <img
                      src={cs.image_url}
                      alt={cs.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/5 text-muted">
                      <ImageIcon size={32} />
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="rounded-md bg-background/90 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary backdrop-blur-sm">
                      {cs.industry}
                    </span>
                    <button
                      onClick={() => togglePublished(cs)}
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm transition ${
                        cs.is_published
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-amber-500/90 text-white'
                      }`}
                      title="Click to toggle publish status"
                    >
                      {cs.is_published ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  {cs.client && (
                    <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                      Client: {cs.client}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-serif text-lg font-bold leading-snug text-primary group-hover:text-primary transition-colors">
                    {cs.title}
                  </h3>

                  <div className="mt-3 space-y-2 text-xs leading-relaxed text-body">
                    <div>
                      <strong className="text-primary font-semibold">Challenge: </strong>
                      <span className="text-muted line-clamp-2">{cs.problem}</span>
                    </div>
                    <div>
                      <strong className="text-primary font-semibold">Solution: </strong>
                      <span className="text-muted line-clamp-2">{cs.solution}</span>
                    </div>
                  </div>

                  {cs.result && (
                    <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-2.5 text-xs text-primary">
                      <div className="font-semibold text-[10px] uppercase tracking-wider mb-0.5">Key Outcome</div>
                      <p className="line-clamp-2 leading-relaxed">{cs.result}</p>
                    </div>
                  )}

                  {/* Tech stack tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {cs.technology
                      .split(',')
                      .map(t => t.trim())
                      .filter(Boolean)
                      .slice(0, 4)
                      .map(tech => (
                        <span
                          key={tech}
                          className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted"
                        >
                          {tech}
                        </span>
                      ))}
                    {cs.technology.split(',').length > 4 && (
                      <span className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted">
                        +{cs.technology.split(',').length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between border-t border-border bg-surface-alt/40 px-5 py-3 text-xs">
                <span className="text-muted font-mono">
                  {cs.created_at ? new Date(cs.created_at).toLocaleDateString() : 'Active'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(cs)}
                    className="font-semibold text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <span className="text-border">|</span>
                  <button
                    onClick={() => setDeleteId(cs.id)}
                    className="text-red-500 hover:text-red-600 transition"
                    title="Delete case study"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl animate-fade-in-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border bg-surface-alt/50 px-6 py-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary">
                  {editingId ? 'Edit Project Case Study' : 'Post New Project Case Study'}
                </h3>
                <p className="text-xs text-muted">
                  Fill in the project details below. This will appear live on the public solutions & case studies showcase.
                </p>
              </div>
              <button
                onClick={() => !saving && setIsModalOpen(false)}
                className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-primary transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title & Client */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-primary">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Digital Lending & Loan Workflow Engine"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-primary">
                    Client / Partner <span className="text-muted font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.client || ''}
                    onChange={e => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    placeholder="e.g. Apex Financial Corporation"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Industry & Tech Stack */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-primary">Industry Domain</label>
                  <select
                    value={formData.industry}
                    onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-primary">
                    Technologies Used <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.technology}
                    onChange={e => setFormData(prev => ({ ...prev, technology: e.target.value }))}
                    placeholder="e.g. React, Node.js, Go, AWS, Docker"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Problem / Challenge with AI Enhance */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-semibold text-primary">
                    The Problem / Challenge <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleEnhanceWithAI('problem')}
                    disabled={enhancingField === 'problem'}
                    className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary hover:text-background transition"
                  >
                    {enhancingField === 'problem' ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    <span>AI Polish</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  value={formData.problem}
                  onChange={e => setFormData(prev => ({ ...prev, problem: e.target.value }))}
                  placeholder="What was the client's bottleneck, manual pain point, or legacy constraint?"
                  className="w-full rounded-md border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Solution / Architecture with AI Enhance */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-semibold text-primary">
                    Our Solution / Architecture <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleEnhanceWithAI('solution')}
                    disabled={enhancingField === 'solution'}
                    className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary hover:text-background transition"
                  >
                    {enhancingField === 'solution' ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    <span>AI Polish</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  value={formData.solution}
                  onChange={e => setFormData(prev => ({ ...prev, solution: e.target.value }))}
                  placeholder="Describe the architecture, software systems, and data pipelines QUMI engineered."
                  className="w-full rounded-md border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Key Results / Outcomes with AI Enhance */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-semibold text-primary">
                    Key Results & Metrics <span className="text-muted font-normal">(Measurable impact)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleEnhanceWithAI('result')}
                    disabled={enhancingField === 'result'}
                    className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary hover:text-background transition"
                  >
                    {enhancingField === 'result' ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    <span>AI Polish</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={formData.result || ''}
                  onChange={e => setFormData(prev => ({ ...prev, result: e.target.value }))}
                  placeholder="e.g. Reduced processing cycle from 5 days to 2 hours with 99.9% uptime."
                  className="w-full rounded-md border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Cover Image & Upload */}
              <div className="rounded-lg border border-border bg-surface-alt/30 p-4 space-y-3">
                <label className="block text-xs font-semibold text-primary">Cover Image</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="url"
                    value={formData.image_url || ''}
                    onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://images.unsplash.com/... or paste image URL"
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-primary hover:bg-surface transition">
                      {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={uploadingImage}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                {/* Preset image selector */}
                <div>
                  <span className="text-[11px] text-muted">Or pick a curated banner:</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {PRESET_IMAGES.map(preset => (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setFormData(prev => ({ ...prev, image_url: preset.url }))}
                        className="rounded border border-border bg-background px-2 py-1 text-[10px] text-muted hover:border-primary hover:text-primary transition"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.image_url && (
                  <div className="relative aspect-video w-48 overflow-hidden rounded border border-border">
                    <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={e => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-primary cursor-pointer">
                  Publish immediately to client website
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-surface-alt transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-background shadow-soft hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  <span>{editingId ? 'Save Changes' : 'Post Case Study'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <AlertCircle size={20} />
              </div>
              <h3 className="text-lg font-serif font-bold text-primary">Delete Case Study?</h3>
            </div>
            <p className="text-sm text-muted">
              Are you sure you want to permanently remove this project case study? It will be immediately removed from the live website showcase.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="rounded-md border border-border px-4 py-2 text-xs font-semibold text-muted hover:bg-surface-alt transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
