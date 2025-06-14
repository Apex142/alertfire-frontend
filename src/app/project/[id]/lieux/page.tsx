import LocationsPageWrapper from "./LocationsPageWrapper";

export default function Page({ params }: { params: { id: string } }) {
  return <LocationsPageWrapper projectId={params.id} />;
}
