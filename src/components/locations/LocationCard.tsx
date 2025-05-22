import StatusBadge from "./StatusBadge";
import Link from "next/link";

interface Location {
  id: string;
  name: string;
  address: string;
  type: string;
  status: string;
  createdBy?: string;
  companyId?: string | null;
  isPublic?: boolean;
}

export default function LocationCard({ location }: { location: Location }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold truncate">{location.name}</h3>
        <StatusBadge status={location.status} />
      </div>
      <div className="text-sm text-gray-500 mb-1 truncate">
        {location.address}
      </div>
      <div className="text-xs text-gray-400 mb-2">{location.type}</div>
      <div className="flex-1" />
      <div className="flex gap-2 mt-2">
        <Link
          href={`/lieux/${location.id}`}
          className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition"
        >
          Voir fiche
        </Link>
        <button className="px-3 py-1 rounded bg-primary text-white text-xs font-medium hover:bg-primary-700 transition">
          Utiliser pour un project
        </button>
        <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition">
          Modifier
        </button>
      </div>
    </div>
  );
}
