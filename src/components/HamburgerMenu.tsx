'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, X, Moon, Sun, Info } from 'lucide-react';
import Link from 'next/link';

interface HamburgerMenuProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function HamburgerMenu({ theme, onThemeToggle }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="p-1.5 bg-background-primary border border-border-primary rounded-md hover:bg-background-tertiary transition-colors"
        aria-label="Menu"
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-background-secondary border border-border-primary rounded-lg shadow-lg z-50">
          <div className="py-2">
            {/* Theme Toggle */}
            <button
              onClick={() => {
                onThemeToggle();
                closeMenu();
              }}
              className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-background-tertiary transition-colors flex items-center gap-3"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>

            {/* Divider */}
            <div className="border-t border-border-primary my-1"></div>

            {/* About Page Link */}
            <Link
              href="/about"
              onClick={closeMenu}
              className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-background-tertiary transition-colors flex items-center gap-3"
            >
              <Info className="w-4 h-4" />
              About
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}