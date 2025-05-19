'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-gray-500 mb-4">
          {error.message || "Impossible de charger le planning"}
        </p>
        <button
          onClick={reset}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
} 