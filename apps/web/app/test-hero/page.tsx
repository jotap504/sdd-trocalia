'use client';

import { useState, useEffect } from 'react';
import { Repeat, Menu, X } from 'lucide-react';

const C = {
  bg: 'hsl(0,0%,10%)',
  heroBg: 'hsl(0,0%,8%)',
  fg: 'hsl(0,0%,96%)',
  muted: 'hsl(0,0%,60%)',
  primary: 'hsl(119,99%,46%)',
  primaryFg: 'hsl(0,0%,4%)',
  border: 'hsl(0,0%,20%)',
  navBtn: 'hsl(0,0%,18%)',
};

const NAV = [
  { label: 'Categorias', href: '#cat' },
  { label: 'Destacados', href: '#premium' },
  { label: 'Remates', href: '#auctions' },
  { label: 'Recientes', href: '#recent' },
  { label: 'Contacto', href: '#contact' },
];

function Navbar() {
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header
      style={{ background: scrolled ? 'hsla(0,0%,8%,0.9)' : 'transparent' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <div className="mx-auto max-w-7xl px-8 lg:px-16 py-5 flex items-center justify-between">
        <a href="/test-hero" className="flex items-center gap-2">
          <span style={{ background: C.primary }} className="w-8 h-8 rounded-lg flex items-center justify-center text-black">
            <Repeat size={16} strokeWidth={2.5} />
          </span>
          <span style={{ color: C.fg }} className="text-xl font-semibold tracking-tight">Tradealo</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((l) => (
            <a key={l.href} href={l.href} style={{ color: C.muted }} className="text-sm uppercase tracking-widest hover:text-white transition-colors">{l.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="/register" style={{ background: C.navBtn, color: C.fg }} className="hidden md:inline-flex h-10 px-6 rounded-lg text-xs uppercase tracking-widest font-medium items-center justify-center hover:brightness-110 active:scale-[0.97] transition-all">Publica gratis</a>
          <button className="md:hidden p-2 rounded-lg hover:bg-white/10" onClick={() => setMobile(true)} aria-label="Menu">
            <Menu size={20} style={{ color: C.fg }} />
          </button>
        </div>
      </div>

      {mobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobile(false)} />
          <aside style={{ background: C.heroBg, borderColor: C.border }} className="absolute right-0 top-0 h-full w-72 shadow-xl flex flex-col border-l">
            <div style={{ borderColor: C.border }} className="flex items-center justify-between px-6 h-16 border-b">
              <span style={{ color: C.fg }} className="font-semibold text-lg">Tradealo</span>
              <button onClick={() => setMobile(false)} className="p-2 rounded-lg hover:bg-white/10" aria-label="Close">
                <X size={20} style={{ color: C.fg }} />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1">
              {NAV.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMobile(false)} style={{ color: C.muted }} className="px-3 py-3 rounded-lg text-sm uppercase tracking-widest hover:text-white hover:bg-white/5 transition-colors">{l.label}</a>
              ))}
              <hr style={{ borderColor: C.border }} className="my-3" />
              <a href="/register" onClick={() => setMobile(false)} style={{ background: C.primary, color: C.primaryFg }} className="px-3 py-3 rounded-lg text-sm text-center font-semibold uppercase tracking-widest hover:brightness-110 transition-all">Publica gratis</a>
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section style={{ background: C.heroBg }} className="relative min-h-screen flex items-end overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full" style={{ background: 'hsla(119,99%,46%,0.05)', filter: 'blur(120px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full" style={{ background: 'hsla(119,99%,46%,0.05)', filter: 'blur(100px)' }} />
      <div className="absolute inset-0 bg-black/30 z-[1] pointer-events-none" />

      <div className="relative z-10 pointer-events-none w-full max-w-[90%] sm:max-w-md lg:max-w-2xl px-6 md:px-10 pb-10 md:pb-10 pt-32">
        <h1 className="opacity-0" style={{ animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s forwards' }}>
          <span style={{ color: C.fg, fontSize: 'clamp(3rem,8vw,6rem)' }} className="font-bold leading-[1.05] tracking-[-0.05em] uppercase">Vende, Subasta</span>
          <br />
          <span style={{ color: C.fg, fontSize: 'clamp(3rem,8vw,6rem)' }} className="font-bold leading-[1.05] tracking-[-0.05em] uppercase">Intercambia</span>
          <br />
          <span style={{ color: C.primary, fontSize: 'clamp(3rem,8vw,6rem)' }} className="font-bold leading-[1.05] tracking-[-0.05em] uppercase">Sin Comision</span>
        </h1>

        <p style={{ color: 'hsla(0,0%,96%,0.8)', fontSize: 'clamp(1.125rem,2.5vw,1.875rem)', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s forwards' }} className="font-light mb-3 md:mb-6 opacity-0">
          El marketplace argentino que te cuida.
        </p>

        <p style={{ color: C.muted, fontSize: 'clamp(0.875rem,1.5vw,1.25rem)', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.55s forwards' }} className="font-light mb-4 md:mb-8 opacity-0 max-w-xl">
          Publica tu producto en segundos. Vende con o sin stock, subasta al mejor postor, o intercambia sin comisiones. Con verificacion de identidad y pagos protegidos.
        </p>

        <div className="flex flex-wrap gap-3 font-bold opacity-0" style={{ animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.7s forwards' }}>
          <a href="/register" style={{ background: C.primary, color: C.primaryFg }} className="pointer-events-auto px-6 py-3 md:px-8 md:py-4 text-sm rounded-sm hover:brightness-110 transition-all active:scale-[0.97]">Publica gratis</a>
          <a href="/listings" style={{ background: '#fff', color: C.heroBg }} className="pointer-events-auto px-6 py-3 md:px-8 md:py-4 text-sm rounded-sm hover:brightness-90 transition-all active:scale-[0.97]">Explorar</a>
        </div>

        <p style={{ color: 'hsla(0,0%,60%,0.6)', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.85s forwards' }} className="text-xs font-light mt-4 md:mt-6 opacity-0">
          Sin comisiones ocultas. Verificados. +1000 publicaciones activas.
        </p>
      </div>
    </section>
  );
}

export default function TestHeroPage() {
  return (
    <div style={{ background: C.bg }} className="min-h-screen font-sans antialiased">
      <style>{'body { font-family: Sora, sans-serif; } @keyframes fadeUp { 0% { opacity: 0; transform: translateY(20px); filter: blur(4px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }'}</style>
      <Navbar />
      <HeroSection />
    </div>
  );
}
