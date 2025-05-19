import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: string;
  size?: 'lg' | 'normal';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, size = 'normal', ...props }, ref) => {
    const inputBase = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50';
    const inputError = error ? 'border-red-500 focus:ring-red-500' : '';
    const inputSize = size === 'lg' ? 'h-12 px-4 py-3 text-base rounded-lg' : '';
    return (
      <div className="relative px-0.5">
        <input
          type={type}
          className={cn(
            inputBase,
            inputError,
            inputSize,
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 