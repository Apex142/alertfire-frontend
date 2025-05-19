import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  error?: string;
  size?: 'lg' | 'normal';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, size = 'normal', children, ...props }, ref) => {
    const base = 'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50';
    const errorStyle = error ? 'border-red-500 focus:ring-red-500' : '';
    const sizeStyle = size === 'lg' ? 'h-12 px-4 py-3 text-base rounded-lg' : '';
    return (
      <div className="relative px-0.5">
        <select
          className={cn(base, errorStyle, sizeStyle, className)}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select }; 