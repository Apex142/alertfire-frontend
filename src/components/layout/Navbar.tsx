// src/components/layout/Navbar.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Bell,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Menu as MenuIcon,
  Moon,
  Settings,
  Sun,
  User,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { appUser, logout, currentSessionId, loading: authLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  const NotificationBlink = ({ count }: { count: number }) =>
    count > 0 ? (
      <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center animate-pulse">
        {count > 9 ? "9+" : count}
      </span>
    ) : null;

  if (authLoading) {
    return (
      <nav className="bg-white dark:bg-gray-900 h-16 flex items-center justify-center z-[9999]">
        <span>Chargement...</span>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 text-white shadow-md sticky top-0 z-[9999] h-16 flex items-center px-4">
        <Link href={appUser ? "/dashboard" : "/"} className="text-xl font-bold">
          AlertFire
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <button onClick={toggleTheme} aria-label="Toggle Theme">
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {!appUser ? (
            <button
              onClick={() => router.push("/login")}
              className="bg-white text-primary px-4 py-1.5 rounded font-medium hover:bg-gray-100"
            >
              <LogIn className="w-4 h-4 inline mr-1" /> Connexion
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                {appUser.photoURL ? (
                  <Image
                    src={appUser.photoURL}
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
                <MenuIcon className="w-5 h-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded shadow-md py-2 z-[9999]">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="w-4 h-4 inline mr-2" /> Profil
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 inline mr-2" /> Paramètres
                  </Link>
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout("Manual logout", currentSessionId);
                      router.push("/");
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-700/20"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {appUser && (
        <div className="fixed bottom-0 w-full flex justify-around bg-white dark:bg-gray-900 border-t dark:border-gray-700 py-2 z-[9999] md:hidden">
          <Link
            href="/dashboard"
            className={
              isActive("/dashboard") ? "text-primary" : "text-gray-500"
            }
          >
            <LayoutDashboard className="w-5 h-5 mx-auto" />
            <span className="text-xs">Tableau</span>
          </Link>
          <Link
            href="/reseau"
            className={isActive("/reseau") ? "text-primary" : "text-gray-500"}
          >
            <Users className="w-5 h-5 mx-auto" />
            <span className="text-xs">Réseau</span>
          </Link>
          <Link
            href="/lieux"
            className={isActive("/lieux") ? "text-primary" : "text-gray-500"}
          >
            <MapPin className="w-5 h-5 mx-auto" />
            <span className="text-xs">Lieux</span>
          </Link>
          <Link
            href="/notifications"
            className={
              isActive("/notifications") ? "text-primary" : "text-gray-500"
            }
          >
            <div className="relative">
              <Bell className="w-5 h-5 mx-auto" />
              <NotificationBlink count={unreadCount} />
            </div>
            <span className="text-xs">Notifs</span>
          </Link>
          <Link
            href="/profile"
            className={isActive("/profile") ? "text-primary" : "text-gray-500"}
          >
            <User className="w-5 h-5 mx-auto" />
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      )}
    </>
  );
}
