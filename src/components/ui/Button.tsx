import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center rounded-lg text-base font-sans transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-6 py-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white border border-primary shadow-sm hover:bg-primary-contrast hover:border-primary-contrast hover:shadow-md disabled:!bg-primary disabled:!text-white disabled:!border-primary',
        secondary: 'bg-white text-primary border border-primary shadow-sm hover:bg-primary hover:text-white hover:shadow-md disabled:!bg-white disabled:!text-primary disabled:!border-primary',
        ghost: 'bg-transparent text-primary hover:bg-primary-50',
        outline: 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white disabled:!bg-transparent disabled:!text-primary disabled:!border-primary',
        destructive: 'bg-destructive text-white border border-destructive shadow-sm hover:bg-destructive-contrast hover:border-destructive-contrast hover:shadow-md disabled:!bg-destructive disabled:!text-white disabled:!border-destructive',
        icon: 'p-0 w-10 h-10 rounded-full justify-center items-center bg-gray-100 text-gray-600 hover:bg-gray-200 border-0 shadow-none',
      },
      size: {
        default: '',
        sm: 'text-sm px-4 py-1.5',
        lg: 'text-lg px-8 py-3',
        icon: 'p-0 w-10 h-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { }

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 