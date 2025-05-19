import { Input } from "@/components/ui/Input";

interface StepBookingProps {
  rate: number;
  setRate: (rate: number) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  status: 'approved' | 'pending' | 'rejected' | 'declined';
  setStatus: (status: 'approved' | 'pending' | 'rejected' | 'declined') => void;
}

export default function StepBooking({
  rate,
  setRate,
  currency,
  setCurrency,
  notes,
  setNotes,
  status,
  setStatus
}: StepBookingProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-2">Statut</label>
        <div className="flex gap-2">
          {(['approved', 'pending', 'rejected', 'declined'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatus(option)}
              className={`px-4 py-2 rounded font-medium border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500
                ${status === option
                  ? option === 'approved' ? 'bg-green-500 text-white border-green-500'
                    : option === 'pending' ? 'bg-yellow-500 text-white border-yellow-500'
                      : option === 'rejected' ? 'bg-red-500 text-white border-red-500'
                        : 'bg-gray-500 text-white border-gray-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}
              `}
            >
              {option === 'approved' ? 'Approuvé'
                : option === 'pending' ? 'En attente'
                  : option === 'rejected' ? 'Rejeté'
                    : 'Décliné'}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Définissez le statut initial de la réservation
        </p>
      </div>

      <div>
        <label className="block font-medium mb-2">Tarif</label>
        <div className="flex gap-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={rate || ""}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            className="flex-1"
            placeholder="Montant"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-3 py-2 border rounded bg-white"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Tarif journalier ou forfaitaire selon le type de mission
        </p>
      </div>

      <div>
        <label className="block font-medium mb-2">Notes de réservation</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-32 px-3 py-2 border rounded resize-none"
          placeholder="Informations complémentaires pour la réservation..."
        />
      </div>

      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-medium mb-2">Rappel important</h3>
        <p className="text-sm text-gray-600">
          La réservation sera confirmée uniquement après acceptation par le technicien
          et validation des conditions (tarif, dates, etc.).
        </p>
      </div>
    </div>
  );
} 