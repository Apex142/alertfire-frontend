// app/project/[id]/equipe/page.tsx

import TeamPageWrapper from "./TeamPageWrapper";

// La page elle-même ne fait plus qu'appeler le Wrapper.
export default function Page({ params }: { params: { id: string } }) {
  return <TeamPageWrapper projectId={params.id} />;
}
