import { cn, formatPrice } from '@/lib/utils';
import type { Currency } from '@/types';

interface Props {
  amount: number;
  currency: Currency;
  negotiable?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  sm: 'text-sm font-semibold',
  md: 'text-base font-semibold',
  lg: 'text-xl font-bold',
  xl: 'text-3xl font-bold',
};

export function PriceDisplay({
  amount,
  currency,
  negotiable,
  size = 'md',
  className,
}: Props) {
  return (
    <div className={cn('leading-tight', className)}>
      <p className={cn(SIZES[size], 'text-tradealo-text font-heading')}>
        {formatPrice(amount, currency)}
        {currency === 'USD' && (
          <span className="ml-1 text-xs font-medium text-tradealo-text-muted">
            USD
          </span>
        )}
      </p>
      {negotiable && (
        <p className="text-xs text-tradealo-text-muted">Negociable</p>
      )}
    </div>
  );
}
