'use client';

import { useState } from 'react';
import { Play, X, Tv, AlertCircle } from 'lucide-react';
import type { Listing } from '@/types';

interface Props {
  listings: Listing[];
}

function LiveVideoCard({
  listing,
  onPlay,
}: {
  listing: Listing;
  onPlay: (id: string) => void;
}) {
  const image = listing.images?.[0];
  return (
    <button
      onClick={() => onPlay(listing.youtubeLiveId!)}
      className="group relative w-64 shrink-0 snap-start rounded-xl overflow-hidden border border-tradealo-border bg-white text-left hover:shadow-md transition-shadow"
    >
      <div className="aspect-video bg-gray-100 relative">
        {image ? (
          <img
            src={image.url}
            alt={listing.title}
            className="w-full h-full object-contain bg-gray-50"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-tradealo-text-muted">
            <Tv size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="p-3 rounded-full bg-white/90 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <Play size={24} className="text-tradealo-primary ml-1" />
          </div>
        </div>
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          EN VIVO
        </div>
      </div>
      <div className="p-3">
        <p className="font-medium text-sm text-tradealo-text line-clamp-1">
          {listing.title}
        </p>
        <p className="text-xs text-tradealo-text-muted mt-0.5">
          {listing.seller?.username ?? 'Vendedor'}
        </p>
      </div>
    </button>
  );
}

export function LiveVideosSection({ listings }: Props) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (listings.length === 0) {
    return (
      <section className="px-4 mx-auto w-full max-w-7xl">
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-dashed border-gray-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-tradealo-primary-light flex items-center justify-center">
            <Tv size={28} className="text-tradealo-primary" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-tradealo-text mb-2">
            Ventas en Vivo
          </h2>
          <p className="text-tradealo-text-muted text-base max-w-md mx-auto">
            Próximamente los vendedores podrán transmitir en vivo sus productos.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-tradealo-text-muted bg-gray-100 rounded-full px-4 py-1.5">
            <AlertCircle size={14} />
            Muy pronto
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 mx-auto w-full max-w-7xl">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-heading text-2xl font-bold text-tradealo-text">
          Ventas en Vivo
        </h2>
        <span className="bg-red-600 text-white text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          EN VIVO
        </span>
      </div>
      <div className="overflow-x-auto pb-3 -mx-4 px-4">
        <div className="flex gap-4 snap-x snap-mandatory">
          {listings.map((listing) => (
            <LiveVideoCard
              key={listing.id}
              listing={listing}
              onPlay={setPlayingId}
            />
          ))}
        </div>
      </div>

      {playingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPlayingId(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Video en vivo"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              onClick={() => setPlayingId(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white border border-white/20 backdrop-blur-sm transition-all hover:cursor-pointer"
              aria-label="Cerrar video"
            >
              <X size={20} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${playingId}?autoplay=1&rel=0`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Video en vivo"
            />
          </div>
        </div>
      )}
    </section>
  );
}
