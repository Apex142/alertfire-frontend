import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/hooks/useCompany";
import { notify } from "@/lib/notify";
import { locationService } from "@/services/LocationService";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DetailsStep } from "./steps/DetailsStep";
import { PolicyStep } from "./steps/PolicyStep";
import { TypeStep } from "./steps/Step1TypeLocation";
import { LocationFormState, Step } from "./types";

type LocationType = "saved" | "public" | "new";
type SearchType = "business" | "venue" | "address";

interface AddLocationFormProps {
  onSuccess: () => void;
  projectId: string;
}

const initialState: LocationFormState = {
  locationType: null,
  selectedSavedLocation: "",
  selectedPublicLocation: "",
  name: "",
  address: "",
  notes: "",
  editPolicy: "private",
};

export default function AddLocationForm({
  onSuccess,
  projectId,
}: AddLocationFormProps) {
  const [step, setStep] = useState<Step>("type");
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<LocationFormState>(initialState);
  const [publicLocations, setPublicLocations] = useState<Location[]>([]);
  const [companyLocations, setCompanyLocations] = useState<Location[]>([]);

  const { appUser } = useAuth();
  const { data: currentCompany } = useCompany(appUser?.companySelected || "", {
    realtime: true,
  });

  useEffect(() => {
    const loadLocations = async () => {
      try {
        if (!appUser) return;

        const [publicLocs, companyLocs] = await Promise.all([
          locationService.getPublicLocations(),
          currentCompany
            ? locationService.getCompanyLocations(currentCompany.id)
            : Promise.resolve([]),
        ]);

        setPublicLocations(publicLocs);
        setCompanyLocations(companyLocs);
      } catch (error) {
        console.error("Erreur lors du chargement des lieux:", error);
        notify.error("Erreur lors du chargement des lieux");
      }
    };

    loadLocations();
  }, [currentCompany, appUser]);

  const handleStateChange = (updates: Partial<LocationFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (): boolean => {
    switch (step) {
      case "type":
        if (!formState.locationType) {
          notify.error("Veuillez sélectionner un type de lieu");
          return false;
        }
        return true;

      case "details":
        if (
          formState.locationType === "new" &&
          (!formState.name.trim() || !formState.address.trim())
        ) {
          notify.error("Veuillez remplir tous les champs obligatoires");
          return false;
        }
        if (
          formState.locationType === "saved" &&
          !formState.selectedSavedLocation
        ) {
          notify.error("Veuillez sélectionner un lieu");
          return false;
        }
        if (
          formState.locationType === "public" &&
          !formState.selectedPublicLocation
        ) {
          notify.error("Veuillez sélectionner un lieu public");
          return false;
        }
        return true;

      case "policy":
        if (formState.locationType === "new" && !formState.editPolicy) {
          notify.error("Veuillez sélectionner une politique d'édition");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;

    switch (step) {
      case "type":
        setStep("details");
        break;
      case "details":
        setStep("policy");
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case "details":
        setStep("type");
        break;
      case "policy":
        setStep("details");
        break;
    }
  };

  const getSelectedLocation = () => {
    switch (formState.locationType) {
      case "public":
        return publicLocations.find(
          (l) => l.id === formState.selectedPublicLocation
        );
      case "saved":
        return companyLocations.find(
          (l) => l.id === formState.selectedSavedLocation
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Soumission du formulaire, étape actuelle:", step);
    console.log("État du formulaire:", formState);

    if (!appUser) {
      notify.error("Vous devez être connecté pour ajouter un lieu");
      return;
    }

    if (!validateStep()) return;

    setLoading(true);

    try {
      let locationId: string | undefined;
      const selectedLocation = getSelectedLocation();
      console.log("Lieu sélectionné:", selectedLocation);

      // Création d'un nouveau lieu dans la collection globale si nécessaire
      if (formState.locationType === "new") {
        console.log("Création d'un nouveau lieu global");
        locationId = await locationService.createLocation({
          label: formState.name.trim(),
          address: formState.address.trim(),
          notes: formState.notes.trim() || undefined,
          isPublic: false,
          companyId: currentCompany?.id,
          createdBy: appUser.uid,
          editPolicy: formState.editPolicy,
        });
        console.log("ID du lieu global créé:", locationId);
      }

      // Ajout du lieu au project
      console.log("Création du lieu dans le project", {
        projectId,
        locationData: {
          label:
            formState.locationType === "new"
              ? formState.name.trim()
              : selectedLocation?.label || "",
          address:
            formState.locationType === "new"
              ? formState.address.trim()
              : selectedLocation?.address || "",
          notes:
            formState.locationType === "new"
              ? formState.notes.trim() || undefined
              : selectedLocation?.notes,
          locationId:
            formState.locationType === "new"
              ? locationId
              : formState.locationType === "public"
              ? formState.selectedPublicLocation
              : formState.selectedSavedLocation,
        },
      });

      await locationService.createLocation(projectId, {
        label:
          formState.locationType === "new"
            ? formState.name.trim()
            : selectedLocation?.label || "",
        address:
          formState.locationType === "new"
            ? formState.address.trim()
            : selectedLocation?.address || "",
        notes:
          formState.locationType === "new"
            ? formState.notes.trim() || undefined
            : selectedLocation?.notes,
        locationId:
          formState.locationType === "new"
            ? locationId
            : formState.locationType === "public"
            ? formState.selectedPublicLocation
            : formState.selectedSavedLocation,
      });

      notify.success("Lieu ajouté avec succès !");
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la création du lieu:", error);
      const message =
        error instanceof Error ? error.message : "Une erreur est survenue";
      notify.error("Erreur lors de l'ajout du lieu : " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AnimatePresence mode="wait">
        {step === "type" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <TypeStep
              locationType={formState.locationType}
              onTypeSelect={(type) => handleStateChange({ locationType: type })}
            />
          </motion.div>
        )}
        {step === "details" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <DetailsStep
              state={formState}
              onChange={handleStateChange}
              companyLocations={companyLocations}
              publicLocations={publicLocations}
            />
          </motion.div>
        )}
        {step === "policy" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <PolicyStep
              state={formState}
              onChange={handleStateChange}
              companyLocations={companyLocations}
              publicLocations={publicLocations}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={step === "type" ? onSuccess : handleBack}
          disabled={loading}
        >
          {step === "type" ? "Annuler" : "Retour"}
        </Button>

        <Button
          type={step === "policy" ? "submit" : "button"}
          variant="primary"
          onClick={step === "policy" ? undefined : handleNext}
          disabled={loading}
        >
          {loading
            ? "Chargement..."
            : step === "policy"
            ? "Ajouter le lieu"
            : "Continuer"}
        </Button>
      </div>
    </form>
  );
}
