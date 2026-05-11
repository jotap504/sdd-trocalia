import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'premium';
type Size = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  primary: 'bg-tradealo-primary-light text-tradealo-primary-hover border-teal-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  premium: 'bg-amber-50 text-amber-800 border-amber-300',
};

const SIZE: Record<Size, string> = {
  sm: 'text-[10px] px-1.5 py-0.5 leading-tight',
  md: 'text-xs px-2 py-0.5',
};

export function Badge({
  variant = 'default',
  size = 'md',
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap',
        VARIANT[variant],
        SIZE[size],
        className
      )}
      {...rest}
    />
  );
}
