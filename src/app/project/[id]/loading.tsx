import { Loading } from "@/components/ui/Loading";

export default function ProjectLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Loading message="Chargement du project..." size="lg" />
    </div>
  );
}
