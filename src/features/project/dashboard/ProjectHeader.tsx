import { Button } from "@/components/ui/Button";
import Spacer from "@/components/ui/Spacer";
import { getAuth } from "firebase/auth";
import {
  CheckCircle2,
  Hourglass,
  Pencil,
  Settings,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ----------- MODAL DE CONFIRMATION -----------
function ConfirmDeleteModal({
  open,
  onCancel,
  onConfirm,
  projectName,
  loading,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  projectName?: string;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md text-center animate-fade-in">
        <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <h2 className="text-xl font-bold mb-2 text-slate-800">
          Supprimer le projet
        </h2>
        <p className="mb-6 text-slate-600">
          Êtes-vous sûr de vouloir supprimer le projet&nbsp;
          <span className="font-semibold text-primary">
            {projectName || "ce projet"}
          </span>
          &nbsp;? <br />
          Cette action est{" "}
          <span className="text-red-600 font-bold">irréversible</span>.<br />
          Tous les membres seront notifiés.
        </p>
        <div className="flex gap-3 justify-center mt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-32"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="w-32"
          >
            {loading ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NiceStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  if (status === "Confirmé" || status === "validé") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 whitespace-nowrap font-medium truncate text-xs sm:text-sm ${
          className ?? ""
        }`}
      >
        <CheckCircle2 className="w-3 h-3" /> Validé
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border-yellow-200 whitespace-nowrap font-medium truncate text-xs sm:text-sm ${
        className ?? ""
      }`}
    >
      <Hourglass className="w-3 h-3 animate-pulse" /> En attente
    </span>
  );
}

// ----------- DROPDOWN MAISON ------------
function ProjectSettingsDropdown({
  onEdit,
  onDeleteClick,
}: {
  onEdit?: () => void;
  onDeleteClick?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        className="rounded-xl font-semibold shadow w-full sm:w-auto md:min-w-[48px] px-3 flex items-center justify-center gap-2"
        aria-label="Réglages du projet"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <Settings className="w-5 h-5" />
        <span className="hidden md:inline ml-1">Réglages</span>
      </Button>
      {open && (
        <div
          className="
            absolute right-0 mt-2 min-w-[160px] bg-white/95 text-[#233554] rounded-xl shadow-2xl py-2 z-[100] ring-1 ring-[#a3c0ed]
            animate-fade-in
          "
        >
          <button
            onClick={() => {
              setOpen(false);
              onEdit && onEdit();
            }}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#e5eaff] rounded text-sm"
          >
            <Pencil className="w-4 h-4 text-primary" />
            Modifier
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onDeleteClick && onDeleteClick();
            }}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 rounded text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

// ----------- HEADER AVEC DROPDOWN + MODAL + API --------
export const ProjectHeader = ({
  project,
  onEdit,
  onFeuilleDeService,
}: {
  project: any;
  onEdit?: () => void;
  onFeuilleDeService?: () => void;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  // Appel API de suppression (DELETE et projectId dans l'URL)
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Non authentifié");
      const idToken = await currentUser.getIdToken();
      const url = `/api/project/delete?projectId=${project.id}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Suppression échouée");
      }
      setModalOpen(false);
      router.push("/dashboard");
    } catch (e: any) {
      alert(e?.message || "Erreur lors de la suppression !");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        className="
        flex flex-col gap-6 
        md:flex-row items-center md:justify-start
        mb-4 w-full
        bg-white shadow-md
        px-6 py-4 rounded-lg
      "
      >
        {/* Titre et status centrés */}
        <div
          className="
          flex md:justify-start justify-center items-center gap-2 w-full min-w-0
        "
        >
          <h1
            className="
            text-3xl font-extrabold text-slate-900 truncate
            flex items-center gap-2
          "
          >
            <span className="truncate">{project.projectName}</span>
            {project.acronym && (
              <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary font-semibold rounded-full text-sm border border-primary/10 truncate">
                {project.acronym}
              </span>
            )}
          </h1>
          <NiceStatusBadge status={project.status} className="text-xs" />
        </div>

        {/* Actions */}
        <div
          className="
          flex flex-col gap-2 w-full 
          sm:flex-row sm:justify-center sm:items-center
          md:w-auto md:justify-end md:items-center md:gap-3
          max-w-lg md:max-w-none
        "
        >
          <Button
            variant="outline"
            className="rounded-xl font-medium w-full sm:w-auto md:min-w-[155px]"
            onClick={onFeuilleDeService}
          >
            Feuille de service
          </Button>
          <ProjectSettingsDropdown
            onEdit={onEdit}
            onDeleteClick={() => setModalOpen(true)}
          />
        </div>
      </div>
      {/* Barre d’espacement */}
      <Spacer />

      {/* MODAL */}
      <ConfirmDeleteModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleDelete}
        projectName={project.projectName}
        loading={deleting}
      />
    </>
  );
};
