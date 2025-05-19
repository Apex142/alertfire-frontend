import React from "react";

interface RoleTemplate {
  id: string;
  label: string;
  category: string;
  icon: string;
}

interface Technician {
  id: string;
  name: string;
  email: string;
}

interface StepSummaryProps {
  roleTemplate: RoleTemplate | null;
  linkType: 'project' | 'events';
  selectedEvents: string[];
  technician: Technician | null;
  inviteEmail: string;
}

export default function StepSummary({
  roleTemplate,
  linkType,
  selectedEvents,
  technician,
  inviteEmail
}: StepSummaryProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Récapitulatif du poste</h2>
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div>
          <h3 className="font-medium mb-2">Poste</h3>
          <div className="flex items-center gap-2">
            {roleTemplate && (
              <span className="text-xl">{roleTemplate.icon}</span>
            )}
            <span>{roleTemplate?.label || "Non spécifié"}</span>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Affectation</h3>
          {linkType === 'project' ? (
            <span>L'ensemble du projet</span>
          ) : (
            <span>
              {selectedEvents.length === 0
                ? 'Aucun événement sélectionné'
                : `Événement(s) sélectionné(s) : ${selectedEvents.join(', ')}`}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-medium mb-2">Technicien</h3>
          {technician ? (
            <div>
              <p>{technician.name}</p>
              <p className="text-gray-500 text-sm">{technician.email}</p>
            </div>
          ) : inviteEmail ? (
            <div>
              <p className="text-gray-600">Invitation à envoyer :</p>
              <p>{inviteEmail}</p>
            </div>
          ) : (
            <p className="text-gray-500">Non spécifié</p>
          )}
        </div>
      </div>
      <div className="bg-yellow-50 border-yellow-200 border p-4 rounded">
        <p className="text-sm text-yellow-800">
          Veuillez vérifier toutes les informations avant de confirmer la réservation.
          Une fois validée, une notification sera envoyée au technicien pour acceptation.
        </p>
      </div>
    </div>
  );
} 