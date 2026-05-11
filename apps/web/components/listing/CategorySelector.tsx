'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  Package,
  Shirt,
  Smartphone,
  BookOpen,
  Sofa,
  Bike,
  Gem,
  Wrench,
  Baby,
  Music,
  Loader2,
} from 'lucide-react';
import { categories as catsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  package: Package,
  shirt: Shirt,
  smartphone: Smartphone,
  book: BookOpen,
  sofa: Sofa,
  bike: Bike,
  gem: Gem,
  wrench: Wrench,
  baby: Baby,
  music: Music,
};

function pickIcon(c: Category) {
  const slug = c.slug?.toLowerCase() ?? '';
  if (slug.includes('moda') || slug.includes('ropa')) return Shirt;
  if (slug.includes('tecnolog') || slug.includes('celular')) return Smartphone;
  if (slug.includes('libro') || slug.includes('cultur')) return BookOpen;
  if (slug.includes('hogar') || slug.includes('mueble')) return Sofa;
  if (slug.includes('depor') || slug.includes('bici')) return Bike;
  if (slug.includes('coleccion') || slug.includes('joya')) return Gem;
  if (slug.includes('herram') || slug.includes('construc')) return Wrench;
  if (slug.includes('niño') || slug.includes('bebé') || slug.includes('infant'))
    return Baby;
  if (slug.includes('music') || slug.includes('instrument')) return Music;
  if (c.icon && ICON_MAP[c.icon]) return ICON_MAP[c.icon];
  return Package;
}

interface Props {
  value?: string;
  onChange: (
    categoryId: string,
    isCollectible: boolean,
    attributes?: Category['attributes']
  ) => void;
}

export function CategorySelector({ value, onChange }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catsApi.getCategories(),
  });

  const [parent, setParent] = useState<Category | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-tradealo-text-muted">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const roots = (data ?? []).filter((c) => !c.parentId);
  const selectedRoot =
    parent ?? roots.find((r) => r.id === value || r.children?.some((c) => c.id === value));

  const breadcrumb = selectedRoot ? [selectedRoot.name] : [];

  return (
    <div className="space-y-4">
      {breadcrumb.length > 0 && (
        <nav className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setParent(null)}
            className="text-tradealo-primary hover:underline"
          >
            Categorías
          </button>
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-2 text-tradealo-text-muted">
              <ChevronRight size={14} />
              <span className="text-tradealo-text font-medium">{b}</span>
            </span>
          ))}
        </nav>
      )}

      {!selectedRoot ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {roots.map((c) => {
            const Icon = pickIcon(c);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  if (c.children?.length) {
                    setParent(c);
                  } else {
                    onChange(c.id, !!c.isCollectible, c.attributes);
                  }
                }}
                className={cn(
                  'group flex flex-col items-center justify-center gap-2 p-5 rounded-xl border bg-white transition-all',
                  'border-tradealo-border hover:border-tradealo-primary hover:bg-tradealo-primary-light/40',
                  value === c.id && 'border-tradealo-primary bg-tradealo-primary-light'
                )}
              >
                <div className="w-12 h-12 rounded-lg bg-tradealo-primary-light flex items-center justify-center text-tradealo-primary-hover">
                  <Icon size={22} />
                </div>
                <span className="font-medium text-sm text-center">{c.name}</span>
                {c.isCollectible && (
                  <span className="text-[10px] uppercase tracking-wide text-amber-700 font-semibold">
                    Coleccionable
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          {selectedRoot.children && selectedRoot.children.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedRoot.children.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    onChange(
                      c.id,
                      !!(c.isCollectible || selectedRoot.isCollectible),
                      c.attributes ?? selectedRoot.attributes
                    )
                  }
                  className={cn(
                    'flex items-center justify-between gap-2 p-4 rounded-lg border bg-white text-left transition-all',
                    'border-tradealo-border hover:border-tradealo-primary',
                    value === c.id && 'border-tradealo-primary bg-tradealo-primary-light'
                  )}
                >
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    {c.isCollectible && (
                      <p className="text-[10px] uppercase tracking-wide text-amber-700 font-semibold mt-0.5">
                        Coleccionable
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-tradealo-text-muted" />
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                onChange(
                  selectedRoot.id,
                  !!selectedRoot.isCollectible,
                  selectedRoot.attributes
                )
              }
              className="w-full p-4 rounded-lg border-2 border-tradealo-primary bg-tradealo-primary-light text-tradealo-primary-hover font-medium"
            >
              Seleccionar {selectedRoot.name}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
