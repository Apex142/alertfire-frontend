"use client";

import { useProjects } from "@/hooks/useProjects";
import { motion } from "framer-motion";
import { MessageSquare, PenLine, Trash2 } from "lucide-react";
import Link from "next/link";

interface Props {
  canEdit?: boolean;
  canRequestEdit?: boolean;
}

export default function ProjectList({ canEdit, canRequestEdit }: Props) {
  const { projects, loading } = useProjects();

  if (loading) {
    return <p className="text-muted-foreground">Chargement des projets…</p>;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Aucun projet trouvé.
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => {
        const isOnFire = project.status === "fire";

        return (
          <Link key={project.id} href={`/sensors/${project.id}`} passHref>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group border rounded-xl p-6 shadow-md bg-white dark:bg-zinc-900 dark:border-zinc-700 flex justify-between items-start hover:shadow-lg transition-all cursor-pointer"
            >
              {/* --- Infos projet --- */}
              <div>
                <h2 className="font-semibold text-lg group-hover:underline flex items-center gap-2">
                  {project.name}
                  {isOnFire && (
                    <span className="animate-pulse bg-red-600/10 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full">
                      🔥 Feu
                    </span>
                  )}
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  Statut&nbsp;:{" "}
                  <span
                    className={
                      isOnFire
                        ? "text-red-600"
                        : project.status === "ok"
                        ? "text-green-600"
                        : project.status === "warning"
                        ? "text-yellow-500"
                        : "text-muted-foreground"
                    }
                  >
                    {project.status}
                  </span>
                </p>
              </div>

              {/* --- Actions --- */}
              <div className="flex space-x-2 shrink-0">
                {canEdit && (
                  <>
                    <IconButton
                      title="Supprimer"
                      colorClass="text-red-500 hover:text-red-600"
                      onClick={() => console.log("Supprimer", project.id)}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                    <IconButton
                      title="Modifier"
                      colorClass="text-blue-500 hover:text-blue-600"
                      onClick={() => console.log("Modifier", project.id)}
                    >
                      <PenLine size={18} />
                    </IconButton>
                  </>
                )}

                {canRequestEdit && (
                  <IconButton
                    title="Demander une correction"
                    colorClass="text-orange-500 hover:text-orange-600"
                    onClick={() =>
                      console.log("Demander correction", project.id)
                    }
                  >
                    <MessageSquare size={18} />
                  </IconButton>
                )}
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

/* === Bouton d’icône interne ===================================== */
function IconButton({
  title,
  colorClass,
  children,
  onClick,
}: {
  title: string;
  colorClass: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`${colorClass} transition`}
      title={title}
      onClick={(e) => {
        e.stopPropagation(); // empêche l’ouverture du lien parent
        onClick();
      }}
    >
      {children}
    </button>
  );
}
