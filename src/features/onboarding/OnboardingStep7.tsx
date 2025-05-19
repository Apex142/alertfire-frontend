import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { InputTag } from '@/components/ui/InputTag';

const LANGUAGES = ['Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Portugais', 'Chinois', 'Arabe'];
const LICENSES = ['Moto', 'Voiture', 'Poids lourd', 'Remorque', 'Bus', 'CACES', 'Travaux en hauteur', 'Habilitation électrique'];
const DIET_SUGGESTIONS = ['Végétarien', 'Vegan', 'Sans gluten', 'Sans lactose', 'Halal', 'Casher', 'Sans porc', 'Allergie arachide'];

const schema = z.object({
  languages: z.array(z.string()).optional(),
  licenses: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

type Props = { onNext: () => void };

export default function OnboardingStep6({ onNext }: Props) {
  const { user } = useAuth();
  const { control, handleSubmit, setValue, getValues, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { languages: [], licenses: [], dietaryRestrictions: [] },
  });
  const [languageInput, setLanguageInput] = useState('');
  const [dietInput, setDietInput] = useState('');
  const languages = watch('languages') || [];
  const licenses = watch('licenses') || [];
  const dietaryRestrictions = watch('dietaryRestrictions') || [];

  const addTag = (type: 'languages' | 'dietaryRestrictions', value: string) => {
    const current = getValues(type) || [];
    if (!current.includes(value)) {
      setValue(type, [...current, value]);
    }
  };
  const removeTag = (type: 'languages' | 'dietaryRestrictions', value: string) => {
    setValue(type, (getValues(type) || []).filter((v: string) => v !== value));
  };

  const toggleLicense = (lic: string) => {
    if (licenses.includes(lic)) {
      setValue('licenses', licenses.filter((l: string) => l !== lic));
    } else {
      setValue('licenses', [...licenses, lic]);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (user) {
      await setDoc(doc(db, 'users', user.uid), {
        ...data,
        onboardingStep: 8
      }, { merge: true });
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center h-full w-full p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">📝 Infos complémentaires</h2>
      {/* Langues parlées */}
      <div className="mb-8">
        <label className="block text-base font-semibold text-gray-800 mb-3">Langues parlées</label>
        <div className="flex flex-wrap gap-3">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              type="button"
              className={`px-4 py-2 rounded-full border text-sm font-semibold shadow-sm transition
                ${languages.includes(lang) ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-gray-300 text-gray-700 hover:bg-primary/10'}`}
              onClick={() => {
                if (languages.includes(lang)) {
                  setValue('languages', languages.filter(l => l !== lang));
                } else {
                  setValue('languages', [...languages, lang]);
                }
              }}
              disabled={isSubmitting}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
      {/* Permis */}
      <div className="mb-8">
        <label className="block text-base font-semibold text-gray-800 mb-3">Permis</label>
        <div className="flex flex-wrap gap-3">
          {LICENSES.map(lic => (
            <button
              key={lic}
              type="button"
              className={`px-4 py-2 rounded-full border text-sm font-semibold shadow-sm transition
                ${licenses.includes(lic) ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-gray-300 text-gray-700 hover:bg-primary/10'}`}
              onClick={() => toggleLicense(lic)}
              disabled={isSubmitting}
            >
              {lic}
            </button>
          ))}
        </div>
      </div>
      {/* Restrictions alimentaires */}
      <div className="mb-8">
        <label className="block text-base font-semibold text-gray-800 mb-3">Restrictions alimentaires <span className="font-normal text-gray-500">(optionnel)</span></label>
        <div className="flex flex-wrap gap-3">
          {DIET_SUGGESTIONS.map(diet => (
            <button
              key={diet}
              type="button"
              className={`px-4 py-2 rounded-full border text-sm font-semibold shadow-sm transition
                ${dietaryRestrictions.includes(diet) ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50'}`}
              onClick={() => {
                if (dietaryRestrictions.includes(diet)) {
                  setValue('dietaryRestrictions', dietaryRestrictions.filter(d => d !== diet));
                } else {
                  setValue('dietaryRestrictions', [...dietaryRestrictions, diet]);
                }
              }}
              disabled={isSubmitting}
            >
              {diet}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" size="lg" variant="primary" className="w-full" disabled={isSubmitting}>
        Suivant
      </Button>
    </form>
  );
} 