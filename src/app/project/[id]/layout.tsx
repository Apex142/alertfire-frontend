"use client";
import { Layout } from "@/components/LayoutLogged";
import ProjectSidebar from "@/components/project/ProjectMenuSidebar";
import { Timestamp } from "firebase/firestore";
import React from "react";
import { ProjectProvider, useProjectContext } from "./providers";

function formatDate(date?: Date | string | Timestamp): string | undefined {
  if (!date) return undefined;

  let dateObj: Date;
  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) return undefined;

  return dateObj.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ProjectContent({ children }: { children: React.ReactNode }) {
  const { project } = useProjectContext();

  if (!project) return null;

  const NAVBAR_HEIGHT = 75; // px (hauteur navbar top)

  return (
    <div className="flex min-h-full">
      <ProjectSidebar
        title={project.projectName}
        startDate={formatDate(project.startDate)}
        endDate={formatDate(project.endDate)}
      />
      {/* Main content */}
      <div
        className="
          flex-1
          px-3
          py-16
          md:py-0
        "
      >
        {children}
      </div>
    </div>
  );
}

function ProjectLayoutClient({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  return (
    <Layout>
      <ProjectProvider projectId={projectId}>
        <ProjectContent>{children}</ProjectContent>
      </ProjectProvider>
    </Layout>
  );
}

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <ProjectLayoutClient projectId={id}>{children}</ProjectLayoutClient>;
}
