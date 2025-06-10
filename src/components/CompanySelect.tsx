"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";
import { collection, DocumentData, getDocs } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { Building, Check, ChevronDown, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";

export interface Company {
  id: string;
  name: string;
  logoUrl?: string | null;
}

interface CompanySelectProps {
  value?: string;
  onChange: (id: string) => void;
  error?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  id?: string;
}

function mapDocToCompany(docSnap: DocumentData, id: string): Company {
  const data = docSnap.data();
  return {
    id,
    name: data?.name || "Compagnie inconnue",
    logoUrl: data?.logoUrl || null,
  };
}

function getColorFromString(str: string): string {
  if (!str || str.length === 0) return "hsl(220, 10%, 80%)";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 55%, 60%)`;
}

export const CompanySelect: React.FC<CompanySelectProps> = ({
  value,
  onChange,
  error,
  className,
  placeholder = "Sélectionnez une entité",
  disabled = false,
  label,
  id: providedId,
}) => {
  const { loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  const selectButtonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const componentId = providedId || React.useId();

  // --- CHARGEMENT DE TOUTES LES COMPANIES ---
  useEffect(() => {
    setIsLoadingCompanies(true);
    const fetchCompanies = async () => {
      try {
        const companiesSnapshot = await getDocs(collection(db, "companies"));
        const fetchedCompanies = companiesSnapshot.docs.map((docSnap) =>
          mapDocToCompany(docSnap, docSnap.id)
        );
        setCompanies(fetchedCompanies);
      } catch (err) {
        console.error("CompanySelect: Error fetching companies:", err);
        setCompanies([]);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  const selectedCompany = companies.find((c) => c.id === value);

  // Gestion ouverture/fermeture (Escape, click-outside)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        selectButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        selectButtonRef.current &&
        !selectButtonRef.current.contains(event.target as Node) &&
        listRef.current &&
        !listRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleOptionClick = (companyId: string) => {
    onChange(companyId);
    setIsOpen(false);
    selectButtonRef.current?.focus();
  };

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLLIElement>,
    companyId: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOptionClick(companyId);
    }
  };

  const effectiveDisabled = disabled || isLoadingCompanies || authLoading;
  const isLoading = authLoading || isLoadingCompanies;

  return (
    <div className={cn("relative w-full", className)}>
      {label && (
        <label
          htmlFor={componentId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <button
        id={componentId}
        type="button"
        ref={selectButtonRef}
        className={cn(
          "w-full flex items-center gap-x-2.5 border rounded-lg px-3.5 py-2.5 text-sm",
          "bg-white dark:bg-gray-700/50",
          "focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark",
          error
            ? "border-red-500 dark:border-red-400 text-red-700 dark:text-red-400"
            : "border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200",
          effectiveDisabled
            ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60"
            : "hover:border-gray-400 dark:hover:border-gray-500",
          "transition-colors duration-150"
        )}
        onClick={() => !effectiveDisabled && setIsOpen((o) => !o)}
        disabled={effectiveDisabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${componentId}-label` : undefined}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 text-gray-400 dark:text-gray-500 animate-spin flex-shrink-0" />
            <span className="truncate flex-1 text-gray-400 dark:text-gray-500">
              Chargement...
            </span>
          </>
        ) : selectedCompany ? (
          <>
            {selectedCompany.logoUrl ? (
              <Image
                src={selectedCompany.logoUrl}
                alt={selectedCompany.name}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0"
                style={{
                  backgroundColor: getColorFromString(selectedCompany.name),
                }}
              >
                {selectedCompany.name[0]?.toUpperCase()}
              </span>
            )}
            <span className="truncate flex-1">{selectedCompany.name}</span>
          </>
        ) : (
          <>
            <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 flex-shrink-0">
              <Building className="w-3.5 h-3.5" />
            </span>
            <span className="truncate flex-1 text-gray-500 dark:text-gray-400">
              {placeholder}
            </span>
          </>
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 ml-auto text-gray-400 dark:text-gray-500 transition-transform duration-200 flex-shrink-0",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && !effectiveDisabled && (
          <motion.ul
            ref={listRef}
            tabIndex={-1}
            className={cn(
              "absolute z-20 mt-1 w-full bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-auto focus:outline-none",
              "custom-scrollbar"
            )}
            role="listbox"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {companies.length === 0 && !isLoadingCompanies && (
              <li className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 text-center">
                Aucune entité disponible.
              </li>
            )}
            {companies.map((company) => {
              const isSelected = company.id === value;
              return (
                <li
                  key={company.id}
                  role="option"
                  tabIndex={0}
                  aria-selected={isSelected}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 cursor-pointer text-sm",
                    "hover:bg-gray-100 dark:hover:bg-gray-600/50 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none",
                    isSelected
                      ? "font-semibold text-primary dark:text-primary-light bg-primary/5 dark:bg-primary-dark/10"
                      : "text-gray-800 dark:text-gray-200"
                  )}
                  onClick={() => handleOptionClick(company.id)}
                  onKeyDown={(e) => handleOptionKeyDown(e, company.id)}
                >
                  {company.logoUrl ? (
                    <Image
                      src={company.logoUrl}
                      alt={company.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0"
                      style={{
                        backgroundColor: getColorFromString(company.name),
                      }}
                    >
                      {company.name[0]?.toUpperCase()}
                    </span>
                  )}
                  <span className="truncate flex-1">{company.name}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 ml-auto text-primary dark:text-primary-light flex-shrink-0" />
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
      {error && (
        <div
          role="alert"
          className="text-red-500 dark:text-red-400 text-xs mt-1"
        >
          {error}
        </div>
      )}
    </div>
  );
};
