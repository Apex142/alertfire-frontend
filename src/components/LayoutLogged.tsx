'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from './ui/Button';
import { useAuth } from '@/hooks/useAuth';
import TopMenu from './TopMenu';
import ProtectedRoute from './ProtectedRoute';
import { useUserDataContext } from '@/app/providers';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopMenu userData={userData} /> {/* 65px = hauteur du menu */}
      <ProtectedRoute>
        <main className="mx-auto h-[calc(100vh-65px)] overflow-y-auto p-0">
          {children}
        </main>
      </ProtectedRoute>
    </div>
  );
} 