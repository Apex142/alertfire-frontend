<<<<<<< HEAD
<<<<<<< HEAD
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }; 
=======
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
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
<<<<<<< HEAD
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
