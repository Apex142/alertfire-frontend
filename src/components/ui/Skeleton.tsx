import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva(
  'animate-pulse rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-gray-200 dark:bg-gray-700',
        primary: 'bg-primary/20 dark:bg-primary/10',
        secondary: 'bg-gray-100 dark:bg-gray-800',
        ghost: 'bg-gray-50 dark:bg-gray-900',
      },
      size: {
        default: 'h-4 w-full',
        sm: 'h-3 w-16',
        lg: 'h-6 w-32',
        xl: 'h-8 w-48',
        '2xl': 'h-12 w-64',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof skeletonVariants> { }

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(skeletonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton, skeletonVariants }; 