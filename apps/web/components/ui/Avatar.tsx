import { cn, getInitials } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  src?: string | null;
  username?: string;
  size?: Size;
  className?: string;
}

const SIZES: Record<Size, string> = {
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

export function Avatar({ src, username, size = 'md', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full overflow-hidden font-semibold',
        'bg-trocalia-primary-light text-trocalia-primary-hover ring-1 ring-white',
        SIZES[size],
        className
      )}
      aria-label={username}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={username ?? 'avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{getInitials(username)}</span>
      )}
    </span>
  );
}
