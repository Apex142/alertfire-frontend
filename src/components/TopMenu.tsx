"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from './ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { User, Bell, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from "react";
import { FirestoreUser } from '@/types/user';

interface TopMenuProps {
  userData: FirestoreUser | null;
}

export default function TopMenu({ userData }: TopMenuProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center text-xl font-bold text-gray-900 dark:text-white"
            >
              Showmate
            </Link>
          </div>

          {/* Menu principal desktop */}
          <div className="hidden md:flex ml-10 items-center space-x-4">
            <Link href="/dashboard" className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/dashboard') ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}`}>Accueil</Link>
            <Link href="/reseau" className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/reseau') ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}`}>Réseau</Link>
            <Link href="/lieux" className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/lieux') ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}`}>Lieux</Link>
            <Link href="/profil" className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/profil') ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}`}>Profil</Link>
          </div>

          {/* Booking + Notifications + User (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/booking" className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/profile') ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}`}>Booking</Link>
            <button type="button" className="relative flex items-center justify-center w-9 h-9 rounded-full text-gray-600 hover:bg-gray-200 transition" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            {loading ? (
              <>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </>
            ) : (
              <>
                {user && (
                  <div
                    className="relative group"
                    ref={menuRef}
                    onMouseEnter={() => setMenuOpen(true)}
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <button
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                      aria-label="Menu utilisateur"
                      type="button"
                      onClick={() => setMenuOpen((v) => !v)}
                    >
                      <User className="w-5 h-5" />
                    </button>
                    {(menuOpen) && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-1 z-[100]">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setMenuOpen(false)}
                        >
                          Paramètres
                        </Link>
                        <button
                          onClick={() => { setMenuOpen(false); signOut(); }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Burger mobile */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-gray-600 hover:bg-gray-200 transition"
            aria-label="Ouvrir le menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Menu mobile (drawer ou overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex">
          <div className="bg-white dark:bg-gray-900 w-64 h-full p-6 flex flex-col">
            <button
              className="self-end mb-6"
              aria-label="Fermer le menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <nav className="flex flex-col gap-4">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className={isActive('/dashboard') ? 'font-bold' : ''}>Accueil</Link>
              <Link href="/reseau" onClick={() => setMobileMenuOpen(false)} className={isActive('/reseau') ? 'font-bold' : ''}>Réseau</Link>
              <Link href="/lieux" onClick={() => setMobileMenuOpen(false)} className={isActive('/lieux') ? 'font-bold' : ''}>Lieux</Link>
              <Link href="/profil" onClick={() => setMobileMenuOpen(false)} className={isActive('/profil') ? 'font-bold' : ''}>Profil</Link>
              <Link href="/booking" onClick={() => setMobileMenuOpen(false)} className={isActive('/booking') ? 'font-bold' : ''}>Booking</Link>
            </nav>
            <div className="mt-auto flex gap-2">
              <button type="button" className="relative flex items-center justify-center w-9 h-9 rounded-full text-gray-600 hover:bg-gray-200 transition" aria-label="Notifications">
                <Bell className="w-5 h-5" />
              </button>
              {/* ... bouton utilisateur mobile ... */}
            </div>
          </div>
          {/* Fermer le menu si on clique sur l'overlay */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </nav>
  );
} 