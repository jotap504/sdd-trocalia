'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Coins } from 'lucide-react';
import { TokenPackCard } from '@/components/wallet/TokenPackCard';
import { PurchaseModal } from '@/components/wallet/PurchaseModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { wallet } from '@/lib/api';
import type { TokenPack } from '@/types';

export default function BuyTokensPage() {
  const [selectedPack, setSelectedPack] = useState<TokenPack | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: packs, isLoading } = useQuery({
    queryKey: ['token-packs'],
    queryFn: () => wallet.getPacks(),
    staleTime: 300_000,
  });

  const handleSelect = (pack: TokenPack) => {
    setSelectedPack(pack);
    setShowModal(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-tradealo-primary-light flex items-center justify-center text-tradealo-primary mx-auto mb-4">
          <Coins size={28} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-tradealo-text">
          Comprar tokens
        </h1>
        <p className="text-tradealo-text-muted mt-2 max-w-md mx-auto text-sm">
          Los tokens te permiten publicar anuncios premium y acceder a funciones
          avanzadas. Comprá una vez y usalos cuando quieras.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-60" />
          ))}
        </div>
      ) : !packs || packs.length === 0 ? (
        <div className="text-center py-12 text-tradealo-text-muted">
          <p className="text-sm">No hay paquetes disponibles por el momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packs.map((pack) => (
            <TokenPackCard
              key={pack.id}
              pack={pack}
              selected={selectedPack?.id === pack.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      <PurchaseModal
        open={showModal}
        pack={selectedPack}
        onClose={() => {
          setShowModal(false);
          setSelectedPack(null);
        }}
      />
    </div>
  );
}
