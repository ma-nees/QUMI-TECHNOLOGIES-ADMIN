'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Loader2, MapPin, Phone, RefreshCw } from 'lucide-react';
import { fetchSettings, saveSettings } from '@/actions';

type SettingsState = {
  email: string;
  location: string;
  mobile_number: string;
  twitter_url: string;
  linkedin_url: string;
  facebook_url: string;
  instagram_url: string;
  reddit_url: string;
  threads_url: string;
};

type SocialKey = Exclude<keyof SettingsState, 'location' | 'mobile_number' | 'email'>;

const EMPTY: SettingsState = {
  email: '',
  location: '',
  mobile_number: '',
  twitter_url: '',
  linkedin_url: '',
  facebook_url: '',
  instagram_url: '',
  reddit_url: '',
  threads_url: '',
};

const SOCIALS: { key: SocialKey; label: string; mark: string; placeholder: string }[] = [
  { key: 'linkedin_url', label: 'LinkedIn', mark: 'in', placeholder: 'https://linkedin.com/company/qumi' },
  { key: 'twitter_url', label: 'X (Twitter)', mark: 'X', placeholder: 'https://x.com/qumi' },
  { key: 'facebook_url', label: 'Facebook', mark: 'f', placeholder: 'https://facebook.com/qumi' },
  { key: 'instagram_url', label: 'Instagram', mark: 'ig', placeholder: 'https://instagram.com/qumi' },
  { key: 'reddit_url', label: 'Reddit', mark: 'r/', placeholder: 'https://reddit.com/r/qumi' },
  { key: 'threads_url', label: 'Threads', mark: '@', placeholder: 'https://threads.net/@qumi' },
];

const inputClass =
  'w-full rounded-md border bg-background px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2';
const okInput = 'border-border focus:border-primary focus:ring-primary/15';
const badInput = 'border-red-300 focus:border-red-500 focus:ring-red-100';

function normalise(data: any): SettingsState {
  const out = { ...EMPTY };
  (Object.keys(EMPTY) as (keyof SettingsState)[]).forEach(k => {
    out[k] = (data?.[k] ?? '') as string;
  });
  return out;
}

function isValidUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function validate(s: SettingsState) {
  const errors: Partial<Record<keyof SettingsState, string>> = {};
  if (s.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (s.mobile_number && !/^[+\d\s()-]{6,20}$/.test(s.mobile_number.trim())) {
    errors.mobile_number = 'Enter a valid phone number, for example +977 1-0000000.';
  }
  SOCIALS.forEach(({ key }) => {
    const v = s[key].trim();
    if (v && !isValidUrl(v)) errors[key] = 'Enter a full link starting with https://';
  });
  return errors;
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-soft">
      <div className="border-b border-border bg-surface-alt/50 px-6 py-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary">{title}</h3>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[0, 1].map(i => (
        <div key={i} className="rounded-lg border border-border bg-surface p-6 shadow-soft">
          <div className="h-4 w-1/4 rounded bg-border" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="h-10 rounded bg-border/60" />
            <div className="h-10 rounded bg-border/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SettingsView() {
  const [settings, setSettings] = useState<SettingsState>(EMPTY);
  const [saved, setSaved] = useState<SettingsState>(EMPTY);
  const [rawRow, setRawRow] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [touched, setTouched] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchSettings();
      if (data) {
        setRawRow(data as Record<string, unknown>);
        const n = normalise(data);
        setSettings(n);
        setSaved(n);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setLoadError('The current settings could not be loaded. You can still enter new values, or try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 4000);
    return () => clearTimeout(t);
  }, [justSaved]);

  const errors = useMemo(() => validate(settings), [settings]);
  const hasErrors = Object.keys(errors).length > 0;
  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(saved), [settings, saved]);
  const connected = SOCIALS.filter(s => settings[s.key].trim()).length;

  const set = (key: keyof SettingsState, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setJustSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (hasErrors) return;
    setSaving(true);
    setSaveError(null);
    try {
      const trimmed = Object.fromEntries(
        (Object.keys(settings) as (keyof SettingsState)[]).map(k => [k, settings[k].trim()]),
      ) as SettingsState;
      await saveSettings({ ...rawRow, ...trimmed } as any);
      setSettings(trimmed);
      setSaved(trimmed);
      setJustSaved(true);
      setTouched(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveError(
        'The settings could not be saved. Please confirm the company_settings table exists in the database and try again.',
      );
    }
    setSaving(false);
  };

  const showError = (key: keyof SettingsState) => (touched || settings[key]) && errors[key];

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Configuration</p>
        <h2 className="mt-1 font-serif text-2xl font-bold text-primary">Company settings</h2>
        <p className="mt-1 text-sm text-muted">
          These details appear on the public website, including the footer and contact page.
        </p>
      </div>

      {loadError && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-md border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <span className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {loadError}
          </span>
          <button onClick={load} className="inline-flex shrink-0 items-center gap-1.5 font-semibold hover:underline">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : (
        <form onSubmit={handleSave} noValidate className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Section title="Contact details" description="How visitors can find and reach your organisation.">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-primary">
                    Contact email
                  </label>
                  <div className="relative">
                    {/* Re-using a lucide icon for email, but wait, I didn't import Mail here. I will just use the @ symbol or import Mail. Mail is not imported, let's just use @ text as icon */}
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-bold text-lg leading-none">@</span>
                    <input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="e.g. hello@qumi.tech"
                      aria-invalid={!!showError('email')}
                      className={`${inputClass} ${showError('email') ? badInput : okInput} pl-9`}
                    />
                  </div>
                  {showError('email') && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-primary">
                    Company location
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="location"
                      value={settings.location}
                      onChange={e => set('location', e.target.value)}
                      placeholder="e.g. Kathmandu, Nepal"
                      className={`${inputClass} ${okInput} pl-9`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mobile" className="mb-1.5 block text-sm font-medium text-primary">
                    Mobile number
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="mobile"
                      type="tel"
                      value={settings.mobile_number}
                      onChange={e => set('mobile_number', e.target.value)}
                      placeholder="e.g. +977 1-0000000"
                      aria-invalid={!!showError('mobile_number')}
                      className={`${inputClass} ${showError('mobile_number') ? badInput : okInput} pl-9`}
                    />
                  </div>
                  {showError('mobile_number') && <p className="mt-1.5 text-xs text-red-600">{errors.mobile_number}</p>}
                </div>
              </div>
            </Section>

            <Section title="Social media" description="Add full profile links. Leave a field empty to hide that platform.">
              <div className="space-y-5">
                {SOCIALS.map(s => (
                  <div key={s.key}>
                    <label htmlFor={s.key} className="mb-1.5 block text-sm font-medium text-primary">
                      {s.label}
                    </label>
                    <div className="flex">
                      <span className="inline-flex w-11 shrink-0 items-center justify-center rounded-l-md border border-r-0 border-border bg-surface-alt text-xs font-bold uppercase text-primary">
                        {s.mark}
                      </span>
                      <input
                        id={s.key}
                        type="url"
                        value={settings[s.key]}
                        onChange={e => set(s.key, e.target.value)}
                        placeholder={s.placeholder}
                        aria-invalid={!!showError(s.key)}
                        className={`${inputClass} ${showError(s.key) ? badInput : okInput} rounded-l-none`}
                      />
                    </div>
                    {showError(s.key) && <p className="mt-1.5 text-xs text-red-600">{errors[s.key]}</p>}
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Preview */}
          <aside className="space-y-4 lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-lg bg-primary text-white shadow-medium">
              <div className="p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Website preview</p>
                <div className="mt-4 font-serif text-xl font-bold tracking-wide">QUMI</div>

                <ul className="mt-5 space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-white/60" />
                    <span className={settings.location ? '' : 'text-white/40'}>
                      {settings.location || 'Location not set'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone size={16} className="mt-0.5 shrink-0 text-white/60" />
                    <span className={settings.mobile_number ? '' : 'text-white/40'}>
                      {settings.mobile_number || 'Phone number not set'}
                    </span>
                  </li>
                </ul>

                <div className="mt-6 flex flex-wrap gap-2">
                  {SOCIALS.map(s => {
                    const active = !!settings[s.key].trim() && !errors[s.key];
                    return (
                      <span
                        key={s.key}
                        title={s.label}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-[11px] font-bold uppercase transition ${active ? 'border-white/60 bg-white/15 text-white' : 'border-white/15 text-white/25'
                          }`}
                      >
                        {s.mark}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-white/10 bg-black/10 px-6 py-3 text-xs text-white/70">
                {connected} of {SOCIALS.length} social channels linked
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-5 shadow-soft">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted">
                <span>Profile completeness</span>
                <span className="text-primary">
                  {Math.round(
                    (((settings.location ? 1 : 0) + (settings.mobile_number ? 1 : 0) + connected) / (2 + SOCIALS.length)) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (((settings.location ? 1 : 0) + (settings.mobile_number ? 1 : 0) + connected) / (2 + SOCIALS.length)) *
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </aside>

          {/* Save bar */}
          <div className="lg:col-span-2">
            <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-lg border border-border bg-surface/95 p-4 shadow-medium backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-[20px] text-sm" aria-live="polite">
                {saveError ? (
                  <span className="flex items-start gap-2 text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /> {saveError}
                  </span>
                ) : justSaved ? (
                  <span className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 size={16} /> Settings saved successfully.
                  </span>
                ) : touched && hasErrors ? (
                  <span className="flex items-center gap-2 text-red-700">
                    <AlertCircle size={16} /> Please correct the highlighted fields before saving.
                  </span>
                ) : dirty ? (
                  <span className="flex items-center gap-2 text-muted">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> You have unsaved changes.
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-muted">
                    <Check size={16} /> All changes are saved.
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={!dirty || saving}
                  onClick={() => {
                    setSettings(saved);
                    setTouched(false);
                    setSaveError(null);
                  }}
                  className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-primary transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Discard changes
                </button>
                <button
                  type="submit"
                  disabled={!dirty || saving}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {saving ? 'Saving' : 'Save settings'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}