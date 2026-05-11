'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helper, leftIcon, rightSlot, className, id, ...rest },
    ref
  ) => {
    const inputId =
      id ?? (rest.name ? `input-${rest.name}` : `input-${Math.random().toString(36).slice(2, 8)}`);
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-tradealo-text mb-1.5"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative flex items-center rounded-lg border bg-white transition-colors',
            error
              ? 'border-tradealo-error focus-within:border-tradealo-error focus-within:ring-2 focus-within:ring-red-100'
              : 'border-tradealo-border focus-within:border-tradealo-primary focus-within:ring-2 focus-within:ring-tradealo-primary-light'
          )}
        >
          {leftIcon && (
            <span className="pl-3 text-tradealo-text-muted">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex-1 bg-transparent px-3 h-11 text-sm placeholder:text-tradealo-text-muted',
              'focus:outline-none',
              leftIcon && 'pl-2',
              rightSlot && 'pr-2',
              className
            )}
            {...rest}
          />
          {rightSlot && <span className="pr-2">{rightSlot}</span>}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-tradealo-error">{error}</p>
        ) : helper ? (
          <p className="mt-1.5 text-xs text-tradealo-text-muted">{helper}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, className, id, ...rest }, ref) => {
    const textareaId =
      id ?? (rest.name ? `ta-${rest.name}` : `ta-${Math.random().toString(36).slice(2, 8)}`);
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-tradealo-text mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2.5 text-sm placeholder:text-tradealo-text-muted',
            'transition-colors min-h-[100px] resize-y',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-tradealo-error focus:border-tradealo-error focus:ring-red-100'
              : 'border-tradealo-border focus:border-tradealo-primary focus:ring-tradealo-primary-light',
            className
          )}
          {...rest}
        />
        {error ? (
          <p className="mt-1.5 text-xs text-tradealo-error">{error}</p>
        ) : helper ? (
          <p className="mt-1.5 text-xs text-tradealo-text-muted">{helper}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
