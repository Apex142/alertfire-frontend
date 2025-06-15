// src/components/layout/Navbar.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
<<<<<<< HEAD
import {
  Bell,
  LayoutDashboard,
=======
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Flame,
  LayoutDashboard,
  Loader2,
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
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
<<<<<<< HEAD
=======
import NotificationButton from "./NotificationButton";
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)

export default function Navbar() {
  const { appUser, logout, currentSessionId, loading: authLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
<<<<<<< HEAD
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
=======
  const { setTheme, resolvedTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () =>
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
      ) {
        setMenuOpen(false);
      }
    };
<<<<<<< HEAD
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
=======
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      <nav className="w-full max-w-full overflow-x-clip bg-background border-b border-border sticky top-0 z-[99999] h-16 px-6 flex items-center justify-between shadow-sm">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-primary"
        >
          <Flame className="w-6 h-6 text-destructive" />
          <span className="tracking-tight">AlertFire</span>
        </Link>

        {/* NAVIGATION (desktop) */}
        <div className="hidden md:flex items-center gap-6 justify-center flex-1">
          <NavLink
            href="/"
            label="Carte"
            icon={<MapPin className="w-4 h-4" />}
            active={isActive("/")}
          />
          <NavLink
            href="/dashboard"
            label="Tableau de bord"
            icon={<LayoutDashboard className="w-4 h-4" />}
            active={isActive("/dashboard")}
          />
          <NavLink
            href="/sensors"
            label="Capteurs"
            icon={<Users className="w-4 h-4" />}
            active={isActive("/sensors")}
          />
          <NavLink
            href="/alerts"
            label="Alertes"
            icon={<AlertTriangle className="w-4 h-4" />}
            active={isActive("/alerts")}
          />
        </div>

        {/* ACTIONS (notifications, thème, auth) */}
        <div className="flex items-center gap-3">
          <NotificationButton />

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Changer de thème"
          >
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

<<<<<<< HEAD
          {!appUser ? (
            <button
              onClick={() => router.push("/login")}
              className="bg-white text-primary px-4 py-1.5 rounded font-medium hover:bg-gray-100"
            >
              <LogIn className="w-4 h-4 inline mr-1" /> Connexion
=======
          {/* Auth loading / avatar / login */}
          {authLoading ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <Loader2 className="animate-spin w-5 h-5 text-muted-foreground" />
            </div>
          ) : !appUser ? (
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <LogIn className="w-4 h-4" /> Connexion
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
<<<<<<< HEAD
                className="flex items-center gap-2 focus:outline-none"
=======
                className="flex items-center gap-2"
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
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
<<<<<<< HEAD
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded shadow-md py-2 z-[9999]">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
=======
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-muted text-muted-foreground rounded shadow-md py-2 z-[99999] border border-border"
                >
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-accent hover:text-background"
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="w-4 h-4 inline mr-2" /> Profil
                  </Link>
                  <Link
                    href="/settings"
<<<<<<< HEAD
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
=======
                    className="block px-4 py-2 hover:bg-accent hover:text-background"
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
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
<<<<<<< HEAD
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-700/20"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" /> Déconnexion
                  </button>
                </div>
=======
                    className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" /> Déconnexion
                  </button>
                </motion.div>
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
              )}
            </div>
          )}
        </div>
      </nav>

<<<<<<< HEAD
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
=======
      {/* NAVIGATION (mobile) */}
      {appUser && (
        <div className="fixed bottom-0 w-full flex justify-around bg-background border-t border-border py-2 z-[99999] md:hidden text-foreground">
          <MobileLink
            href="/"
            label="Carte"
            icon={<MapPin className="w-5 h-5" />}
            active={isActive("/")}
          />
          <MobileLink
            href="/dashboard"
            label="Tableau"
            icon={<LayoutDashboard className="w-5 h-5" />}
            active={isActive("/dashboard")}
          />
          <MobileLink
            href="/sensors"
            label="Capteurs"
            icon={<Users className="w-5 h-5" />}
            active={isActive("/sensors")}
          />
          <MobileLink
            href="/alerts"
            label="Alertes"
            icon={<AlertTriangle className="w-5 h-5" />}
            active={isActive("/alerts")}
          />
          <MobileLink
            href="/profile"
            label="Profil"
            icon={<User className="w-5 h-5" />}
            active={isActive("/profile")}
          />
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
        </div>
      )}
    </>
  );
}
<<<<<<< HEAD
=======

/* ---------- Composants internes ---------- */

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1 text-sm font-medium transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon} {label}
    </Link>
  );
}

function MobileLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 text-xs font-medium ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
