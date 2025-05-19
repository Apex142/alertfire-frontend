export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <div key={j} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 