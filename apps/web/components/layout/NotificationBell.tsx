'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@/lib/api';
import { formatRelative } from '@/lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notifications.unreadCount(),
    refetchInterval: 60_000,
  });

  const { data: list, isLoading } = useQuery({
    queryKey: ['notifications', 'list-preview'],
    queryFn: () => notifications.getNotifications(),
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const count = countData?.count ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100 text-trocalia-text transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-trocalia-error text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-trocalia-border rounded-xl shadow-lg z-50 overflow-hidden animate-slide-up">
          <div className="px-4 py-3 border-b border-trocalia-border flex items-center justify-between">
            <h4 className="font-semibold text-sm">Notificaciones</h4>
            {count > 0 && (
              <button
                onClick={async () => {
                  await notifications.markAllRead();
                  qc.invalidateQueries({ queryKey: ['notifications'] });
                }}
                className="text-xs text-trocalia-primary hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-trocalia-text-muted">
                <Loader2 className="animate-spin" size={18} />
              </div>
            ) : !list?.data?.length ? (
              <div className="py-10 text-center text-sm text-trocalia-text-muted">
                No tenés notificaciones
              </div>
            ) : (
              list.data.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-trocalia-border last:border-0 hover:bg-gray-50 transition-colors ${
                    !n.read ? 'bg-teal-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-trocalia-primary mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-trocalia-text truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-trocalia-text-muted line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-trocalia-text-muted mt-1">
                        {formatRelative(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center py-2.5 text-sm font-medium text-trocalia-primary hover:bg-trocalia-primary-light transition-colors"
          >
            Ver todas
          </Link>
        </div>
      )}
    </div>
  );
}
