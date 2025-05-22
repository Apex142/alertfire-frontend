"use client";

import { useUserDataContext } from "@/app/providers";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute";
import TopMenu from "./TopMenu";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const { userData } = useUserDataContext();

  const isActive = (path: string) => pathname === path;

  return (
    <div
      className="min-h-screen min-w-full max-w-screen max-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden"
      style={{ width: "100vw", height: "100vh" }}
    >
      <TopMenu userData={userData} />
      {/* 65px = hauteur du menu */}
      <ProtectedRoute>
        <main
          className="mx-auto w-full h-[calc(100vh-65px)] max-h-[calc(100vh-65px)] overflow-y-auto overflow-x-hidden p-0"
          style={{
            maxWidth: "100vw",
            minWidth: 0,
            minHeight: 0,
          }}
        >
          {children}
        </main>
      </ProtectedRoute>
    </div>
  );
}
