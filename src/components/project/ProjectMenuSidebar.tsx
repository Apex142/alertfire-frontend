import { cn } from "@/lib/utils";
import { useActiveProject } from "@/stores/useActiveProjectStore";
import {
  BadgeCheck,
  Calendar,
  Car,
  DollarSign,
  FileText,
  Home,
  Hotel,
  MapPin,
  MoreHorizontal,
  Package,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Tabs
const menuItems = [
  { label: "Tableau", path: "", icon: Home },
  { label: "Équipe", path: "equipe", icon: Users },
  { label: "Planning", path: "planning", icon: Calendar },
  { label: "Contenu", path: "contenu", icon: FileText },
  { label: "Lieux", path: "lieux", icon: MapPin },
];
const additionalProducts = [
  {
    label: "Accréditation",
    path: "accreditation",
    icon: BadgeCheck,
    key: "hasAccreditation",
  },
  { label: "Logement", path: "logement", icon: Hotel, key: "hasAccommodation" },
  { label: "Véhicule", path: "vehicule", icon: Car, key: "hasVehicle" },
  { label: "Argent", path: "argent", icon: DollarSign, key: "hasFinance" },
  { label: "Matériel", path: "materiel", icon: Package, key: "hasEquipment" },
];

export default function ProjectTabsBar() {
  const pathname = usePathname();
  const { project } = useActiveProject();
  const [showModules, setShowModules] = useState(false);

  if (!project) return null;
  if (!pathname?.startsWith(`/project/${project.id}`)) return null;

  const projectId = project.id;
  const baseUrl = `/project/${projectId}`;
  const activeProducts = additionalProducts.filter(
    (product) => project[product.key as keyof typeof project]
  );

  const renderMenuItem = (item: { label: string; path: string; icon: any }) => {
    const href = `${baseUrl}/${item.path}`.replace(/\/$/, "");
    const isActive =
      pathname === href || (item.path === "" && pathname === baseUrl);

    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "flex items-center md:gap-3 gap-0.5 md:px-4 md:py-2 px-2 py-1 rounded transition min-w-[52px] md:min-w-0 group",
          isActive
            ? "bg-[#eaf2fb] text-[#3887c6] font-semibold shadow-sm"
            : "text-gray-500 hover:bg-gray-50 hover:text-[#3887c6]"
        )}
        style={{ transition: "all .16s" }}
      >
        <item.icon
          className={cn(
            "w-6 h-6 md:w-5 md:h-5",
            isActive
              ? "text-[#3887c6]"
              : "group-hover:text-[#3887c6] text-gray-400"
          )}
        />
        <span className="md:inline-block hidden text-[14.7px] font-medium truncate">
          {item.label}
        </span>
        {/* Mobile label */}
        <span className="md:hidden block text-[11px] font-medium">
          {item.label}
        </span>
      </Link>
    );
  };

  // --- Drawer mobile pour modules additionnels
  const TABS_HEIGHT = 48;
  const NAVBAR_HEIGHT = 75;

  return (
    <>
      {/* --- Modules Drawer (mobile only) --- */}
      {showModules && (
        <div
          className="fixed inset-0 bg-black/40 z-[120] flex justify-end md:hidden"
          onClick={() => setShowModules(false)}
        >
          <div
            className="bg-white w-48 h-full shadow-lg px-3 py-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-xs text-gray-500 font-bold uppercase">
              Modules
            </div>
            {activeProducts.map(renderMenuItem)}
          </div>
        </div>
      )}

      {/* --- TOP BAR MOBILE --- */}
      <nav
        className={cn(
          "md:hidden fixed left-0 right-0 z-[35] bg-white border-b border-gray-100"
        )}
        style={{
          top: `${NAVBAR_HEIGHT}px`,
          height: "64px",
          boxShadow: "0 2px 12px rgb(36 48 78 / 7%)",
        }}
      >
        <div className="flex flex-nowrap justify-between items-center px-3 h-full">
          {menuItems.map((item) => {
            const href = `${baseUrl}/${item.path}`.replace(/\/$/, "");
            const isActive =
              pathname === href || (item.path === "" && pathname === baseUrl);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg py-2 px-1 min-w-0 flex-grow mx-0.5 text-center transition",
                  isActive
                    ? "bg-[#eaf2fb] text-[#3887c6] font-semibold shadow"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#3887c6]"
                )}
                style={{ transition: "all .16s" }}
              >
                <item.icon
                  className={cn(
                    "w-7 h-7 mb-0.5",
                    isActive
                      ? "text-[#3887c6]"
                      : "text-gray-400 group-hover:text-[#3887c6]"
                  )}
                />
                <span className="text-[13px] font-semibold truncate leading-tight w-full block">
                  {item.label}
                </span>
              </Link>
            );
          })}
          {activeProducts.length > 0 && (
            <button
              onClick={() => setShowModules(true)}
              className="flex flex-col items-center justify-center rounded-lg py-2 px-1 min-w-0 flex-grow mx-0.5 text-center text-gray-500 hover:text-[#3887c6]"
            >
              <MoreHorizontal className="w-7 h-7 mb-0.5" />
              <span className="text-[13px] font-semibold leading-tight w-full block truncate">
                Plus
              </span>
            </button>
          )}
        </div>
      </nav>
      <div className="md:hidden" style={{ height: "64px" }} />

      {/* --- LEFT SIDEBAR DESKTOP --- */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-white border-r border-gray-100 pt-18 pb-8 px-0 z-20 w-60 min-h-[calc(100vh-0px)] pr-2"
        )}
        // Pas de fixed, sidebar dans le flow
        style={{
          boxShadow: "2px 0 12px 0 rgb(36 48 78 / 3%)",
        }}
      >
        <div className="flex flex-col gap-1 px-2 py-4">
          {menuItems.map(renderMenuItem)}
        </div>
        {activeProducts.length > 0 && (
          <div className="mt-7 border-t pt-3 border-gray-200 px-2">
            <p className="text-xs font-semibold text-gray-400 mb-2 uppercase pl-1">
              Modules
            </p>
            <div className="flex flex-col gap-1">
              {activeProducts.map(renderMenuItem)}
            </div>
          </div>
        )}
      </aside>
      {/* Plus besoin du block pour décaler le main */}
    </>
  );
}
