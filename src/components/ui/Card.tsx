"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  missingInfo?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  disabled,
  missingInfo,
}) => {
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={clsx(
        "relative w-full rounded-xl p-4 md:p-6 shadow transition-all",
        "flex items-center justify-between gap-4 overflow-hidden",
        disabled
          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
          : "cursor-pointer bg-card hover:shadow-lg",
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {/* Liseré rouge si info manquante */}
      {missingInfo && (
        <motion.span
          layoutId="card-alert"
          className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-destructive"
        />
      )}

      {/* Contenu passé en children */}
      <div className="flex-grow min-w-0">{children}</div>

      {/* Icône + badge manquant */}
      <div className="flex items-center gap-3 shrink-0">
        {missingInfo && (
          <span
            title="Informations manquantes"
            className="relative flex h-3 w-3 items-center justify-center"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/70" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
          </span>
        )}
        <ChevronRight size={20} className="text-muted-foreground" />
      </div>
    </motion.div>
  );
};
