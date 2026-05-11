import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  tokens: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = {
  sm: { icon: 12, text: 'text-xs', gap: 'gap-1' },
  md: { icon: 16, text: 'text-sm', gap: 'gap-1.5' },
  lg: { icon: 20, text: 'text-base', gap: 'gap-2' },
};

export function TokenBadge({ tokens, size = 'md', className }: Props) {
  const s = SIZE[size];
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold text-tradealo-primary-hover',
        s.text,
        s.gap,
        className
      )}
    >
      <Coins size={s.icon} className="text-tradealo-primary" />
      {tokens.toLocaleString('es-AR')}
    </span>
  );
}
