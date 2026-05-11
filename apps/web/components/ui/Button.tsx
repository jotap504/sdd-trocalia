'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-tradealo-primary text-white hover:bg-tradealo-primary-hover active:bg-tradealo-primary-hover shadow-sm',
  secondary:
    'bg-white text-tradealo-primary border border-tradealo-primary hover:bg-tradealo-primary-light',
  ghost:
    'bg-transparent text-tradealo-text hover:bg-black/5 active:bg-black/10',
  danger:
    'bg-tradealo-error text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  whatsapp:
    'bg-tradealo-whatsapp text-white hover:brightness-95 active:brightness-90 shadow-sm',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-5 text-sm rounded-lg gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium select-none',
          'transition-colors duration-150 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-tradealo-primary focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          !isDisabled && 'cursor-pointer',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth && 'w-full',
          className
        )}
        {...rest}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';
