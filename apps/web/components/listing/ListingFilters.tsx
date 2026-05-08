'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProvinceSelector } from '@/components/ui/ProvinceSelector';
import { CONDITIONS } from '@/lib/constants';
import { categories } from '@/lib/api';
import { cn } from '@/lib/utils';

interface FiltersState {
  q: string;
  category: string;
  province: string;
  conditions: string[];
  type: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
}

const EMPTY: FiltersState = {
  q: '',
  category: '',
  province: '',
  conditions: [],
  type: '',
  minPrice: '',
  maxPrice: '',
  currency: '',
};

export function ListingFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FiltersState>(EMPTY);

  useEffect(() => {
    setState({
      q: sp.get('q') ?? '',
      category: sp.get('category') ?? '',
      province: sp.get('province') ?? '',
      conditions: sp.get('condition')?.split(',').filter(Boolean) ?? [],
      type: sp.get('type') ?? '',
      minPrice: sp.get('minPrice') ?? '',
      maxPrice: sp.get('maxPrice') ?? '',
      currency: sp.get('currency') ?? '',
    });
  }, [sp]);

  const { data: cats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categories.getCategories(),
  });

  const apply = () => {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.category) params.set('category', state.category);
    if (state.province) params.set('province', state.province);
    if (state.conditions.length)
      params.set('condition', state.conditions.join(','));
    if (state.type) params.set('type', state.type);
    if (state.minPrice) params.set('minPrice', state.minPrice);
    if (state.maxPrice) params.set('maxPrice', state.maxPrice);
    if (state.currency) params.set('currency', state.currency);
    router.push(`/listings?${params.toString()}`);
    setOpen(false);
  };

  const reset = () => {
    setState(EMPTY);
    router.push('/listings');
    setOpen(false);
  };

  const flatCats = (cats ?? []).flatMap((c) => [c, ...(c.children ?? [])]);

  return (
    <>
      <div className="lg:hidden">
        <Button
          variant="secondary"
          fullWidth
          leftIcon={<SlidersHorizontal size={16} />}
          onClick={() => setOpen(true)}
        >
          Filtros
        </Button>
      </div>

      <aside
        className={cn(
          'lg:sticky lg:top-20 lg:self-start',
          open ? 'block' : 'hidden lg:block'
        )}
      >
        <div className="lg:bg-white lg:rounded-xl lg:border lg:border-trocalia-border lg:p-5 fixed inset-0 lg:static z-50 bg-white flex flex-col lg:block">
          <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-trocalia-border shrink-0">
            <h3 className="font-heading font-semibold">Filtros</h3>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-4 lg:p-0 overflow-y-auto flex-1 lg:overflow-visible space-y-5">
            <div className="hidden lg:block">
              <h3 className="font-heading font-semibold text-base mb-1">
                Filtros
              </h3>
              <p className="text-xs text-trocalia-text-muted">
                Afiná los resultados a tu gusto
              </p>
            </div>

            <Input
              label="Búsqueda"
              leftIcon={<Search size={15} />}
              placeholder="Bicicleta rodado 26…"
              value={state.q}
              onChange={(e) => setState({ ...state, q: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Categoría
              </label>
              <select
                value={state.category}
                onChange={(e) =>
                  setState({ ...state, category: e.target.value })
                }
                className="w-full h-11 rounded-lg border border-trocalia-border px-3 text-sm focus:outline-none focus:border-trocalia-primary focus:ring-2 focus:ring-trocalia-primary-light"
              >
                <option value="">Todas las categorías</option>
                {flatCats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <ProvinceSelector
              label="Provincia"
              value={state.province}
              onChange={(e) =>
                setState({ ...state, province: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <div className="space-y-2">
                {CONDITIONS.map((c) => (
                  <label
                    key={c.value}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={state.conditions.includes(c.value)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...state.conditions, c.value]
                          : state.conditions.filter((v) => v !== c.value);
                        setState({ ...state, conditions: next });
                      }}
                      className="w-4 h-4 rounded text-trocalia-primary focus:ring-trocalia-primary"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de publicación
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-lg">
                {[
                  { v: '', l: 'Todos' },
                  { v: 'standard', l: 'Estándar' },
                  { v: 'premium', l: 'Premium' },
                ].map((t) => (
                  <button
                    key={t.v}
                    type="button"
                    onClick={() => setState({ ...state, type: t.v })}
                    className={cn(
                      'h-8 rounded-md text-xs font-medium transition-colors',
                      state.type === t.v
                        ? 'bg-white text-trocalia-primary shadow-sm'
                        : 'text-trocalia-text-muted hover:text-trocalia-text'
                    )}
                  >
                    {t.l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Precio</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={state.minPrice}
                  onChange={(e) =>
                    setState({ ...state, minPrice: e.target.value })
                  }
                  className="w-full h-10 rounded-lg border border-trocalia-border px-3 text-sm focus:outline-none focus:border-trocalia-primary"
                />
                <span className="text-trocalia-text-muted">—</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={state.maxPrice}
                  onChange={(e) =>
                    setState({ ...state, maxPrice: e.target.value })
                  }
                  className="w-full h-10 rounded-lg border border-trocalia-border px-3 text-sm focus:outline-none focus:border-trocalia-primary"
                />
              </div>
              <div className="grid grid-cols-3 gap-1 mt-2 p-1 bg-gray-100 rounded-lg">
                {[
                  { v: '', l: 'Ambas' },
                  { v: 'ARS', l: 'Pesos' },
                  { v: 'USD', l: 'Dólares' },
                ].map((c) => (
                  <button
                    key={c.v}
                    type="button"
                    onClick={() => setState({ ...state, currency: c.v })}
                    className={cn(
                      'h-8 rounded-md text-xs font-medium transition-colors',
                      state.currency === c.v
                        ? 'bg-white text-trocalia-primary shadow-sm'
                        : 'text-trocalia-text-muted hover:text-trocalia-text'
                    )}
                  >
                    {c.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:mt-5 p-4 lg:p-0 border-t lg:border-t-0 border-trocalia-border flex gap-2 shrink-0 bg-white">
            <Button variant="secondary" onClick={reset} fullWidth>
              Limpiar
            </Button>
            <Button onClick={apply} fullWidth>
              Aplicar
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
