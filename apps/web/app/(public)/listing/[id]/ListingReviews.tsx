'use client';

import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { reviews } from '@/lib/api';
import { formatRelative } from '@/lib/utils';

interface Props {
  sellerId: string;
}

export function ListingReviews({ sellerId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', sellerId],
    queryFn: () => reviews.getReviews(sellerId),
    staleTime: 60_000,
    enabled: !!sellerId,
  });

  const items = data?.data?.slice(0, 5) ?? [];

  return (
    <div className="bg-white rounded-xl border border-trocalia-border p-5">
      <h2 className="font-heading font-semibold text-base mb-4">
        Opiniones del vendedor
      </h2>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton variant="avatar" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="w-1/3" />
                <Skeleton variant="text" className="w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <p className="text-sm text-trocalia-text-muted">
          El vendedor todavía no tiene opiniones.
        </p>
      )}

      {!isLoading && items.length > 0 && (
        <ul className="space-y-4">
          {items.map((review) => (
            <li key={review.id} className="flex gap-3">
              <Avatar
                src={review.reviewer?.avatarUrl}
                username={review.reviewer?.username ?? 'Usuario'}
                size="sm"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-trocalia-text">
                    {review.reviewer?.username ?? 'Usuario'}
                  </span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < review.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs text-trocalia-text-muted">
                    {formatRelative(review.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-trocalia-text leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
