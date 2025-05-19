import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { db, storage } from '@/lib/firebase';
import { doc, setDoc, getDocs, collection, query, where, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import InputAddressAutocomplete from '@/components/ui/InputAddressAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';
import { Select } from '@/components/ui/Select';

const legalStatusOptions = ['Gérant', 'Salarié', 'Autoentrepreneur', 'Intermittent', 'Bénévole'] as const;
type LegalStatus = typeof legalStatusOptions[number];

const companySchema = z.object({
  siren: z.string().length(9, 'Le SIREN doit contenir 9 chiffres').optional().or(z.literal('')),
  name: z.string().min(2, 'Le nom est requis'),
  address: z.string().min(5, 'L\'adresse est requise'),
  position: z.string().min(2, 'Le poste est requis'),
  legalStatus: z.enum(legalStatusOptions, { required_error: 'Sélectionnez un statut légal' }),
  logo: z.instanceof(File).optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

type Props = { onNext: () => void };

export default function OnboardingStep5({ onNext }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilledData, setPrefilledData] = useState<{ name?: string; address?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    mode: 'onTouched',
    defaultValues: {
      siren: '',
      name: '',
      address: '',
      position: '',
      legalStatus: undefined,
      logo: undefined,
    }
  });

  const siren = watch('siren');
  const logo = watch('logo');

  // Vérifier le SIREN dans Firestore
  const checkSirenInFirestore = async (siren: string) => {
    const q = query(collection(db, 'companies'), where('siren', '==', siren));
    const snap = await getDocs(q);
    return !snap.empty ? snap.docs[0].id : null;
  };

  // Récupérer les données SIRENE
  const fetchSirenData = async (siren: string) => {
    try {
      const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${siren}`);
      if (!res.ok) throw new Error('Erreur lors de la recherche');
      const data = await res.json();
      if (data.results?.[0]) {
        const company = data.results[0];
        setPrefilledData({
          name: company.nom_raison_sociale,
          address: company.siege?.adresse,
        });
        setValue('name', company.nom_raison_sociale);
        setValue('address', company.siege?.adresse);
      }
    } catch (e) {
      console.error('Erreur SIRENE:', e);
    }
  };

  // Observer les changements du SIREN
  useEffect(() => {
    if (siren && siren.length === 9) {
      fetchSirenData(siren);
    } else {
      setPrefilledData(null);
    }
  }, [siren]);

  // Gestion du logo
  const MAX_SIZE_MB = 2;
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Le logo ne doit pas dépasser ${MAX_SIZE_MB} Mo`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setValue('logo', undefined);
        return;
      }
      // Vérifier si c'est une image carrée
      const img = new Image();
      img.onload = () => {
        if (img.width !== img.height) {
          setError('Le logo doit être une image carrée');
          if (fileInputRef.current) fileInputRef.current.value = '';
          setValue('logo', undefined);
        } else {
          setValue('logo', file);
          setError(null);
        }
      };
      img.src = URL.createObjectURL(file);
    }
  };

  // Soumission du formulaire
  const onSubmit = async (data: CompanyFormData) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let logoUrl = '';
      if (data.logo) {
        try {
          const logoRef = ref(storage, `companies/logos/${Date.now()}_${data.logo.name}`);
          await uploadBytes(logoRef, data.logo);
          logoUrl = await getDownloadURL(logoRef);
        } catch (e) {
          console.error('Erreur lors de l\'upload du logo:', e);
          setError('Erreur lors de l\'upload du logo');
          setLoading(false);
          return;
        }
      }

      // Vérifier si l'entreprise existe déjà
      if (data.siren) {
        const existingCompanyId = await checkSirenInFirestore(data.siren);
        if (existingCompanyId) {
          // Ajouter l'utilisateur à l'entreprise existante
          await setDoc(doc(db, 'companies', existingCompanyId, 'members', user.uid), {
            uid: user.uid,
            email: user.email,
            position: data.position,
            legalStatus: data.legalStatus,
            status: 'approved',
            joinedAt: new Date().toISOString(),
          });
          // Ajout dans company_memberships
          const membershipId = `${user.uid}_${existingCompanyId}`;
          await setDoc(doc(db, 'company_memberships', membershipId), {
            userId: user.uid,
            companyId: existingCompanyId,
            role: 'membre',
            status: 'approved',
            position: data.position,
            legalStatus: data.legalStatus,
            joinedAt: new Date().toISOString(),
          });
          // Mise à jour du user
          await setDoc(doc(db, 'users', user.uid), {
            companySelected: existingCompanyId,
            onboardingStep: 8
          }, { merge: true });
          onNext();
          return;
        }
      }

      // Créer une nouvelle entreprise
      const companyRef = await addDoc(collection(db, 'companies'), {
        name: data.name,
        address: data.address,
        siren: data.siren,
        logoUrl,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      });

      // Ajouter l'utilisateur comme premier membre
      await setDoc(doc(db, 'companies', companyRef.id, 'members', user.uid), {
        uid: user.uid,
        email: user.email,
        position: data.position,
        legalStatus: data.legalStatus,
        status: 'approved',
        joinedAt: new Date().toISOString(),
      });
      // Ajout dans company_memberships (créateur = gérant)
      const membershipId = `${user.uid}_${companyRef.id}`;
      await setDoc(doc(db, 'company_memberships', membershipId), {
        userId: user.uid,
        companyId: companyRef.id,
        role: 'gérant',
        status: 'approved',
        position: data.position,
        legalStatus: data.legalStatus,
        joinedAt: new Date().toISOString(),
      });

      // Mise à jour du user
      await setDoc(doc(db, 'users', user.uid), {
        companyId: companyRef.id,
        position: data.position,
        legalStatus: data.legalStatus,
        onboardingStep: 6
      }, { merge: true });

      onNext();
    } catch (e) {
      setError('Une erreur est survenue lors de la création de la structure');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6">
      <motion.div layout className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">🏢 Ajoute une structure</h2>
        <p className="text-gray-600 mb-6 text-center">Cherche l'entité qui va produire tes projets (ex: entreprise, association, collectivité). Tu peux dépendre de plusieurs structures.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="siren"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="lg"
                placeholder="SIREN (facultatif)"
                error={errors.siren?.message}
              />
            )}
          />

          {prefilledData && (
            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
              Des données ont été préremplies à partir du registre officiel.
            </div>
          )}

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="lg"
                placeholder="Nom de la structure"
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <InputAddressAutocomplete
                value={field.value}
                onChange={field.onChange}
                onSelect={field.onChange}
                placeholder="Adresse de la structure"
                error={errors.address?.message}
                size="lg"
              />
            )}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo (carré)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              ref={fileInputRef}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {logo && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(logo)}
                  alt="Aperçu du logo"
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>
            )}
            {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
          </div>

          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="lg"
                placeholder="Poste (ex: Responsable technique, Directeur prod)"
                error={errors.position?.message}
              />
            )}
          />

          <Controller
            name="legalStatus"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Statut légal
                </label>
                <Select
                  {...field}
                  size="lg"
                  error={errors.legalStatus?.message}
                >
                  <option value="">Sélectionnez un statut</option>
                  {legalStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting || loading}
          >
            {loading ? 'Création en cours...' : 'Créer et rejoindre'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
} 