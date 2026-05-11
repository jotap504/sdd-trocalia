'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { kyc } from '@/lib/api';
import { KycProgress } from '@/components/kyc/KycProgress';
import { KycStepCard } from '@/components/kyc/KycStepCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

type KycStepStatus = 'pending' | 'verified' | 'rejected';

export default function KycPage() {
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ['kyc-status'],
    queryFn: () => kyc.getKycStatus(),
    staleTime: 60_000,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['kyc-status'] });

  const stepStatus = (done: boolean): KycStepStatus =>
    done ? 'verified' : 'pending';

  const allComplete = status?.id && status?.selfie && status?.address;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-tradealo-text">
          Verificación de identidad (KYC)
        </h1>
        <p className="text-sm text-tradealo-text-muted mt-1">
          Verificá tu identidad para acceder a todas las funcionalidades de
          Tradealo sin límites.
        </p>
      </div>

      {isLoading ? (
        <Skeleton variant="card" className="h-40" />
      ) : status ? (
        <KycProgress status={status} />
      ) : null}

      {!isLoading && allComplete && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle2
            size={48}
            className="mx-auto text-tradealo-success mb-3"
          />
          <h2 className="font-heading font-bold text-lg text-tradealo-text">
            ¡Verificación completa!
          </h2>
          <p className="text-sm text-tradealo-text-muted mt-1 mb-4">
            Tu identidad fue verificada con éxito. Podés publicar sin límites.
          </p>
          <Link href="/my-listings/new">
            <Button>Publicar ahora</Button>
          </Link>
        </div>
      )}

      {!isLoading && status && !allComplete && (
        <div className="space-y-5">
          <h2 className="font-heading font-semibold text-base">
            Pasos de verificación
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-medium">¿Qué necesitás tener a mano?</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Tu DNI argentino (frente y dorso)</li>
              <li>Una selfie sosteniendo el DNI</li>
              <li>Un comprobante de domicilio reciente</li>
            </ul>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KycStepCard
              type="id"
              status={stepStatus(status.id)}
              onUploaded={refresh}
            />
            <KycStepCard
              type="selfie"
              status={stepStatus(status.selfie)}
              onUploaded={refresh}
            />
            <KycStepCard
              type="address"
              status={stepStatus(status.address)}
              onUploaded={refresh}
            />
          </div>
        </div>
      )}
    </div>
  );
}
