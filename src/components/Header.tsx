'use client';

import { Search, Moon, Sun, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import HamburgerMenu from './HamburgerMenu';
import Link from 'next/link';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    // Check for system preference on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className="bg-background-secondary border-b border-border-primary sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 py-3">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between gap-5">
          {/* Logo and Branding */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              Sentiment.so
            </h1>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={handleSearch}
                className="bg-background-primary border border-border-primary text-text-primary pl-9 pr-3 py-1.5 rounded-md w-52 text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
              />
            </div>

            {/* Hamburger Menu */}
            <HamburgerMenu theme={theme} onThemeToggle={toggleTheme} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {!isSearchExpanded ? (
            /* Normal Mobile Header */
            <div className="flex items-center justify-between">
              {/* Minimal Logo */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
              </div>

              {/* Icon Controls */}
              <div className="flex items-center gap-2">
                {/* Search Icon */}
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className="p-2 bg-background-primary border border-border-primary rounded-lg hover:bg-background-tertiary transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 text-text-muted" />
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 bg-background-primary border border-border-primary rounded-lg hover:bg-background-tertiary transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-text-muted" /> : <Moon className="w-4 h-4 text-text-muted" />}
                </button>

                {/* About */}
                <Link
                  href="/about"
                  className="p-2 bg-background-primary border border-border-primary rounded-lg hover:bg-background-tertiary transition-colors"
                  aria-label="About"
                >
                  <Info className="w-4 h-4 text-text-muted" />
                </Link>
              </div>
            </div>
          ) : (
            /* Expanded Search Mode */
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full bg-background-primary border border-border-primary text-text-primary pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setIsSearchExpanded(false)}
                className="p-2 bg-background-primary border border-border-primary rounded-lg hover:bg-background-tertiary transition-colors"
                aria-label="Close search"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 