import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

type IdentityStepProps = {
  control: Control<any>;
  errors: FieldErrors;
  setValue: (name: string, value: any) => void;
  getValues: (name: string) => any;
};

export default function IdentityStep({ control, errors }: IdentityStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">👉 Informations personnelles</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Prénom
        </label>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              error={errors.firstName?.message}
              placeholder="Votre prénom"
            />
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nom
        </label>
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              error={errors.lastName?.message}
              placeholder="Votre nom"
            />
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Téléphone
        </label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="tel"
              error={errors.phone?.message}
              placeholder="+33 6 12 34 56 78"
            />
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Adresse
        </label>
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              error={errors.address?.message}
              placeholder="Votre adresse"
            />
          )}
        />
      </div>
    </div>
  );
} 