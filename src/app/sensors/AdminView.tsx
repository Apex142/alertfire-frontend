"use client";

import AddProjectModal from "./AddProjectModal";
import ProjectList from "./ProjectList";

export default function SensorsAdminView() {
  return (
    <div className="space-y-4 p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">Administration des projets</h1>
      <AddProjectModal />
      <ProjectList canEdit />
    </div>
  );
}
