<<<<<<< HEAD
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
=======
// src/components/ui/button.tsx
"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "destructive"
  | "ghost"
  | "outline"
  | "outlineRed";

type Size = "sm" | "default" | "lg" | "icon";

type Shape = "rounded" | "squared";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Couleurs prédéfinies basées sur tes tokens Tailwind */
  variant?: Variant;
  /** Trois tailles + “icon” pour les boutons icônes */
  size?: Size;
  /** Forme du bouton */
  shape?: Shape;
  /** Pleine largeur */
  isFullWidth?: boolean;
  /** Affiche “Chargement…” + désactive le bouton */
  loading?: boolean;
  /** Icône avant le texte */
  startIcon?: React.ReactNode;
  /** Icône après le texte */
  endIcon?: React.ReactNode;
}

/* ----- Couleurs selon tes tokens design ----- */
const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90 shadow",
  secondary: "bg-secondary text-foreground hover:opacity-90 shadow",
  destructive:
    "bg-destructive text-destructive-foreground hover:opacity-90 shadow",
  ghost:
    "bg-transparent text-foreground hover:bg-muted hover:text-foreground/80",
  outline: "border border-border bg-transparent text-foreground hover:bg-muted",
  outlineRed:
    "border border-red-600 text-red-600 hover:bg-red-600 hover:text-white",
};

/* ----- Tailles ----- */
const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  default: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  icon: "p-2",
};

/* ----- Forme ----- */
const shapeClasses: Record<Shape, string> = {
  rounded: "rounded-lg",
  squared: "rounded-none",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      shape = "rounded",
      isFullWidth = false,
      loading = false,
      startIcon,
      endIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
    return (
      <button
        ref={ref}
        className={cn(
<<<<<<< HEAD
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
=======
          // base
          "inline-flex items-center justify-center font-medium transition focus:outline-none",
          // désactivation
          isDisabled && "cursor-not-allowed opacity-50",
          // variants / tailles
          variantClasses[variant],
          sizeClasses[size],
          shapeClasses[shape],
          // full width
          isFullWidth && "w-full",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Icône à gauche */}
        {startIcon && (
          <span
            className={cn(size === "sm" ? "mr-2" : "mr-3", "flex items-center")}
          >
            {startIcon}
          </span>
        )}

        {/* Texte ou loading */}
        {loading ? "Chargement…" : children}

        {/* Icône à droite */}
        {endIcon && (
          <span
            className={cn(size === "sm" ? "ml-2" : "ml-3", "flex items-center")}
          >
            {endIcon}
          </span>
        )}
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
      </button>
    );
  }
);

Button.displayName = "Button";
<<<<<<< HEAD
=======

export default Button;
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
