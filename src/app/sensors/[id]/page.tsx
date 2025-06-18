"use client";

import { Button } from "@/components/ui/Button";
import { CenterMessage } from "@/components/ui/CenterMessage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoCard } from "@/components/ui/InfoCard";
import { ListBlock } from "@/components/ui/ListBlock";
import { useProjects } from "@/hooks/useProjects";
import { ProjectService } from "@/services/ProjectService";
import { ProjectStatus } from "@/types/enums/ProjectStatus";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  BatteryCharging,
  CheckCircle2,
  Flame,
  Loader2,
  MapPin,
  RefreshCcw,
  SignalHigh,
  ThermometerSun,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function SensorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { projects, loading, error, refresh } = useProjects();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const project = projects.find((p) => p.id === id);

  const resolveFire = async () => {
    if (!project) return;
    try {
      await ProjectService.update(project.id, { status: ProjectStatus.OK });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <CenterMessage
        icon={<Loader2 className="animate-spin" />}
        text="Chargement…"
      />
    );
  }

  if (error) {
    return (
      <CenterMessage
        icon={<AlertTriangle className="text-destructive" />}
        text={`Erreur : ${error.message}`}
      >
        <Button variant="outline" onClick={refresh} startIcon={<RefreshCcw />}>
          Réessayer
        </Button>
      </CenterMessage>
    );
  }

  if (!project) {
    return (
      <CenterMessage
        icon={<AlertTriangle size={32} />}
        text={
          <>
            Aucun projet trouvé : <code>{id}</code>
          </>
        }
      >
        <Button startIcon={<ArrowLeft />} onClick={() => router.back()}>
          Retour
        </Button>
      </CenterMessage>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto w-full max-w-4xl px-4 pb-10"
    >
      <header className="sticky top-0 z-10 -mx-4 mb-6 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold">{project.name}</h1>
          <p className="text-xs text-muted-foreground">
            UID : <code>{project.id}</code>
          </p>
        </div>

        <div className="flex gap-2">
          {project.status === "fire" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  Feu terminé
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" />
                    Confirmer la fin d’alerte
                  </h2>
                </DialogHeader>
                <p className="text-sm mt-2">
                  Ce capteur est actuellement marqué comme <b>en feu</b>.
                  Voulez-vous changer son statut en <code>ok</code> ?
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={resolveFire} disabled={saving}>
                    {saving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Confirmer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="ghost" size="icon" onClick={refresh}>
            <RefreshCcw size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft size={18} />
          </Button>
        </div>
      </header>

      {/* === Infos générales === */}
      <section className="grid gap-4 md:grid-cols-2">
        <InfoCard
          label="Statut"
          value={project.status}
          badgeColor={
            project.status === "ok"
              ? "bg-green-100 text-green-800"
              : project.status === "fire"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }
          icon={
            project.status === "fire" ? (
              <AlertTriangle className="text-destructive" />
            ) : (
              <CheckCircle2 className="text-green-600" />
            )
          }
        />
        <InfoCard
          label="Dernière activation"
          value={
            project.lastSeenAt
              ? new Date(project.lastSeenAt.toDate()).toLocaleString("fr-FR")
              : "—"
          }
        />
        <InfoCard
          label="Coordonnées"
          value={
            project.latitude && project.longitude
              ? `${project.latitude.toFixed(5)}, ${project.longitude.toFixed(
                  5
                )}`
              : "—"
          }
          icon={<MapPin />}
        />
        <InfoCard
          label="Nb d’activations"
          value={project.activationCount ?? 0}
        />
      </section>

      {/* === Données capteur === */}
      {project.lastReading && (
        <section className="mt-8 rounded-lg border border-border bg-muted/40 p-5">
          <h2 className="mb-4 text-lg font-semibold">
            Dernières données capteur
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard
              label="Température"
              value={
                typeof project.lastReading.temperature === "number"
                  ? `${project.lastReading.temperature.toFixed(1)} °C`
                  : "—"
              }
              icon={<ThermometerSun />}
            />
            <InfoCard
              label="Fumée"
              value={
                typeof project.lastReading.smoke === "number"
                  ? `${project.lastReading.smoke.toFixed(0)} ppm`
                  : "—"
              }
              icon={<SignalHigh />}
            />
            <InfoCard
              label="Batterie"
              value={
                typeof project.lastReading.battery === "number"
                  ? `${project.lastReading.battery.toFixed(0)} %`
                  : "—"
              }
              icon={<BatteryCharging />}
            />
            <InfoCard
              label="Flamme détectée"
              value={
                project.lastReading.flame === true
                  ? "Oui"
                  : project.lastReading.flame === false
                  ? "Non"
                  : "—"
              }
              icon={
                <Flame
                  className={project.lastReading.flame ? "text-red-600" : ""}
                />
              }
              badgeColor={
                project.lastReading.flame === true
                  ? "bg-red-100 text-red-700"
                  : project.lastReading.flame === false
                  ? "bg-green-100 text-green-700"
                  : undefined
              }
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Reçu le{" "}
            {project.lastReading.createdAt?.toDate().toLocaleString("fr-FR") ??
              "—"}
          </p>
        </section>
      )}

      {/* === Description === */}
      {project.description && (
        <section className="mt-8 rounded-lg border border-border bg-muted/40 p-5">
          <h2 className="mb-2 text-lg font-semibold">Description</h2>
          <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        </section>
      )}

      {/* === Techniciens / Pompiers === */}
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <ListBlock
          title="Techniciens responsables"
          items={project.technicianIds}
        />
        <ListBlock title="Pompiers affectés" items={project.firefighterIds} />
      </section>
    </motion.main>
  );
}

/* InfoCard, ListBlock et CenterMessage : identiques à ta version */
