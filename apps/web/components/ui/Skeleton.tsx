import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'text' | 'card' | 'avatar' | 'block';

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
  text: 'h-4 rounded',
  card: 'h-48 rounded-xl',
  avatar: 'rounded-full w-10 h-10',
  block: 'rounded-lg',
};

export function Skeleton({ variant = 'text', className, ...rest }: Props) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200/80',
        VARIANTS[variant],
        className
      )}
      {...rest}
    />
  );
}
