'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';

const HIGHLIGHTS = [
  {
    title: 'Centralised administration',
    text: 'Manage institute records, staff and day-to-day operations from a single, consistent workspace.',
  },
  {
    title: 'Restricted access',
    text: 'Accounts are issued by the institute. Sign-in is limited to authorised administrators.',
  },
  {
    title: 'Dependable and private',
    text: 'Information is stored securely and is available only to those who need it to do their work.',
  },
];

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'The email address or password you entered is incorrect.';
  if (m.includes('email not confirmed')) return 'This account has not been verified yet. Please contact your system administrator.';
  if (m.includes('rate') || m.includes('too many')) return 'Too many sign-in attempts. Please wait a few minutes and try again.';
  return message;
}

export function LoginView({ initialError }: { initialError?: string | null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

  // Sync prop changes to state
  React.useEffect(() => {
    if (initialError) setError(initialError);
  }, [initialError]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('The authentication service is currently unavailable. Please contact your system administrator.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(friendlyError(error.message));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-background font-sans">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between bg-primary text-background p-12 xl:p-16 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div aria-hidden="true" className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-24 -right-24 h-[20rem] w-[20rem] rounded-full border border-white/10" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/25 bg-white/10 font-serif text-lg font-bold">
              Q
            </div>
            <div>
              <div className="font-serif text-xl font-bold tracking-wide">QUMI</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/70">Institute Administration</div>
            </div>
          </div>
        </div>

        <div className="relative max-w-lg">
          <h2 className="font-serif text-4xl xl:text-5xl font-bold leading-tight text-white">
            Administration portal for institute staff
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/80">
            Sign in to manage records, oversee operations and keep the institute running smoothly.
          </p>

          <ul className="mt-10 space-y-6">
            {HIGHLIGHTS.map(item => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/80" />
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wider">{item.title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-xs text-white/60">
          &copy; {new Date().getFullYear()} QUMI. All rights reserved.
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-background font-serif text-lg font-bold">
              Q
            </div>
            <div>
              <div className="font-serif text-lg font-bold text-primary leading-none">QUMI</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">Institute Administration</div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg shadow-medium p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-serif font-bold text-primary">Administrator sign in</h1>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                Enter the credentials issued to you by the institute to access the administration portal.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-6 flex items-start gap-3 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-5" noValidate={false}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-border rounded-md text-sm bg-background transition focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="admin@qumi.tech"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 border border-border rounded-md text-sm bg-background transition focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-background py-3 rounded-md text-sm font-semibold tracking-wide hover:bg-primary/90 transition-all shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-8 flex items-start gap-3 border-t border-border pt-6 text-xs leading-relaxed text-muted">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
              <p>
                This system is for authorised personnel only. Unauthorised access is prohibited. If you have
                forgotten your password or need an account, contact your system administrator.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            &copy; {new Date().getFullYear()} QUMI. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}