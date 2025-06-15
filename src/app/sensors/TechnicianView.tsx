"use client";

import AddProjectModal from "./AddProjectModal";
import ProjectList from "./ProjectList";

export default function SensorsTechnicianView() {
  return (
    <div className="space-y-4 p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">Gestion des projets</h1>
      <AddProjectModal />
      <ProjectList canEdit />
    </div>
  );
}
