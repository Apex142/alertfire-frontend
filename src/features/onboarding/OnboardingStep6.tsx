import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';

const STATUS_OPTIONS = ['Intermittent', 'Autoentrepreneur', 'Salarié', 'Bénévole', 'Autre'] as const;

const schema = z.object({
  status: z.enum(STATUS_OPTIONS, { required_error: 'Sélectionne un statut' }),
});

type FormData = z.infer<typeof schema>;

type Props = { onNext: () => void };

export default function OnboardingStep6({ onNext }: Props) {
  const { user } = useAuth();
  const { control, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { status: undefined },
  });
  const selected = watch('status');

  const handleSelect = async (status: typeof STATUS_OPTIONS[number]) => {
    setValue('status', status);
    if (user) {
      await setDoc(doc(db, 'users', user.uid), {
        status,
        onboardingStep: 7
      }, { merge: true });
    }
    onNext();
  };

  return (
    <form className="flex flex-col items-center justify-center h-full w-full p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">⚖️ Quel est ton statut&nbsp;?</h2>
      <div className="w-full flex flex-col gap-4 mb-6">
        {STATUS_OPTIONS.map(status => (
          <button
            type="button"
            key={status}
            className={`w-full flex items-center hover:cursor-pointer gap-4 p-4 rounded-xl border transition shadow-sm text-left text-lg font-medium
              ${selected === status ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white hover:bg-primary/5'}`}
            onClick={() => handleSelect(status)}
            disabled={isSubmitting}
          >
            {status}
          </button>
        ))}
        {errors.status && <div className="text-red-600 text-sm mt-1">{errors.status.message}</div>}
      </div>
    </form>
  );
} 