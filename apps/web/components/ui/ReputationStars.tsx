import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

const SIZES = {
  sm: 14,
  md: 16,
  lg: 20,
};

export function ReputationStars({
  rating,
  count,
  size = 'md',
  showNumber = true,
  className,
}: Props) {
  const filled = Math.round(rating);
  const px = SIZES[size];

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={px}
            className={
              i <= filled
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm text-trocalia-text-muted">
          {rating > 0 ? rating.toFixed(1) : 'Sin reseñas'}
          {typeof count === 'number' && count > 0 && (
            <span className="ml-1">({count})</span>
          )}
        </span>
      )}
    </div>
  );
}
