"use client";

import ProjectList from "./ProjectList";

export default function SensorsFirefighterView() {
  return (
    <div className="space-y-4 p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">Projets en cours</h1>
      <ProjectList canRequestEdit />
    </div>
  );
}
