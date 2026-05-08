import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Currency } from '@/types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: Currency = 'ARS'): string {
  const prefix = currency === 'USD' ? 'U$S' : '$';
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${prefix} ${formatted}`;
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatRelative(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return 'hace unos segundos';
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  if (days < 7) return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  if (days < 30) return `hace ${Math.round(days / 7)} sem`;
  if (days < 365) return `hace ${Math.round(days / 30)} meses`;
  return `hace ${Math.round(days / 365)} años`;
}

export function truncate(str: string, max: number): string {
  if (!str) return '';
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + '…';
}

export function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
