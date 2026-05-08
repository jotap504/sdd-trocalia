'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Tag,
  ShieldCheck,
  Settings,
  Coins,
  ScrollText,
  Repeat,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/listings', label: 'Listings', icon: Tag },
  { href: '/admin/kyc', label: 'KYC', icon: ShieldCheck },
  { href: '/admin/config', label: 'Config', icon: Settings },
  { href: '/admin/token-packs', label: 'Token Packs', icon: Coins },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const initialize = useAuthStore((s) => s.initialize);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!initialized) return;
    if (pathname === '/admin/login') return;
    if (!user || user.role !== 'super_admin') {
      router.replace('/admin/login');
    }
  }, [initialized, user, router, pathname]);

  // On the login page, just render children without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!initialized || !user || user.role !== 'super_admin') return null;

  const onLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-trocalia-bg">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-gray-900 text-white flex flex-col">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
          <span className="w-8 h-8 rounded-lg bg-trocalia-primary flex items-center justify-center">
            <Repeat size={16} strokeWidth={2.5} />
          </span>
          <span className="font-heading font-bold text-base">
            Trocalia Admin
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && item.href !== '/admin';
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-trocalia-primary text-white'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 py-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white w-full text-left transition-colors"
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-trocalia-border flex items-center justify-between px-6 shrink-0">
          <p className="font-heading font-semibold text-trocalia-text">
            Panel CEO
          </p>
          <div className="flex items-center gap-2">
            <Avatar
              src={user.avatarUrl}
              username={user.username ?? user.email}
              size="sm"
            />
            <span className="text-sm font-medium text-trocalia-text">
              {user.username ?? user.email}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
