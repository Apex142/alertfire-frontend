import LocationCard from '@/components/locations/LocationCard';

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

interface LocationsSectionProps {
  title: string;
  locations: Location[];
  emptyMessage: string;
  type: 'my' | 'public' | 'favorite' | string;
}

export default function LocationsSection({ title, locations, emptyMessage }: LocationsSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {locations.length === 0 ? (
        <div className="text-gray-400 italic text-center py-8">{emptyMessage}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {locations.map(loc => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </div>
      )}
    </section>
  );
} 