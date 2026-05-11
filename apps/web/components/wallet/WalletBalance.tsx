import { Coins, Sparkles } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Props {
  balance: number;
  monthlyQuota: number;
  monthlyUsed: number;
  className?: string;
}

export function WalletBalance({
  balance,
  monthlyQuota,
  monthlyUsed,
  className,
}: Props) {
  const remaining = Math.max(monthlyQuota - monthlyUsed, 0);
  const percent = monthlyQuota
    ? Math.min(100, Math.round((monthlyUsed / monthlyQuota) * 100))
    : 0;

  return (
    <Card
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-tradealo-primary to-tradealo-primary-hover text-white border-0',
        className
      )}
    >
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
      <div className="absolute -right-4 -bottom-12 w-32 h-32 bg-white/5 rounded-full" />
      <CardBody className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-80">Tu balance</p>
            <div className="flex items-end gap-2 mt-1">
              <Coins size={28} />
              <span className="font-heading font-bold text-4xl leading-none">
                {balance.toLocaleString('es-AR')}
              </span>
              <span className="text-sm opacity-80 mb-1">tokens</span>
            </div>
          </div>
          <Sparkles size={20} className="opacity-50" />
        </div>

        <div className="mt-6 pt-5 border-t border-white/20">
          <div className="flex items-center justify-between text-xs">
            <span className="opacity-90">Cuota mensual gratuita</span>
            <span className="font-medium">
              {remaining} / {monthlyQuota} disponibles
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          {monthlyQuota > 0 && (
            <p className="mt-2 text-[11px] opacity-80">
              Cada mes recibís {monthlyQuota} publicaciones estándar gratis.
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
