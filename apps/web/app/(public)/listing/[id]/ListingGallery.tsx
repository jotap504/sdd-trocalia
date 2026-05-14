'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import type { ListingImage } from '@/types';

interface Props {
  images: ListingImage[];
  title: string;
}

export function ListingGallery({ images, title }: Props) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center text-tradealo-text-muted border border-tradealo-border">
        <ImageIcon size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-tradealo-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={`${title} — imagen ${selected + 1}`}
          className="w-full h-full object-contain"
        />
      </div>
      {images.length > 1 && (
        <div className="overflow-x-auto flex gap-2 pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelected(idx)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                idx === selected
                  ? 'border-tradealo-primary'
                  : 'border-tradealo-border hover:border-tradealo-primary/50'
              }`}
              aria-label={`Ver imagen ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-contain bg-gray-50" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
