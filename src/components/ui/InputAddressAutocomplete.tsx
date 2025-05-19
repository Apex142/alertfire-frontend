import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { cn } from '@/lib/utils';

export type AddressPrediction = {
  description: string;
  place_id: string;
};

interface InputAddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  size?: 'lg' | 'normal';
  types?: string[];
}

export default function InputAddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Adresse',
  className = '',
  disabled = false,
  error,
  size = 'normal',
  types = ['geocode'],
}: InputAddressAutocompleteProps) {
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [service, setService] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Charger Google Maps JS API dynamiquement
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
      setService(new (window as any).google.maps.places.AutocompleteService());
      setScriptLoaded(true);
      return;
    }
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      libraries: ['places'],
    });
    loader.load().then(() => {
      setService(new (window as any).google.maps.places.AutocompleteService());
      setScriptLoaded(true);
    });
  }, []);

  // Suggestions avec debounce
  useEffect(() => {
    if (!service || !value || disabled || hasSelected) {
      setPredictions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const searchValue = value.trim();
      if (!searchValue) {
        setPredictions([]);
        setLoading(false);
        return;
      }

      service.getPlacePredictions({
        input: searchValue,
        componentRestrictions: { country: 'fr' },
        types
      }, (results: any, status: any) => {
        setLoading(false);
        if (status !== 'OK' && status !== 'ZERO_RESULTS') {
          console.error('Erreur Google Places:', status);
          setPredictions([]);
          return;
        }
        setPredictions(results ? results.map((p: any) => ({
          description: p.description,
          place_id: p.place_id
        })) : []);
      });
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, service, disabled, hasSelected, types]);

  // Gestion de hasSelected
  const lastSelectedRef = useRef<string>('');

  useEffect(() => {
    // Si la valeur actuelle est différente de la dernière sélection
    // et que hasSelected est true, on réactive les suggestions
    if (hasSelected && value !== lastSelectedRef.current) {
      setHasSelected(false);
    }
  }, [value, hasSelected]);

  // Accessibilité : navigation clavier
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!predictions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % predictions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + predictions.length) % predictions.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const selected = predictions[activeIndex];
      if (selected) {
        handleSelect(selected.description);
      }
    } else if (e.key === 'Escape') {
      setPredictions([]);
      setActiveIndex(-1);
    }
  };

  // Sélection souris
  const handleSelect = (address: string) => {
    lastSelectedRef.current = address;
    onSelect(address);
    setPredictions([]);
    setActiveIndex(-1);
    setHasSelected(true);
  };

  // Si l'utilisateur modifie l'input après sélection
  const handleInputChange = (val: string) => {
    onChange(val);
    setActiveIndex(-1);
  };

  // Classes Tailwind uniformisées avec Input.tsx
  const inputBase = 'flex w-full bg-white placeholder:text-gray-400 focus:outline-none transition text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50';
  const inputBorder = error ? 'border-red-500 focus:ring-red-500 focus:border-transparent' : 'border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent';
  const inputSize = size === 'lg' ? 'h-12 px-4 py-3 text-base rounded-lg' : 'h-10 px-3 py-2 rounded-md';

  return (
    <div className={cn('relative px-0.5', className)}>
      <input
        ref={inputRef}
        type="text"
        className={cn(inputBase, inputBorder, inputSize)}
        value={value}
        onChange={e => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        aria-autocomplete="list"
        aria-expanded={!!predictions.length}
        aria-activedescendant={activeIndex >= 0 ? `address-suggestion-${activeIndex}` : undefined}
      />
      {/* Spinner de chargement */}
      {loading && !hasSelected && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      )}
      {/* Suggestions */}
      {scriptLoaded && predictions.length > 0 && !hasSelected && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {predictions.map((p, i) => (
            <li
              key={p.place_id}
              id={`address-suggestion-${i}`}
              className={cn(
                'px-4 py-2 cursor-pointer text-sm hover:bg-primary/10',
                i === activeIndex && 'bg-primary/10 text-primary font-semibold'
              )}
              onMouseDown={() => handleSelect(p.description)}
              onMouseEnter={() => setActiveIndex(i)}
              aria-selected={i === activeIndex}
              role="option"
            >
              {p.description}
            </li>
          ))}
        </ul>
      )}
      {/* Fallback aucune suggestion */}
      {scriptLoaded && !loading && value && predictions.length === 0 && !hasSelected && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 text-sm text-gray-500">
          Aucune adresse trouvée
        </div>
      )}
      {/* Message d'erreur */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 