import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const companySchema = z.object({
  companyName: z.string().min(1, 'Veuillez sélectionner une entreprise'),
  siret: z.string().min(9, 'SIRET requis'),
  address: z.string().min(1, 'Adresse requise'),
});

type CompanyFormData = z.infer<typeof companySchema>;

type CompanySuggestion = {
  nom_raison_sociale: string;
  siret: string;
  siege: { adresse: string };
};

export default function CompanySearchForm({ onSubmit }: { onSubmit?: (data: CompanyFormData) => void }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: '',
      siret: '',
      address: '',
    },
  });

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!query || query.length < 3) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Erreur lors de la recherche');
        const data = await res.json();
        setSuggestions(
          (data?.results || []).map((item: any) => ({
            nom_raison_sociale: item.nom_raison_sociale || item.nom_complet || '',
            siret: item.siret || '',
            siege: { adresse: item.siege?.adresse || '' },
          }))
        );
        setLoading(false);
      } catch (e) {
        setError('Erreur lors de la recherche');
        setSuggestions([]);
        setLoading(false);
      }
    }, 400);
    // eslint-disable-next-line
  }, [query]);

  // Fermer la dropdown si clic en dehors
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sélection d'une suggestion
  const handleSelect = (company: CompanySuggestion) => {
    setValue('companyName', company.nom_raison_sociale);
    setValue('siret', company.siret);
    setValue('address', company.siege.adresse);
    setQuery(company.nom_raison_sociale);
    setShowDropdown(false);

    // Soumettre directement les données au parent
    if (onSubmit) {
      onSubmit({
        companyName: company.nom_raison_sociale,
        siret: company.siret,
        address: company.siege.adresse
      });
    }
  };

  // Afficher la dropdown si on tape
  useEffect(() => {
    if (query.length >= 3 && suggestions.length > 0) setShowDropdown(true);
    else setShowDropdown(false);
  }, [query, suggestions]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto p-4 bg-white rounded-xl shadow space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher une entreprise</label>
        <div className="relative" ref={dropdownRef}>
          <Input
            type="text"
            placeholder="Nom ou SIRET de l'entreprise"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setValue('companyName', '');
              setValue('siret', '');
              setValue('address', '');
            }}
            autoComplete="off"
            className={errors.companyName ? 'border-red-500' : ''}
            onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
          )}
          {showDropdown && (
            <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow max-h-60 overflow-auto">
              {suggestions.length === 0 && !loading && !error && (
                <li className="px-4 py-2 text-gray-400">Aucun résultat</li>
              )}
              {error && (
                <li className="px-4 py-2 text-red-500">{error}</li>
              )}
              {suggestions.map((s, idx) => (
                <li
                  key={s.siret + idx}
                  className="px-4 py-2 cursor-pointer hover:bg-primary/10"
                  onClick={() => handleSelect(s)}
                >
                  <div className="font-semibold text-sm">{s.nom_raison_sociale}</div>
                  <div className="text-xs text-gray-500">SIRET : {s.siret}</div>
                  <div className="text-xs text-gray-400 truncate">{s.siege.adresse}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {errors.companyName && (
          <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
        )}
      </div>
      {/* Champs cachés pour la soumission */}
      <Controller
        name="companyName"
        control={control}
        render={({ field }) => <input type="hidden" {...field} />}
      />
      <Controller
        name="siret"
        control={control}
        render={({ field }) => <input type="hidden" {...field} />}
      />
      <Controller
        name="address"
        control={control}
        render={({ field }) => <input type="hidden" {...field} />}
      />
      <Button type="submit" className="w-full">Continuer</Button>
    </form>
  );
} 