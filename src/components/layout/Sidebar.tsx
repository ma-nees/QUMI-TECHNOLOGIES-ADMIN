'use client';
import React, { useState, useEffect } from 'react';
import { Settings, Mail, Briefcase, LogOut, Loader2, Inbox, FolderKanban } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';

export const menuItems = [
  { name: 'Case Studies', icon: <FolderKanban size={20} />, hint: 'Project case studies' },
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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  return (
    <aside className="flex h-full w-60 sm:w-64 flex-col border-r border-border bg-surface transition-all">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
        <img
          src="/logo.png"
          alt="QUMI Technologies"
          className="h-8 w-auto max-h-9 object-contain transition-all duration-200"
          style={{
            filter: isDark ? 'brightness(0) invert(1)' : 'brightness(0)',
          }}
        />
        <div className="leading-tight">
          <div className="font-serif text-base font-bold tracking-wide text-primary">QUMI</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Administration</div>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 px-2.5 pt-3">
        <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Workspace</p>
        {menuItems.map(item => {
          const active = activeTab === item.name;
          const count = counts?.[item.name];
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors ${active ? 'bg-primary/5 text-primary' : 'text-muted hover:bg-surface-alt hover:text-primary'
                }`}
            >
              <span
                className={`absolute inset-y-1.5 left-0 w-[3px] rounded-r bg-primary transition-opacity ${active ? 'opacity-100' : 'opacity-0'
                  }`}
              />
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${active
                    ? 'border-primary/20 bg-primary text-background shadow-soft'
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
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-background">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Account */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-md bg-surface-alt/60 p-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-background">
            {initialsFromEmail(email)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-primary">{email ?? 'Administrator'}</div>
            <div className="text-[10px] text-muted">Signed in</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={signingOut}
          className="mt-2 flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-60"
        >
          <span className="flex w-4 items-center justify-center">
            {signingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
          </span>
          {signingOut ? 'Signing out' : 'Sign out'}
        </button>

        <p className="mt-2 px-2.5 text-[10px] text-muted">&copy; {new Date().getFullYear()} QUMI</p>
      </div>
    </aside>
  );
}