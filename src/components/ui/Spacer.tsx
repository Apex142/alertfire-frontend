export default function Spacer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`border-t border-gray-600 ${className}`}
      aria-hidden="true"
    />
  );
}
