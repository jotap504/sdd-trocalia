import { Coins, Sparkles, Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice, cn } from '@/lib/utils';
import type { TokenPack } from '@/types';

interface Props {
  pack: TokenPack;
  selected?: boolean;
  onSelect: (pack: TokenPack) => void;
}

export function TokenPackCard({ pack, selected, onSelect }: Props) {
  const total = pack.tokens + (pack.bonusTokens ?? 0);
  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl border-2 p-5 transition-all',
        selected
          ? 'border-tradealo-primary shadow-card-hover'
          : 'border-tradealo-border hover:border-tradealo-primary/50 hover:shadow-card'
      )}
    >
      {pack.popular && (
        <Badge
          variant="premium"
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 shadow-sm"
        >
          <Sparkles size={11} />
          Más elegido
        </Badge>
      )}
      <div className="text-center">
        <h3 className="font-heading font-bold text-lg">{pack.name}</h3>
        {pack.description && (
          <p className="text-xs text-tradealo-text-muted mt-1">
            {pack.description}
          </p>
        )}
      </div>
      <div className="my-5 flex flex-col items-center">
        <div className="flex items-baseline gap-1">
          <Coins size={20} className="text-tradealo-primary" />
          <span className="font-heading font-bold text-3xl text-tradealo-text">
            {total.toLocaleString('es-AR')}
          </span>
        </div>
        {pack.bonusTokens && pack.bonusTokens > 0 && (
          <p className="text-xs font-medium text-tradealo-success mt-1">
            + {pack.bonusTokens} tokens de regalo
          </p>
        )}
      </div>
      <div className="text-center">
        <p className="font-heading font-bold text-2xl">
          {formatPrice(pack.priceArs, 'ARS')}
        </p>
        <p className="text-[11px] text-tradealo-text-muted mt-0.5">
          Precio único
        </p>
      </div>
      <Button
        fullWidth
        className="mt-5"
        variant={selected ? 'primary' : 'secondary'}
        onClick={() => onSelect(pack)}
        leftIcon={selected ? <Check size={16} /> : undefined}
      >
        {selected ? 'Seleccionado' : 'Seleccionar'}
      </Button>
    </div>
  );
}
