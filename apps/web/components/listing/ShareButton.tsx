'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Link, MessageCircle, Check } from 'lucide-react';

interface Props {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fullUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${url}`
      : url;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => { setCopied(false); setOpen(false); }, 1200);
    } catch {
      /* fallback */
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${title}\n${fullUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full justify-center h-10 px-4 rounded-xl border border-tradealo-border bg-white text-sm font-medium text-tradealo-text hover:bg-tradealo-bg transition-colors"
      >
        <Share2 size={16} />
        Compartir
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl border border-tradealo-border shadow-lg overflow-hidden z-50">
          <button
            onClick={copyLink}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-tradealo-text hover:bg-tradealo-bg transition-colors"
          >
            {copied ? (
              <Check size={18} className="text-green-500" />
            ) : (
              <Link size={18} className="text-tradealo-text-muted" />
            )}
            {copied ? '¡Copiado!' : 'Copiar enlace'}
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-tradealo-text hover:bg-tradealo-bg transition-colors border-t border-tradealo-border"
          >
            <MessageCircle size={18} className="text-green-500" />
            Compartir por WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
