'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Coins, ShieldCheck } from 'lucide-react';
import { wallet } from '@/lib/api';
import { toast } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import type { TokenPack } from '@/types';

interface Props {
  open: boolean;
  pack: TokenPack | null;
  onClose: () => void;
}

export function PurchaseModal({ open, pack, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    if (!pack) return;
    setLoading(true);
    try {
      const r = await wallet.createPayment(pack.id);
      if (r.initPoint) {
        window.location.href = r.initPoint;
      } else {
        toast.error('No pudimos iniciar el pago');
      }
    } catch {
      toast.error('Falló la creación del pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Confirmar compra" size="md">
      {pack && (
        <div className="space-y-5">
          <div className="rounded-xl bg-trocalia-primary-light p-5 text-center">
            <p className="text-xs uppercase tracking-wide text-trocalia-primary-hover font-semibold">
              {pack.name}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Coins className="text-trocalia-primary" size={22} />
              <span className="font-heading font-bold text-3xl text-trocalia-text">
                {(pack.tokens + (pack.bonusTokens ?? 0)).toLocaleString('es-AR')}
              </span>
              <span className="text-trocalia-text-muted text-sm">tokens</span>
            </div>
            {pack.bonusTokens && pack.bonusTokens > 0 && (
              <p className="text-xs text-trocalia-success font-medium mt-1">
                Incluye {pack.bonusTokens} de regalo
              </p>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-trocalia-text-muted">Subtotal</span>
              <span>{formatPrice(pack.priceArs, 'ARS')}</span>
            </div>
            <div className="flex items-center justify-between font-semibold pt-2 border-t border-trocalia-border">
              <span>Total a pagar</span>
              <span className="text-lg">{formatPrice(pack.priceArs, 'ARS')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-trocalia-text-muted bg-gray-50 rounded-lg p-3">
            <ShieldCheck size={14} className="shrink-0 text-trocalia-success" />
            <span>
              Vas a ser redirigido a MercadoPago para completar el pago de
              forma segura.
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Cancelar
            </Button>
            <Button fullWidth loading={loading} onClick={onConfirm}>
              Confirmar compra
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
