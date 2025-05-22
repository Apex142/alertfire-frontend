import * as LucideIcons from "lucide-react";
import { AlertTriangle, Mail, UserPlus } from "lucide-react";

interface RoleTemplate {
  id: string;
  label: string;
  category: string;
  icon: string;
}

interface Technician {
  uid: string;
  name: string;
  email: string;
}

interface StepSummaryProps {
  roleTemplate: RoleTemplate | null;
  linkType: "project" | "events";
  selectedEvents: string[];
  technician: Technician | null;
  inviteEmail: string;
  selectedAction: "force" | "invite" | null;
}

// Utilitaire pour afficher une icône Lucide si possible, sinon emoji natif
function getRoleIcon(icon: string) {
  const Icon = (LucideIcons as any)[icon];
  if (Icon) return <Icon className="w-6 h-6 text-primary" />;
  return <span className="text-2xl">{icon}</span>;
}

// Affichage action
function renderAction(action: "force" | "invite" | null) {
  if (action === "invite") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
        <Mail className="w-3 h-3 mr-0.5" />
        Invitation
      </span>
    );
  }
  if (action === "force") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
        <UserPlus className="w-3 h-3 mr-0.5" />
        Ajout direct
      </span>
    );
  }
  return <span className="text-gray-400 text-xs">Non spécifié</span>;
}

export default function StepSummary({
  roleTemplate,
  linkType,
  selectedEvents,
  technician,
  inviteEmail,
  selectedAction,
}: StepSummaryProps) {
  // Message final selon action (texte seulement, couleur toujours warning)
  let confirmationMessage: string;
  if (selectedAction === "invite") {
    confirmationMessage =
      "Une fois validée, une notification sera envoyée au technicien pour acceptation.";
  } else if (selectedAction === "force") {
    confirmationMessage =
      "Le technicien sera affecté immédiatement à ce poste. Aucune notification d'acceptation n'est nécessaire.";
  } else {
    confirmationMessage =
      "Veuillez sélectionner une action avant de valider l’affectation.";
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        Récapitulatif du poste
      </h2>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 shadow p-6 flex flex-col gap-5">
        {/* Poste */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 shadow-inner">
            {roleTemplate && getRoleIcon(roleTemplate.icon)}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Poste
            </div>
            <div className="text-lg font-medium text-slate-900">
              {roleTemplate?.label || "Non spécifié"}
            </div>
            {roleTemplate?.category && (
              <span className="inline-block text-xs text-primary bg-primary/10 rounded px-2 py-0.5 mt-1">
                {roleTemplate.category}
              </span>
            )}
          </div>
        </div>

        {/* Affectation */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
            Affectation
          </div>
          {linkType === "project" ? (
            <span className="text-slate-700">L'ensemble du project</span>
          ) : (
            <span className="text-slate-700">
              {selectedEvents.length === 0 ? (
                "Aucun événement sélectionné"
              ) : (
                <>
                  <span className="font-semibold text-primary">
                    {selectedEvents.length}
                  </span>
                  {" événement(s) : "}
                  {selectedEvents.join(", ")}
                </>
              )}
            </span>
          )}
        </div>

        {/* Technicien */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
            Technicien
          </div>
          {technician ? (
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium shadow-sm">
                {technician.name}
              </div>
              <span className="text-xs text-gray-500">{technician.email}</span>
            </div>
          ) : inviteEmail ? (
            <div>
              <div className="rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium mb-1 inline-block">
                Invitation à envoyer
              </div>
              <div className="text-xs text-gray-500">{inviteEmail}</div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Non spécifié</span>
          )}
        </div>

        {/* Action */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
            Action
          </div>
          {renderAction(selectedAction)}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1" />
        <div>
          <p className="text-sm text-yellow-800">
            Veuillez vérifier toutes les informations avant de confirmer
            l’affectation.
            <br />
            {confirmationMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
