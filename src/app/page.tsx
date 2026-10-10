'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { MessagesView } from '@/components/views/MessagesView';
import { JobsView } from '@/components/views/JobsView';
import { ApplicationsView } from '@/components/views/ApplicationsView';
import { SettingsView } from '@/components/views/SettingsView';
import { LoginView } from '@/components/views/LoginView';
import { Sidebar } from '@/components/layout/Sidebar';
import { supabase } from '@/lib/supabase';
import './globals.css';

// Client-side gate only. Enforce the same rule on the server or with
// Supabase Row Level Security so the data stays protected regardless of the UI.
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'qumitechnologies.web@gmail.com').toLowerCase();
const UNAUTHORISED = 'Access denied. This portal is restricted to the designated administrator.';

function initialsFromEmail(email?: string | null) {
  if (!email) return 'A';
  const parts = email
    .split('@')[0]
    .replace(/[^a-zA-Z]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2);
  return (parts.map(p => p[0].toUpperCase()).join('') || email[0].toUpperCase()).slice(0, 2);
}

function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5 bg-background">
      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary shadow-medium">
        <span className="font-serif text-2xl font-bold text-accent">Q</span>
      </div>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/2 animate-[slide_1.2s_ease-in-out_infinite] rounded-full bg-primary" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Preparing your workspace</p>
      <style>{`@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
    </div>
  );
}

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Messages');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const applySession = (next: any) => {
      if (!next) {
        // Signed out. Keep any existing error message so the user can read it.
        setSession(null);
        return;
      }
      if (next.user.email?.toLowerCase() !== ADMIN_EMAIL) {
        supabase!.auth.signOut();
        setAuthError(UNAUTHORISED);
        setSession(null);
      } else {
        setAuthError(null);
        setSession(next);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => applySession(session));

    return () => subscription.unsubscribe();
  }, []);

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMobileMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileMenuOpen]);

  if (loading) return <LoadingScreen />;

  if (!session) {
    return <LoginView initialError={authError} />;
  }

  const email: string | undefined = session.user?.email;
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="relative flex h-screen overflow-hidden bg-background font-sans text-body">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar wrapper */}
      <div
        className={`fixed inset-y-0 left-0 z-50 h-full transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {isMobileMenuOpen && (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
            className="absolute right-3 top-5 z-10 rounded-md p-1.5 text-muted transition hover:bg-surface-alt hover:text-primary md:hidden"
          >
            <X size={20} />
          </button>
        )}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={t => {
            setActiveTab(t);
            setIsMobileMenuOpen(false);
          }}
        />
      </div>

      {/* Main content */}
      <main className="flex min-w-0 w-full flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:h-[88px] sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="-ml-2 rounded-md p-2 text-primary transition-colors hover:bg-surface-alt md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={28} strokeWidth={2.5} />
            </button>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-base md:text-sm">
              <span className="hidden text-muted sm:inline">Administration</span>
              <span className="hidden text-border sm:inline">/</span>
              <span className="truncate font-bold text-lg md:text-base md:font-semibold text-primary">{activeTab}</span>
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <span className="hidden text-xs text-muted lg:block">{today}</span>
            <div className="hidden h-6 w-px bg-border lg:block" />
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-background shadow-soft sm:h-10 sm:w-10">
                {initialsFromEmail(email)}
              </div>
              <div className="hidden min-w-0 sm:block">
                <div className="max-w-[200px] truncate text-sm font-medium text-primary">{email ?? 'Administrator'}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        <div key={activeTab} className="mx-auto w-full max-w-7xl p-4 sm:p-8 animate-fade-in-up">
          {activeTab === 'Messages' && <MessagesView />}
          {activeTab === 'Jobs' && <JobsView />}
          {activeTab === 'Applications' && <ApplicationsView />}
          {activeTab === 'Settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}