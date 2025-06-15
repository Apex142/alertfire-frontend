import React from "react";

export function InfoCard({
  label,
  value,
  icon,
  badgeColor,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      {icon && <span className="shrink-0">{icon}</span>}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {badgeColor ? (
          <span
            className={`mt-0.5 inline-block rounded px-2 py-0.5 text-xs ${badgeColor}`}
          >
            {value}
          </span>
        ) : (
          <p className="text-sm">{value}</p>
        )}
      </div>
    </div>
  );
}
