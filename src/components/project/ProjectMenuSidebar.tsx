'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useActiveProject } from '@/stores/useActiveProjectStore';
import {
  Home,
  Users,
  Calendar,
  FileText,
  MapPin,
  BadgeCheck,
  Hotel,
  Car,
  DollarSign,
  Package,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainMenu = [
  { label: 'Tableau de bord', path: '', icon: Home },
  { label: 'Equipe', path: 'equipe', icon: Users },
  { label: 'Planning', path: 'planning', icon: Calendar },
  { label: 'Contenu', path: 'contenu', icon: FileText },
  { label: 'Lieux', path: 'lieux', icon: MapPin },
];

const additionalProducts = [
  { label: 'Accréditation', path: 'accreditation', icon: BadgeCheck, key: 'hasAccreditation' },
  { label: 'Logement', path: 'logement', icon: Hotel, key: 'hasAccommodation' },
  { label: 'Véhicule', path: 'vehicule', icon: Car, key: 'hasVehicle' },
  { label: 'Argent', path: 'argent', icon: DollarSign, key: 'hasFinance' },
  { label: 'Matériel', path: 'materiel', icon: Package, key: 'hasEquipment' },
];

interface ProjectSidebarProps {
  title: string;
  startDate?: string;
  endDate?: string;
}

export default function ProjectSidebar({ title, startDate, endDate }: ProjectSidebarProps) {
  const [showProducts, setShowProducts] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const params = useParams();
  const pathname = usePathname();
  const { project } = useActiveProject();

  if (!project) return null;

  const projectId = project.id;
  const baseUrl = `/projet/${projectId}`;

  const menuItems = [
    { href: baseUrl, label: 'Vue d\'ensemble', exact: true },
    { href: `${baseUrl}/planning`, label: 'Planning' },
    { href: `${baseUrl}/equipe`, label: 'Équipe' },
    { href: `${baseUrl}/lieux`, label: 'Lieux' },
    { href: `${baseUrl}/documents`, label: 'Documents' },
    { href: `${baseUrl}/parametres`, label: 'Paramètres' },
  ];

  // Filtrer les produits actifs
  const activeProducts = additionalProducts.filter(product => project[product.key as keyof typeof project]);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>
        {startDate && (
          <p className="text-sm text-gray-600">
            {startDate}
            {endDate && ` - ${endDate}`}
          </p>
        )}
      </div>
      <nav className="space-y-1 px-3">
        {menuItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
} 