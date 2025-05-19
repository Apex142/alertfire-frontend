import { Input } from "@/components/ui/Input";

interface Technician {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialties?: string[];
}

interface StepTechnicianProps {
  selectedTechnician: Technician | null;
  setSelectedTechnician: (tech: Technician | null) => void;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
}

export default function StepTechnician({
  selectedTechnician,
  setSelectedTechnician,
  inviteEmail,
  setInviteEmail
}: StepTechnicianProps) {
  return (
    <div>
      <div className="mb-6">
        <label className="block font-medium mb-2">Sélectionner un technicien existant</label>
        <div className="max-h-48 overflow-y-auto border rounded bg-white">
          {/* TODO: Implémenter la liste des techniciens depuis la base de données */}
          <div className="p-4 text-gray-400">
            La liste des techniciens sera implémentée ultérieurement
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-gray-200"></div>
          <span className="text-sm text-gray-500">ou</span>
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Inviter un nouveau technicien</label>
        <Input
          type="email"
          placeholder="Adresse email du technicien"
          value={inviteEmail}
          onChange={(e) => {
            setInviteEmail(e.target.value);
            setSelectedTechnician(null);
          }}
          className="mb-2"
        />
        <p className="text-sm text-gray-500">
          Un email d'invitation sera envoyé pour rejoindre le projet
        </p>
      </div>
    </div>
  );
} 