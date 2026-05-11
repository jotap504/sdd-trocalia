'use client';

import { ShieldCheck, Clock } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';

export default function AdminAuditLogPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-tradealo-text">
        Audit Log
      </h1>

      <Card>
        <CardBody className="py-20 text-center">
          <div className="relative inline-flex">
            <ShieldCheck
              size={56}
              className="text-tradealo-text-muted mx-auto"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-100 rounded-full p-1">
              <Clock size={18} className="text-amber-600" />
            </span>
          </div>
          <h2 className="font-heading font-bold text-lg text-tradealo-text mt-5">
            En construcción
          </h2>
          <p className="text-sm text-tradealo-text-muted mt-2 max-w-sm mx-auto">
            El registro de auditoría estará disponible próximamente. Acá vas a poder
            ver todas las acciones administrativas con fecha, usuario y detalle del
            cambio.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
