'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { WalletBalance } from '@/components/wallet/WalletBalance';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { wallet } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { WalletTransaction } from '@/types';

export default function WalletPage() {
  const [allTx, setAllTx] = useState<WalletTransaction[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data: balance, isLoading: loadingBalance } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => wallet.getBalance(),
    staleTime: 60_000,
  });

  const { isLoading: loadingTx } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: async () => {
      const res = await wallet.getTransactions({ limit: 20 });
      setAllTx(res.data ?? []);
      setHasMore(!!res.nextCursor);
      setCursor(res.nextCursor);
      return res;
    },
    staleTime: 60_000,
  });

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await wallet.getTransactions({ cursor, limit: 20 });
      setAllTx((prev) => [...prev, ...(res.data ?? [])]);
      setHasMore(!!res.nextCursor);
      setCursor(res.nextCursor);
    } catch {
      // silently ignore
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-tradealo-text">
          Mi billetera
        </h1>
        <Link href="/wallet/buy-tokens">
          <Button leftIcon={<Coins size={16} />}>Comprar tokens</Button>
        </Link>
      </div>

      {loadingBalance ? (
        <Skeleton variant="card" className="h-40" />
      ) : balance ? (
        <WalletBalance
          balance={balance.balance}
          monthlyQuota={balance.monthlyQuota}
          monthlyUsed={balance.monthlyUsed}
        />
      ) : null}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-base">
            Historial de movimientos
          </h2>
          <Link
            href="/wallet/buy-tokens"
            className="text-xs text-tradealo-primary hover:underline flex items-center gap-1"
          >
            Comprar más tokens <ArrowRight size={12} />
          </Link>
        </div>

        {loadingTx && allTx.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="text" className="h-14" />
            ))}
          </div>
        ) : allTx.length === 0 ? (
          <Card>
            <div className="text-center py-10 text-tradealo-text-muted p-5">
              <Coins size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No hay movimientos todavía.</p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-tradealo-border">
              {allTx.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === 'credit'
                        ? 'bg-green-100 text-tradealo-success'
                        : 'bg-red-100 text-tradealo-error'
                    }`}
                  >
                    {tx.type === 'credit' ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-tradealo-text truncate">
                      {tx.description ?? tx.reason}
                    </p>
                    <p className="text-xs text-tradealo-text-muted">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`font-heading font-bold text-base shrink-0 ${
                      tx.type === 'credit'
                        ? 'text-tradealo-success'
                        : 'text-tradealo-error'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button
              variant="secondary"
              onClick={loadMore}
              loading={loadingMore}
            >
              Cargar más
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
