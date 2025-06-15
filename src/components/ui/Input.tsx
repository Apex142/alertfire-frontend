// src/components/ui/Input.tsx
import { cn } from "@/lib/utils"; // Assurez-vous d'avoir cette fonction utilitaire
import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, id, error, className, wrapperClassName, type = "text", ...props },
    ref
  ) => {
    const inputId = id || props.name; // Utiliser name comme fallback pour id si non fourni

    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={cn(
            "block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-primary-focus dark:focus:ring-primary-dark-focus",
            "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
            "placeholder-gray-400 dark:placeholder-gray-500",
            error
              ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
              : "focus:border-primary dark:focus:border-primary-dark",
            props.disabled &&
              "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70",
            className
          )}
          {...props}
        />
        {error && (
          <p
            role="alert"
            className="mt-1 text-xs text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  InputHTMLAttributes<HTMLTextAreaElement> & {
    error?: string;
    label?: string;
    wrapperClassName?: string;
    rows?: number;
  }
>(
  (
    { label, id, error, className, wrapperClassName, rows = 3, ...props },
    ref
  ) => {
    const textareaId = id || props.name;
    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            "block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-primary-focus dark:focus:ring-primary-dark-focus",
            "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white",
            "placeholder-gray-400 dark:placeholder-gray-500",
            error
              ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
              : "focus:border-primary dark:focus:border-primary-dark",
            props.disabled &&
              "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70",
            className
          )}
          {...props}
        />
        {error && (
          <p
            role="alert"
            className="mt-1 text-xs text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
