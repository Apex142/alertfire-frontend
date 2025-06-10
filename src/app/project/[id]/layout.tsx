import { Layout } from "@/components/layout/Layout";
import { ProjectProvider } from "@/contexts/ProjectContext";
import ProjectLayoutShell from "./ProjectLayoutShell";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  if (!params || !params.id) {
    // DEBUG fallback pour voir le souci
    return <div>Erreur : paramètre manquant</div>;
  }
  return (
    <Layout>
      <ProjectProvider projectId={params.id}>
        <ProjectLayoutShell>{children}</ProjectLayoutShell>
      </ProjectProvider>
    </Layout>
  );
}
