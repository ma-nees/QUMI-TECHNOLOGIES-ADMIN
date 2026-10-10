'use client';
import React, { useEffect, useState } from 'react';
import { Settings, Mail, Briefcase, LogOut, Loader2, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const menuItems = [
  { name: 'Messages', icon: <Mail size={20} />, hint: 'Website enquiries' },
  { name: 'Jobs', icon: <Briefcase size={20} />, hint: 'Careers and openings' },
  { name: 'Applications', icon: <Inbox size={20} />, hint: 'Candidate submissions' },
  { name: 'Settings', icon: <Settings size={20} />, hint: 'Company details' },
];

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  /** Optional numeric badges, keyed by menu item name, e.g. { Messages: 4 } */
  counts?: Record<string, number>;
};

function initialsFromEmail(email: string | null) {
  if (!email) return 'A';
  const name = email.split('@')[0].replace(/[^a-zA-Z]+/g, ' ').trim();
  const parts = name.split(' ').filter(Boolean).slice(0, 2);
  return (parts.map(p => p[0].toUpperCase()).join('') || email[0].toUpperCase()).slice(0, 2);
}

export function Sidebar({ activeTab, setActiveTab, counts }: SidebarProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!cancelled) setEmail(data?.user?.email ?? null);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-surface transition-all">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary shadow-soft">
          <span className="font-serif text-base font-bold text-accent">Q</span>
        </div>
        <div className="leading-tight">
          <div className="font-serif text-lg font-bold tracking-wide text-primary">QUMI</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Administration</div>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 px-3 pt-6">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Workspace</p>
        {menuItems.map(item => {
          const active = activeTab === item.name;
          const count = counts?.[item.name];
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${active ? 'bg-primary/5 text-primary' : 'text-muted hover:bg-surface-alt hover:text-primary'
                }`}
            >
              <span
                className={`absolute inset-y-2 left-0 w-[3px] rounded-r bg-primary transition-opacity ${active ? 'opacity-100' : 'opacity-0'
                  }`}
              />
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors ${active
                    ? 'border-primary/20 bg-primary text-white shadow-soft'
                    : 'border-border bg-background group-hover:border-primary/30'
                  }`}
              >
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-tight">{item.name}</span>
                <span className="block truncate text-[11px] font-normal text-muted">{item.hint}</span>
              </span>
              {typeof count === 'number' && count > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Account */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-md bg-surface-alt/60 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
            {initialsFromEmail(email)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-primary">{email ?? 'Administrator'}</div>
            <div className="text-[11px] text-muted">Signed in</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={signingOut}
          className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
        >
          <span className="flex w-5 items-center justify-center">
            {signingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
          </span>
          {signingOut ? 'Signing out' : 'Sign out'}
        </button>

        <p className="mt-4 px-3 text-[10px] text-muted">&copy; {new Date().getFullYear()} QUMI</p>
      </div>
    </aside>
  );
}