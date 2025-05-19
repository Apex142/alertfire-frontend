import { useState } from 'react';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const firstNameSchema = z.string().min(2, 'Le prénom doit contenir au moins 2 caractères');

export default function ConversationOnboarding() {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ firstName?: string }>({});

  const handleFirstNameSubmit = () => {
    const result = firstNameSchema.safeParse(firstName);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    setError(null);
    setAnswers((prev) => ({ ...prev, firstName }));
    setStep(1); // Passer à la prochaine carte (à implémenter)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
        {step === 0 && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-center">Comment dois-je t'appeler&nbsp;?</h2>
            <Input
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Ton prénom"
              className="mb-2"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleFirstNameSubmit();
              }}
              error={error || undefined}
            />
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <Button onClick={handleFirstNameSubmit} variant="primary" className="w-full mt-2">
              Suivant
            </Button>
          </div>
        )}
        {/* Étapes suivantes à venir ici */}
      </div>
    </div>
  );
} 