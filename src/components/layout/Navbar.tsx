// src/components/layout/Navbar.tsx (ou le chemin où vous le placez)
"use client";

import { useAuth } from "@/contexts/AuthContext"; // Utiliser le hook de AuthContext
import { useNotifications } from "@/hooks/useNotifications"; // Suppose que ce hook existe
import {
  Bell,
  Home,
  LayoutDashboard, // Utilisé dans la nav mobile
  LogIn,
  LogOut,
  MapPin,
  Menu as MenuIcon, // Non utilisé dans le snippet fourni, mais conservé
  Moon, // Non utilisé dans le snippet fourni, mais conservé
  Settings,
  Sun,
  User,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes"; // Pour la gestion du thème
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import NotificationButton from "../NotificationButton";

export default function Navbar() {
  // Utiliser appUser de AuthContext pour les données affichées
  const { appUser, logout, currentSessionId, loading: authLoading } = useAuth();
  const { unreadCount } = useNotifications(); // Suppose que ce hook retourne le nombre de notifications non lues
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // const [moreOpen, setMoreOpen] = useState(false); // moreOpen et moreRef non utilisés dans le JSX fourni

  // Utilisation de next-themes
  const { theme, setTheme, resolvedTheme } = useTheme();

  const menuRef = useRef<HTMLDivElement>(null);
  // const moreRef = useRef<HTMLButtonElement>(null); // Non utilisé

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
      // Logique pour moreOpen si réintroduit
    };
    if (menuOpen /*|| moreOpen*/) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen /*, moreOpen*/]);

  const truncateEmail = (
    email: string | undefined | null,
    maxLength: number = 20
  ): string => {
    if (!email) return "Utilisateur";
    if (email.length > maxLength) {
      const [name, domain] = email.split("@");
      if (!domain) return email.slice(0, maxLength) + "..."; // Si pas de @
      return `${name.slice(
        0,
        Math.max(1, maxLength / 2 - domain.length)
      )}...@${domain}`;
    }
    return email;
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  const topGradient = "bg-white dark:bg-gray-800"; // Classes Tailwind pour le fond
  const hoverText = "hover:text-gray-700 dark:hover:text-gray-200"; // Classes pour le survol

  const NotificationBlink = ({ count }: { count: number }) =>
    count > 0 ? (
      <span
        className="absolute flex items-center justify-center pointer-events-none"
        style={{ top: "-5px", right: "-5px", width: "22px", height: "22px" }} // Ajusté légèrement
      >
        <span className="absolute w-full h-full rounded-full bg-primary/70 animate-ping" />
        <span className="relative inline-flex rounded-full h-5 w-5 bg-primary text-white text-xs items-center justify-center border-2 border-white dark:border-gray-800">
          {count > 9 ? "9+" : count}
        </span>
      </span>
    ) : null;

  if (authLoading) {
    // Peut-être un placeholder minimal pendant le chargement de l'auth,
    // ou laisser le Layout principal gérer le chargement global
    return (
      <nav
        className={`${topGradient} shadow-md text-black dark:text-white sticky top-0 z-50 h-[65px] flex items-center justify-center transition-colors duration-200`}
      >
        <span className="text-sm">Chargement...</span>
      </nav>
    );
  }

  return (
    <>
      {/* Navbar principale en haut - h-[65px] pour correspondre à Layout.tsx */}
      <nav
        className={`${topGradient} shadow-md text-black dark:text-white sticky top-0 z-40 h-[65px] flex items-center transition-colors duration-200`}
      >
        <div className="flex justify-between items-center w-full py-2 px-4 sm:px-6">
          <Link
            href={appUser ? "/dashboard" : "/"}
            className="text-xl font-bold tracking-tight select-none text-gray-800 dark:text-white"
          >
            Showmate {/* Adaptez le nom */}
          </Link>

          <div className="hidden md:flex flex-1 justify-center items-center gap-x-2 lg:gap-x-4">
            <Link
              href={appUser ? "/dashboard" : "/"}
              className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition duration-150 ${
                isActive(appUser ? "/dashboard" : "/")
                  ? "bg-gray-100 dark:bg-gray-700"
                  : hoverText
              }`}
            >
              <Home className="w-4 h-4" /> Accueil
            </Link>
            {appUser && ( // Liens conditionnels si l'utilisateur est connecté
              <>
                <Link
                  href="/reseau"
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition duration-150 ${
                    isActive("/reseau")
                      ? "bg-gray-100 dark:bg-gray-700"
                      : hoverText
                  }`}
                >
                  <Users className="w-4 h-4" /> Réseau
                </Link>
                <Link
                  href="/lieux"
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition duration-150 ${
                    isActive("/lieux")
                      ? "bg-gray-100 dark:bg-gray-700"
                      : hoverText
                  }`}
                >
                  <MapPin className="w-4 h-4" /> Lieux
                </Link>
                {/* Profil est dans le menu déroulant, mais peut être ici aussi si désiré */}
              </>
            )}
          </div>

          <div className="flex items-center gap-x-2 sm:gap-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Changer de thème"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {!appUser ? (
              <button
                onClick={() => router.push("/login")}
                className="hidden md:flex items-center justify-center gap-2 text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                <LogIn className="w-4 h-4" /> Se connecter
              </button>
            ) : (
              <>
                <div className="hidden md:block relative">
                  <NotificationButton />
                  <NotificationBlink count={unreadCount} />
                </div>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                    aria-label="Menu utilisateur"
                  >
                    {appUser.photoURL ? (
                      <Image
                        src={appUser.photoURL}
                        alt="Avatar"
                        width={36}
                        height={36}
                        className="rounded-full border-2 border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <User className="w-9 h-9 rounded-full border-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 p-1.5" />
                    )}
                    <MenuIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 hidden sm:block" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 z-50 ring-1 ring-gray-200 dark:ring-gray-700">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                          {appUser.displayName || "Utilisateur"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {truncateEmail(appUser.email)}
                        </p>
                      </div>
                      <nav className="mt-1">
                        <Link
                          href="/profile"
                          className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                          onClick={() => setMenuOpen(false)}
                        >
                          <User className="w-4 h-4" /> Profil
                        </Link>
                        <Link
                          href="/settings"
                          className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                          onClick={() => setMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" /> Paramètres
                        </Link>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={async () => {
                            setMenuOpen(false);
                            await logout(
                              "Manual user logout",
                              currentSessionId
                            ); // Utiliser logout du AuthContext
                            router.push("/"); // Rediriger vers l'accueil après déconnexion
                          }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/20 flex items-center gap-3"
                        >
                          <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              </>
            )}
            {/* Bouton Menu Hamburger pour mobile (pour les liens centraux) */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => {
                /* TODO: Logique pour ouvrir un menu mobile si les liens centraux doivent y être*/
              }}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Navbar Mobile (Bottom) - Affichée uniquement si l'utilisateur est connecté */}
      {appUser && (
        <div
          className={`${topGradient} fixed bottom-0 w-full flex justify-around items-center py-2.5 border-t border-gray-200 dark:border-gray-700 md:hidden shadow-top-md z-40 transition-colors duration-200`}
        >
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium ${
              isActive("/dashboard")
                ? "text-primary dark:text-primary-light"
                : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" /> Tableau
          </Link>
          <Link
            href="/reseau"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium ${
              isActive("/reseau")
                ? "text-primary dark:text-primary-light"
                : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light"
            }`}
          >
            <Users className="w-5 h-5" /> Réseau
          </Link>
          <Link
            href="/lieux"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium ${
              isActive("/lieux")
                ? "text-primary dark:text-primary-light"
                : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light"
            }`}
          >
            <MapPin className="w-5 h-5" /> Lieux
          </Link>
          <Link
            href="/notifications"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium relative ${
              isActive("/notifications")
                ? "text-primary dark:text-primary-light"
                : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light"
            }`}
          >
            <span className="relative">
              <Bell className="w-5 h-5" />{" "}
              <NotificationBlink count={unreadCount} />
            </span>
            Notifs
          </Link>
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium ${
              isActive("/profile")
                ? "text-primary dark:text-primary-light"
                : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light"
            }`}
          >
            <User className="w-5 h-5" /> Profil
          </Link>
        </div>
      )}
    </>
  );
}
