'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateProjectStore } from './useCreateProjectStore';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { InputDate } from '@/components/ui/InputDate';

const COLORS = [
  '#AD1457', '#D50000', '#F4511E', '#E67C73', '#F6BF26',
  '#33B679', '#0B8043', '#039BE5', '#3F51B5', '#7986CB',
  '#8E24AA', '#616161'
];

const schema = z.object({
  projectName: z.string().min(2, 'Le nom du projet est requis'),
  acronym: z.string().optional(),
  status: z.enum(['Confirmé', 'Optionnel']),
  shortDescription: z.string().max(100, 'Max 100 caractères').optional(),
  color: z.string().min(1, 'Choisissez une couleur'),
  startDate: z.date({ required_error: 'Date de début requise' }),
  endDate: z.date({ required_error: 'Date de fin requise' }),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onNext: (data: FormValues) => void;
  initialDate?: Date;
}

export default function Step1InformationsGenerales({ onNext, initialDate }: Props) {
  const { data, setData } = useCreateProjectStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
      status: 'Confirmé',
      color: data.color || COLORS[0],
      startDate: initialDate ? new Date(initialDate) : (data.startDate ? new Date(data.startDate) : undefined),
      endDate: initialDate ? new Date(initialDate) : (data.endDate ? new Date(data.endDate) : undefined),
    }
  });

  const onSubmit = (values: FormValues) => {
    // Mise à jour du store avec les nouvelles valeurs
    setData({
      ...values,
      startDate: values.startDate,
      endDate: values.endDate,
    });
    // Passage des données à l'étape suivante
    onNext(values);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto px-4"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block font-medium mb-1">Titre du projet *</label>
            <Input
              {...register('projectName')}
              autoFocus
              size="lg"
              error={errors.projectName?.message}
              placeholder="Ex: Tour de France"
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Acronyme</label>
            <Input
              {...register('acronym')}
              placeholder="ex: TDF25"
              size="lg"
              error={errors.acronym?.message}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block font-medium mb-1">Début</label>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <InputDate
                  value={field.value}
                  onChange={field.onChange}
                  initialValue={initialDate}
                  error={errors.startDate?.message}
                />
              )}
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Fin</label>
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <InputDate
                  value={field.value}
                  onChange={field.onChange}
                  initialValue={initialDate}
                  error={errors.endDate?.message}
                />
              )}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-2 gap-y-4 items-start">
          <div className="flex-1 w-full">
            <label className="block font-medium mb-1">Couleur *</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <label key={color} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value={color}
                    {...register('color')}
                    className="hidden"
                  />
                  <span
                    className={`w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-1
                      ${color === watch('color') ? 'ring-2 ring-primary' : ''}`}
                    style={{ background: color }}
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="block font-medium mb-1">Statut *</label>
            <div className="flex gap-2">
              {(['Confirmé', 'Optionnel'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`flex-1 min-w-[100px] px-3 py-2 rounded font-medium border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${watch('status') === status
                      ? status === 'Confirmé' ? 'bg-green-500 text-white border-green-500'
                        : 'bg-yellow-400 text-white border-yellow-400'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}
                  `}
                  onClick={() => {
                    setValue('status', status);
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
            {errors.status && <div className="text-red-500 text-xs mt-1">{errors.status.message}</div>}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" size="lg" variant="primary">
            Continuer
          </Button>
        </div>
      </form>
    </motion.div>
  );
} 