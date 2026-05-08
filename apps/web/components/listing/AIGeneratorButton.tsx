'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { ai } from '@/lib/api';
import { toast } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Props {
  type: 'title' | 'description';
  context: Record<string, unknown>;
  onGenerate: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function AIGeneratorButton({
  type,
  context,
  onGenerate,
  className,
  size = 'sm',
}: Props) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await ai.generateText(type, context);
      onGenerate(res.text);
      toast.success(
        type === 'title'
          ? 'Título sugerido por IA'
          : 'Descripción sugerida por IA'
      );
    } catch {
      toast.error('No pudimos generar el texto. Probá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
        'bg-gradient-to-r from-teal-50 to-emerald-50 text-trocalia-primary-hover',
        'border border-teal-200 hover:bg-teal-50 hover:border-teal-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5',
        className
      )}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 12 : 14} className="animate-spin" />
      ) : (
        <Sparkles size={size === 'sm' ? 12 : 14} />
      )}
      {loading ? 'Generando…' : 'Generar con IA'}
    </button>
  );
}
