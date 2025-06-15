import React from "react";

export function CenterMessage({
  icon,
  text,
  children,
}: {
  icon: React.ReactNode;
  text: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        {icon}
        <p>{text}</p>
      </div>
      {children}
    </div>
  );
}
