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
  Plus,
  Settings,
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
  const menuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);

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
  const topGradient =
    "bg-gradient-to-r from-[#233554] via-[#354178] to-[#3887c6]";
  const bottomGradient =
    "bg-gradient-to-r from-[#233554] via-[#354178] to-[#3887c6]";
  const hoverText = "hover:text-[#a3c0ed]";
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
      <nav className={`${topGradient} shadow-xl text-white sticky top-0 z-40`}>
        <div className="flex justify-between items-center py-3 px-4 sm:px-8">
          {/* Nom du site à gauche */}
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight select-none drop-shadow-lg"
          >
            Showmate
          </Link>

          {/* Liens centraux */}
          <div className="hidden md:flex flex-1 justify-center gap-5">
            <Link
              href="/"
              className={`flex items-center gap-2 text-[1.13rem] font-medium px-3 py-2 rounded-xl transition duration-150 ${
                isActive("/") ? "bg-white/15 shadow-inner" : hoverText
              }`}
            >
              <Home className="w-5 h-5" /> Accueil
            </Link>
            <Link
              href="/reseau"
              className={`flex items-center gap-2 text-[1.13rem] font-medium px-3 py-2 rounded-xl transition duration-150 ${
                isActive("/reseau") ? "bg-white/15 shadow-inner" : hoverText
              }`}
            >
              <Users className="w-5 h-5" /> Réseau
            </Link>
            <Link
              href="/lieux"
              className={`flex items-center gap-2 text-[1.13rem] font-medium px-3 py-2 rounded-xl transition duration-150 ${
                isActive("/lieux") ? "bg-white/15 shadow-inner" : hoverText
              }`}
            >
              <MapPin className="w-5 h-5" /> Lieux
            </Link>
            <Link
              href="/profile"
              className={`flex items-center gap-2 text-[1.13rem] font-medium px-3 py-2 rounded-xl transition duration-150 ${
                isActive("/profile") ? "bg-white/15 shadow-inner" : hoverText
              }`}
            >
              <User className="w-5 h-5" /> Profil
            </Link>
          </div>

          {/* Actions à droite */}
          {!user ? (
            <div className="flex items-center">
              {/* Connexion Desktop */}
              <button
                onClick={() => router.push("/login")}
                className="hidden md:flex py-2.5 px-5 rounded-xl font-medium text-base border border-white/80 bg-white/5 hover:bg-white/20 hover:text-[#233554] transition-all duration-150"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Se connecter
              </button>
              {/* Connexion Mobile */}
              <button
                onClick={() => router.push("/login")}
                className="flex md:hidden items-center text-white hover:text-[#a3c0ed] transition"
              >
                <LogIn className="w-8 h-8" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Bouton Notifications Desktop */}
              <div className="hidden md:flex relative ml-1">
                <NotificationButton />
                <NotificationBlink count={unreadCount} />
              </div>

              {/* Menu utilisateur */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 focus:outline-none hover:bg-white/15 rounded-full px-2.5 py-1.5 transition duration-150"
                >
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Avatar"
                      width={38}
                      height={38}
                      className="rounded-full border-2 border-white/70 shadow"
                    />
                  ) : (
                    <User className="w-9 h-9 rounded-full border-2 border-white/70 shadow bg-gray-700 text-white p-1" />
                  )}
                  <Menu className="w-5 h-5" />
                </button>
                {/* Menu déroulant */}
                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white/95 text-[#233554] rounded-xl shadow-2xl py-3 z-[1000] ring-1 ring-[#a3c0ed] animate-fade-in">
                    <div className="px-5 pb-2 text-base font-semibold">
                      {user?.email ? truncateEmail(user.email, 20) : "Invité"}
                    </div>
                    <hr className="my-2 border-[#a3c0ed]" />
                    <Link
                      href="/profile"
                      className="block px-5 py-2 hover:bg-[#e5eaff] hover:text-[#233554] rounded flex items-center gap-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      Profil
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-5 py-2 hover:bg-[#e5eaff] hover:text-[#233554] rounded flex items-center gap-2"
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
                      className="w-full text-left px-5 py-2 hover:bg-[#e5eaff] hover:text-[#3887c6] flex items-center gap-2 text-[#3887c6] rounded"
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
        className={`${bottomGradient} z-[100] fixed bottom-0 w-full flex justify-around items-center py-4 md:hidden shadow-lg`}
      >
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-0.5 text-white ${
            isActive("/dashboard") ? "text-[#a3c0ed]" : "hover:text-[#a3c0ed]"
          }`}
        >
          <LayoutDashboard className="w-7 h-7" />
          <span className="text-[0.82rem] font-medium">Tableau</span>
        </Link>
        <Link
          href="/messages"
          className={`flex flex-col items-center gap-0.5 text-white ${
            isActive("/messages") ? "text-[#a3c0ed]" : "hover:text-[#a3c0ed]"
          }`}
        >
          <MessageCircle className="w-7 h-7" />
          <span className="text-[0.82rem] font-medium">Messages</span>
        </Link>
        <Link
          href="/notifications"
          className={`flex flex-col items-center gap-0.5 text-white relative ${
            isActive("/notifications")
              ? "text-[#a3c0ed]"
              : "hover:text-[#a3c0ed]"
          }`}
        >
          <span className="relative flex items-center justify-center">
            <Bell className="w-7 h-7" />
            <NotificationBlink count={unreadCount} />
          </span>
          <span className="text-[0.82rem] font-medium">Notifs</span>
        </Link>
        {/* Bouton Plus */}
        <button
          ref={moreRef}
          className={`flex flex-col items-center gap-0.5 text-white hover:text-[#a3c0ed] relative focus:outline-none`}
          onClick={() => setMoreOpen((v) => !v)}
        >
          <Plus className="w-7 h-7" />
          <span className="text-[0.82rem] font-medium">Plus</span>
          {moreOpen && (
            <div className="absolute bottom-14 right-0 bg-white text-[#233554] rounded-xl shadow-2xl py-2 w-32 z-[200] animate-fade-in ring-1 ring-[#a3c0ed]">
              <Link
                href="/reseau"
                className="block px-4 py-2 hover:bg-[#e5eaff] rounded"
                onClick={() => setMoreOpen(false)}
              >
                <Users className="inline w-4 h-4 mr-2" /> Réseau
              </Link>
              <Link
                href="/lieux"
                className="block px-4 py-2 hover:bg-[#e5eaff] rounded"
                onClick={() => setMoreOpen(false)}
              >
                <MapPin className="inline w-4 h-4 mr-2" /> Lieux
              </Link>
            </div>
          )}
        </button>
      </div>
    </>
  );
};

export default Navbar;
