// src/components/layout/Navbar.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Flame,
  LayoutDashboard,
  Loader2,
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
import NotificationButton from "./NotificationButton";

export default function Navbar() {
  const { appUser, firebaseUser, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const { setTheme, resolvedTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () =>
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);
  const isAuthenticated = Boolean(appUser || firebaseUser);
  const showLoginButton = !authLoading && !isAuthenticated;
  const showUserMenu = !authLoading && Boolean(appUser);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

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
        {isAuthenticated && (
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
        )}

        {/* ACTIONS (notifications, thème, auth) */}
        <div className="flex items-center gap-3">
          {isAuthenticated && <NotificationButton />}

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Changer de thème"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Auth loading / avatar / login */}
          {authLoading ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <Loader2 className="animate-spin w-5 h-5 text-muted-foreground" />
            </div>
          ) : showLoginButton ? (
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <LogIn className="w-4 h-4" /> Connexion
            </button>
          ) : showUserMenu && appUser ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2"
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
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-muted text-muted-foreground rounded shadow-md py-2 z-[99999] border border-border"
                >
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-accent hover:text-background"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="w-4 h-4 inline mr-2" /> Profil
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 hover:bg-accent hover:text-background"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 inline mr-2" /> Paramètres
                  </Link>
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout("Manual logout");
                      router.push("/");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" /> Déconnexion
                  </button>
                </motion.div>
              )}
            </div>
          ) : null}
        </div>
      </nav>

      {/* NAVIGATION (mobile) */}
      {isAuthenticated && (
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
        </div>
      )}
    </>
  );
}

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
