import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  flat?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, flat = false, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-xl border border-tradealo-border overflow-hidden',
        !flat && 'shadow-card',
        hover && 'transition-shadow duration-200 hover:shadow-card-hover',
        className
      )}
      {...rest}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn('px-5 py-4 border-b border-tradealo-border', className)}
      {...rest}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={cn('p-5', className)} {...rest} />
  )
);
CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn('px-5 py-4 border-t border-tradealo-border bg-gray-50/40', className)}
      {...rest}
    />
  )
);
CardFooter.displayName = 'CardFooter';
