import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  User,
  HelpCircle,
  Users,
  PlusCircle,
  Search,
} from "lucide-react";

const intentSchema = z.object({
  userIntent: z.enum(["organizer", "technician", "unknown"], {
    required_error: "Veuillez choisir une option",
  }),
  // Organizer
  structureType: z.enum(["independent", "join", "create"]).optional(),
  structureName: z.string().optional(),
  joinStructure: z.string().optional(),
  // Technician
  statuses: z
    .array(z.enum(["Salarié", "Bénévole", "Intermittent", "Autoentrepreneur"]))
    .optional(),
});

type IntentFormData = z.infer<typeof intentSchema>;

const STATUS_OPTIONS = [
  "Salarié",
  "Bénévole",
  "Intermittent",
  "Autoentrepreneur",
];

export default function UserIntentStep({
  onContinue,
}: {
  onContinue?: (data: IntentFormData) => void;
}) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<IntentFormData>({
    resolver: zodResolver(intentSchema),
    mode: "onChange",
    defaultValues: { userIntent: undefined },
  });

  const userIntent = watch("userIntent");
  const structureType = watch("structureType");
  const statuses = watch("statuses") || [];

  // Mock pour la recherche de structure
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searchSelected, setSearchSelected] = useState("");

  // Simule la recherche
  const handleSearch = (val: string) => {
    setSearch(val);
    if (val.length > 1) {
      setSearchResults(
        [
          "Association Les Artisans",
          "SARL Lumière",
          "Collectif Scène Ouverte",
        ].filter((s) => s.toLowerCase().includes(val.toLowerCase()))
      );
    } else {
      setSearchResults([]);
    }
  };

  // Validation pour le bouton
  let canContinue = false;
  if (userIntent === "organizer") {
    if (structureType === "independent") canContinue = true;
    if (structureType === "join" && searchSelected) canContinue = true;
    if (structureType === "create" && watch("structureName"))
      canContinue = true;
  } else if (userIntent === "technician") {
    canContinue = statuses.length > 0;
  } else if (userIntent === "unknown") {
    canContinue = true;
  }

  return (
    <form
      onSubmit={handleSubmit((data) => onContinue?.(data))}
      className="w-full max-w-xl mx-auto p-4 bg-white rounded-xl shadow space-y-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Comment souhaitez-vous utiliser Showmate ?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Organizer */}
        <Controller
          name="userIntent"
          control={control}
          render={({ field }) => (
            <div
              className={`cursor-pointer rounded-xl border p-6 flex flex-col items-center transition shadow-sm hover:shadow-lg ${
                field.value === "organizer"
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 bg-white"
              }`}
              onClick={() => field.onChange("organizer")}
            >
              <PlusCircle className="w-8 h-8 mb-2 text-primary" />
              <span className="font-semibold text-center">
                Je vais créer et gérer des projects
              </span>
            </div>
          )}
        />
        {/* Technician */}
        <Controller
          name="userIntent"
          control={control}
          render={({ field }) => (
            <div
              className={`cursor-pointer rounded-xl border p-6 flex flex-col items-center transition shadow-sm hover:shadow-lg ${
                field.value === "technician"
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 bg-white"
              }`}
              onClick={() => field.onChange("technician")}
            >
              <Users className="w-8 h-8 mb-2 text-primary" />
              <span className="font-semibold text-center">
                Je vais uniquement participer à des projects
              </span>
            </div>
          )}
        />
        {/* Unknown */}
        <Controller
          name="userIntent"
          control={control}
          render={({ field }) => (
            <div
              className={`cursor-pointer rounded-xl border p-6 flex flex-col items-center transition shadow-sm hover:shadow-lg ${
                field.value === "unknown"
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 bg-white"
              }`}
              onClick={() => field.onChange("unknown")}
            >
              <HelpCircle className="w-8 h-8 mb-2 text-primary" />
              <span className="font-semibold text-center">
                Je ne sais pas encore
              </span>
            </div>
          )}
        />
      </div>
      {/* Sous-questions conditionnelles */}
      {userIntent === "organizer" && (
        <div className="space-y-4">
          <div className="text-lg font-medium text-gray-800">
            Souhaitez-vous agir en tant qu'indépendant ou au nom d'une structure
            ?
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Controller
              name="structureType"
              control={control}
              render={({ field }) => (
                <>
                  <Button
                    type="button"
                    variant={
                      field.value === "independent" ? "primary" : "outline"
                    }
                    className="flex-1"
                    onClick={() => {
                      field.onChange("independent");
                      setValue("structureName", undefined);
                      setValue("joinStructure", undefined);
                      setSearch("");
                      setSearchSelected("");
                    }}
                  >
                    <User className="w-5 h-5 mr-2" />
                    Indépendant
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "join" ? "primary" : "outline"}
                    className="flex-1"
                    onClick={() => {
                      field.onChange("join");
                      setValue("structureName", undefined);
                    }}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Rejoindre une structure existante
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "create" ? "primary" : "outline"}
                    className="flex-1"
                    onClick={() => {
                      field.onChange("create");
                      setValue("joinStructure", undefined);
                      setSearch("");
                      setSearchSelected("");
                    }}
                  >
                    <Building2 className="w-5 h-5 mr-2" />
                    Créer une nouvelle structure
                  </Button>
                </>
              )}
            />
          </div>
          {/* Bloc conditionnel selon le choix */}
          {structureType === "join" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher une structure
              </label>
              <Input
                type="text"
                placeholder="Nom de la structure"
                value={search}
                onChange={(e) => {
                  handleSearch(e.target.value);
                  setValue("joinStructure", "");
                  setSearchSelected("");
                }}
                autoComplete="off"
              />
              {search && searchResults.length > 0 && (
                <ul className="bg-white border border-gray-200 rounded shadow mt-1 max-h-40 overflow-auto">
                  {searchResults.map((s) => (
                    <li
                      key={s}
                      className={`px-4 py-2 cursor-pointer hover:bg-primary/10 ${
                        searchSelected === s ? "bg-primary/10" : ""
                      }`}
                      onClick={() => {
                        setSearchSelected(s);
                        setValue("joinStructure", s);
                        setSearch(s);
                      }}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {structureType === "create" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la nouvelle structure
              </label>
              <Controller
                name="structureName"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Nom de la structure" />
                )}
              />
            </div>
          )}
        </div>
      )}
      {userIntent === "technician" && (
        <div className="space-y-4">
          <div className="text-lg font-medium text-gray-800">
            Quel est votre statut ?
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <Button
                key={status}
                type="button"
                variant={statuses.includes(status) ? "primary" : "outline"}
                onClick={() => {
                  if (statuses.includes(status)) {
                    setValue(
                      "statuses",
                      statuses.filter((s) => s !== status)
                    );
                  } else {
                    setValue("statuses", [...statuses, status]);
                  }
                }}
                className="rounded-full px-4 py-2 text-sm"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      )}
      {/* Erreurs globales */}
      {errors.userIntent && (
        <p className="text-red-600 text-sm mt-2">{errors.userIntent.message}</p>
      )}
      {/* Bouton continuer */}
      <div className="pt-6 flex justify-end">
        <Button type="submit" variant="primary" disabled={!canContinue}>
          Continuer
        </Button>
      </div>
    </form>
  );
}
