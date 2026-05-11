'use client';

import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const STYLES = {
  success: 'bg-white border-green-200 text-green-800',
  error: 'bg-white border-red-200 text-red-800',
  info: 'bg-white border-blue-200 text-blue-800',
};

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const ICON_COLORS = {
  success: 'text-tradealo-success',
  error: 'text-tradealo-error',
  info: 'text-blue-500',
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              'relative flex items-start gap-3 px-4 py-3 pr-10 rounded-xl border shadow-lg min-w-[280px] max-w-sm animate-slide-up pointer-events-auto',
              STYLES[t.type]
            )}
          >
            <Icon size={18} className={cn('mt-0.5 shrink-0', ICON_COLORS[t.type])} />
            <p className="text-sm flex-1 text-tradealo-text">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="absolute right-2 top-2 p-1 rounded hover:bg-black/5 text-tradealo-text-muted"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
