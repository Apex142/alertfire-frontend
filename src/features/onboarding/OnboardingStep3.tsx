import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

const schema = z.object({
  phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
});

type FormData = z.infer<typeof schema>;

function formatPhone(value: string) {
  return value.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}

export default function OnboardingStep3({ onNext }: { onNext: () => void }) {
  const { user } = useAuth();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: FormData) => {
    if (user) {
      await setDoc(doc(db, 'users', user.uid), { ...data, onboardingStep: 4 }, { merge: true });
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center h-full w-full p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">📱 Comment te joindre ?</h2>
      <div className="w-full mb-6">
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              size="lg"
              error={errors.phone?.message}
              placeholder="Téléphone"
              className="mb-3"
              maxLength={14}
              value={formatPhone(field.value || '')}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                field.onChange(raw);
              }}
            />
          )}
        />
      </div>
      <Button type="submit" size="lg" variant="primary" className="w-full" disabled={isSubmitting}>
        Suivant
      </Button>
    </form>
  );
} 