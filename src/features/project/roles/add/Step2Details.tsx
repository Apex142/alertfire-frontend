import React from "react";
import { Button } from "@/components/ui/Button";

interface RoleTemplate {
  id: string;
  label: string;
  category: string;
  icon: string;
}

interface StepDetailsProps {
  role: RoleTemplate | null;
  linkType: "project" | "events";
  setLinkType: (type: "project" | "events") => void;
  onNext: () => void;
}

export default function StepDetails({
  role,
  linkType,
  setLinkType,
  onNext,
}: StepDetailsProps) {
  const handleSelect = (type: "project" | "events") => {
    setLinkType(type);
    onNext();
  };

  const roleLabel = role?.label || "non défini";

  return (
    <div>
      <label className="block font-medium mb-4">
        Ce poste ({roleLabel}) sera présent sur :
      </label>
      <div className="flex gap-4 mb-4">
        <Button
          type="button"
          variant={linkType === "project" ? "primary" : "secondary"}
          onClick={() => handleSelect("project")}
          className="flex-1"
        >
          L'ensemble du project
        </Button>
        <Button
          type="button"
          variant={linkType === "events" ? "primary" : "secondary"}
          onClick={() => handleSelect("events")}
          className="flex-1"
        >
          Un ou des événements
        </Button>
      </div>
      <p className="text-gray-500 text-sm">
        Choisissez si ce poste doit être affecté à tout le project ou à des
        événements spécifiques.
      </p>
    </div>
  );
}
