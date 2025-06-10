import { cn } from "@/lib/utils";
import React from "react";

// Ajoute colorScheme ici pour l'intercepter
export const Button = React.forwardRef(
  (
    {
      className,
      variant = "outline",
      size = "md",
      colorScheme, // <-- intercepte ici
      IconLeft,
      children,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: "solid" | "outline" | "ghost" | "primary";
      size?: "sm" | "md" | "lg";
      colorScheme?: "primary" | "gray"; // <-- optionnel pour la coloration
      IconLeft?: React.ElementType;
    },
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    // Génère la classe selon colorScheme/variant
    let colorClasses = "";
    if (colorScheme === "primary" && variant !== "ghost") {
      colorClasses =
        "bg-primary text-white border-primary hover:bg-primary-dark";
    } else if (colorScheme === "gray" && variant !== "ghost") {
      colorClasses =
        "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600";
    }

    // Continue ta logique de variant/size ici...
    return (
      <button
        ref={ref}
        className={cn(
          // ...ton système
          "inline-flex items-center gap-2 justify-center rounded-md border transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2",
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-base",
          size === "lg" && "px-6 py-2.5 text-lg",
          variant === "solid" && "border-transparent",
          variant === "outline" && "bg-transparent",
          variant === "ghost" && "bg-transparent border-transparent",
          colorClasses,
          className
        )}
        {...props} // ne transmet PAS colorScheme au DOM !
      >
        {IconLeft && <IconLeft className="w-4 h-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
