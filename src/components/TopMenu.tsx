"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Bell,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Plus,
  Settings,
  Sun,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import NotificationButton from "./NotificationButton";

const Navbar = () => {
  const { user, signOut, loading } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const menuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);

  // Gestion du thème
  useEffect(() => {
    // Vérifie le thème système au chargement
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Ferme les menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
      if (
        moreOpen &&
        moreRef.current &&
        !(
          event.target === moreRef.current ||
          moreRef.current.contains(event.target as Node)
        )
      ) {
        setMoreOpen(false);
      }
    };
    if (menuOpen || moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen, moreOpen]);

  // Email court
  const truncateEmail = (email: string, maxLength: number = 20) => {
    if (!email) return "";
    if (email.length > maxLength) {
      const [name, domain] = email.split("@");
      return `${name.slice(0, maxLength / 2)}...@${domain}`;
    }
    return email;
  };

  // Helpers
  const topGradient = "bg-white dark:bg-primary-contrast";
  const bottomGradient = "bg-white dark:bg-primary-contrast";
  const hoverText = "hover:text-black/80 dark:hover:text-white/80";
  const isActive = (href: string) => pathname === href;

  // Badge notification stylé (blink centré, visible partout)
  const NotificationBlink = ({ count }: { count: number }) =>
    count > 0 ? (
      <span
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          top: "-7px",
          right: "-8px", // Plus à droite, sort un peu du bouton
          width: "24px",
          height: "24px",
        }}
      >
        {/* Blink/ping */}
        <span className="absolute w-6 h-6 rounded-full bg-blue-400/70 animate-ping" />
        {/* Badge nombre */}
        <span className="relative w-6 h-6 bg-[#3887c6] text-white text-[0.95rem] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-md z-10 transition-all">
          {count}
        </span>
      </span>
    ) : null;

  return (
    <>
      {/* Navbar principale en haut */}
      <nav className={`${topGradient} shadow-md text-black dark:text-white sticky top-0 z-40 transition-colors duration-200`}>
        <div className="flex justify-between items-center py-2 px-4 sm:px-6">
          {/* Nom du site à gauche */}
          <Link
            href="/"
            className="text-xl font-bold tracking-tight select-none"
          >
            Showmate
          </Link>

          {/* Liens centraux */}
          <div className="hidden md:flex flex-1 justify-center gap-4">
            <Link
              href="/"
              className={`flex items-center gap-2 text-base font-medium px-3 py-1.5 rounded-lg transition duration-150 ${isActive("/") ? "bg-black/5 dark:bg-white/10" : hoverText
                }`}
            >
              <Home className="w-4 h-4" /> Accueil
            </Link>
            <Link
              href="/reseau"
              className={`flex items-center gap-2 text-base font-medium px-3 py-1.5 rounded-lg transition duration-150 ${isActive("/reseau") ? "bg-black/5 dark:bg-white/10" : hoverText
                }`}
            >
              <Users className="w-4 h-4" /> Réseau
            </Link>
            <Link
              href="/lieux"
              className={`flex items-center gap-2 text-base font-medium px-3 py-1.5 rounded-lg transition duration-150 ${isActive("/lieux") ? "bg-black/5 dark:bg-white/10" : hoverText
                }`}
            >
              <MapPin className="w-4 h-4" /> Lieux
            </Link>
            <Link
              href="/profile"
              className={`flex items-center gap-2 text-base font-medium px-3 py-1.5 rounded-lg transition duration-150 ${isActive("/profile") ? "bg-black/5 dark:bg-white/10" : hoverText
                }`}
            >
              <User className="w-4 h-4" /> Profil
            </Link>
          </div>

          {/* Actions à droite */}
          {!user ? (
            <div className="flex items-center gap-2">
              {/* Bouton thème */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Changer de thème"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>
              {/* Connexion Desktop */}
              <button
                onClick={() => router.push("/login")}
                className="hidden md:flex py-1.5 px-4 rounded-lg font-medium text-sm border border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all duration-150"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Se connecter
              </button>
              {/* Connexion Mobile */}
              <button
                onClick={() => router.push("/login")}
                className="flex md:hidden items-center text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 transition"
              >
                <LogIn className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Bouton thème */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Changer de thème"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>
              {/* Bouton Notifications Desktop */}
              <div className="hidden md:flex relative ml-1">
                <NotificationButton />
                <NotificationBlink count={unreadCount} />
              </div>

              {/* Menu utilisateur */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 focus:outline-none hover:bg-black/5 dark:hover:bg-white/10 rounded-lg px-2 py-1 transition duration-150"
                >
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="rounded-full border border-black/20 dark:border-white/50"
                    />
                  ) : (
                    <User className="w-8 h-8 rounded-full border border-black/20 dark:border-white/50 bg-black/5 dark:bg-white/10 text-black dark:text-white p-1" />
                  )}
                  <Menu className="w-4 h-4" />
                </button>
                {/* Menu déroulant */}
                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white/95 dark:bg-gray-800 text-[#233554] dark:text-white rounded-xl shadow-2xl py-3 z-[1000] ring-1 ring-[#a3c0ed] dark:ring-gray-600 animate-fade-in">
                    <div className="px-5 pb-2 text-base font-semibold">
                      {user?.email ? truncateEmail(user.email, 20) : "Invité"}
                    </div>
                    <hr className="my-2 border-[#a3c0ed] dark:border-gray-600" />
                    <Link
                      href="/profile"
                      className="block px-5 py-2 hover:bg-[#e5eaff] dark:hover:bg-gray-700 hover:text-[#233554] dark:hover:text-white rounded flex items-center gap-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      Profil
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-5 py-2 hover:bg-[#e5eaff] dark:hover:bg-gray-700 hover:text-[#233554] dark:hover:text-white rounded flex items-center gap-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      Paramètres
                    </Link>
                    <button
                      onClick={async () => {
                        setMenuOpen(false);
                        await signOut();
                        router.push("/login");
                      }}
                      className="w-full text-left px-5 py-2 hover:bg-[#e5eaff] dark:hover:bg-gray-700 hover:text-[#3887c6] dark:hover:text-[#3887c6] flex items-center gap-2 text-[#3887c6] rounded"
                    >
                      <LogOut className="w-5 h-5" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Navbar Mobile (Bottom) */}
      <div
        className={`${bottomGradient} z-[100] fixed bottom-0 w-full flex justify-around items-center py-3 md:hidden shadow-lg transition-colors duration-200`}
      >
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-0.5 text-black dark:text-white ${isActive("/dashboard") ? "text-black/80 dark:text-white/80" : "hover:text-black/80 dark:hover:text-white/80"
            }`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[0.75rem] font-medium">Tableau</span>
        </Link>

        <Link
          href="/reseau"
          className={`flex flex-col items-center gap-0.5 text-black dark:text-white ${isActive("/reseau") ? "text-black/80 dark:text-white/80" : "hover:text-black/80 dark:hover:text-white/80"
            }`}
        >
          <Users className="w-6 h-6" />
          <span className="text-[0.75rem] font-medium">Réseau</span>
        </Link>

        <Link
          href="/lieux"
          className={`flex flex-col items-center gap-0.5 text-black dark:text-white ${isActive("/lieux") ? "text-black/80 dark:text-white/80" : "hover:text-black/80 dark:hover:text-white/80"
            }`}
        >
          <MapPin className="w-6 h-6" />
          <span className="text-[0.75rem] font-medium">Lieux</span>
        </Link>

        <Link
          href="/notifications"
          className={`flex flex-col items-center gap-0.5 text-black dark:text-white relative ${isActive("/notifications") ? "text-black/80 dark:text-white/80" : "hover:text-black/80 dark:hover:text-white/80"
            }`}
        >
          <span className="relative flex items-center justify-center">
            <Bell className="w-6 h-6" />
            <NotificationBlink count={unreadCount} />
          </span>
          <span className="text-[0.75rem] font-medium">Notifs</span>
        </Link>

      </div>
    </>
  );
};

export default Navbar;
