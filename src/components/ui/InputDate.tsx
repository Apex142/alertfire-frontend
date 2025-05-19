import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface InputDateProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange'> {
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  initialValue?: Date | string;
  error?: string;
  size?: 'lg' | 'normal';
}

export const InputDate: React.FC<InputDateProps> = ({ value, onChange, initialValue, error, className, size = 'normal', ...props }) => {
  const [internalValue, setInternalValue] = useState<string>('');

  useEffect(() => {
    let dateToUse = value || initialValue;
    if (dateToUse instanceof Date) {
      setInternalValue(dateToUse.toISOString().substring(0, 10));
    } else if (typeof dateToUse === 'string' && dateToUse.length >= 10) {
      setInternalValue(dateToUse.substring(0, 10));
    } else {
      setInternalValue('');
    }
  }, [value, initialValue]);

  const inputBase = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50';
  const inputError = error ? 'border-red-500 focus:ring-red-500' : '';
  const inputSize = size === 'lg' ? 'h-12 px-4 py-3 text-base rounded-lg' : '';

  return (
    <div className="relative">
      <input
        type="date"
        className={cn(
          inputBase,
          inputError,
          inputSize,
          className
        )}
        value={internalValue}
        onChange={e => {
          setInternalValue(e.target.value);
          if (onChange) {
            onChange(e.target.value ? new Date(e.target.value) : undefined);
          }
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}; 