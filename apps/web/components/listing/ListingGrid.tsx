'use client';

import { ListingCard } from './ListingCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { PackageOpen } from 'lucide-react';
import type { Listing } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  listings: Listing[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  cols?: 2 | 3 | 4;
  className?: string;
  variant?: 'grid' | 'list';
}

export function ListingGrid({
  listings,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  emptyTitle = 'No encontramos nada por acá',
  emptyMessage = 'Probá ajustar los filtros o buscar otra cosa.',
  cols = 4,
  className,
  variant = 'grid',
}: Props) {
  const gridCols =
    variant === 'list'
      ? 'grid-cols-1'
      : cn(
          'grid-cols-2 md:grid-cols-3',
          cols === 4 && 'xl:grid-cols-4'
        );

  if (isLoading && listings.length === 0) {
    return (
      <div className={cn('grid gap-4 sm:gap-5', gridCols, className)}>
        {Array.from({ length: cols * 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-tradealo-border overflow-hidden"
          >
            <Skeleton variant="card" className="aspect-[4/3] h-auto rounded-none" />
            <div className="p-4 space-y-2">
              <Skeleton variant="text" className="w-3/4" />
              <Skeleton variant="text" className="w-1/2 h-5" />
              <Skeleton variant="text" className="w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="bg-white border border-dashed border-tradealo-border rounded-2xl p-10 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-tradealo-primary-light flex items-center justify-center text-tradealo-primary mb-4">
          <PackageOpen size={26} />
        </div>
        <h3 className="font-heading font-semibold text-lg mb-1">{emptyTitle}</h3>
        <p className="text-sm text-tradealo-text-muted max-w-sm mx-auto">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={cn('grid gap-4 sm:gap-5', gridCols, className)}>
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} variant={variant} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" onClick={onLoadMore} loading={isLoading}>
            Cargar más
          </Button>
        </div>
      )}
    </div>
  );
}
