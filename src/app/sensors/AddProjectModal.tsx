import AddProjectWizard from "@/components/projects/AddProjectWizard";
import Button from "@/components/ui/button";
import { useState } from "react";

export default function SensorPage() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between mb-4 max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-semibold">Capteurs</h1>
        <Button onClick={() => setOpen(true)} variant="primary">
          Ajouter un projet
        </Button>

        {/* Modal d'ajout de projet */}
        <AddProjectWizard open={open} onClose={() => setOpen(false)} />
      </div>
    </>
  );
}
