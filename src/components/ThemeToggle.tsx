'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-9 w-9" />;

  const toggleTheme = (e: React.MouseEvent) => {
    const isDark = theme === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    // Fallback if browser doesn't support View Transitions
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath,
        },
        {
          duration: 800,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted transition-all duration-200 hover:bg-surface-alt hover:text-primary active:scale-[0.98]"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
