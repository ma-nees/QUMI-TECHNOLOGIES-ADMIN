'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchContactMessages } from '@/actions';
import { sendReplyEmail } from '@/actions/email';
import { enhanceTextWithAI } from '@/actions/ai';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Copy,
  Inbox,
  Mail,
  RefreshCw,
  Search,
  Tag,
  Wand2,
} from 'lucide-react';

type ContactMessage = {
  id: string | number;
  name: string;
  email: string;
  company?: string | null;
  topic?: string | null;
  message: string;
  created_at: string;
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

export function MessagesView() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<string>('All');
  const [selectedId, setSelectedId] = useState<ContactMessage['id'] | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reply states
  const [isComposing, setIsComposing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchContactMessages()
      .then((data: any) => {
        const list: ContactMessage[] = data ?? [];
        setMessages(list);
        if (list.length) setSelectedId(prev => prev ?? list[0].id);
      })
      .catch((err: unknown) => {
        console.error('Failed to load messages', err);
        setError('The messages could not be loaded. Please check your connection and try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    messages.forEach(m => m.topic && set.add(m.topic));
    return ['All', ...Array.from(set)];
  }, [messages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter(m => {
      if (topic !== 'All' && m.topic !== topic) return false;
      if (!q) return true;
      return [m.name, m.email, m.company, m.topic, m.message].some(v => (v ?? '').toLowerCase().includes(q));
    });
  }, [messages, query, topic]);

  const selected = useMemo(
    () => filtered.find(m => m.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId],
  );

  const stats = useMemo(() => {
    const now = Date.now();
    return {
      total: messages.length,
      week: messages.filter(m => now - new Date(m.created_at).getTime() < 7 * DAY).length,
      today: messages.filter(m => now - new Date(m.created_at).getTime() < DAY).length,
    };
  }, [messages]);

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleEnhance = async () => {
    if (!replyText.trim()) return;
    setIsEnhancing(true);
    setActionStatus(null);
    try {
      const res = await enhanceTextWithAI(replyText, 'reply');
      if (res.success && res.enhancedText) {
        setReplyText(res.enhancedText);
        setActionStatus({ type: 'success', msg: 'Text enhanced successfully.' });
      } else {
        setActionStatus({ type: 'error', msg: "Failed to enhance text: " + (res as any).error });
      }
    } catch (err: any) {
      setActionStatus({ type: 'error', msg: "An unexpected error occurred: " + err.message });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setIsSending(true);
    setActionStatus(null);
    try {
      const subject = `Re: ${selected.topic || 'Your enquiry'}`;
      const res = await sendReplyEmail(selected.email, subject, replyText);
      if (res.success) {
        setIsComposing(false);
        setReplyText('');
        // To show success when not composing, we could use a global toast, but for now we'll just show it in the UI temporarily or reset.
        // Actually, if we set isComposing(false), the composer disappears. We should probably keep it open for a second or show the message elsewhere, but wait! The user wants the success message.
        // Let's NOT close it immediately, or we show the status above the reply buttons.
        setActionStatus({ type: 'success', msg: 'Reply sent successfully.' });
        setTimeout(() => {
          setIsComposing(false);
          setActionStatus(null);
        }, 2000);
      } else {
        setActionStatus({ type: 'error', msg: "Failed to send reply: " + res.error });
      }
    } catch (err: any) {
      setActionStatus({ type: 'error', msg: "An unexpected error occurred: " + err.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Communications</p>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-2xl font-serif font-bold text-primary">Contact messages</h2>
            <button 
              onClick={load}
              disabled={loading}
              title="Refresh messages"
              className="rounded-md p-1.5 text-muted hover:bg-surface-alt hover:text-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <p className="mt-1 text-sm text-muted">Enquiries submitted through the website contact form.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: stats.total },
            { label: 'This week', value: stats.week },
            { label: 'Today', value: stats.today },
          ].map(s => (
            <div key={s.label} className="min-w-[96px] rounded-md border border-border bg-surface px-4 py-3 shadow-soft">
              <div className="text-2xl font-serif font-bold leading-none text-primary">{loading ? '-' : s.value}</div>
              <div className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Inbox */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-medium">
        <div className="grid lg:grid-cols-[380px_1fr]">
          {/* List column */}
          <div className={`${showDetail ? 'hidden lg:block' : 'block'} border-border lg:border-r`}>
            <div className="space-y-3 border-b border-border p-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name, email or keyword"
                  aria-label="Search messages"
                  className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
              </div>

              {topics.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {topics.map(t => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${topic === t
                          ? 'border-primary bg-primary text-background'
                          : 'border-border bg-background text-muted hover:border-primary/40 hover:text-primary'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="max-h-[640px] overflow-y-auto">
              {loading ? (
                <Skeleton />
              ) : error ? (
                <div className="flex flex-col items-center gap-3 p-10 text-center">
                  <AlertCircle className="text-red-600" size={28} />
                  <p className="text-sm text-muted">{error}</p>
                  <button
                    onClick={load}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-primary/90"
                  >
                    <RefreshCw size={14} /> Try again
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 p-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Inbox size={22} />
                  </div>
                  <p className="font-medium text-primary">{messages.length ? 'No matching messages' : 'No messages yet'}</p>
                  <p className="text-sm text-muted">
                    {messages.length
                      ? 'Try a different search term or clear the topic filter.'
                      : 'New enquiries from the website will appear here.'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {filtered.map(msg => {
                    const active = selected?.id === msg.id;
                    return (
                      <li key={msg.id}>
                        <button
                          onClick={() => {
                            setSelectedId(msg.id);
                            setShowDetail(true);
                          }}
                          className={`relative flex w-full gap-3 p-4 text-left transition-colors ${active ? 'bg-primary/5' : 'hover:bg-surface-alt'
                            }`}
                        >
                          {active && <span className="absolute inset-y-0 left-0 w-[3px] bg-primary" />}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {initials(msg.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="truncate text-sm font-semibold text-primary">{msg.name}</span>
                              <span className="shrink-0 text-[11px] text-muted">{shortDate(msg.created_at)}</span>
                            </div>
                            <div className="truncate text-xs text-muted">{msg.topic || 'General enquiry'}</div>
                            <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-body/80">{msg.message}</p>
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
          <div className={`${showDetail ? 'block' : 'hidden lg:block'} min-h-[480px]`}>
            {selected ? (
              <article className="flex h-full flex-col">
                <div className="border-b border-border p-6 sm:p-8">
                  <button
                    onClick={() => setShowDetail(false)}
                    className="mb-5 inline-flex items-center gap-2 text-sm text-muted hover:text-primary lg:hidden"
                  >
                    <ArrowLeft size={16} /> Back to messages
                  </button>

                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                      {initials(selected.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-serif font-bold text-primary">{selected.name}</h3>
                      <p className="truncate text-sm text-muted">{selected.email}</p>
                      <p className="mt-1 text-xs text-muted">{fullDate(selected.created_at)}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {selected.company && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-body">
                        <Building2 size={13} className="text-muted" /> {selected.company}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                      <Tag size={12} /> {selected.topic || 'General enquiry'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-6 sm:p-8">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Message</p>
                  <div className="whitespace-pre-wrap rounded-md border border-border/60 border-l-[3px] border-l-primary bg-background p-5 text-[15px] leading-relaxed text-body">
                    {selected.message}
                  </div>
                </div>

                <div className="flex flex-col border-t border-border bg-surface-alt/50">
                  {isComposing ? (
                    <div className="p-4 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-primary">Reply to {selected.name}</h4>
                        <button 
                          onClick={() => setIsComposing(false)}
                          className="text-xs text-muted hover:text-primary transition"
                        >
                          Cancel
                        </button>
                      </div>
                      {actionStatus && (
                        <div className={`flex items-start gap-2 rounded-md p-3 text-sm ${
                          actionStatus.type === 'success' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {actionStatus.type === 'success' ? <Check size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                          {actionStatus.msg}
                        </div>
                      )}
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        className="w-full h-32 rounded-md border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                      <div className="flex justify-between gap-3">
                        <button
                          onClick={handleEnhance}
                          disabled={isEnhancing || !replyText.trim()}
                          className="inline-flex items-center gap-2 rounded-md border border-purple-500/20 bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-400 shadow-soft transition hover:bg-purple-500/20 disabled:opacity-50"
                        >
                          <Wand2 size={16} className={isEnhancing ? "animate-pulse" : ""} />
                          {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                        </button>
                        <button
                          onClick={handleSendReply}
                          disabled={isSending || !replyText.trim()}
                          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-background shadow-soft transition hover:bg-primary/90 disabled:opacity-50"
                        >
                          {isSending ? <RefreshCw size={16} className="animate-spin" /> : <Mail size={16} />}
                          {isSending ? 'Sending...' : 'Send Reply'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3 p-4 sm:px-8">
                      <button
                        onClick={() => {
                          setReplyText('');
                          setIsComposing(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-background shadow-soft transition hover:bg-primary/90"
                      >
                        <Mail size={16} /> Reply here
                      </button>
                      <a
                        href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.topic || 'Your enquiry'}`)}`}
                        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-primary transition hover:border-primary/40"
                      >
                        Open email app
                      </a>
                      <button
                        onClick={() => copyEmail(selected.email)}
                        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-primary transition hover:border-primary/40"
                      >
                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        {copied ? 'Copied' : 'Copy email'}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ) : (
              <div className="flex h-full min-h-[480px] flex-col items-center justify-center gap-3 p-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail size={24} />
                </div>
                <p className="font-medium text-primary">Select a message to read it</p>
                <p className="max-w-xs text-sm text-muted">The full enquiry and reply options will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}