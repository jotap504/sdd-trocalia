'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { PROVINCIAS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
}

export const ProvinceSelector = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, placeholder = 'Seleccionar provincia', className, id, ...rest }, ref) => {
    const selectId = id ?? `prov-${rest.name ?? 'select'}`;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-trocalia-text mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full h-11 rounded-lg border bg-white px-3 text-sm appearance-none',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-trocalia-error focus:border-trocalia-error focus:ring-red-100'
              : 'border-trocalia-border focus:border-trocalia-primary focus:ring-trocalia-primary-light',
            className
          )}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {PROVINCIAS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-trocalia-error">{error}</p>}
      </div>
    );
  }
);
ProvinceSelector.displayName = 'ProvinceSelector';
