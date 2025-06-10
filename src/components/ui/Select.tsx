// src/components/ui/Select.tsx
"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react"; // ChevronDown ou une icône similaire
import React, {
  ButtonHTMLAttributes,
  createContext,
  HTMLAttributes,
  LiHTMLAttributes,
  ReactNode,
  useContext,
  useState,
} from "react";

// Contexte pour le Select
interface SelectContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValue: string | number | undefined;
  setSelectedValue: (value: string | number | undefined) => void;
  onValueChange?: (value: string | number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error(
      "Select subcomponents must be used within a Select provider"
    );
  }
  return context;
};

// Composant principal Select (Provider)
interface SelectProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  defaultValue?: string | number;
  value?: string | number;
  onValueChange?: (value: string | number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function Select({
  children,
  defaultValue,
  value,
  onValueChange,
  placeholder,
  disabled,
  className,
  ...props
}: SelectProps) {
  const [open, setOpen] = useState(false);
  // Gérer l'état interne si non contrôlé, sinon utiliser la prop `value`
  const [internalValue, setInternalValue] = useState<
    string | number | undefined
  >(value || defaultValue);

  // Synchroniser l'état interne si la prop `value` change (pour le mode contrôlé)
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string | number | undefined) => {
    if (value === undefined) {
      // Mode non contrôlé
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false); // Fermer le select après sélection
  };

  const displayedValue = value !== undefined ? value : internalValue;

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        selectedValue: displayedValue,
        setSelectedValue: handleValueChange, // Renommé pour clarté, agit comme un onSelect
        onValueChange, // Transmettre pour Controller
        placeholder,
        disabled,
      }}
    >
      <div className={cn("relative w-full", className)} {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// SelectTrigger
interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode; // Devrait contenir SelectValue
}
export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(({ children, className, ...props }, ref) => {
  const { open, setOpen, disabled } = useSelectContext();
  return (
    <button
      type="button"
      ref={ref}
      disabled={disabled}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-200",
        "focus:outline-none focus:ring-2 focus:ring-primary-focus dark:focus:ring-primary-dark-focus focus:border-primary dark:focus:border-primary-dark",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      aria-expanded={open}
      aria-haspopup="listbox"
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 opacity-50 transition-transform",
          open && "transform rotate-180"
        )}
      />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

// SelectValue
interface SelectValueProps extends HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}
export function SelectValue({
  placeholder: customPlaceholder,
  className,
  ...props
}: SelectValueProps) {
  const { selectedValue, placeholder: contextPlaceholder } = useSelectContext();
  const displayPlaceholder =
    customPlaceholder || contextPlaceholder || "Sélectionner...";

  // Trouver le label de l'enfant SelectItem qui correspond à selectedValue
  // Ceci est une simplification. Une vraie solution Headless UI gérerait cela via le contexte.
  // Pour l'instant, on affiche la valeur brute ou le placeholder.
  // Idéalement, le contexte stockerait {value, label} de l'item sélectionné.
  return (
    <span
      className={cn(
        "pointer-events-none truncate",
        !selectedValue && "text-gray-500 dark:text-gray-400",
        className
      )}
      {...props}
    >
      {selectedValue !== undefined ? String(selectedValue) : displayPlaceholder}
    </span>
  );
}

// SelectContent
interface SelectContentProps extends HTMLAttributes<HTMLUListElement> {}
export function SelectContent({
  children,
  className,
  ...props
}: SelectContentProps) {
  const { open } = useSelectContext();
  if (!open) return null;
  return (
    <ul
      className={cn(
        "absolute z-50 mt-1 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden",
        "max-h-60 overflow-y-auto custom-scrollbar", // Hauteur max et scroll
        className
      )}
      role="listbox"
      {...props}
    >
      {children}
    </ul>
  );
}

// SelectItem
interface SelectItemProps extends LiHTMLAttributes<HTMLLIElement> {
  value: string | number;
  children: ReactNode;
  disabled?: boolean;
}
export const SelectItem = React.forwardRef<HTMLLIElement, SelectItemProps>(
  ({ value, children, className, disabled, ...props }, ref) => {
    const { selectedValue, setSelectedValue, setOpen } = useSelectContext();
    const isSelected = selectedValue === value;

    return (
      <li
        ref={ref}
        onClick={() => {
          if (disabled) return;
          setSelectedValue(value);
          setOpen(false); // Fermer après sélection
        }}
        onKeyDown={(e) => {
          // Permettre la sélection avec Entrée
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            setSelectedValue(value);
            setOpen(false);
          }
        }}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
          "focus:bg-gray-100 dark:focus:bg-gray-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          isSelected && "font-semibold text-primary dark:text-primary-light",
          !disabled &&
            "hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer",
          className
        )}
        role="option"
        aria-selected={isSelected}
        tabIndex={disabled ? -1 : 0} // Pour la navigation clavier
        data-disabled={disabled ? "" : undefined}
        {...props}
      >
        {/* Indicateur de sélection (peut être une icône Check) */}
        {isSelected && (
          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            ✓
          </span>
        )}
        {children}
      </li>
    );
  }
);
SelectItem.displayName = "SelectItem";
