import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { CompanySelect } from '@/components/CompanySelect';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { useState } from 'react';
import { useCreateProjectStore } from './useCreateProjectStore';

const schema = z.object({
  companyId: z.string().min(1, 'Sélectionnez une entreprise'),
  privacy: z.enum(['public', 'privé'])
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onNext: (values: FormValues) => void;
  onBack?: () => void;
  defaultValues?: Partial<FormValues>;
}

export default function Step2CompanyAndPrivacy({ onNext, onBack, defaultValues }: Props) {
  const { data: projectData } = useCreateProjectStore();
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'idle' | 'creating' | 'membership'>('idle');

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      privacy: defaultValues?.privacy || 'privé',
    }
  });

  // Le handler ne fait que transmettre les données au parent
  const handleSave = async (data: FormValues) => {
    setIsLoading(true);
    try {
      onNext(data);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (!isLoading) return 'Enregistrer';
    switch (loadingStep) {
      case 'creating':
        return 'Création du projet...';
      case 'membership':
        return 'Accueil des utilisateurs...';
      default:
        return 'Enregistrer';
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-6 max-w-lg mx-auto px-4">
      <div>
        <label className="block font-medium mb-1">Entreprise</label>
        <Controller
          control={control}
          name="companyId"
          render={({ field }) => (
            <CompanySelect
              value={field.value}
              onChange={field.onChange}
              error={errors.companyId?.message}
            />
          )}
        />
        <p className="text-xs text-gray-500 mt-1">À quelle entité sera rattaché le projet&nbsp;?</p>
      </div>
      <div>
        <label className="block font-medium mb-1">Confidentialité</label>
        <Controller
          control={control}
          name="privacy"
          render={({ field }) => (
            <div className="flex gap-2">
              {['public', 'privé'].map((privacy) => (
                <button
                  key={privacy}
                  type="button"
                  className={`px-4 py-2 rounded font-medium border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${field.value === privacy
                      ? privacy === 'public' ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-700 text-white border-gray-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}
                  `}
                  onClick={() => field.onChange(privacy)}
                >
                  {privacy === 'public' ? 'Public' : 'Privé'}
                </button>
              ))}
            </div>
          )}
        />
        <p className="text-xs text-gray-500 mt-1">Un projet public est visible par tous les membres. Un projet privé n'est visible que par les membres concernés.</p>
        {errors.privacy && <div className="text-red-500 text-xs mt-1">{errors.privacy.message}</div>}
      </div>
      <div className="flex justify-between pt-4">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            Précedent
          </Button>
        )}
        <Button
          type="submit"
          size="lg"
          variant="primary"
          disabled={isLoading}
        >
          {getButtonText()}
        </Button>
      </div>
    </form>
  );
} 