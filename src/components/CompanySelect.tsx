import React, { useState, useRef, useEffect } from 'react';
import { useUserData } from '@/hooks/useUserData';

interface Company {
  id: string;
  name: string;
  logoUrl?: string;
}

interface CompanySelectProps {
  value?: string;
  onChange: (id: string) => void;
  error?: string;
  className?: string;
}

function getColorFromString(str: string) {
  // Simple hash to color
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 60%)`;
  return color;
}

export const CompanySelect: React.FC<CompanySelectProps> = ({ value, onChange, error, className }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Charge les companies de l'utilisateur via useUserData
  const { userCompanies } = useUserData();
  const companies = userCompanies || [];

  const { userData } = useUserData();
  const defaultCompanyId = userData?.companySelected;
  const selectedCompanyId = value ?? defaultCompanyId;
  const selected = companies.find(c => c.id === selectedCompanyId);


  console.log('🔍 companies', defaultCompanyId, selectedCompanyId, companies);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.focus();
    }
  }, [open]);

  return (
    <div className={`relative ${className || ''}`} tabIndex={-1}>
      <button
        type="button"
        ref={buttonRef}
        className={`w-full flex items-center gap-2 border rounded px-3 py-2 bg-white text-left focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          selected.logoUrl ? (
            <img src={selected.logoUrl} alt={selected.name} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-base" style={{ background: getColorFromString(selected.name) }}>
              {selected.name[0]}
            </span>
          )
        ) : (
          <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-base">?</span>
        )}
        <span className="truncate flex-1">{selected ? selected.name : 'Sélectionnez une entreprise'}</span>
        <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          tabIndex={0}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto focus:outline-none"
          role="listbox"
          onBlur={e => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
          }}
        >
          {companies.map(company => (
            <li
              key={company.id}
              role="option"
              aria-selected={company.id === selectedCompanyId}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${company.id === selectedCompanyId ? 'bg-gray-100 font-semibold' : ''}`}
              onClick={() => {
                onChange(company.id);
                setOpen(false);
              }}
            >
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-base" style={{ background: getColorFromString(company.name) }}>
                  {company.name[0]}
                </span>
              )}
              <span className="truncate">{company.name}</span>
            </li>
          ))}
        </ul>
      )}
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
}; 