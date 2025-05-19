import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Input } from '@/components/ui/Input';
import InputAddressAutocomplete from '@/components/ui/InputAddressAutocomplete';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { updateProfile } from 'firebase/auth';

const schema = z.object({
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  fullAddress: z.string().min(5, 'Adresse trop courte'),
});

type FormData = z.infer<typeof schema>;

export default function OnboardingStep2({ onNext }: { onNext: () => void }) {
  const { user } = useAuth();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: FormData) => {
    if (user) {
      // Mise à jour du displayName dans Firebase Auth
      const displayName = `${data.firstName} ${data.lastName.charAt(0)}.`;
      await updateProfile(user, { displayName });

      // Mise à jour des données dans Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...data,
        displayName,
        onboardingStep: 3
      }, { merge: true });
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center h-full w-full p-6">

      <h1 className="text-3xl font-bold mb-6 text-center">👉 Personnalisons ton profil</h1>
      <Controller
        name="firstName"
        control={control}
        render={({ field }) => (
          <div className="w-full mb-6">
            <Input {...field} size="lg" error={errors.firstName?.message} placeholder="Prénom" className="mb-3" />
          </div>
        )}
      />
      < Controller
        name="lastName"
        control={control}
        render={({ field }) => (
          <div className="w-full mb-6">
            <Input {...field} size="lg" error={errors.lastName?.message} placeholder="Nom" className="mb-3" />
          </div>
        )}
      />
      < Controller
        name="fullAddress"
        control={control}
        render={({ field }) => (
          <div className="w-full mb-6">
            <InputAddressAutocomplete
              value={field.value || ''}
              onChange={field.onChange}
              size="lg"
              onSelect={field.onChange}
              placeholder="Adresse"
            />
            {errors.fullAddress && (
              <div className="text-red-600 text-sm mt-1">{errors.fullAddress.message}</div>
            )}
          </div>
        )}
      />
      < Button type="submit" variant="primary" className="w-full mt-4" size="lg" disabled={isSubmitting} >
        Suivant
      </Button >
    </form>
  );
} 